# Plano de Implementação: My Easy Docs

## Visão Geral

**My Easy Docs** - Módulo de organização de arquivos com IA integrada.

**Funcionalidades:**
- Upload/download de qualquer arquivo (limite: 100MB)
- Pastas hierárquicas
- Editor básico (TXT, MD)
- Chat IA sobre todos os documentos
- Storage: Cloudflare R2

---

# STATUS DE IMPLEMENTAÇÃO

| Fase | Descrição | Status |
|------|-----------|--------|
| 1-11 | Componentes Visuais | ✅ CONCLUÍDO |
| 12 | Migration do Banco de Dados | ⏳ Pendente |
| 13 | D1 Client - Métodos de Dados | ⏳ Pendente |
| 14 | Services de Lógica de Negócio | ⏳ Pendente |
| 15 | Hooks de Estado | ⏳ Pendente |
| 16 | Conectar UI com Dados Reais | ⏳ Pendente |
| 17 | Extração de Texto | ⏳ Pendente |
| 18 | Busca e IA | ⏳ Pendente |
| 19 | Testes e Polimento | ⏳ Pendente |

---

# FASES DE IMPLEMENTAÇÃO

> Ordem: Visual primeiro, backend depois

---

## FASE 1: Estrutura de Pastas e Arquivos Base ✅

### 1.1 Criar estrutura de pastas
Criar a seguinte estrutura em `src/features/my-easy-docs/`:
```
my-easy-docs/
├── components/
│   ├── layout/
│   ├── explorer/
│   ├── preview/
│   ├── modals/
│   ├── chat/
│   ├── upload/
│   └── shared/
├── hooks/
├── services/
├── types/
├── utils/
├── constants/
├── MyEasyDocs.tsx
└── index.ts
```

### 1.2 Criar arquivo de tipos básicos
Criar `src/features/my-easy-docs/types/index.ts` com interfaces:
- `DocsFolder`
- `DocsDocument`
- `TextExtractionStatus`
- `UploadProgress`
- `DocsChatMessage`
- `DocumentSource`

### 1.3 Criar arquivo de constantes
Criar `src/features/my-easy-docs/constants/index.ts` com:
- `MAX_FILE_SIZE`
- `SUPPORTED_TEXT_TYPES`
- `FILE_TYPE_ICONS` (mapeamento extensão → ícone Lucide)

### 1.4 Criar utils básicos
Criar `src/features/my-easy-docs/utils/index.ts` com:
- `formatFileSize(bytes)`
- `getFileExtension(filename)`
- `getFileType(mimeType)`
- `generateId()`

---

## FASE 2: Componente Principal e Layout Base ✅

### 2.1 Criar MyEasyDocs.tsx
Criar `src/features/my-easy-docs/MyEasyDocs.tsx`:
- Props: `onBackToDashboard`
- Layout flex: sidebar (280px) + área principal
- Estados locais: `currentFolderId`, `selectedDocument`, `viewMode`, `chatOpen`
- Dados mock temporários para visualização

### 2.2 Criar index.ts de exports
Criar `src/features/my-easy-docs/index.ts`:
```typescript
export { MyEasyDocs } from './MyEasyDocs';
export * from './types';
```

### 2.3 Adicionar rota no routes.ts
Em `src/router/routes.ts` adicionar:
```typescript
MY_EASY_DOCS: '/myeasydocs',
```

### 2.4 Adicionar rota no App.tsx
- Importar `MyEasyDocs`
- Adicionar `<Route>` com `<ProtectedRoute>`
- Criar função `goToMyEasyDocs`

---

## FASE 3: Sidebar e Navegação ✅

### 3.1 Criar DocsSidebar
Criar `src/features/my-easy-docs/components/layout/DocsSidebar.tsx`:
- Header com título "My Easy Docs" e botão voltar
- Botão "Nova Pasta"
- Botão "Upload"
- Área para FolderTree
- Seção "Favoritos" (link rápido)
- Seção "Recentes" (link rápido)
- Estilo dark theme consistente com projeto

### 3.2 Criar FolderTree
Criar `src/features/my-easy-docs/components/explorer/FolderTree.tsx`:
- Props: `folders`, `currentFolderId`, `onNavigate`, `onCreateFolder`
- Renderiza árvore recursiva de pastas
- Item "Meus Documentos" no topo (root)
- Expandir/colapsar com chevron

