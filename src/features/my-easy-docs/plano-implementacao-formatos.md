# Plano de Implementação: Suporte a Múltiplos Formatos de Arquivo

## Formatos Alvo

### Imagens
- JPEG, PNG, WebP, SVG, GIF

### Documentos
- PDF, DOCX, DOC, HTML, JSON

### Planilhas
- XLSX, XLS, CSV

### Mídia
- MP4, MOV, MP3, WAV

### Compactados (Apenas Armazenamento)
- ZIP, RAR, 7Z, TAR, GZ

---

## ⚠️ SEGURANÇA: Formatos Bloqueados

Bloquear upload de arquivos potencialmente perigosos:

```typescript
const BLOCKED_EXTENSIONS = [
  // Executáveis Windows
  '.exe', '.msi', '.bat', '.cmd', '.com', '.scr', '.pif',
  // Scripts
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1',  // PowerShell
  // Executáveis Unix/Mac
  '.sh', '.bash', '.zsh', '.csh', '.ksh',
  '.app', '.command',
  // Java
  '.jar', '.class',
  // Outros perigosos
  '.dll', '.sys', '.drv',
  '.inf', '.reg',  // Registry/config do Windows
  '.lnk',  // Shortcuts (podem apontar para malware)
  '.hta',  // HTML Application (executa código)
];

const BLOCKED_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-sh',
  'application/x-shellscript',
];
```

### Implementação do Bloqueio

Adicionar validação em `UploadService.ts`:

```typescript
export function isBlockedFile(file: File): { blocked: boolean; reason?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      blocked: true,
      reason: `Arquivos ${extension} não são permitidos por motivos de segurança.`
    };
  }

  if (BLOCKED_MIME_TYPES.includes(file.type)) {
    return {
      blocked: true,
      reason: 'Este tipo de arquivo não é permitido por motivos de segurança.'
    };
  }

  return { blocked: false };
}
```

---

## Resumo de Capacidades por Formato

| Formato | Leitura | Edição | Conversão |
|---------|---------|--------|-----------|
| JPEG | ✅ Feito | 🔧 Fase B | → PNG, WebP |
| PNG | ✅ Feito | 🔧 Fase B | → JPEG, WebP |
| WebP | ✅ Feito | 🔧 Fase B | → PNG, JPEG |
| SVG | ✅ Feito | ❌ Não suportado | → PNG, JPEG |
| GIF | ✅ Feito | ❌ Não suportado | → PNG (1º frame) |
| PDF | ✅ Feito | ❌ Não suportado | → Texto, Imagens |
| DOCX | 🔧 Fase A | ❌ Não suportado | → HTML, Texto |
| DOC | 🔧 Fase A | ❌ Não suportado | - |
| HTML | ✅ Feito | 🔧 Fase B | - |
| JSON | ✅ Feito | 🔧 Fase B | ↔ CSV |
| XLSX | 🔧 Fase A | ❌ Não suportado | → CSV, JSON |
| XLS | 🔧 Fase A | ❌ Não suportado | → XLSX |
| CSV | 🔧 Fase A | 🔧 Fase B | → XLSX, JSON |
| MP4 | ✅ Feito | ❌ Não suportado | - |
| MOV | 🔧 Fase A | ❌ Não suportado | - |
| MP3 | ✅ Feito | ❌ Não suportado | - |
| WAV | ✅ Feito | ❌ Não suportado | - |
| ZIP | 🔧 Fase A | ❌ Não suportado | - |
| RAR | 📦 Armazenar | ❌ Não suportado | - |
| 7Z | 📦 Armazenar | ❌ Não suportado | - |

---

# ═══════════════════════════════════════════════════════════════
# FASE A: LEITURAS E VISUALIZAÇÕES
# ═══════════════════════════════════════════════════════════════

Implementar todas as leituras primeiro. Testar completamente antes de passar para Fase B.

---

## ETAPA A0: Bloqueio de Arquivos Perigosos (SEGURANÇA)

