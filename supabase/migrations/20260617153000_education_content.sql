-- Tabel education_content (Fase 12)
CREATE TABLE IF NOT EXISTS education_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'pencegahan' | 'penanganan' | 'hukum' | 'pemulihan' | 'regulasi'
  content_type TEXT NOT NULL, -- 'video' | 'pdf' | 'article' | 'link'
  url TEXT, -- YouTube URL atau link eksternal
  file_path TEXT, -- path di Supabase Storage untuk PDF
  thumbnail_url TEXT, -- auto-generate dari YouTube atau upload manual
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'published' | 'draft'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public SELECT hanya status='published', admin full access
ALTER TABLE education_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published education content" 
  ON education_content FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admin has full access to education content" 
  ON education_content FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
