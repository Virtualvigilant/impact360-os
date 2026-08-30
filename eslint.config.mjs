import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * `no-explicit-any` was downgraded to a warning while the codebase carried 111 uses of
 * `any` — mostly `const db: any = supabaseClient()`, which defeated every generated
 * type. The types are now generated from the migrations and the casts are gone, so the
 * rule is back to an error: reintroducing `any` should fail the build, not add a line
 * of scrollback nobody reads.
 */
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
            ],
            // `react/no-unescaped-entities` is left to eslint-config-next, which already
            // sets it to error. Re-declaring it here puts the rule in a config object
            // that does not register the react plugin, which flat config rejects.
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
        },
    },
    {
        // One-off Node scripts run with `node scripts/x.cjs`, outside the bundler.
        files: ['scripts/**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'no-console': 'off',
        },
    },
    {
        // Generated from SQL; regenerate rather than hand-edit.
        files: ['src/types/database.ts'],
        rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),
]);

export default eslintConfig;