### Objetivo
Bloquear upload de executáveis e scripts perigosos.

### Arquivos a Modificar
1. `services/UploadService.ts` - Adicionar validação de bloqueio
2. `components/upload/UploadModal.tsx` - Mostrar erro amigável

### Passos Detalhados

#### Passo A0.1: Adicionar constantes de bloqueio
```typescript
// Em constants/index.ts ou criar constants/security.ts

export const BLOCKED_EXTENSIONS = [
  // Executáveis Windows
  '.exe', '.msi', '.bat', '.cmd', '.com', '.scr', '.pif',
  // Scripts
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1',
  // Unix/Mac
  '.sh', '.bash', '.zsh', '.app', '.command',
  // Java
  '.jar', '.class',
  // Outros
  '.dll', '.sys', '.drv', '.inf', '.reg', '.lnk', '.hta',
];
```

#### Passo A0.2: Adicionar validação em UploadService.ts
```typescript
export function isBlockedFile(file: File): { blocked: boolean; reason?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      blocked: true,
      reason: `Arquivos ${extension} não são permitidos por motivos de segurança.`
    };
  }

  return { blocked: false };
}
```

#### Passo A0.3: Integrar no fluxo de upload
```typescript
// Em validateFile() ou processUpload()
const blockCheck = isBlockedFile(file);
if (blockCheck.blocked) {
  throw new Error(blockCheck.reason);
}
```

### Testes Manuais - Etapa A0

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| A0.1 | Upload .exe | Tentar upload de arquivo.exe | Erro: "não permitido por segurança" |
| A0.2 | Upload .bat | Tentar upload de script.bat | Erro: "não permitido por segurança" |
| A0.3 | Upload .sh | Tentar upload de script.sh | Erro: "não permitido por segurança" |
| A0.4 | Upload .jar | Tentar upload de app.jar | Erro: "não permitido por segurança" |
| A0.5 | Upload .zip | Tentar upload de arquivo.zip | Upload permitido ✅ |
| A0.6 | Upload .pdf | Tentar upload de doc.pdf | Upload permitido ✅ |

**Após testar todos os itens acima, passar para A1.**

---

## ETAPA A1: Visualização de Planilhas (XLSX/XLS/CSV)

### Objetivo
Criar componente para visualizar planilhas como tabela HTML interativa.

### Dependências
```bash
npm install papaparse
```

### Arquivos a Criar
1. `components/preview/SpreadsheetPreview.tsx`

### Arquivos a Modificar
1. `components/preview/FilePreview.tsx` - Adicionar case para spreadsheet
2. `utils/index.ts` - Adicionar helper isSpreadsheet()

### Passos Detalhados

#### Passo A1.1: Instalar papaparse (opcional, para CSV robusto)
```bash
npm install papaparse
```

#### Passo A1.2: Adicionar helper em utils/index.ts
```typescript
export function isSpreadsheet(mimeType: string): boolean {
  return [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ].includes(mimeType);
}
```

#### Passo A1.3: Criar SpreadsheetPreview.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/SpreadsheetPreview.tsx

// Funcionalidades:
// - Receber URL do arquivo R2
// - Usar biblioteca xlsx (já instalada) para parsear
// - Exibir como tabela HTML com scroll
// - Suportar múltiplas abas (sheets)
// - Mostrar nome da sheet ativa
// - Permitir trocar entre sheets

// Props esperadas:
interface SpreadsheetPreviewProps {
  url: string;
  fileName: string;
}

// Estrutura básica:
// 1. useState para dados parseados
// 2. useState para sheet ativa
// 3. useEffect para carregar e parsear arquivo
// 4. Renderizar tabs para sheets
// 5. Renderizar tabela com headers e dados
```

#### Passo A1.4: Integrar no FilePreview.tsx
```typescript
// Adicionar import
import SpreadsheetPreview from './SpreadsheetPreview';

