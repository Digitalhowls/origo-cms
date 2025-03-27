-- Migración para la tabla de plantillas de diseño predefinidas
CREATE TABLE IF NOT EXISTS layout_templates (
  id SERIAL PRIMARY KEY, 
  name TEXT NOT NULL,
  description TEXT,
  preview TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  thumbnail TEXT,
  structure JSONB NOT NULL,
  content JSONB NOT NULL,
  popularity INTEGER DEFAULT 0 NOT NULL,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);