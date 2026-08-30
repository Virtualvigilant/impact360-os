#!/usr/bin/env python3
"""Generate src/types/database.ts from the SQL migrations.

The Supabase CLI can do this from a live project, but the schema here is the source of
truth and must be typed before it is deployed. Parsing the migrations keeps the
TypeScript boundary honest without needing a database connection.

Usage:  python3 scripts/generate-db-types.py
"""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIGRATIONS = ROOT / "supabase" / "migrations"
OUT = ROOT / "src" / "types" / "database.ts"

SCALARS = {
    "uuid": "string",
    "text": "string",
    "citext": "string",
    "boolean": "boolean",
    "bool": "boolean",
    "integer": "number",
    "int": "number",
    "int4": "number",
    "bigint": "number",
    "smallint": "number",
    "numeric": "number",
    "decimal": "number",
    "real": "number",
    "double precision": "number",
    "date": "string",
    "timestamptz": "string",
    "timestamp": "string",
    "timestamp with time zone": "string",
    "time": "string",
    "interval": "string",
    "jsonb": "Json",
    "json": "Json",
}


def read_sql() -> str:
    files = sorted(MIGRATIONS.glob("*.sql"))
    if not files:
        sys.exit(f"no migrations found in {MIGRATIONS}")
    return "\n".join(f.read_text() for f in files)


def parse_enums(sql: str) -> dict[str, list[str]]:
    enums: dict[str, list[str]] = {}
    for match in re.finditer(
        r"create type public\.(\w+) as enum\s*\((.*?)\);", sql, re.S | re.I
    ):
        name, body = match.group(1), match.group(2)
        enums[name] = re.findall(r"'([^']*)'", body)
    return enums


def split_columns(body: str) -> list[str]:
    """Split a CREATE TABLE body on top-level commas."""
    parts, depth, current = [], 0, ""
    for char in body:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        if char == "," and depth == 0:
            parts.append(current)
            current = ""
        else:
            current += char
    if current.strip():
        parts.append(current)
    return [p.strip() for p in parts if p.strip()]


TABLE_CONSTRAINTS = re.compile(
    r"^(primary\s+key|unique|check|foreign\s+key|constraint|exclude)\b", re.I
)


def ts_type(sql_type: str, enums: dict[str, list[str]]) -> str:
    raw = sql_type.strip().lower()
    array = raw.endswith("[]")
    if array:
        raw = raw[:-2].strip()
    raw = re.sub(r"\(.*?\)", "", raw).strip()
    raw = raw.replace("public.", "")

    if raw in enums:
        base = f"Database['public']['Enums']['{raw}']"
    else:
        base = SCALARS.get(raw)
        if base is None:
            base = "string"  # unknown domain types degrade to string, never to any
    return f"{base}[]" if array else base


def parse_tables(sql: str, enums: dict[str, list[str]]) -> dict[str, list[dict]]:
    tables: dict[str, list[dict]] = {}
    for match in re.finditer(
        r"create table public\.(\w+)\s*\((.*?)\n\);", sql, re.S | re.I
    ):
        name, body = match.group(1), match.group(2)
        columns = []
        for line in split_columns(body):
            line = re.sub(r"--.*", "", line).strip()
            if not line or TABLE_CONSTRAINTS.match(line):
                continue
            col = re.match(r'"?(\w+)"?\s+(.+)', line, re.S)
            if not col:
                continue
            col_name, rest = col.group(1), col.group(2)
            rest_flat = " ".join(rest.split())

            # The type is everything up to the first modifier keyword.
            type_match = re.match(
                r"((?:[\w\.]+(?:\s+precision|\s+with\s+time\s+zone)?)(?:\(\d+(?:,\s*\d+)?\))?(?:\[\])?)",
                rest_flat,
            )
            sql_type = type_match.group(1) if type_match else "text"

            generated = "generated always as identity" in rest_flat.lower()
            not_null = re.search(r"\bnot\s+null\b", rest_flat, re.I) is not None
            has_default = (
                re.search(r"\bdefault\b", rest_flat, re.I) is not None or generated
            )
            is_pk = re.search(r"\bprimary\s+key\b", rest_flat, re.I) is not None
            is_unique = re.search(r"\bunique\b", rest_flat, re.I) is not None

            reference = re.search(
                r"references\s+public\.(\w+)\s*\(\s*(\w+)\s*\)", rest_flat, re.I
            )

            columns.append(
                {
                    "name": col_name,
                    "ts": ts_type(sql_type, enums),
                    "nullable": not not_null and not is_pk,
                    "optional_on_insert": has_default or (not not_null and not is_pk),
                    "references": (reference.group(1), reference.group(2)) if reference else None,
                    "one_to_one": is_pk or is_unique,
                }
            )
        tables[name] = columns
    return tables


