-- Create ENUM types
CREATE TYPE user_role AS ENUM ('reporter', 'consultant', 'operator', 'satgas', 'admin');
CREATE TYPE report_status AS ENUM ('received', 'under_review', 'in_consultation', 'escalated', 'resolved', 'closed');
CREATE TYPE report_intent AS ENUM ('record_only', 'consultation', 'satgas_escalation');
CREATE TYPE incident_type AS ENUM ('verbal_harassment', 'physical_harassment', 'sexual_violence', 'digital_violence', 'other');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'urgent');
CREATE TYPE consultant_availability AS ENUM ('online', 'busy', 'offline');

-- Campuses
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Profiles linked to auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'reporter' NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    status VARCHAR(50) DEFAULT 'active', -- account status: pending, active, archived
    availability_status consultant_availability DEFAULT 'offline', -- For consultants
    max_active_cases INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultant Invites
CREATE TABLE consultant_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID UNIQUE DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES users(id),
    campus_id UUID REFERENCES campuses(id),
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code VARCHAR(8) UNIQUE,
    reporter_id UUID REFERENCES users(id),
    campus_id UUID REFERENCES campuses(id),
    incident_type incident_type,
    description TEXT,
    intent report_intent DEFAULT 'record_only',
    status report_status DEFAULT 'received',
    priority priority_level DEFAULT 'normal',
    assigned_consultant_id UUID REFERENCES users(id),
    assigned_satgas_campus_id UUID REFERENCES campuses(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Attachments
CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    sender_tracking_code VARCHAR(8),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Notes
CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Satgas Case Updates
CREATE TABLE satgas_case_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    satgas_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status report_status,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id), -- Can be null for system actions
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'id',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satgas_case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_invites ENABLE ROW LEVEL SECURITY;

-- Helper Function to Get Current User Role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper Function to Get Current User Campus
CREATE OR REPLACE FUNCTION get_current_user_campus()
RETURNS UUID AS $$
  SELECT campus_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS: Reports
-- Admin: Lihat Semua
CREATE POLICY reports_admin_all ON reports FOR ALL TO authenticated
USING (get_current_user_role() = 'admin');

-- Pelapor: Lihat laporannya sendiri
CREATE POLICY reports_reporter_select ON reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR get_current_user_role() = 'admin');

-- Konsultan: Lihat laporan yang ditugaskan ke mereka
CREATE POLICY reports_consultant_select ON reports FOR SELECT TO authenticated
USING (assigned_consultant_id = auth.uid() OR get_current_user_role() = 'admin');

-- Operator: Lihat laporan dari kampus mereka
CREATE POLICY reports_operator_select ON reports FOR SELECT TO authenticated
USING ((get_current_user_role() = 'operator' AND campus_id = get_current_user_campus()) OR get_current_user_role() = 'admin');

-- Satgas: Lihat laporan yang diteruskan ke kampus mereka
CREATE POLICY reports_satgas_select ON reports FOR SELECT TO authenticated
USING ((get_current_user_role() = 'satgas' AND assigned_satgas_campus_id = get_current_user_campus()) OR get_current_user_role() = 'admin');