// Adicionar case para spreadsheet antes do default
if (isSpreadsheet(document.mime_type)) {
  return <SpreadsheetPreview url={fileUrl} fileName={document.name} />;
}
```

### Testes Manuais - Etapa A1

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| A1.1 | Upload XLSX simples | Upload arquivo .xlsx com 1 sheet | Tabela renderizada corretamente |
| A1.2 | Upload XLSX múltiplas sheets | Upload .xlsx com 3+ sheets | Tabs para trocar entre sheets |
| A1.3 | Upload XLS legado | Upload arquivo .xls | Mesma visualização que XLSX |
| A1.4 | Upload CSV | Upload arquivo .csv | Tabela renderizada |
| A1.5 | Planilha grande | Upload com 1000+ linhas | Scroll funciona, sem travamento |
| A1.6 | Células vazias | Planilha com células vazias | Exibir células vazias corretamente |
| A1.7 | Caracteres especiais | Planilha com acentos, emojis | Renderizar corretamente |

**Após testar todos os itens acima, passar para A2.**

---

## ETAPA A2: Preview Visual de DOCX

### Objetivo
Renderizar DOCX como HTML visual em vez de apenas texto extraído.

### Dependências
```bash
npm install docx-preview
```

### Arquivos a Criar
1. `components/preview/DocxPreview.tsx`

### Arquivos a Modificar
1. `components/preview/FilePreview.tsx`

### Passos Detalhados

#### Passo A2.1: Instalar biblioteca
```bash
npm install docx-preview
```

#### Passo A2.2: Criar DocxPreview.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/DocxPreview.tsx

// Usar docx-preview para renderizar DOCX como HTML
// A biblioteca renderiza diretamente em um container

// Funcionalidades:
// - Carregar arquivo do R2
// - Renderizar usando docx-preview
// - Fallback para texto extraído se falhar
// - Loading state enquanto processa

import { renderAsync } from 'docx-preview';

// No useEffect:
// 1. Fetch do arquivo
// 2. Converter para ArrayBuffer
// 3. Chamar renderAsync(arrayBuffer, containerRef.current)
```

#### Passo A2.3: Integrar no FilePreview.tsx
```typescript
// Adicionar import
import DocxPreview from './DocxPreview';

// Substituir case para DOCX:
if (document.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  return <DocxPreview url={fileUrl} fileName={document.name} />;
}
```

### Testes Manuais - Etapa A2

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| A2.1 | DOCX simples | Upload .docx com texto | Texto formatado visível |
| A2.2 | DOCX com imagens | Upload .docx com imagens | Imagens renderizadas inline |
| A2.3 | DOCX com tabelas | Upload .docx com tabelas | Tabelas renderizadas |
| A2.4 | DOCX com estilos | Negrito, itálico, cores | Estilos preservados |
| A2.5 | DOCX grande | Documento 50+ páginas | Scroll funciona |

**Após testar todos os itens acima, passar para A3.**

---

## ETAPA A3: Mensagens para Formatos Legados (DOC, MOV)

### Objetivo
Melhorar UX para formatos com suporte limitado.

### Arquivos a Modificar
1. `components/preview/FilePreview.tsx` ou criar `UnsupportedPreview.tsx`
2. `components/preview/VideoPreview.tsx`

### Passos Detalhados

#### Passo A3.1: Mensagem para DOC
```typescript
// Em FilePreview.tsx, adicionar case para .doc:
if (document.mime_type === 'application/msword') {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileWarning className="w-16 h-16 text-yellow-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Formato DOC (legado)</h3>
      <p className="text-gray-500 mb-4">
        O formato .doc tem suporte limitado no navegador.
        Para melhor visualização, converta para .docx usando
        Microsoft Word ou LibreOffice.
      </p>
      <Button onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Baixar arquivo
      </Button>
    </div>
  );
}
```