# The three operational views are derived aggregates; their shapes are declared here
# because they cannot be inferred from a CREATE VIEW select list reliably.
VIEWS = {
    "intern_operating_summary": [
        ("placement_id", "string", False),
        ("intern_id", "string", False),
        ("full_name", "string", False),
        ("email", "string", False),
        ("programme_id", "string", True),
        ("programme_name", "string", True),
        ("track_name", "string", True),
        ("current_phase", "string", True),
        ("status", "Database['public']['Enums']['placement_status']", False),
        ("primary_mentor_id", "string", True),
        ("supervisor_id", "string", True),
        ("start_date", "string", True),
        ("end_date", "string", True),
        ("learning_progress", "number", False),
        ("attendance_rate", "number", False),
        ("performance_score", "number", True),
        ("open_tasks", "number", False),
        ("completed_tasks", "number", False),
        ("risk_level", "Database['public']['Enums']['risk_level']", False),
    ],
    "mentor_capacity": [
        ("mentor_id", "string", False),
        ("full_name", "string", False),
        ("email", "string", False),
        ("active_interns", "number", False),
        ("high_risk_interns", "number", False),
        ("check_ins_waiting", "number", False),
    ],
    "programme_health": [
        ("programme_id", "string", False),
        ("name", "string", False),
        ("cohort_label", "string", True),
        ("status", "Database['public']['Enums']['programme_status']", False),
        ("active_interns", "number", False),
        ("completed_interns", "number", False),
        ("at_risk_interns", "number", False),
        ("average_score", "number", True),
    ],
}


def emit(enums: dict[str, list[str]], tables: dict[str, list[dict]]) -> str:
    out: list[str] = []
    out.append("// AUTO-GENERATED — do not edit by hand.")
    out.append("// Regenerate with:  npm run db:types")
    out.append("// Source of truth: supabase/migrations/*.sql")
    out.append("")
    out.append(
        "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];"
    )
    out.append("")
    out.append("export type Database = {")
    out.append("  public: {")

    out.append("    Tables: {")
    for table in sorted(tables):
        columns = tables[table]
        out.append(f"      {table}: {{")
        out.append("        Row: {")
        for c in columns:
            null = " | null" if c["nullable"] else ""
            out.append(f"          {c['name']}: {c['ts']}{null};")
        out.append("        };")
        out.append("        Insert: {")
        for c in columns:
            null = " | null" if c["nullable"] else ""
            opt = "?" if c["optional_on_insert"] else ""
            out.append(f"          {c['name']}{opt}: {c['ts']}{null};")
        out.append("        };")
        out.append("        Update: {")
        for c in columns:
            null = " | null" if c["nullable"] else ""
            out.append(f"          {c['name']}?: {c['ts']}{null};")
        out.append("        };")
        relationships = [c for c in columns if c["references"]]
        if not relationships:
            out.append("        Relationships: [];")
        else:
            out.append("        Relationships: [")
            for c in relationships:
                referenced_table, referenced_column = c["references"]
                # Postgres names an inline column constraint `<table>_<column>_fkey`,
                # which is the hint the client uses to disambiguate two foreign keys
                # pointing at the same table (placements → profiles, three times).
                out.append("          {")
                out.append(f'            foreignKeyName: "{table}_{c["name"]}_fkey";')
                out.append(f'            columns: ["{c["name"]}"];')
                out.append(f"            isOneToOne: {'true' if c['one_to_one'] else 'false'};")
                out.append(f'            referencedRelation: "{referenced_table}";')
                out.append(f'            referencedColumns: ["{referenced_column}"];')
                out.append("          },")
            out.append("        ];")
        out.append("      };")
    out.append("    };")

    out.append("    Views: {")
    for view, columns in VIEWS.items():
        out.append(f"      {view}: {{")
        out.append("        Row: {")
        for name, ts, nullable in columns:
            null = " | null" if nullable else ""
            out.append(f"          {name}: {ts}{null};")
        out.append("        };")
        out.append("        Relationships: [];")
        out.append("      };")
    out.append("    };")

    out.append("    Functions: {")
    out.append("      assign_role: {")
    out.append("        Args: { target_profile_id: string; new_role: Database['public']['Enums']['app_role']; reason?: string };")
    out.append("        Returns: Database['public']['Tables']['profiles']['Row'];")
    out.append("      };")
    out.append("      current_app_role: { Args: Record<string, never>; Returns: Database['public']['Enums']['app_role'] };")
    out.append("      is_programme_staff: { Args: Record<string, never>; Returns: boolean };")
    out.append("    };")

    out.append("    Enums: {")
    for name in sorted(enums):
        values = " | ".join(f"'{v}'" for v in enums[name])
        out.append(f"      {name}: {values};")
    out.append("    };")

    out.append("    CompositeTypes: Record<string, never>;")
    out.append("  };")
    out.append("};")
    out.append("")

    # Ergonomic aliases used across the application.
    out.append("type PublicSchema = Database['public'];")
    out.append("")
    out.append(
        "export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];"
    )
    out.append(
        "export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];"
    )
    out.append(
        "export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];"
    )
    out.append(
        "export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row'];"
    )
    out.append(
        "export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];"
    )
    out.append("")
    return "\n".join(out)


def main() -> None:
    sql = read_sql()
    enums = parse_enums(sql)
    tables = parse_tables(sql, enums)
    if not tables:
        sys.exit("parsed zero tables — check the migration format")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(emit(enums, tables))
    print(f"wrote {OUT.relative_to(ROOT)}: {len(tables)} tables, {len(enums)} enums")


if __name__ == "__main__":
    main()