### 3.3 Criar FolderTreeItem
Criar `src/features/my-easy-docs/components/explorer/FolderTreeItem.tsx`:
- Props: `folder`, `level`, `isExpanded`, `isSelected`, `onToggle`, `onSelect`
- Ícone de pasta (Folder do Lucide)
- Nome da pasta
- Chevron para expandir
- Indentação por nível
- Hover e selected states

---

## FASE 4: Header e Toolbar ✅

### 4.1 Criar DocsHeader
Criar `src/features/my-easy-docs/components/layout/DocsHeader.tsx`:
- Props: `currentPath`, `onNavigate`, `viewMode`, `onViewModeChange`, `onOpenChat`
- Breadcrumb de navegação
- Botões: Grid/List toggle, Chat IA
- Estilo consistente

### 4.2 Criar Breadcrumb
Criar `src/features/my-easy-docs/components/shared/Breadcrumb.tsx`:
- Props: `path` (array de folders), `onNavigate`
- Renderiza: Home > Pasta1 > Pasta2
- Separador com ChevronRight
- Cada item clicável (exceto o último)

### 4.3 Criar SearchInput
Criar `src/features/my-easy-docs/components/shared/SearchInput.tsx`:
- Input com ícone de Search
- Placeholder "Buscar documentos..."
- Debounce na digitação
- Botão limpar (X)

---

## FASE 5: Grid e Lista de Arquivos ✅

### 5.1 Criar FileGrid
Criar `src/features/my-easy-docs/components/explorer/FileGrid.tsx`:
- Props: `items` (folders + documents), `onOpen`, `onSelect`
- CSS Grid responsivo (auto-fill, minmax 180px)
- Renderiza pastas primeiro, depois documentos
- Usa FileCard para cada item

### 5.2 Criar FileList
Criar `src/features/my-easy-docs/components/explorer/FileList.tsx`:
- Props: mesmas do FileGrid
- Tabela com colunas: Nome, Tamanho, Tipo, Modificado
- Header clicável para ordenação
- Renderiza FileRow para cada item

### 5.3 Criar FileCard
Criar `src/features/my-easy-docs/components/explorer/FileCard.tsx`:
- Props: `item` (folder ou document), `onOpen`, `onSelect`, `isSelected`
- Card com borda slate-800, bg slate-900/50
- Ícone grande no centro (FileIcon)
- Nome abaixo truncado
- Tamanho para documentos
- Hover effect (border-blue-500)
- Click para selecionar, double-click para abrir

### 5.4 Criar FileRow
Criar `src/features/my-easy-docs/components/explorer/FileRow.tsx`:
- Props: mesmas do FileCard
- Row de tabela
- Ícone pequeno + nome, tamanho, tipo, data
- Hover highlight
- Click/double-click behavior

### 5.5 Criar FileIcon
Criar `src/features/my-easy-docs/components/shared/FileIcon.tsx`:
- Props: `mimeType`, `size`
- Retorna ícone Lucide apropriado:
  - Folder → FolderIcon
  - PDF → FileText
  - Image → Image
  - Text → FileType
  - etc.

### 5.6 Criar EmptyState
Criar `src/features/my-easy-docs/components/explorer/EmptyState.tsx`:
- Ícone FolderOpen grande e opaco
- Texto "Nenhum arquivo nesta pasta"
- Botão "Fazer upload" primário

---

## FASE 6: Modais Básicos ✅

### 6.1 Criar CreateFolderModal
Criar `src/features/my-easy-docs/components/modals/CreateFolderModal.tsx`:
- Props: `isOpen`, `onClose`, `onCreate`, `parentFolderName`
- Input para nome da pasta
- Validação: não vazio
- Botões: Cancelar, Criar
- Padrão visual dos modais do projeto

### 6.2 Criar RenameModal
Criar `src/features/my-easy-docs/components/modals/RenameModal.tsx`:
- Props: `isOpen`, `onClose`, `onRename`, `currentName`, `itemType`
- Input preenchido com nome atual
- Título dinâmico: "Renomear pasta" ou "Renomear arquivo"
- Validação: não vazio, diferente do atual