#### Passo A3.2: Fallback para MOV em VideoPreview.tsx
```typescript
// Em VideoPreview.tsx, adicionar handler de erro:
const [error, setError] = useState(false);

<video
  onError={() => setError(true)}
  // ...
>

{error && isMov && (
  <div className="text-center p-4">
    <p className="text-yellow-500 mb-2">
      Seu navegador pode não suportar o formato MOV.
    </p>
    <p className="text-gray-500 mb-4">
      Recomendamos converter para MP4 para melhor compatibilidade.
    </p>
    <Button onClick={handleDownload}>Baixar arquivo</Button>
  </div>
)}
```

### Testes Manuais - Etapa A3

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| A3.1 | Upload DOC | Upload arquivo .doc | Mensagem explicativa + botão download |
| A3.2 | MOV compatível | Upload .mov (Safari) | Reproduz normalmente |
| A3.3 | MOV incompatível | Upload .mov (Chrome) | Mensagem + botão download |
| A3.4 | Download DOC | Clicar botão download | Arquivo baixa corretamente |
| A3.5 | Download MOV | Clicar botão download | Arquivo baixa corretamente |

**Após testar todos os itens acima, passar para A4.**

---

## ETAPA A4: Preview de Arquivos ZIP

### Objetivo
Mostrar lista de arquivos dentro de um ZIP (sem extração completa).

### Dependências
```bash
npm install jszip
```

### Arquivos a Criar
1. `components/preview/ZipPreview.tsx`

### Arquivos a Modificar
1. `components/preview/FilePreview.tsx`

### Passos Detalhados

#### Passo A4.1: Instalar jszip
```bash
npm install jszip
```

#### Passo A4.2: Criar ZipPreview.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/ZipPreview.tsx

import JSZip from 'jszip';

interface ZipPreviewProps {
  url: string;
  fileName: string;
}

// Funcionalidades:
// - Carregar ZIP do R2
// - Listar arquivos e pastas
// - Mostrar tamanho de cada arquivo
// - Mostrar total de arquivos
// - Botão para baixar ZIP completo

// Estrutura da lista:
// ┌─────────────────────────────────────────┐
// │ 📁 arquivo.zip (15 arquivos, 2.3 MB)   │
// ├─────────────────────────────────────────┤
// │ 📄 documento.pdf          1.2 MB        │
// │ 📁 imagens/                             │
// │   📷 foto1.jpg            500 KB        │
// │   📷 foto2.jpg            600 KB        │
// │ 📄 readme.txt             2 KB          │
// ├─────────────────────────────────────────┤
// │        [Baixar ZIP Completo]            │
// └─────────────────────────────────────────┘
```

#### Passo A4.3: Integrar no FilePreview.tsx
```typescript
// Adicionar case para ZIP
if (document.mime_type === 'application/zip' ||
    document.mime_type === 'application/x-zip-compressed') {
  return <ZipPreview url={fileUrl} fileName={document.name} />;
}
```

### Testes Manuais - Etapa A4

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| A4.1 | Upload ZIP | Upload arquivo.zip | Lista de conteúdo aparece |
| A4.2 | ZIP com pastas | Upload ZIP com subpastas | Estrutura hierárquica visível |
| A4.3 | ZIP grande | Upload ZIP com 100+ arquivos | Lista renderiza sem travar |
| A4.4 | Download ZIP | Clicar "Baixar" | ZIP baixa corretamente |
| A4.5 | RAR/7Z | Upload arquivo.rar | Ícone genérico + download (sem preview) |

---

## ✅ CHECKPOINT FASE A

Antes de prosseguir para a Fase B, confirme que TODOS os testes abaixo passam:

### Segurança (A0)
- [ ] Arquivos .exe são bloqueados
- [ ] Arquivos .bat/.sh são bloqueados
- [ ] Arquivos .jar são bloqueados
- [ ] Arquivos seguros (PDF, ZIP, etc.) são permitidos

### Planilhas (A1)
- [ ] XLSX visualiza corretamente
- [ ] XLS visualiza corretamente
- [ ] CSV visualiza como tabela
- [ ] Múltiplas sheets funcionam
- [ ] Scroll funciona em planilhas grandes

### Documentos (A2)
- [ ] DOCX renderiza com formatação
- [ ] Imagens no DOCX aparecem
- [ ] Tabelas no DOCX aparecem

### Legados (A3)
- [ ] DOC mostra mensagem + download
- [ ] MOV mostra fallback quando não suporta

### Compactados (A4)
- [ ] ZIP mostra lista de conteúdo
- [ ] RAR/7Z mostram ícone + download

**Somente passe para Fase B após todos os itens acima estarem OK.**

---

# ═══════════════════════════════════════════════════════════════
# FASE B: EDIÇÕES
# ═══════════════════════════════════════════════════════════════

Implementar funcionalidades de edição após Fase A estar completa e testada.

---

## ETAPA B1: Editor de JSON

### Objetivo
Permitir edição de arquivos JSON com syntax highlighting e validação.

### Arquivos a Criar
1. `components/preview/JsonEditor.tsx`

### Arquivos a Modificar
1. `components/preview/FilePreview.tsx`

### Passos Detalhados

#### Passo B1.1: Criar JsonEditor.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/JsonEditor.tsx

// Usar CodeMirror já instalado com lang-json

// Funcionalidades:
// - Carregar conteúdo JSON
// - Syntax highlighting
// - Validação de JSON em tempo real
// - Botão salvar (usa DocumentService.saveContent)
// - Indicador de JSON válido/inválido
// - Formatação automática (pretty print)

// Imports necessários:
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

// Função de validação:
function validateJson(content: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}
```

