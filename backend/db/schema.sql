CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT '',
    birth_city VARCHAR(100) DEFAULT '',
    age INTEGER DEFAULT NULL,
    power_level VARCHAR(50) DEFAULT 'None',
    avatar_url TEXT DEFAULT '',
    avatar_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birth_city VARCHAR(100),
    backstory TEXT,
    image_url TEXT,
    role VARCHAR(100) DEFAULT 'Adventurer',
    lore TEXT,
    daily_activity TEXT,
    is_nsfw BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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