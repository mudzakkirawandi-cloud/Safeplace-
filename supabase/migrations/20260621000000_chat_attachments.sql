-- 1. Tambah kolom attachment ke tabel messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS emergency BOOLEAN DEFAULT FALSE;

-- 2. RLS policy untuk reporter
CREATE POLICY messages_reporter_select ON messages 
FOR SELECT TO authenticated
USING (
  get_current_user_role() = 'reporter' AND 
  EXISTS (
    SELECT 1 FROM reports 
    WHERE id = messages.report_id 
    AND reporter_id = auth.uid()
  )
);

CREATE POLICY messages_reporter_insert ON messages 
FOR INSERT TO authenticated
WITH CHECK (
  get_current_user_role() = 'reporter' AND 
  EXISTS (
    SELECT 1 FROM reports 
    WHERE id = report_id 
    AND reporter_id = auth.uid()
  )
);

-- 3. RLS policy untuk admin (bisa lihat semua)
CREATE POLICY messages_admin_select ON messages
FOR SELECT TO authenticated
USING (get_current_user_role() = 'admin');
