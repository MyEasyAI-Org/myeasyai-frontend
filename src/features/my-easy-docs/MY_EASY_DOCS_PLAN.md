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
| 12 | Migration do Banco de Dados | ✅ CONCLUÍDO |
| 13 | D1 Client - Métodos de Dados | ✅ CONCLUÍDO |
| 13.5 | Worker API Routes | ✅ CONCLUÍDO |
| 14 | Services de Lógica de Negócio | ✅ CONCLUÍDO |
| 15 | Hooks de Estado | ✅ CONCLUÍDO |
| 16 | Conectar UI com Dados Reais | ✅ CONCLUÍDO |
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

## FASE 12: Migration do Banco de Dados ✅

### 12.1 Migration SQL Criada
**Arquivo**: `workers/api-d1/migrations/016_add_docs_tables.sql`

Tabelas criadas:
- `docs_folders` - Estrutura hierárquica de pastas
- `docs_documents` - Metadados dos arquivos
- `docs_content` - Texto extraído dos documentos
- `docs_chunks` - Chunks para busca IA
- `docs_chunks_fts` - Tabela virtual FTS5 para busca full-text

Triggers implementados:
- `docs_chunks_ai` - Sincroniza inserções com FTS
- `docs_chunks_ad` - Sincroniza deleções com FTS
- `docs_chunks_au` - Sincroniza atualizações com FTS

Indexes criados para performance em todas as tabelas.

---

## FASE 13: D1 Client - Métodos de Dados ✅

### 13.1 Tipos D1 Adicionados
Em `src/lib/api-clients/d1-client.ts`:
- `D1DocsFolder`
- `D1DocsDocument`
- `D1DocsContent`
- `D1DocsChunk`
- `D1DocsSearchResult`

### 13.2 Métodos de Folders Implementados
- `getDocsFolders(userId)` - Lista todas as pastas
- `getDocsFolderById(id)` - Busca pasta por ID
- `getDocsFoldersByParent(userId, parentId)` - Lista pastas filhas
- `createDocsFolder(data)` - Cria nova pasta
- `updateDocsFolder(id, data)` - Atualiza pasta
- `deleteDocsFolder(id)` - Deleta pasta

### 13.3 Métodos de Documents Implementados
- `getDocsDocuments(userId, options?)` - Lista documentos com filtros
- `getDocsDocumentById(id)` - Busca documento por ID
- `getRecentDocsDocuments(userId, limit)` - Documentos recentes
- `getFavoriteDocsDocuments(userId)` - Documentos favoritos
- `createDocsDocument(data)` - Cria novo documento
- `updateDocsDocument(id, data)` - Atualiza documento
- `toggleDocsDocumentFavorite(id)` - Alterna favorito
- `deleteDocsDocument(id)` - Deleta documento

### 13.4 Métodos de Content e Chunks Implementados
- `getDocsContent(documentId)` - Busca conteúdo extraído
- `createDocsContent(data)` - Cria conteúdo
- `deleteDocsContent(documentId)` - Deleta conteúdo
- `getDocsChunks(documentId)` - Lista chunks
- `createDocsChunks(chunks)` - Cria chunks em lote
- `deleteDocsChunks(documentId)` - Deleta chunks
- `searchDocsChunks(userId, query, limit)` - Busca FTS5
- `getDocsStats(userId)` - Estatísticas do usuário

---

## FASE 13.5: Worker API Routes ✅

### 13.5.1 Schema Drizzle Adicionado
**Arquivo**: `workers/api-d1/src/db/schema.ts`

Tabelas adicionadas ao schema Drizzle:
```typescript
// docs_folders - Pastas de documentos
export const docsFolders = sqliteTable('docs_folders', {
  id, user_id, parent_id, name, path, created_at, updated_at
});

// docs_documents - Documentos
export const docsDocuments = sqliteTable('docs_documents', {
  id, user_id, folder_id, name, original_name, mime_type, size,
  r2_key, r2_url, is_favorite, extraction_status, created_at, updated_at
});

// docs_content - Conteúdo extraído
export const docsContent = sqliteTable('docs_content', {
  id, document_id, raw_text, word_count, extracted_at
});

// docs_chunks - Chunks para busca IA
export const docsChunks = sqliteTable('docs_chunks', {
  id, document_id, user_id, chunk_index, content, created_at
});
```

