-- Run this in your Neon SQL console to set up all tables

CREATE TABLE IF NOT EXISTS bio (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'Swift Caulfield',
  role TEXT DEFAULT 'Artist / Illustrator',
  bio_text TEXT DEFAULT '',
  tags TEXT DEFAULT 'Illustration, Concept Art, Graphic Design, Digital Art',
  pfp_url TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS art (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS design (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default bio row
INSERT INTO bio (id, name, role, bio_text, tags)
VALUES (1, 'Swift Caulfield', 'Artist / Illustrator', '', 'Illustration, Concept Art, Graphic Design, Digital Art')
ON CONFLICT (id) DO NOTHING;
