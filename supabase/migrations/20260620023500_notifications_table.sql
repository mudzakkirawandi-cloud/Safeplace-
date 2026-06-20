-- Migration: notifications_table
-- Description: Creates the notifications table and applies RLS policies.

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: User can only select their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Policy: User can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Note: System/Admin functions will bypass RLS or use a separate service role to insert notifications.
