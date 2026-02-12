// Docs API Routes - CRUD para MyEasyDocs
// Gerencia pastas, documentos, conteúdo extraído e chunks para busca IA
// Inclui endpoint para servir arquivos do R2

import { Hono } from 'hono';
import { eq, and, desc, isNull, sql } from 'drizzle-orm';
import {
  docsFolders,
  docsDocuments,
  docsContent,
  docsChunks,
  type NewDocsFolder,
  type NewDocsDocument,
  type NewDocsContent,
  type NewDocsChunk,
} from '../db/schema';
import type { Env, Variables } from '../index';

export const docsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// =============================================================================
// FOLDERS
// =============================================================================

/**
 * GET /docs/folders/user/:userId
 * Lista todas as pastas de um usuário
 */
docsRoutes.get('/folders/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const folders = await db.query.docsFolders.findMany({
    where: eq(docsFolders.user_id, userId),
    orderBy: [desc(docsFolders.created_at)],
  });

  return c.json({ data: folders });
});

/**
 * GET /docs/folders/:id
 * Busca pasta por ID
 */
docsRoutes.get('/folders/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const folder = await db.query.docsFolders.findFirst({
    where: eq(docsFolders.id, id),
  });

  if (!folder) {
    return c.json({ error: 'Folder not found' }, 404);
  }

  return c.json({ data: folder });
});

/**
 * GET /docs/folders/user/:userId/root
 * Lista pastas na raiz (sem parent)
 */
docsRoutes.get('/folders/user/:userId/root', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const folders = await db.query.docsFolders.findMany({
    where: and(
      eq(docsFolders.user_id, userId),
      isNull(docsFolders.parent_id)
    ),
    orderBy: [desc(docsFolders.created_at)],
  });

  return c.json({ data: folders });
});

/**
 * GET /docs/folders/user/:userId/parent/:parentId
 * Lista pastas filhas de uma pasta
 */
docsRoutes.get('/folders/user/:userId/parent/:parentId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const parentId = c.req.param('parentId');

  const folders = await db.query.docsFolders.findMany({
    where: and(
      eq(docsFolders.user_id, userId),
      eq(docsFolders.parent_id, parentId)
    ),
    orderBy: [desc(docsFolders.created_at)],
  });

  return c.json({ data: folders });
});

/**
 * POST /docs/folders
 * Cria nova pasta
 */
