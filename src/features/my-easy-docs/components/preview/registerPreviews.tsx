// =============================================
// Preview Registration
// =============================================
// Registers all preview components in the registry.
// Each entry maps a detection predicate to a component.
// New formats can be added here without modifying FilePreview.
// =============================================

import { registerPreview } from './previewRegistry';
import type { PreviewComponentProps } from './previewRegistry';
import { isImage, isPdf, /* isVideo, isAudio, */ isSpreadsheet, isCode, isTextFile, isEditable, isDocx, isDocLegacy, isJson, isHtml } from '../../utils';
import { ImagePreview } from './ImagePreview';
import { DocxPreview } from './DocxPreview';
import { LegacyFormatPreview } from './LegacyFormatPreview';
import { PdfPreview } from './PdfPreview';
// import { VideoPreview } from './VideoPreview';
// import { AudioPreview } from './AudioPreview';
import { SpreadsheetPreview } from './SpreadsheetPreview';
import { CodePreview } from './CodePreview';
import { TextPreview } from './TextPreview';
import { JsonPreview } from './JsonPreview';
import { HtmlPreview } from './HtmlPreview';

// =============================================
// ADAPTER COMPONENTS
// =============================================
// Each adapter maps PreviewComponentProps to a specific component's props

function ImagePreviewAdapter(props: PreviewComponentProps) {
  return <ImagePreview url={props.fileUrl!} name={props.document.name} onDownload={props.onDownload} />;
}

function PdfPreviewAdapter(props: PreviewComponentProps) {
  return <PdfPreview url={props.fileUrl!} name={props.document.name} onDownload={props.onDownload} />;
}

// TODO: v2 - Reativar suporte a vídeo/áudio
// function VideoPreviewAdapter(props: PreviewComponentProps) {
//   return <VideoPreview url={props.fileUrl!} name={props.document.name} onDownload={props.onDownload} />;
// }

// TODO: v2 - Reativar suporte a vídeo/áudio
// function AudioPreviewAdapter(props: PreviewComponentProps) {
//   return <AudioPreview url={props.fileUrl!} name={props.document.name} onDownload={props.onDownload} />;
// }

function SpreadsheetPreviewAdapter(props: PreviewComponentProps) {
  return (
    <SpreadsheetPreview
      url={props.fileUrl || undefined}
      r2Key={props.document.r2_key}
      fileName={props.document.name}
      isSaving={props.isSavingContent}
      onSave={isEditable(props.document.name) ? props.onSave : undefined}
    />
  );
}

function CodePreviewAdapter(props: PreviewComponentProps) {
  return (
    <CodePreview
      content={props.textContent ?? null}
      name={props.document.name}
      isLoading={props.isLoadingContent}
    />
  );
}

function TextPreviewAdapter(props: PreviewComponentProps) {
  return (
    <TextPreview
      content={props.textContent ?? null}
      name={props.document.name}
      isLoading={props.isLoadingContent}
      isSaving={props.isSavingContent}
      onSave={isEditable(props.document.name) ? props.onSave : undefined}
      onFullscreen={isEditable(props.document.name) ? props.onFullscreen : undefined}
    />
  );
}

function JsonPreviewAdapter(props: PreviewComponentProps) {
  return (
    <JsonPreview
      content={props.textContent ?? null}
      name={props.document.name}
      isLoading={props.isLoadingContent}
      isSaving={props.isSavingContent}
      onSave={props.onSave}
    />
  );
}

function HtmlPreviewAdapter(props: PreviewComponentProps) {
  return (
    <HtmlPreview
      content={props.textContent ?? null}
      name={props.document.name}
      isLoading={props.isLoadingContent}
      isSaving={props.isSavingContent}
      onSave={props.onSave}
    />
  );
}

function DocxPreviewAdapter(props: PreviewComponentProps) {
  return (
    <DocxPreview
      url={props.fileUrl || undefined}
      r2Key={props.document.r2_key}
      fileName={props.document.name}
      onDownload={props.onDownload}
    />
  );
}

function DocLegacyPreviewAdapter(props: PreviewComponentProps) {
  return (
    <LegacyFormatPreview
      title="Formato DOC (legado)"
      message="O formato .doc tem suporte limitado no navegador. Para melhor visualização, converta para .docx usando Microsoft Word ou LibreOffice."
      onDownload={props.onDownload}
    />
  );
}

// =============================================
// REGISTRATION
// =============================================

export function registerAllPreviews(): void {
  // Higher priority entries (specific formats) registered first
  registerPreview({
    key: 'docx',
    canHandle: (doc) => isDocx(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
    component: DocxPreviewAdapter,
    priority: 20,
  });

  registerPreview({
    key: 'doc-legacy',
    canHandle: (doc) => isDocLegacy(doc.mime_type),
    component: DocLegacyPreviewAdapter,
    priority: 20,
  });

  // Specific format editors (priority 15 - above generic code at 5)
  registerPreview({
    key: 'json',
    canHandle: (doc) => isJson(doc.mime_type, doc.name),
    component: JsonPreviewAdapter,
    priority: 15,
  });

  registerPreview({
    key: 'html',
    canHandle: (doc) => isHtml(doc.mime_type, doc.name),
    component: HtmlPreviewAdapter,
    priority: 15,
  });

  registerPreview({
    key: 'image',
    canHandle: (doc) => isImage(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
    component: ImagePreviewAdapter,
    priority: 10,
  });

  registerPreview({
    key: 'pdf',
    canHandle: (doc) => isPdf(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
    component: PdfPreviewAdapter,
    priority: 10,
  });

  // TODO: v2 - Reativar suporte a vídeo/áudio
  // registerPreview({
  //   key: 'video',
  //   canHandle: (doc) => isVideo(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
  //   component: VideoPreviewAdapter,
  //   priority: 10,
  // });

  // TODO: v2 - Reativar suporte a vídeo/áudio
  // registerPreview({
  //   key: 'audio',
  //   canHandle: (doc) => isAudio(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
  //   component: AudioPreviewAdapter,
  //   priority: 10,
  // });

  registerPreview({
    key: 'spreadsheet',
    canHandle: (doc) => isSpreadsheet(doc.mime_type) && !!(doc.r2_url || doc.r2_key),
    component: SpreadsheetPreviewAdapter,
    priority: 10,
  });

  registerPreview({
    key: 'code',
    canHandle: (doc) => isCode(doc.mime_type, doc.name),
    component: CodePreviewAdapter,
    priority: 5,
  });

  registerPreview({
    key: 'text',
    canHandle: (doc) => isTextFile(doc.mime_type),
    component: TextPreviewAdapter,
    priority: 5,
  });
}
