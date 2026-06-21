-- Fix RLS agar peer consultant bisa SELECT semua pesan
-- di laporan yang di-assign kepadanya
DROP POLICY IF EXISTS messages_peer_consultant_select ON messages;
CREATE POLICY messages_peer_consultant_select ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reports r
    WHERE r.id = messages.report_id
    AND r.assigned_consultant_id = auth.uid()
  )
);

-- Fix RLS agar reporter bisa SELECT semua pesan di laporannya
DROP POLICY IF EXISTS messages_reporter_select ON messages;
CREATE POLICY messages_reporter_select ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reports r
    WHERE r.id = messages.report_id
    AND r.reporter_id = auth.uid()
  )
  OR sender_id = auth.uid()
  OR sender_id IS NULL
);

-- Fix RLS agar peer consultant bisa INSERT pesan
DROP POLICY IF EXISTS messages_peer_consultant_insert ON messages;
CREATE POLICY messages_peer_consultant_insert ON messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM reports r
    WHERE r.id = messages.report_id
    AND r.assigned_consultant_id = auth.uid()
  )
);
