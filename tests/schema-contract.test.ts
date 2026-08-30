import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_ROLES } from '@/lib/auth/roles';

/**
 * The TypeScript types are generated from the migrations by
 * `scripts/generate-db-types.py`. Nothing stops someone editing one and forgetting the
 * other, so these tests assert the two still agree on the things the application
 * depends on most.
 */
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');
const migrationSql = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => readFileSync(join(MIGRATIONS_DIR, file), 'utf8'))
    .join('\n');

const generatedTypes = readFileSync(join(process.cwd(), 'src', 'types', 'database.ts'), 'utf8');

describe('generated types match the migrations', () => {
    it('declares every table the migrations create', () => {
        const declared = [...migrationSql.matchAll(/create table public\.(\w+)\s*\(/g)].map((match) => match[1]);
        expect(declared.length).toBeGreaterThan(50);
        for (const table of declared) {
            expect(generatedTypes, table).toContain(`      ${table}: {`);
        }
    });

    it('declares every enum the migrations create', () => {
        const declared = [...migrationSql.matchAll(/create type public\.(\w+) as enum/g)].map((match) => match[1]);
        expect(declared.length).toBeGreaterThan(25);
        for (const name of declared) {
            expect(generatedTypes, name).toContain(`      ${name}: `);
        }
    });

    it('keeps the application role list in step with the app_role enum', () => {
        const match = migrationSql.match(/create type public\.app_role as enum\s*\(([^)]*)\)/);
        expect(match).toBeTruthy();
        const sqlRoles = [...match![1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
        expect([...sqlRoles].sort()).toEqual([...APP_ROLES].sort());
    });
});

describe('security invariants hold in SQL', () => {
    it('never reads the new account role from client-supplied metadata', () => {
        // The original `handle_new_user` did exactly this, and the browser controls
        // that payload — it let anyone sign up as super_admin.
        const handleNewUser = migrationSql.slice(migrationSql.lastIndexOf('function public.handle_new_user()'));
        const body = handleNewUser.slice(0, handleNewUser.indexOf('$$;'));
        expect(body).not.toMatch(/raw_user_meta_data\s*->>\s*'role'/);
    });

    it('protects profile privileges on insert as well as update', () => {
        // Guarding only UPDATE left the self-insert path wide open.
        expect(migrationSql).toMatch(/create trigger profiles_protect_privileges\s+before insert or update on public\.profiles/);
    });

    it('routes role changes through one authorised function', () => {
        expect(migrationSql).toContain('create or replace function public.assign_role');
        expect(migrationSql).toMatch(/revoke all on function public\.assign_role/);
    });

    it('enables row-level security on every table it creates', () => {
        const created = [...migrationSql.matchAll(/create table public\.(\w+)\s*\(/g)].map((match) => match[1]);

        // The RLS migration enables it by looping over a literal array of table names.
        // Extract that array and check nothing the migrations create was left out — a
        // table missing from the list is readable by anyone with the anon key.
        const enableIndex = migrationSql.indexOf('enable row level security');
        expect(enableIndex).toBeGreaterThan(-1);
        const arrayStart = migrationSql.lastIndexOf('array[', enableIndex);
        const listBlock = migrationSql.slice(arrayStart, migrationSql.indexOf(']', arrayStart));
        const listed = new Set([...listBlock.matchAll(/'(\w+)'/g)].map((match) => match[1]));

        for (const table of created) {
            expect(listed.has(table), `${table} is missing from the RLS enable list`).toBe(true);
        }
    });
});
