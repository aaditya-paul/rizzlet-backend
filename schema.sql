-- Rizzlet Database Schema
-- PostgreSQL

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- Usage Records Table
-- ============================================
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for usage queries
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_user_created ON usage_records(user_id, created_at);

-- ============================================
-- Trigger to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
