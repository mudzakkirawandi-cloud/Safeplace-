-- Tambahkan role peer_consultant
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'peer_consultant';

-- Tabel satgas_investigations
CREATE TABLE satgas_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    investigator_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'ongoing', -- 'ongoing', 'concluded'
    findings TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel satgas_documents
CREATE TABLE satgas_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    document_type VARCHAR(50), -- 'evidence', 'official_letter', 'statement'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE satgas_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE satgas_documents ENABLE ROW LEVEL SECURITY;

-- RLS untuk satgas_investigations
CREATE POLICY satgas_investigations_select ON satgas_investigations FOR SELECT TO authenticated
USING (
  get_current_user_role() = 'admin' OR 
  (get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = satgas_investigations.report_id AND assigned_satgas_campus_id = get_current_user_campus()))
);

CREATE POLICY satgas_investigations_insert ON satgas_investigations FOR INSERT TO authenticated
WITH CHECK (
  get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = report_id AND assigned_satgas_campus_id = get_current_user_campus())
);

CREATE POLICY satgas_investigations_update ON satgas_investigations FOR UPDATE TO authenticated
USING (
  get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = report_id AND assigned_satgas_campus_id = get_current_user_campus())
);

-- RLS untuk satgas_documents
CREATE POLICY satgas_documents_select ON satgas_documents FOR SELECT TO authenticated
USING (
  get_current_user_role() = 'admin' OR 
  (get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = satgas_documents.report_id AND assigned_satgas_campus_id = get_current_user_campus())) OR
  (get_current_user_role() = 'reporter' AND EXISTS (SELECT 1 FROM reports WHERE id = satgas_documents.report_id AND reporter_id = auth.uid()))
);

CREATE POLICY satgas_documents_insert ON satgas_documents FOR INSERT TO authenticated
WITH CHECK (
  get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = report_id AND assigned_satgas_campus_id = get_current_user_campus())
);

CREATE POLICY satgas_documents_delete ON satgas_documents FOR DELETE TO authenticated
USING (
  get_current_user_role() = 'satgas' AND uploaded_by = auth.uid()
);

-- Note: No RLS for messages found in migrations, so satgas chat could face RLS issues if a policy was added manually.
-- Assuming messages table relies on the fact that if they can read reports they can add messages? Or there is no RLS policy to block them?
-- To be safe, we'll add policies for messages here specifically for satgas:
CREATE POLICY messages_satgas_select ON messages FOR SELECT TO authenticated
USING (
  get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = messages.report_id AND assigned_satgas_campus_id = get_current_user_campus())
);

CREATE POLICY messages_satgas_insert ON messages FOR INSERT TO authenticated
WITH CHECK (
  get_current_user_role() = 'satgas' AND EXISTS (SELECT 1 FROM reports WHERE id = report_id AND assigned_satgas_campus_id = get_current_user_campus())
);
