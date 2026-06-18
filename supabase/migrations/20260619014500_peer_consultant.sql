-- Tambahkan kolom role ke tabel consultant_invites jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='consultant_invites' AND column_name='role') THEN
        ALTER TABLE consultant_invites ADD COLUMN role user_role DEFAULT 'consultant';
    END IF;
END $$;

-- Policy untuk peer_consultant pada reports
-- Peer Consultant: Lihat laporan yang ditugaskan ke mereka
CREATE POLICY reports_peer_consultant_select ON reports FOR SELECT TO authenticated
USING (assigned_consultant_id = auth.uid() AND get_current_user_role() = 'peer_consultant');

-- Policy untuk peer_consultant pada messages
CREATE POLICY messages_peer_consultant_select ON messages FOR SELECT TO authenticated
USING (
  get_current_user_role() = 'peer_consultant' AND EXISTS (SELECT 1 FROM reports WHERE id = messages.report_id AND assigned_consultant_id = auth.uid())
);

CREATE POLICY messages_peer_consultant_insert ON messages FOR INSERT TO authenticated
WITH CHECK (
  get_current_user_role() = 'peer_consultant' AND EXISTS (SELECT 1 FROM reports WHERE id = report_id AND assigned_consultant_id = auth.uid())
);

-- Note: case_notes tidak dapat diakses oleh peer_consultant (sesuai wewenang)
-- Karena policy case_notes_consultant_select menggunakan role consultant, peer_consultant secara otomatis tidak bisa select/insert.
