CREATE TABLE artisans (
  id SERIAL PRIMARY KEY,
  gmail VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(10),
  dob DATE NOT NULL,
  city VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  skill VARCHAR(100) NOT NULL,
  experience INTEGER NOT NULL,
  bio TEXT NOT NULL,
  profile_pic TEXT,
  certificate TEXT,
  reference TEXT,
  portfolio TEXT[]
);