docsRoutes.post('/folders', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewDocsFolder>();

  if (!body.user_id || !body.name) {
    return c.json({ error: 'user_id and name are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newFolder: NewDocsFolder = {
    id,
    user_id: body.user_id,
    parent_id: body.parent_id || null,
    name: body.name,
    path: body.path || `/${body.name}`,
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(docsFolders).values(newFolder).returning();

  console.log(`✅ [D1] Docs Folder created: ${id}`);
  return c.json({ data: result[0], success: true }, 201);
});

/**
 * PATCH /docs/folders/:id
 * Atualiza pasta
 */
docsRoutes.patch('/folders/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, ...updates } = body;

  const result = await db
    .update(docsFolders)
    .set({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .where(eq(docsFolders.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Folder not found' }, 404);
  }

  console.log(`✅ [D1] Docs Folder updated: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /docs/folders/:id
 * Remove pasta (cascade deleta documentos)
 */
docsRoutes.delete('/folders/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(docsFolders)
    .where(eq(docsFolders.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Folder not found' }, 404);
  }

  console.log(`✅ [D1] Docs Folder deleted: ${id}`);
  return c.json({ success: true });
});

// =============================================================================
// DOCUMENTS
// =============================================================================

/**
 * GET /docs/documents/user/:userId
 * Lista todos os documentos de um usuário
 */
docsRoutes.get('/documents/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const folderId = c.req.query('folder_id');

  let whereClause = eq(docsDocuments.user_id, userId);

  if (folderId === 'null' || folderId === '') {
    whereClause = and(whereClause, isNull(docsDocuments.folder_id)) as typeof whereClause;
  } else if (folderId) {
    whereClause = and(whereClause, eq(docsDocuments.folder_id, folderId)) as typeof whereClause;
  }

  const documents = await db.query.docsDocuments.findMany({
    where: whereClause,
    orderBy: [desc(docsDocuments.created_at)],
  });

  return c.json({ data: documents });
});

/**
 * GET /docs/documents/user/:userId/recent
 * Lista documentos recentes
 */
docsRoutes.get('/documents/user/:userId/recent', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  const documents = await db.query.docsDocuments.findMany({
    where: eq(docsDocuments.user_id, userId),
    orderBy: [desc(docsDocuments.updated_at)],
    limit,
  });

  return c.json({ data: documents });
});

/**
 * GET /docs/documents/user/:userId/favorites
 * Lista documentos favoritos
 */
docsRoutes.get('/documents/user/:userId/favorites', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const documents = await db.query.docsDocuments.findMany({
    where: and(
      eq(docsDocuments.user_id, userId),
      eq(docsDocuments.is_favorite, true)
    ),
    orderBy: [desc(docsDocuments.updated_at)],
  });

  return c.json({ data: documents });
});

/**
 * GET /docs/documents/:id
 * Busca documento por ID
 */
docsRoutes.get('/documents/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const document = await db.query.docsDocuments.findFirst({
    where: eq(docsDocuments.id, id),
  });

  if (!document) {
    return c.json({ error: 'Document not found' }, 404);
  }

  return c.json({ data: document });
});

/**
 * POST /docs/documents
 * Cria novo documento
 */
docsRoutes.post('/documents', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewDocsDocument>();

  if (!body.user_id || !body.name || !body.r2_key) {
    return c.json({ error: 'user_id, name, and r2_key are required' }, 400);
  }

  const id = body.id || crypto.randomUUID();
  const now = new Date().toISOString();

  const newDocument: NewDocsDocument = {
    id,
    user_id: body.user_id,
    folder_id: body.folder_id || null,
    name: body.name,
    original_name: body.original_name || body.name,
    mime_type: body.mime_type || 'application/octet-stream',
    size: body.size || 0,
    r2_key: body.r2_key,
    r2_url: body.r2_url || null,
    is_favorite: body.is_favorite || false,
    extraction_status: body.extraction_status || 'pending',
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(docsDocuments).values(newDocument).returning();

  console.log(`✅ [D1] Docs Document created: ${id}`);
  return c.json({ data: result[0], success: true }, 201);
});

/**
 * PATCH /docs/documents/:id
 * Atualiza documento
 */
docsRoutes.patch('/documents/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, ...updates } = body;

  const result = await db
    .update(docsDocuments)
    .set({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .where(eq(docsDocuments.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Document not found' }, 404);
  }

  console.log(`✅ [D1] Docs Document updated: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * PATCH /docs/documents/:id/favorite
 * Toggle favorito do documento
 */
docsRoutes.patch('/documents/:id/favorite', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  // Primeiro, busca o documento atual
  const current = await db.query.docsDocuments.findFirst({
    where: eq(docsDocuments.id, id),
  });

  if (!current) {
    return c.json({ error: 'Document not found' }, 404);
  }

  // Toggle o is_favorite
  const result = await db
    .update(docsDocuments)
    .set({
      is_favorite: !current.is_favorite,
      updated_at: new Date().toISOString(),
    })
    .where(eq(docsDocuments.id, id))
    .returning();

  console.log(`✅ [D1] Docs Document favorite toggled: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /docs/documents/:id
 * Remove documento
 */
docsRoutes.delete('/documents/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(docsDocuments)
    .where(eq(docsDocuments.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Document not found' }, 404);
  }

  console.log(`✅ [D1] Docs Document deleted: ${id}`);
  return c.json({ success: true });
});

// =============================================================================
// CONTENT
// =============================================================================

/**
 * GET /docs/content/document/:documentId
 * Busca conteúdo extraído de um documento
 */
docsRoutes.get('/content/document/:documentId', async (c) => {
  const db = c.get('db');
  const documentId = c.req.param('documentId');

  const content = await db.query.docsContent.findFirst({
    where: eq(docsContent.document_id, documentId),
  });

  if (!content) {
    return c.json({ error: 'Content not found' }, 404);
  }

  return c.json({ data: content });
});

/**
 * POST /docs/content
 * Cria/atualiza conteúdo extraído
 */
docsRoutes.post('/content', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewDocsContent>();

  if (!body.document_id) {
    return c.json({ error: 'document_id is required' }, 400);
  }

  // Verifica se já existe conteúdo para este documento
  const existing = await db.query.docsContent.findFirst({
    where: eq(docsContent.document_id, body.document_id),
  });

  if (existing) {
    // Atualiza
    const result = await db
      .update(docsContent)
      .set({
        raw_text: body.raw_text || null,
        word_count: body.word_count || 0,
        extracted_at: new Date().toISOString(),
      })
      .where(eq(docsContent.document_id, body.document_id))
      .returning();

    console.log(`✅ [D1] Docs Content updated for document: ${body.document_id}`);
    return c.json({ data: result[0], success: true });
  }

  // Cria novo
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newContent: NewDocsContent = {
    id,
    document_id: body.document_id,
    raw_text: body.raw_text || null,
    word_count: body.word_count || 0,
    extracted_at: now,
  };

  const result = await db.insert(docsContent).values(newContent).returning();

  console.log(`✅ [D1] Docs Content created for document: ${body.document_id}`);
  return c.json({ data: result[0], success: true }, 201);
});

/**
 * DELETE /docs/content/document/:documentId
 * Remove conteúdo de um documento
 */
docsRoutes.delete('/content/document/:documentId', async (c) => {
  const db = c.get('db');
  const documentId = c.req.param('documentId');

  await db
    .delete(docsContent)
    .where(eq(docsContent.document_id, documentId));

  console.log(`✅ [D1] Docs Content deleted for document: ${documentId}`);
  return c.json({ success: true });
});

// =============================================================================
// CHUNKS
// =============================================================================

/**
 * GET /docs/chunks/document/:documentId
 * Lista chunks de um documento
 */
docsRoutes.get('/chunks/document/:documentId', async (c) => {
  const db = c.get('db');
  const documentId = c.req.param('documentId');

  const chunks = await db.query.docsChunks.findMany({
    where: eq(docsChunks.document_id, documentId),
    orderBy: [docsChunks.chunk_index],
  });

  return c.json({ data: chunks });
});

/**
 * POST /docs/chunks/batch
 * Cria múltiplos chunks de uma vez
 */
docsRoutes.post('/chunks/batch', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<{ chunks: NewDocsChunk[] }>();

  if (!body.chunks || !Array.isArray(body.chunks) || body.chunks.length === 0) {
    return c.json({ error: 'chunks array is required' }, 400);
  }

  const now = new Date().toISOString();
  const chunksToInsert = body.chunks.map((chunk, index) => ({
    id: crypto.randomUUID(),
    document_id: chunk.document_id,
    user_id: chunk.user_id,
    chunk_index: chunk.chunk_index ?? index,
    content: chunk.content,
    created_at: now,
  }));

  await db.insert(docsChunks).values(chunksToInsert);

  console.log(`✅ [D1] Docs Chunks created: ${chunksToInsert.length} chunks`);
  return c.json({ success: true, count: chunksToInsert.length }, 201);
});

/**
 * DELETE /docs/chunks/document/:documentId
 * Remove todos os chunks de um documento
 */
docsRoutes.delete('/chunks/document/:documentId', async (c) => {
  const db = c.get('db');
  const documentId = c.req.param('documentId');

  await db
    .delete(docsChunks)
    .where(eq(docsChunks.document_id, documentId));

  console.log(`✅ [D1] Docs Chunks deleted for document: ${documentId}`);
  return c.json({ success: true });
});

/**
 * GET /docs/chunks/search
 * Busca chunks por texto - Multi-termo com OR
 * Query params: user_id, query, limit
 */
docsRoutes.get('/chunks/search', async (c) => {
  const db = c.get('db');
  const userId = c.req.query('user_id');
  const query = c.req.query('query');
  const limitParam = c.req.query('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  if (!userId || !query) {
    return c.json({ error: 'user_id and query are required' }, 400);
  }

  // Extrair palavras significativas (min 2 caracteres)
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length >= 2)
    .slice(0, 10); // Max 10 palavras para evitar queries muito pesadas

  if (words.length === 0) {
    return c.json({ data: [] });
  }

  // Construir condições OR para cada palavra (case-insensitive)
  // LOWER(content) LIKE '%word1%' OR LOWER(content) LIKE '%word2%' ...
  const orConditions = words.map((word: string) =>
    sql`LOWER(${docsChunks.content}) LIKE ${'%' + word + '%'}`
  );

  const results = await db
    .select({
      chunk_id: docsChunks.id,
      document_id: docsChunks.document_id,
      chunk_index: docsChunks.chunk_index,
      content: docsChunks.content,
      document_name: docsDocuments.name,
    })
    .from(docsChunks)
    .innerJoin(docsDocuments, eq(docsChunks.document_id, docsDocuments.id))
    .where(
      and(
        eq(docsChunks.user_id, userId),
        sql`(${sql.join(orConditions, sql` OR `)})`
      )
    )
    .limit(limit);

  return c.json({ data: results });
});

// =============================================================================
// STATS
// =============================================================================

/**
 * GET /docs/stats/user/:userId
 * Retorna estatísticas do usuário
 */
docsRoutes.get('/stats/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  // Conta pastas
  const foldersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(docsFolders)
    .where(eq(docsFolders.user_id, userId));

  // Conta documentos
  const documentsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(docsDocuments)
    .where(eq(docsDocuments.user_id, userId));

  // Soma tamanho total
  const sizeResult = await db
    .select({ total: sql<number>`COALESCE(SUM(size), 0)` })
    .from(docsDocuments)
    .where(eq(docsDocuments.user_id, userId));

  // Conta chunks
  const chunksResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(docsChunks)
    .where(eq(docsChunks.user_id, userId));

  return c.json({
    data: {
      total_folders: foldersResult[0]?.count || 0,
      total_documents: documentsResult[0]?.count || 0,
      total_size: sizeResult[0]?.total || 0,
      total_chunks: chunksResult[0]?.count || 0,
    },
  });
});

// =============================================================================
// FILE SERVING (R2)
// =============================================================================

/**
 * GET /docs/files/*
 * Serve arquivos diretamente do R2 bucket
 * O path após /files/ é a chave do R2 (ex: docs/userId/docId.xlsx)
 */
docsRoutes.get('/files/*', async (c) => {
  const r2 = c.env.R2_BUCKET;

  if (!r2) {
    console.error('❌ [DOCS] R2_BUCKET binding not available');
    return c.json({ error: 'Storage not configured' }, 500);
  }

  // Extrair a chave R2 do path (tudo após /docs/files/)
  const path = c.req.path;
  const r2Key = path.replace('/docs/files/', '');

  if (!r2Key || r2Key === '') {
    return c.json({ error: 'File key is required' }, 400);
  }

  console.log(`📥 [DOCS] Serving file: ${r2Key}`);

  try {
    const object = await r2.get(r2Key);

    if (!object) {
      console.warn(`⚠️ [DOCS] File not found: ${r2Key}`);
      return c.json({ error: 'File not found' }, 404);
    }

    // Determinar Content-Type baseado na extensão ou usar o httpMetadata
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';

    console.log(`✅ [DOCS] Serving ${r2Key} (${object.size} bytes, ${contentType})`);

    // Retornar o arquivo com headers apropriados
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=3600',
        'ETag': object.etag,
      },
    });
  } catch (error) {
    console.error(`❌ [DOCS] Error serving file ${r2Key}:`, error);
    return c.json({ error: 'Failed to retrieve file' }, 500);
  }
});