Types exportados:
- `DocsFolder`, `NewDocsFolder`
- `DocsDocument`, `NewDocsDocument`
- `DocsContent`, `NewDocsContent`
- `DocsChunk`, `NewDocsChunk`

### 13.5.2 Rotas API Criadas
**Arquivo**: `workers/api-d1/src/routes/docs.ts`

#### Folders
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/docs/folders/user/:userId` | Lista todas as pastas |
| GET | `/docs/folders/:id` | Busca pasta por ID |
| GET | `/docs/folders/user/:userId/root` | Lista pastas na raiz |
| GET | `/docs/folders/user/:userId/parent/:parentId` | Lista pastas filhas |
| POST | `/docs/folders` | Cria pasta |
| PATCH | `/docs/folders/:id` | Atualiza pasta |
| DELETE | `/docs/folders/:id` | Deleta pasta |

#### Documents
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/docs/documents/user/:userId` | Lista documentos (query: folder_id) |
| GET | `/docs/documents/user/:userId/recent` | Lista recentes (query: limit) |
| GET | `/docs/documents/user/:userId/favorites` | Lista favoritos |
| GET | `/docs/documents/:id` | Busca documento por ID |
| POST | `/docs/documents` | Cria documento |
| PATCH | `/docs/documents/:id` | Atualiza documento |
| PATCH | `/docs/documents/:id/favorite` | Toggle favorito |
| DELETE | `/docs/documents/:id` | Deleta documento |

#### Content
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/docs/content/document/:documentId` | Busca conteúdo extraído |
| POST | `/docs/content` | Cria/atualiza conteúdo |
| DELETE | `/docs/content/document/:documentId` | Deleta conteúdo |

#### Chunks
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/docs/chunks/document/:documentId` | Lista chunks |
| POST | `/docs/chunks/batch` | Cria múltiplos chunks |
| DELETE | `/docs/chunks/document/:documentId` | Deleta chunks |
| GET | `/docs/chunks/search` | Busca texto (query: user_id, query, limit) |

