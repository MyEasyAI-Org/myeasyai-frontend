// =============================================
// MyEasyDocs - Preview Components
// =============================================

export { FilePreview } from './FilePreview';
export { ImagePreview } from './ImagePreview';
export { ImageEditor } from './ImageEditor';
export { PdfPreview } from './PdfPreview';
// TODO: v2 - Reativar suporte a vídeo/áudio
// export { VideoPreview } from './VideoPreview';
// export { AudioPreview } from './AudioPreview';
export { CodePreview } from './CodePreview';
export { TextPreview } from './TextPreview';
export { TextEditor } from './TextEditor';
export { JsonPreview } from './JsonPreview';
export { JsonEditor } from './JsonEditor';
export { HtmlPreview } from './HtmlPreview';
export { HtmlEditor } from './HtmlEditor';
export { CsvEditor } from './CsvEditor';
export { DocxPreview } from './DocxPreview';
export { LegacyFormatPreview } from './LegacyFormatPreview';
export { ConvertMenu } from './ConvertMenu';
export { UnsupportedPreview } from './UnsupportedPreview';
export { SpreadsheetPreview } from './SpreadsheetPreview';

// Shared components
export { PreviewLoadingState } from './shared/PreviewLoadingState';
export { PreviewErrorState } from './shared/PreviewErrorState';
export { PreviewEmptyState } from './shared/PreviewEmptyState';

// Registry
export { registerPreview, resolvePreview } from './previewRegistry';
export { registerAllPreviews } from './registerPreviews';