### 6.3 Criar DeleteConfirmModal
Criar `src/features/my-easy-docs/components/modals/DeleteConfirmModal.tsx`:
- Props: `isOpen`, `onClose`, `onConfirm`, `itemName`, `itemType`, `hasChildren`
- Ícone AlertTriangle vermelho
- Mensagem de confirmação
- Aviso extra se pasta tem conteúdo
- Botão Deletar em vermelho

### 6.4 Criar MoveItemModal
Criar `src/features/my-easy-docs/components/modals/MoveItemModal.tsx`:
- Props: `isOpen`, `onClose`, `onMove`, `item`, `folders`
- Mini FolderTree para selecionar destino
- Preview do item sendo movido
- Desabilitar destino = origem

---

## FASE 7: Preview de Arquivos ✅

### 7.1 Criar FilePreview
Criar `src/features/my-easy-docs/components/preview/FilePreview.tsx`:
- Props: `document`, `onClose`, `onEdit`, `onDownload`
- Container que ocupa área direita (ou overlay)
- Header: nome, botões (download, editar, fechar)
- Switch por mime_type para componente específico

### 7.2 Criar ImagePreview
Criar `src/features/my-easy-docs/components/preview/ImagePreview.tsx`:
- Props: `url`, `name`
- Imagem centralizada
- Zoom básico (click para ampliar)
- Suporta: jpg, png, gif, webp, svg

### 7.3 Criar PdfPreview
Criar `src/features/my-easy-docs/components/preview/PdfPreview.tsx`:
- Props: `url`, `name`
- iframe ou object para renderizar PDF
- Fallback: link para abrir em nova aba

### 7.4 Criar TextPreview
Criar `src/features/my-easy-docs/components/preview/TextPreview.tsx`:
- Props: `content`, `name`, `onEdit`
- Área de texto read-only com scroll
- Monospace font
- Syntax highlight básico para .md
- Botão "Editar"

### 7.5 Criar UnsupportedPreview
Criar `src/features/my-easy-docs/components/preview/UnsupportedPreview.tsx`:
- Props: `document`, `onDownload`
- Ícone grande do tipo de arquivo
- Mensagem "Preview não disponível para este tipo"
- Botão "Download" destacado

---

## FASE 8: Upload UI ✅

### 8.1 Criar DropZone
Criar `src/features/my-easy-docs/components/upload/DropZone.tsx`:
- Props: `onFilesSelected`, `disabled`
- Área pontilhada para drag-and-drop
- Input file hidden (aceita múltiplos)
- Visual feedback: normal → hover → dragging
- Ícone Upload, texto "Arraste arquivos ou clique"
- Validação de tamanho (100MB)

### 8.2 Criar UploadModal
Criar `src/features/my-easy-docs/components/modals/UploadModal.tsx`:
- Props: `isOpen`, `onClose`, `currentFolderId`
- DropZone no topo
- Lista de arquivos selecionados
- UploadProgressList abaixo
- Botão "Fazer Upload"

### 8.3 Criar UploadProgressList
Criar `src/features/my-easy-docs/components/upload/UploadProgressList.tsx`:
- Props: `uploads` (array de UploadProgress)
- Lista de UploadProgressItem
- Mostra status geral

### 8.4 Criar UploadProgressItem
Criar `src/features/my-easy-docs/components/upload/UploadProgressItem.tsx`:
- Props: `upload`, `onCancel`
- Nome do arquivo
- Progress bar
- Status: pending, uploading, extracting, completed, error
- Ícone de status (spinner, check, x)
- Botão cancelar (se em progresso)

---

## FASE 9: Chat UI (Interface Visual) ✅

### 9.1 Criar DocsChatDrawer
Criar `src/features/my-easy-docs/components/chat/DocsChatDrawer.tsx`:
- Props: `isOpen`, `onClose`, `messages`, `onSend`, `isLoading`
- Drawer lateral (400px) que desliza da direita
- Header: "Assistente de Documentos", botão fechar
- Lista de mensagens com scroll
- Input fixo na parte inferior
- Backdrop semi-transparente

### 9.2 Criar DocsChatMessage
Criar `src/features/my-easy-docs/components/chat/DocsChatMessage.tsx`:
- Props: `message`
- Layout diferente: user (direita, azul) vs assistant (esquerda, slate)
- Avatar: user (ícone User) vs assistant (ícone Bot/Sparkles)
- Conteúdo com markdown renderizado
- DocumentSources se houver