#### Stats
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/docs/stats/user/:userId` | Estatísticas do usuário |

### 13.5.3 Registro no Index
**Arquivo**: `workers/api-d1/src/index.ts`

```typescript
import { docsRoutes } from './routes/docs';
// ...
app.route('/docs', docsRoutes);
```

---

## FASE 14: Services de Lógica de Negócio ✅

### 14.1 FolderService Implementado
**Arquivo**: `src/features/my-easy-docs/services/FolderService.ts`

Métodos implementados:
- `getAll()` - Lista todas as pastas do usuário
- `getById(id)` - Busca pasta por ID
- `getByParent(parentId)` - Lista pastas filhas
- `create(name, parentId?)` - Cria nova pasta com path automático
- `rename(id, newName)` - Renomeia pasta
- `move(id, newParentId)` - Move pasta para outro parent
- `delete(id)` - Deleta pasta (cascade via D1)
- `getPath(folderId)` - Retorna breadcrumb array
- `getDescendantIds(folderId)` - Lista IDs de subpastas (para deleção)
- `count()` - Conta total de pastas

Helpers internos:
- `getCurrentUserId()` - Obtém userId via authService
- `mapD1ToFolder()` - Converte tipo D1 para frontend
- `buildFolderPath()` - Constrói path hierárquico

### 14.2 DocumentService Implementado
**Arquivo**: `src/features/my-easy-docs/services/DocumentService.ts`

Métodos implementados:
- `getAll()` - Lista todos documentos
- `getByFolder(folderId)` - Lista documentos da pasta
- `getById(id)` - Busca documento por ID
- `getRecent(limit?)` - Documentos recentes
- `getFavorites()` - Documentos favoritos
- `create(data)` - Cria registro de documento
- `createEmpty(name, extension, folderId?)` - Cria arquivo .txt/.md vazio
- `update(id, data)` - Atualiza metadados
- `move(id, newFolderId)` - Move documento
- `rename(id, newName)` - Renomeia documento
- `toggleFavorite(id)` - Alterna favorito
- `delete(id)` - Deleta documento + arquivo R2
- `getContent(id)` - Obtém DocsContent completo
- `getTextContent(id)` - Obtém apenas texto extraído
- `saveContent(id, content)` - Salva conteúdo texto + atualiza R2
- `count()` - Conta total de documentos
- `getStats()` - Estatísticas do usuário

### 14.3 UploadService Implementado
**Arquivo**: `src/features/my-easy-docs/services/UploadService.ts`

Métodos implementados:
- `validateFile(file)` - Valida tamanho (100MB) e tipo
- `generateDocumentId()` - Gera UUID para documento
- `generateR2Key(documentId, filename)` - Gera chave R2 com userId/docId/filename
- `uploadToR2(file, r2Key)` - Upload básico para R2
- `uploadToR2WithProgress(file, r2Key, onProgress)` - Upload com callback de progresso
- `getDownloadUrl(r2Key)` - Constrói URL pública do R2
- `processUpload(file, onProgress?)` - Processo completo: valida + gera IDs + upload
- `deleteFromR2(r2Key)` - Deleta arquivo do R2
- `uploadTextContent(r2Key, content)` - Upload de conteúdo texto (para arquivos .txt/.md)

### 14.4 Barrel Export
**Arquivo**: `src/features/my-easy-docs/services/index.ts`
```typescript
export { FolderService } from './FolderService';
export { DocumentService } from './DocumentService';
export { UploadService } from './UploadService';
```

### 14.5 Tipos Auxiliares Adicionados
Em `src/features/my-easy-docs/types/index.ts`:
```typescript
export interface CreateDocumentData { ... }
export interface UpdateDocumentData { ... }
export interface FileValidationResult { valid: boolean; error?: string; }
export interface ProcessedUploadResult { documentId: string; r2Key: string; }
export type ProgressCallback = (progress: number) => void;
```

---

## FASE 15: Hooks de Estado ✅

### 15.1 useFolders Implementado
**Arquivo**: `src/features/my-easy-docs/hooks/useFolders.ts`

Estado retornado:
- `folders` - Array de todas as pastas
- `currentFolderId` - ID da pasta atual (null = root)
- `currentFolder` - Objeto da pasta atual
- `currentPath` - Breadcrumb array
- `childFolders` - Pastas filhas da atual
- `isLoading` - Estado de carregamento
- `error` - Mensagem de erro

Ações:
- `refresh()` - Recarrega todas as pastas
- `navigateTo(folderId)` - Navega para pasta e atualiza breadcrumb
- `createFolder(name, parentId?)` - Cria pasta
- `renameFolder(id, newName)` - Renomeia pasta
- `moveFolder(id, newParentId)` - Move pasta
- `deleteFolder(id)` - Deleta pasta e navega para root se necessário

Hook auxiliar: `useFolder(id)` - Carrega uma pasta específica

### 15.2 useDocuments Implementado
**Arquivo**: `src/features/my-easy-docs/hooks/useDocuments.ts`

Estado retornado:
- `documents` - Array de documentos
- `selectedDocument` - Documento selecionado
- `isLoading` - Estado de carregamento
- `error` - Mensagem de erro
- `totalCount` - Total de documentos

Opções de filtro:
- `folderId` - Filtrar por pasta
- `favoritesOnly` - Apenas favoritos
- `recentOnly` - Apenas recentes
- `recentLimit` - Limite para recentes

Ações:
- `refresh()` - Recarrega documentos
- `selectDocument(doc)` - Seleciona documento
- `createDocument(data)` - Cria registro
- `createEmptyFile(name, ext, folderId?)` - Cria arquivo vazio
- `renameDocument(id, newName)` - Renomeia
- `moveDocument(id, newFolderId)` - Move
- `toggleFavorite(id)` - Alterna favorito
- `deleteDocument(id)` - Deleta
- `getContent(id)` - Obtém conteúdo
- `saveContent(id, content)` - Salva conteúdo

Hook auxiliar: `useDocument(id)` - Carrega um documento específico com conteúdo

### 15.3 useFileUpload Implementado
**Arquivo**: `src/features/my-easy-docs/hooks/useFileUpload.ts`

Estado retornado:
- `uploads` - Array de UploadProgress
- `isUploading` - Se há upload em andamento

Opções:
- `folderId` - Pasta padrão para uploads
- `onDocumentCreated` - Callback quando documento é criado
- `onAllComplete` - Callback quando todos terminam
- `onError` - Callback de erro

Ações:
- `uploadFiles(files, folderId?)` - Inicia upload de múltiplos arquivos
- `cancelUpload(uploadId)` - Cancela upload específico
- `clearCompleted()` - Limpa uploads finalizados
- `clearAll()` - Limpa todos os uploads
- `retryUpload(uploadId)` - Retenta upload com erro

Hook auxiliar: `useDropZone(options)` - Suporte a drag-and-drop
- Retorna `isDragging` e `dropZoneProps` para spread no elemento

### 15.4 Barrel Export
**Arquivo**: `src/features/my-easy-docs/hooks/index.ts`
```typescript
export { useFolders, useFolder } from './useFolders';
export { useDocuments, useDocument } from './useDocuments';
export { useFileUpload, useDropZone } from './useFileUpload';
```

---

## FASE 16: Conectar UI com Dados Reais ✅

### 16.1 MyEasyDocs Atualizado
**Arquivo**: `src/features/my-easy-docs/MyEasyDocs.tsx`

Mudanças realizadas:
- Removidos imports de MOCK_FOLDERS e MOCK_DOCUMENTS
- Adicionado import dos hooks reais: `useFolders`, `useDocuments`, `useFileUpload`

Integração com useFolders:
```typescript
const {
  folders, currentFolderId, currentFolder, currentPath, childFolders,
  isLoading: isFoldersLoading, error: foldersError,
  refresh: refreshFolders, navigateTo, createFolder, renameFolder, moveFolder, deleteFolder,
} = useFolders();
```

Integração com useDocuments:
```typescript
const {
  documents, selectedDocument, isLoading: isDocumentsLoading, error: documentsError,
  refresh: refreshDocuments, selectDocument, createDocument, createEmptyFile,
  renameDocument, moveDocument, toggleFavorite, deleteDocument, getContent, saveContent,
} = useDocuments({ folderId: currentFolderId });
```

Integração com useFileUpload:
```typescript
const { isUploading, uploadFiles, clearCompleted } = useFileUpload({
  folderId: currentFolderId,
  onDocumentCreated: () => refreshDocuments(),
});
```

### 16.2 Estados de Loading e Error
- Loading state com spinner Loader2 centralizado
- Error state com mensagem em vermelho
- Combina estados de folders e documents

### 16.3 Handlers Conectados
Todos os handlers de modais agora são `async` e chamam os services via hooks:
- `handleCreateFolderSubmit` → `createFolder()`
- `handleCreateFileSubmit` → `createEmptyFile()`
- `handleRenameSubmit` → `renameFolder()` ou `renameDocument()`
- `handleMoveSubmit` → `moveFolder()` ou `moveDocument()`
- `handleDeleteConfirm` → `deleteFolder()` ou `deleteDocument()`
- `handleToggleFavorite` → `toggleFavorite()`
- `handleUploadFiles` → `uploadFiles()`
- `handleSaveContent` → `saveContent()`

### 16.4 Auto-refresh após Upload
```typescript
useEffect(() => {
  if (!isUploading) {
    clearCompleted();
  }
}, [isUploading, clearCompleted]);
```

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
| 12 | DB | 016_add_docs_tables.sql | ✅ |
| 13 | D1 Client | tipos e métodos no d1-client.ts | ✅ |
| 13.5 | Worker API | docs.ts routes, schema Drizzle | ✅ |
| 14 | Services | FolderService, DocumentService, UploadService | ✅ |
| 15 | Hooks | useFolders, useDocuments, useFileUpload | ✅ |
| 16 | Conectar UI | MyEasyDocs com dados reais | ✅ |
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

## Fases 12-13.5 (Database, API Client & Worker Routes) - CONCLUÍDAS ✅

5. ✅ **Migration criada**: `016_add_docs_tables.sql` com todas as tabelas
6. ✅ **D1 Client completo**: Tipos e métodos para folders, documents, content, chunks
7. ✅ **Worker API Routes**: `docs.ts` com todas as rotas REST implementadas

## Fases 14-16 (Services, Hooks, UI) - CONCLUÍDAS ✅

7. ✅ **Services**: FolderService, DocumentService, UploadService
8. ✅ **Hooks**: useFolders, useDocuments, useFileUpload
9. ✅ **UI Conectada**: MyEasyDocs usando hooks reais

## Fases 17-19 (Extração, IA, Testes) - PENDENTES ⏳

10. ⏳ **Extração funciona**: PDFs/DOCX/TXT são indexados
11. ⏳ **Chat funciona**: IA responde sobre documentos
12. ⏳ **Testes finais**: CRUD completo, upload, polimento