#### Passo B1.2: Integrar no FilePreview.tsx
```typescript
// Adicionar botão "Editar" para arquivos .json
// Quando em modo edição, renderizar JsonEditor
```

### Testes Manuais - Etapa B1

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| B1.1 | Visualizar JSON | Upload .json | Syntax highlighting correto |
| B1.2 | Entrar em edição | Clicar "Editar" | Editor CodeMirror aparece |
| B1.3 | JSON válido | Editar mantendo válido | Indicador verde/válido |
| B1.4 | JSON inválido | Remover vírgula/aspas | Indicador vermelho + erro |
| B1.5 | Salvar JSON | Editar e salvar | Arquivo atualizado no R2 |
| B1.6 | Formatar JSON | Botão "Formatar" | JSON identado corretamente |
| B1.7 | Cancelar edição | Botão "Cancelar" | Volta ao preview |

**Após testar todos os itens acima, passar para B2.**

---

## ETAPA B2: Editor de CSV

### Objetivo
Permitir edição de CSV como tabela interativa.

### Arquivos a Criar
1. `components/preview/CsvEditor.tsx`

### Passos Detalhados

#### Passo B2.1: Criar CsvEditor.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/CsvEditor.tsx

// Funcionalidades:
// - Aproveitar SpreadsheetPreview como base
// - Células editáveis (clique para editar)
// - Adicionar/remover linhas
// - Adicionar/remover colunas
// - Exportar de volta para CSV
// - Salvar no R2

function parseCSV(text: string): string[][] {
  // Usar papaparse ou implementação manual
}

function toCSV(data: string[][]): string {
  return data.map(row => row.join(',')).join('\n');
}
```

### Testes Manuais - Etapa B2

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| B2.1 | Entrar em edição | Clicar "Editar" em CSV | Tabela editável aparece |
| B2.2 | Editar célula | Clicar em célula | Input aparece, permite edição |
| B2.3 | Adicionar linha | Botão "+" | Nova linha adicionada |
| B2.4 | Remover linha | Botão "x" na linha | Linha removida |
| B2.5 | Salvar CSV | Botão salvar | Arquivo atualizado |
| B2.6 | Cancelar edição | Botão cancelar | Volta ao preview |

**Após testar todos os itens acima, passar para B3.**

---

## ETAPA B3: Editor de HTML

### Objetivo
Permitir edição de arquivos HTML com preview em tempo real.

### Arquivos a Criar
1. `components/preview/HtmlEditor.tsx`

### Passos Detalhados

#### Passo B3.1: Criar HtmlEditor.tsx
```typescript
// Localização: src/features/my-easy-docs/components/preview/HtmlEditor.tsx