### 9.3 Criar DocsChatInput
Criar `src/features/my-easy-docs/components/chat/DocsChatInput.tsx`:
- Props: `onSend`, `disabled`
- Textarea expansível (1-4 linhas)
- Botão enviar (SendHorizontal)
- Enter para enviar, Shift+Enter para nova linha
- Placeholder "Pergunte sobre seus documentos..."

### 9.4 Criar DocumentSources
Criar `src/features/my-easy-docs/components/chat/DocumentSources.tsx`:
- Props: `sources`, `onOpenDocument`
- Seção "Fontes consultadas:"
- Lista de chips clicáveis com nome do documento
- Ícone FileText pequeno

---

## FASE 10: Editor de Texto ✅

### 10.1 Criar TextEditor
Criar `src/features/my-easy-docs/components/preview/TextEditor.tsx`:
- Props: `content`, `onSave`, `onCancel`
- Textarea monospace com scroll
- Auto-resize ou altura fixa
- Toolbar: Salvar (check), Cancelar (x)
- Indicador de alterações não salvas

---

## FASE 11: Integração Visual Completa ✅

### 11.1 Integrar todos os componentes no MyEasyDocs
Atualizar `MyEasyDocs.tsx` para usar todos os componentes:
- DocsSidebar com FolderTree
- DocsHeader com Breadcrumb
- FileGrid ou FileList baseado em viewMode
- FilePreview quando documento selecionado
- CreateFolderModal, RenameModal, DeleteConfirmModal, MoveItemModal
- UploadModal
- DocsChatDrawer
- Estados para controlar abertura de modais
- Dados mock para visualização completa

### 11.2 Adicionar card no Dashboard
Atualizar `Dashboard.tsx`:
- Adicionar ProductCard para My Easy Docs
- Ícone: FolderOpen ou FileStack
- Descrição: "Organize seus arquivos e converse com a IA"
- Botão para navegar

### 11.3 Testar navegação visual
- Verificar todas as rotas funcionando
- Testar abertura/fechamento de modais
- Testar toggle grid/list
- Testar abertura do chat drawer
- Verificar responsividade básica

---

## MELHORIAS EXTRAS IMPLEMENTADAS ✅

> Componentes adicionais criados além do plano original

### VideoPreview.tsx
**Arquivo**: `components/preview/VideoPreview.tsx`
- Player HTML5 de vídeo com controles customizados
- Props: `url`, `name`
- Funcionalidades: play/pause, seek bar, volume, fullscreen
- Suporta: mp4, webm, ogg

### AudioPreview.tsx
**Arquivo**: `components/preview/AudioPreview.tsx`
- Player HTML5 de áudio com interface visual
- Props: `url`, `name`
- Funcionalidades: play/pause, seek bar, volume, skip 10s
- Arte placeholder com ícone de música
- Exibe duração e tempo atual

### CodePreview.tsx
**Arquivo**: `components/preview/CodePreview.tsx`
- Preview de código com syntax highlighting
- Props: `content`, `language`, `name`
- Usa `prism-react-renderer` com tema `vsDark`
- Detecta linguagem automaticamente pela extensão
- Suporta: js, ts, jsx, tsx, py, java, c, cpp, go, rust, json, yaml, xml, html, css, sql, sh, md

### TextEditorModal.tsx
**Arquivo**: `components/modals/TextEditorModal.tsx`
- Editor fullscreen em modal overlay
- Props: `isOpen`, `onClose`, `document`, `content`, `onSave`
- Funcionalidades:
  - Textarea monospace com altura total
  - Botão salvar (Save) e fechar (X)
  - Indicador de alterações não salvas
  - Confirmação antes de fechar se houver alterações

### CreateFileModal.tsx
**Arquivo**: `components/modals/CreateFileModal.tsx`
- Modal para criar novos arquivos de texto
- Props: `isOpen`, `onClose`, `onCreate`, `parentFolderName`
- Funcionalidades:
  - Input para nome do arquivo
  - Seletor de extensão (.txt ou .md)
  - Validação de nome não vazio
  - Cria documento vazio na pasta atual

