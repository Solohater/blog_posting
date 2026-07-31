CREATE TABLE IF NOT EXISTS users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  bio TEXT,
  role VARCHAR(50) DEFAULT 'USER',
  followers INTEGER[] DEFAULT '{}',
  following INTEGER[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tags (
  tagid SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

INSERT INTO tags (name, description) VALUES
  ('Technology', 'Tech-related articles and tutorials'),
  ('Science', 'Scientific discoveries and research'),
  ('Health', 'Health and wellness topics'),
  ('Education', 'Educational content and resources'),
  ('Business', 'Business and entrepreneurship'),
  ('Lifestyle', 'Lifestyle and personal development')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS blogs (
  blogid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tagid INTEGER REFERENCES tags(tagid),
  status VARCHAR(20) DEFAULT 'pending',
  file_path VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

DO $$ BEGIN IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'blogs' AND column_name = 'status'
) THEN ALTER TABLE blogs ADD COLUMN status VARCHAR(20) DEFAULT 'pending'; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'blogs' AND column_name = 'file_path'
) THEN ALTER TABLE blogs ADD COLUMN file_path VARCHAR(500); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'blogs' AND column_name = 'created_at'
) THEN ALTER TABLE blogs ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(); END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'blogs' AND column_name = 'reviewed_at'
) THEN ALTER TABLE blogs ADD COLUMN reviewed_at TIMESTAMPTZ; END IF; END $$;

CREATE TABLE IF NOT EXISTS comments (
  commentid SERIAL PRIMARY KEY,
  blogid INTEGER NOT NULL REFERENCES blogs(blogid) ON DELETE CASCADE,
  userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
  blogid INTEGER NOT NULL REFERENCES blogs(blogid) ON DELETE CASCADE,
  userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  PRIMARY KEY (blogid, userid)
);

CREATE TABLE IF NOT EXISTS blogratings (
  ratingid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  blogid INTEGER NOT NULL REFERENCES blogs(blogid) ON DELETE CASCADE,
  ratingvalue INTEGER NOT NULL CHECK (ratingvalue >= 1 AND ratingvalue <= 5)
);