// Funcionalidades:
// - Split view: código à esquerda, preview à direita
// - Syntax highlighting para HTML (CodeMirror)
// - Preview atualizado em tempo real
// - Botão salvar

// Layout:
// ┌────────────────┬────────────────┐
// │   CodeMirror   │    iframe      │
// │   (HTML code)  │   (preview)    │
// └────────────────┴────────────────┘

import { html } from '@codemirror/lang-html';

// Preview seguro com sandbox:
<iframe
  srcDoc={htmlContent}
  sandbox="allow-same-origin"
  title="HTML Preview"
/>
```

### Testes Manuais - Etapa B3

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| B3.1 | Entrar em edição | Clicar "Editar" em HTML | Split view aparece |
| B3.2 | Editar HTML | Modificar código | Preview atualiza em tempo real |
| B3.3 | HTML com CSS | Arquivo com `<style>` | Estilos aplicados no preview |
| B3.4 | Salvar HTML | Editar e salvar | Arquivo atualizado |
| B3.5 | Cancelar edição | Botão cancelar | Volta ao preview |

**Após testar todos os itens acima, passar para B4.**

---

## ETAPA B4: Editor de Imagens

### Objetivo
Permitir edições básicas em imagens (crop, rotate, resize, filtros).

### Dependências
```bash
npm install fabric
```

### Arquivos a Criar
1. `components/preview/ImageEditor.tsx`
2. `services/ImageService.ts`

### Passos Detalhados

#### Passo B4.1: Instalar Fabric.js
```bash
npm install fabric
```

#### Passo B4.2: Criar ImageService.ts
```typescript
// Localização: src/features/my-easy-docs/services/ImageService.ts

export class ImageService {
  static async loadImage(url: string): Promise<HTMLImageElement>;
  static rotate(canvas: HTMLCanvasElement, degrees: number): void;
  static crop(canvas: HTMLCanvasElement, rect: CropRect): void;
  static resize(canvas: HTMLCanvasElement, width: number, height: number): void;
  static applyFilter(canvas: HTMLCanvasElement, filter: FilterType): void;
  static exportAs(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' | 'webp'): Blob;
}
```

#### Passo B4.3: Criar ImageEditor.tsx
```typescript
// Layout:
// ┌─────────────────────────────────┐
// │  [Crop] [Rotate] [Resize] [...]  │ <- Toolbar
// ├─────────────────────────────────┤
// │         Canvas/Imagem           │
// ├─────────────────────────────────┤
// │      [Cancelar]  [Salvar]       │
// └─────────────────────────────────┘
```

### Testes Manuais - Etapa B4

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| B4.1 | Abrir editor | Clicar "Editar" em imagem | Editor abre com imagem |
| B4.2 | Rotacionar | Botão rotate 90° | Imagem rotaciona |
| B4.3 | Crop | Selecionar área, cortar | Imagem cortada |
| B4.4 | Resize | Alterar dimensões | Imagem redimensionada |
| B4.5 | Filtro brilho | Ajustar slider | Brilho alterado |
| B4.6 | Salvar PNG | Salvar como PNG | Arquivo PNG salvo |
| B4.7 | Converter JPEG→PNG | Abrir JPEG, salvar PNG | Formato convertido |
| B4.8 | Cancelar | Botão cancelar | Volta ao preview |

**Após testar todos os itens acima, passar para B5.**

---

## ETAPA B5: Serviço de Conversão

### Objetivo
Centralizar todas as conversões entre formatos.

### Arquivos a Criar
1. `services/ConversionService.ts`

### Passos Detalhados

#### Passo B5.1: Criar ConversionService.ts
```typescript
// Localização: src/features/my-easy-docs/services/ConversionService.ts

export class ConversionService {
  // Imagens
  static async imageToFormat(
    blob: Blob,
    targetFormat: 'png' | 'jpeg' | 'webp',
    quality?: number
  ): Promise<Blob>;