### DocumentTreeItem.tsx
**Arquivo**: `components/explorer/DocumentTreeItem.tsx`
- Item de documento na árvore do sidebar
- Props: `document`, `level`, `isSelected`, `onSelect`
- Funcionalidades:
  - Ícone baseado no tipo de arquivo (FileIcon)
  - Indentação por nível (como pastas)
  - Estado selecionado destacado
  - Clique para selecionar documento

### Atualizações em Componentes Existentes

**FolderTree.tsx** (atualizado):
- Agora renderiza documentos dentro de cada pasta
- Usa `DocumentTreeItem` para cada documento
- Documentos aparecem após as subpastas
- Props adicionais: `documents`, `selectedDocumentId`, `onSelectDocument`

**DocsSidebar.tsx** (atualizado):
- Novo botão "Arquivo" ao lado de "Pasta"
- Props adicionais: `documents`, `selectedDocumentId`, `onCreateFile`, `onSelectDocument`
- Passa documentos para FolderTree

### Novas Funções Utilitárias

**utils/index.ts** (atualizado):
```typescript
// Verifica se é arquivo de código
isCode(mimeType: string): boolean

// Verifica se é vídeo
isVideo(mimeType: string): boolean

// Verifica se é áudio
isAudio(mimeType: string): boolean

// Retorna linguagem do código pela extensão
getCodeLanguage(filename: string): string

// Constante: extensões de código suportadas
CODE_EXTENSIONS: Record<string, string>
```

---

## FASE 12: Migration do Banco de Dados

### 12.1 Criar migration SQL
Criar `workers/api-d1/migrations/XXX_add_docs_tables.sql`:

```sql
-- docs_folders
CREATE TABLE IF NOT EXISTS docs_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  parent_id TEXT,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_docs_folders_user ON docs_folders(user_id);
CREATE INDEX idx_docs_folders_parent ON docs_folders(parent_id);

-- docs_documents
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
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_docs_documents_user ON docs_documents(user_id);
CREATE INDEX idx_docs_documents_folder ON docs_documents(folder_id);

-- docs_content
CREATE TABLE IF NOT EXISTS docs_content (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  text_content TEXT NOT NULL,
  chunks_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- docs_chunks
CREATE TABLE IF NOT EXISTS docs_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_docs_chunks_user ON docs_chunks(user_id);
CREATE INDEX idx_docs_chunks_document ON docs_chunks(document_id);

-- FTS5 para busca
CREATE VIRTUAL TABLE IF NOT EXISTS docs_chunks_fts USING fts5(
  chunk_text,
  content='docs_chunks',
  content_rowid='rowid'
);

-- Triggers FTS
CREATE TRIGGER docs_chunks_ai AFTER INSERT ON docs_chunks BEGIN
  INSERT INTO docs_chunks_fts(rowid, chunk_text) VALUES (new.rowid, new.chunk_text);
END;
CREATE TRIGGER docs_chunks_ad AFTER DELETE ON docs_chunks BEGIN
  INSERT INTO docs_chunks_fts(docs_chunks_fts, rowid, chunk_text) VALUES('delete', old.rowid, old.chunk_text);
END;
```

---

## FASE 13: D1 Client - Métodos de Dados

### 13.1 Adicionar tipos D1 para Docs
Em `src/lib/api-clients/d1-client.ts` adicionar interfaces:
- `D1DocsFolder`
- `D1DocsDocument`
- `D1DocsContent`
- `D1DocsChunk`

### 13.2 Adicionar métodos de Folders
- `getDocsFolders(userId)`
- `getDocsFolderById(id)`
- `createDocsFolder(data)`
- `updateDocsFolder(id, data)`
- `deleteDocsFolder(id)`

### 13.3 Adicionar métodos de Documents
- `getDocsDocuments(userId, folderId?)`
- `getDocsDocumentById(id)`
- `createDocsDocument(data)`
- `updateDocsDocument(id, data)`
- `deleteDocsDocument(id)`

### 13.4 Adicionar métodos de Content e Chunks
- `createDocsContent(data)`
- `getDocsContentByDocument(documentId)`
- `createDocsChunks(chunks)`
- `searchDocsChunks(userId, query)` - usa FTS5
- `deleteDocsChunksByDocument(documentId)`

---

## FASE 14: Services de Lógica de Negócio

