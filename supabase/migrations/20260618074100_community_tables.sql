-- Create community_posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT, 
  has_trigger_warning BOOLEAN DEFAULT false,
  trigger_warning_text TEXT,
  status TEXT DEFAULT 'published', 
  removed_by UUID REFERENCES users(id), 
  removed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_replies table
CREATE TABLE community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  display_name TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_reactions table
CREATE TABLE community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

-- RLS for community_posts
CREATE POLICY "Public can view published posts"
  ON community_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own posts"
  ON community_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can view all posts"
  ON community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Authenticated users can insert posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can update posts status"
  ON community_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can delete posts"
  ON community_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

-- RLS for community_replies
CREATE POLICY "Public can view published replies"
  ON community_replies FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own replies"
  ON community_replies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can view all replies"
  ON community_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Authenticated users can insert replies"
  ON community_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
  ON community_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can update replies"
  ON community_replies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Users can delete their own replies"
  ON community_replies FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and operators can delete replies"
  ON community_replies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'operator')
    )
  );

-- RLS for community_reactions
CREATE POLICY "Public can view reactions"
  ON community_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime subscriptions setup
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reactions;
