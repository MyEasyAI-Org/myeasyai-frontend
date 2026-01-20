import { FilesStore, type File, type Folder, type FileMap } from './files';
import { EditorStore, type EditorDocument, type EditorDocuments, type ScrollPosition } from './editor';
import { WorkbenchStore, type WorkbenchViewType } from './workbench';
import { TerminalStore } from './terminal';

// Create singleton instances
export const filesStore = new FilesStore();
export const editorStore = new EditorStore();
export const terminalStore = new TerminalStore();
export const workbenchStore = new WorkbenchStore(editorStore, filesStore);

// Link terminalStore to workbenchStore
workbenchStore.setTerminalStore(terminalStore);

// Export types and classes
export { FilesStore, type File, type Folder, type FileMap };
export { EditorStore, type EditorDocument, type EditorDocuments, type ScrollPosition };
export { WorkbenchStore, type WorkbenchViewType };
export { TerminalStore };