### 14.1 Criar FolderService
Criar `src/features/my-easy-docs/services/FolderService.ts`:
- `getAll(userId)`
- `getById(id)`
- `getByParent(userId, parentId)`
- `create(userId, name, parentId?)`
- `rename(id, newName)`
- `move(id, newParentId)`
- `delete(id)`
- `getPath(id)` - retorna breadcrumb

### 14.2 Criar DocumentService
Criar `src/features/my-easy-docs/services/DocumentService.ts`:
- `getAll(userId)`
- `getByFolder(userId, folderId)`
- `getById(id)`
- `create(data)` - **Suporta criar documentos vazios para .txt/.md (CreateFileModal)**
- `update(id, data)`
- `move(id, newFolderId)`
- `toggleFavorite(id)`
- `delete(id)` - deleta também do R2
- `getContent(id)` - retorna conteúdo texto do documento
- `saveContent(id, content)` - salva conteúdo texto (para TextEditorModal)

### 14.3 Criar UploadService
Criar `src/features/my-easy-docs/services/UploadService.ts`:
- `validateFile(file)`
- `generateR2Key(userId, docId, filename)`
- `uploadToR2(file, key, onProgress)` - usa CloudflareClient
- `getDownloadUrl(r2Key)`

---

## FASE 15: Hooks de Estado

### 15.1 Criar useFolders
Criar `src/features/my-easy-docs/hooks/useFolders.ts`:
- Estado: folders, currentFolder, currentPath, loading, error
- Ações: load, createFolder, renameFolder, moveFolder, deleteFolder
- navigateTo(folderId)
- Integra com FolderService

### 15.2 Criar useDocuments
Criar `src/features/my-easy-docs/hooks/useDocuments.ts`:
- Estado: documents, selectedDocument, loading, error
- Ações: load, updateDocument, moveDocument, toggleFavorite, deleteDocument
- Filtrar por currentFolderId
- Integra com DocumentService

### 15.3 Criar useFileUpload
Criar `src/features/my-easy-docs/hooks/useFileUpload.ts`:
- Estado: uploads (array de UploadProgress)
- uploadFiles(files, folderId)
- Gerencia progresso de cada arquivo
- Integra com UploadService

---

## FASE 16: Conectar UI com Dados Reais

### 16.1 Atualizar MyEasyDocs com hooks reais
- Substituir dados mock por useFolders e useDocuments
- Conectar ações dos modais aos services
- Conectar upload real
- Gerenciar loading states

### 16.2 Testar CRUD completo
- Criar pasta
- Renomear pasta
- Mover pasta
- Deletar pasta
- Upload de arquivo
- Renomear arquivo
- Mover arquivo
- Deletar arquivo

---

## FASE 17: Extração de Texto

### 17.1 Instalar dependências
```bash
npm install unpdf mammoth
```

### 17.2 Criar TextExtractionService
Criar `src/features/my-easy-docs/services/TextExtractionService.ts`:
- `canExtract(mimeType)`
- `extractFromPdf(blob)` - usa unpdf
- `extractFromDocx(blob)` - usa mammoth
- `extractFromText(blob)` - leitura direta
- `extract(file)` - método unificado

### 17.3 Criar textChunker util
Criar `src/features/my-easy-docs/utils/textChunker.ts`:
- `chunkText(text, chunkSize, overlap)`
- Quebra em parágrafos/frases
- Retorna array de strings

### 17.4 Integrar extração no upload
Após upload bem-sucedido:
1. Verificar se tipo suporta extração
2. Extrair texto
3. Dividir em chunks
4. Salvar em docs_content e docs_chunks
5. Atualizar status do documento

---

## FASE 18: Busca e IA

### 18.1 Criar DocsSearchService
Criar `src/features/my-easy-docs/services/DocsSearchService.ts`:
- `searchChunks(userId, query)` - busca FTS5
- `rankResults(chunks, query)`
- `getDocumentContext(chunks)`

### 18.2 Criar DocsAIService
Criar `src/features/my-easy-docs/services/DocsAIService.ts`:
- `buildPrompt(question, chunks, history)`
- `askQuestion(userId, question, history)`
  1. Buscar chunks relevantes
  2. Construir prompt
  3. Chamar geminiClient
  4. Retornar resposta + sources

