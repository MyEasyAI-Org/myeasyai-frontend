-- =============================================
-- MyEasyDocs Tables Migration (Fixed)
-- Matches the Drizzle schema exactly
-- =============================================

-- Drop old tables if they exist with wrong schema
DROP TABLE IF EXISTS docs_chunks_fts;
DROP TABLE IF EXISTS docs_chunks;
DROP TABLE IF EXISTS docs_content;
DROP TABLE IF EXISTS docs_documents;
DROP TABLE IF EXISTS docs_folders;

-- Docs Folders (hierarchical folder structure)
CREATE TABLE IF NOT EXISTS docs_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  parent_id TEXT,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES docs_folders(id) ON DELETE CASCADE
);

-- Docs Documents (file metadata)
CREATE TABLE IF NOT EXISTS docs_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  folder_id TEXT,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  r2_url TEXT,
  is_favorite INTEGER DEFAULT 0,
  extraction_status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES docs_folders(id) ON DELETE SET NULL
);

-- Docs Content (extracted text from documents)
-- Matches schema: raw_text, word_count, extracted_at (NO user_id)
CREATE TABLE IF NOT EXISTS docs_content (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  raw_text TEXT,
  word_count INTEGER DEFAULT 0,
  extracted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES docs_documents(id) ON DELETE CASCADE
);

-- Docs Chunks (text chunks for AI search)
-- Matches schema: content (not chunk_text), no content_id
CREATE TABLE IF NOT EXISTS docs_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES docs_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_docs_folders_user_id ON docs_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_folders_parent_id ON docs_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_docs_documents_user_id ON docs_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_documents_folder_id ON docs_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_docs_content_document_id ON docs_content(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_chunks_user_id ON docs_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_chunks_document_id ON docs_chunks(document_id);
