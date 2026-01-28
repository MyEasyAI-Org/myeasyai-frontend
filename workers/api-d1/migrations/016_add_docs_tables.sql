-- =============================================
-- MyEasyDocs Tables Migration
-- Document storage and AI chat module
-- =============================================

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
  r2_key TEXT NOT NULL UNIQUE,
  r2_url TEXT,
  text_extraction_status TEXT DEFAULT 'pending',
  is_favorite INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES docs_folders(id) ON DELETE SET NULL
);

-- Docs Content (extracted text from documents)
CREATE TABLE IF NOT EXISTS docs_content (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  text_content TEXT NOT NULL,
  chunks_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES docs_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Docs Chunks (text chunks for AI search)
CREATE TABLE IF NOT EXISTS docs_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES docs_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES docs_content(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- FTS5 virtual table for full-text search on chunks
CREATE VIRTUAL TABLE IF NOT EXISTS docs_chunks_fts USING fts5(
  chunk_text,
  content='docs_chunks',
  content_rowid='rowid'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS docs_chunks_ai AFTER INSERT ON docs_chunks BEGIN
  INSERT INTO docs_chunks_fts(rowid, chunk_text) VALUES (new.rowid, new.chunk_text);
END;

CREATE TRIGGER IF NOT EXISTS docs_chunks_ad AFTER DELETE ON docs_chunks BEGIN
  INSERT INTO docs_chunks_fts(docs_chunks_fts, rowid, chunk_text) VALUES('delete', old.rowid, old.chunk_text);
END;

CREATE TRIGGER IF NOT EXISTS docs_chunks_au AFTER UPDATE ON docs_chunks BEGIN
  INSERT INTO docs_chunks_fts(docs_chunks_fts, rowid, chunk_text) VALUES('delete', old.rowid, old.chunk_text);
  INSERT INTO docs_chunks_fts(rowid, chunk_text) VALUES (new.rowid, new.chunk_text);
END;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_docs_folders_user_id ON docs_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_folders_parent_id ON docs_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_docs_documents_user_id ON docs_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_documents_folder_id ON docs_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_docs_documents_r2_key ON docs_documents(r2_key);
CREATE INDEX IF NOT EXISTS idx_docs_documents_favorite ON docs_documents(is_favorite);
CREATE INDEX IF NOT EXISTS idx_docs_content_document_id ON docs_content(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_content_user_id ON docs_content(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_chunks_user_id ON docs_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_chunks_document_id ON docs_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_chunks_content_id ON docs_chunks(content_id);