  static async svgToPng(svgBlob: Blob): Promise<Blob>;
  static async gifToPng(gifBlob: Blob): Promise<Blob>; // primeiro frame

  // Planilhas
  static async xlsxToCsv(blob: Blob, sheetIndex?: number): Promise<string>;
  static async csvToXlsx(csvText: string): Promise<Blob>;
  static async xlsxToJson(blob: Blob): Promise<object[]>;
  static async jsonToCsv(data: object[]): Promise<string>;
}
```

#### Passo B5.2: Adicionar botões de conversão na UI
```typescript
// Menu dropdown "Converter para..." ou "Exportar como..."
// Resultado: Download do arquivo convertido
```

### Testes Manuais - Etapa B5

| # | Teste | Como Verificar | Resultado Esperado |
|---|-------|----------------|-------------------|
| B5.1 | PNG → JPEG | Converter e baixar | JPEG válido |
| B5.2 | JPEG → PNG | Converter e baixar | PNG válido |
| B5.3 | PNG → WebP | Converter e baixar | WebP válido |
| B5.4 | SVG → PNG | Converter e baixar | PNG renderizado |
| B5.5 | GIF → PNG | Converter (1º frame) | PNG do primeiro frame |
| B5.6 | XLSX → CSV | Exportar sheet | CSV válido |
| B5.7 | CSV → XLSX | Converter e baixar | XLSX abre no Excel |
| B5.8 | XLSX → JSON | Exportar dados | JSON array válido |

---

## ✅ CHECKPOINT FASE B

Confirme que TODOS os editores funcionam:

### JSON (B1)
- [ ] Edição com syntax highlighting
- [ ] Validação em tempo real
- [ ] Salvar funciona

### CSV (B2)
- [ ] Tabela editável
- [ ] Adicionar/remover linhas
- [ ] Salvar funciona

### HTML (B3)
- [ ] Split view código/preview
- [ ] Preview atualiza em tempo real
- [ ] Salvar funciona

### Imagens (B4)
- [ ] Rotate funciona
- [ ] Crop funciona
- [ ] Resize funciona
- [ ] Salvar em diferentes formatos

### Conversões (B5)
- [ ] Conversões de imagem funcionam
- [ ] Conversões de planilha funcionam

---

## Estrutura Final de Arquivos

```
src/features/my-easy-docs/
├── components/
│   └── preview/
│       ├── FilePreview.tsx        # Modificar
│       ├── SpreadsheetPreview.tsx # FASE A
│       ├── DocxPreview.tsx        # FASE A
│       ├── ZipPreview.tsx         # FASE A
│       ├── JsonEditor.tsx         # FASE B
│       ├── CsvEditor.tsx          # FASE B
│       ├── HtmlEditor.tsx         # FASE B
│       └── ImageEditor.tsx        # FASE B
├── constants/
│   ├── index.ts                   # MIME types existentes
│   └── security.ts                # FASE A (bloqueios)
├── services/
│   ├── UploadService.ts           # Modificar (validação)
│   ├── ImageService.ts            # FASE B
│   └── ConversionService.ts       # FASE B
└── utils/
    └── index.ts                   # Adicionar helpers
```

---

## Dependências a Instalar

### Fase A
```bash
npm install docx-preview papaparse jszip
```

### Fase B
```bash
npm install fabric
```

---

## Ordem de Implementação

### FASE A (Leituras) - Implementar Primeiro
1. **A0** - Bloqueio de arquivos perigosos (SEGURANÇA) ⚠️
2. **A1** - SpreadsheetPreview (XLSX/XLS/CSV)
3. **A2** - DocxPreview
4. **A3** - Mensagens DOC/MOV
5. **A4** - ZipPreview

**⏸️ PARAR E TESTAR FASE A COMPLETAMENTE**

### FASE B (Edições) - Implementar Depois
6. **B1** - JsonEditor
7. **B2** - CsvEditor
8. **B3** - HtmlEditor
9. **B4** - ImageEditor
10. **B5** - ConversionService
