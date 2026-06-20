-- Migration: reports_insert_policy
-- Description: Allow users to insert reports where they are the reporter.

CREATE POLICY "reports_reporter_insert" 
    ON reports FOR INSERT 
    TO authenticated 
    WITH CHECK (reporter_id = auth.uid());