### 18.3 Criar useDocsChat
Criar `src/features/my-easy-docs/hooks/useDocsChat.ts`:
- Estado: messages, isLoading, error
- sendMessage(content)
- clearMessages()
- Integra com DocsAIService

### 18.4 Conectar chat UI com hook
Atualizar DocsChatDrawer para usar useDocsChat real

---

## FASE 19: Testes e Polimento

### 19.1 Testar build
```bash
npm run build
```

### 19.2 Testar funcionalidades
1. CRUD de pastas
2. Upload de arquivos (vários tipos)
3. Extração de texto (PDF, DOCX, TXT)
4. Preview de arquivos:
   - Imagens (jpg, png, gif, webp, svg)
   - PDF
   - Texto (.txt, .md)
   - **Vídeo (mp4, webm, ogg)** - VideoPreview
   - **Áudio (mp3, wav, ogg)** - AudioPreview
   - **Código (js, ts, py, etc.)** - CodePreview com syntax highlight
5. Editor de texto:
   - Editor inline (TextEditor)
   - **Editor fullscreen (TextEditorModal)**
6. **Criar arquivo vazio (.txt/.md)** - CreateFileModal
7. Chat IA com perguntas
8. Busca de documentos

### 19.3 Ajustes finais
- Loading states em todas as operações
- Error handling com toast
- Responsividade
- Mensagens de feedback
- Edge cases (pasta vazia, erro de upload, etc.)

---

# Resumo de Arquivos por Fase

| Fase | Foco | Arquivos Principais | Status |
|------|------|---------------------|--------|
| 1 | Base | types/, constants/, utils/ | ✅ |
| 2 | Componente principal | MyEasyDocs.tsx, index.ts, routes.ts, App.tsx | ✅ |
| 3 | Sidebar | DocsSidebar, FolderTree, FolderTreeItem | ✅ |
| 4 | Header | DocsHeader, Breadcrumb, SearchInput | ✅ |
| 5 | Grid/Lista | FileGrid, FileList, FileCard, FileRow, FileIcon, EmptyState | ✅ |
| 6 | Modais | CreateFolderModal, RenameModal, DeleteConfirmModal, MoveItemModal | ✅ |
| 7 | Preview | FilePreview, ImagePreview, PdfPreview, TextPreview, UnsupportedPreview | ✅ |
| 8 | Upload UI | DropZone, UploadModal, UploadProgressList, UploadProgressItem | ✅ |
| 9 | Chat UI | DocsChatDrawer, DocsChatMessage, DocsChatInput, DocumentSources | ✅ |
| 10 | Editor | TextEditor | ✅ |
| 11 | Integração visual | MyEasyDocs completo, Dashboard card | ✅ |
| **Extras** | **Melhorias** | **VideoPreview, AudioPreview, CodePreview, TextEditorModal, CreateFileModal, DocumentTreeItem** | ✅ |
| 12 | DB | migration SQL | ⏳ |
| 13 | D1 Client | métodos no d1-client.ts | ⏳ |
| 14 | Services | FolderService, DocumentService, UploadService | ⏳ |
| 15 | Hooks | useFolders, useDocuments, useFileUpload | ⏳ |
| 16 | Conectar UI | MyEasyDocs com dados reais | ⏳ |
| 17 | Extração | TextExtractionService, textChunker | ⏳ |
| 18 | IA | DocsSearchService, DocsAIService, useDocsChat | ⏳ |
| 19 | Testes | Ajustes finais | ⏳ |

---

# Verificação Final

## Fases 1-11 (Visual) - CONCLUÍDAS ✅

1. ✅ **Build sem erros**: `npm run build` passa
2. ✅ **Visual completo**: Todas as telas renderizam corretamente
3. ✅ **Preview funciona**: PDF, imagem, texto, vídeo, áudio e código renderizam
4. ✅ **Editor funciona**: Editor inline e fullscreen funcionam

## Fases 12-19 (Backend) - PENDENTES ⏳

5. ⏳ **CRUD funciona**: Criar, renomear, mover, deletar (precisa backend)
6. ⏳ **Upload funciona**: Arquivo vai para R2 e aparece na lista (precisa backend)
7. ⏳ **Extração funciona**: PDFs/DOCX/TXT são indexados (precisa backend)
8. ⏳ **Chat funciona**: IA responde sobre documentos (precisa backend)
