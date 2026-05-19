CREATE TABLE IF NOT EXISTS portfolio_bio (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) DEFAULT 'Swift Caulfield',
  role VARCHAR(100) DEFAULT 'Artist / Illustrator',
  bio_text TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  pfp_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_art (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_design (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO portfolio_bio (name, role, bio_text, tags)
SELECT 'Swift Caulfield', 'Artist / Illustrator', '', 'Illustration, Concept Art, Graphic Design, Digital Art'
WHERE NOT EXISTS (SELECT 1 FROM portfolio_bio);