-- Add admin review fields to team_tasks
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE team_tasks
    ADD COLUMN IF NOT EXISTS admin_review TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
