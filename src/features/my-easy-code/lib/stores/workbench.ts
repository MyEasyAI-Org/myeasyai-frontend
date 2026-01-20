import { atom, type ReadableAtom, type WritableAtom } from 'nanostores';
import { EditorStore, type EditorDocument, type ScrollPosition } from './editor';
import { FilesStore, type FileMap } from './files';
import type { TerminalStore } from './terminal';

export type WorkbenchViewType = 'code' | 'preview';

export class WorkbenchStore {
  #filesStore: FilesStore;
  #editorStore: EditorStore;
  #terminalStore: TerminalStore | null = null;

  showWorkbench: WritableAtom<boolean> = atom(false);
  currentView: WritableAtom<WorkbenchViewType> = atom('code');
  unsavedFiles: WritableAtom<Set<string>> = atom(new Set<string>());
  previewUrl: WritableAtom<string | undefined> = atom(undefined);
  showTerminal: WritableAtom<boolean> = atom(true);

  constructor(editorStore: EditorStore, filesStore: FilesStore) {
    this.#editorStore = editorStore;
    this.#filesStore = filesStore;
  }

  setTerminalStore(terminalStore: TerminalStore) {
    this.#terminalStore = terminalStore;
    // Sync showTerminal with terminalStore
    this.showTerminal = terminalStore.showTerminal;
  }

  toggleTerminal(value?: boolean) {
    if (this.#terminalStore) {
      this.#terminalStore.toggleTerminal(value);
    } else {
      this.showTerminal.set(value !== undefined ? value : !this.showTerminal.get());
    }
  }

  get files() {
    return this.#filesStore.files;
  }

  get currentDocument(): ReadableAtom<EditorDocument | undefined> {
    return this.#editorStore.currentDocument;
  }

  get selectedFile(): ReadableAtom<string | undefined> {
    return this.#editorStore.selectedFile;
  }

  get filesCount(): number {
    return this.#filesStore.filesCount;
  }

  setDocuments(files: FileMap) {
    this.#editorStore.setDocuments(files);

    if (this.#filesStore.filesCount > 0 && this.currentDocument.get() === undefined) {
      for (const [filePath, dirent] of Object.entries(files)) {
        if (dirent?.type === 'file') {
          this.setSelectedFile(filePath);
          break;
        }
      }
    }
  }

  setShowWorkbench(show: boolean) {
    this.showWorkbench.set(show);
  }

  setCurrentDocumentContent(newContent: string) {
    const filePath = this.currentDocument.get()?.filePath;

    if (!filePath) {
      return;
    }

    const originalContent = this.#filesStore.getFile(filePath)?.content;
    const unsavedChanges = originalContent !== undefined && originalContent !== newContent;

    this.#editorStore.updateFile(filePath, newContent);

    const currentDocument = this.currentDocument.get();

    if (currentDocument) {
      const previousUnsavedFiles = this.unsavedFiles.get();

      if (unsavedChanges && previousUnsavedFiles.has(currentDocument.filePath)) {
        return;
      }

      const newUnsavedFiles = new Set(previousUnsavedFiles);

      if (unsavedChanges) {
        newUnsavedFiles.add(currentDocument.filePath);
      } else {
        newUnsavedFiles.delete(currentDocument.filePath);
      }

      this.unsavedFiles.set(newUnsavedFiles);
    }
  }

  setCurrentDocumentScrollPosition(position: ScrollPosition) {
    const editorDocument = this.currentDocument.get();

    if (!editorDocument) {
      return;
    }

    const { filePath } = editorDocument;
    this.#editorStore.updateScrollPosition(filePath, position);
  }

  setSelectedFile(filePath: string | undefined) {
    this.#editorStore.setSelectedFile(filePath);
  }

  saveFile(filePath: string) {
    const documents = this.#editorStore.documents.get();
    const document = documents[filePath];

    if (document === undefined) {
      return;
    }

    // Update the file in the files store
    this.#filesStore.setFileContent(filePath, document.value);

    const newUnsavedFiles = new Set(this.unsavedFiles.get());
    newUnsavedFiles.delete(filePath);
    this.unsavedFiles.set(newUnsavedFiles);
  }

  saveCurrentDocument() {
    const currentDocument = this.currentDocument.get();

    if (currentDocument === undefined) {
      return;
    }

    this.saveFile(currentDocument.filePath);
  }

  resetCurrentDocument() {
    const currentDocument = this.currentDocument.get();

    if (currentDocument === undefined) {
      return;
    }

    const { filePath } = currentDocument;
    const file = this.#filesStore.getFile(filePath);

    if (!file) {
      return;
    }

    this.setCurrentDocumentContent(file.content);
  }

  saveAllFiles() {
    for (const filePath of this.unsavedFiles.get()) {
      this.saveFile(filePath);
    }
  }

  createFile(filePath: string, content: string = '') {
    this.#filesStore.setFile(filePath, { type: 'file', content });
    this.setSelectedFile(filePath);
    return true;
  }

  createFolder(folderPath: string) {
    this.#filesStore.setFile(folderPath, { type: 'folder' });
    return true;
  }

  deleteFile(filePath: string) {
    const currentDocument = this.currentDocument.get();
    const isCurrentFile = currentDocument?.filePath === filePath;

    const success = this.#filesStore.deleteFile(filePath);

    if (success) {
      const newUnsavedFiles = new Set(this.unsavedFiles.get());

      if (newUnsavedFiles.has(filePath)) {
        newUnsavedFiles.delete(filePath);
        this.unsavedFiles.set(newUnsavedFiles);
      }

      if (isCurrentFile) {
        const files = this.files.get();
        let nextFile: string | undefined = undefined;

        for (const [path, dirent] of Object.entries(files)) {
          if (dirent && 'type' in dirent && dirent.type === 'file') {
            nextFile = path;
            break;
          }
        }

        this.setSelectedFile(nextFile);
      }
    }

    return success;
  }

  deleteFolder(folderPath: string) {
    const currentDocument = this.currentDocument.get();
    const isInCurrentFolder = currentDocument?.filePath?.startsWith(folderPath + '/');

    const success = this.#filesStore.deleteFolder(folderPath);

    if (success) {
      const unsavedFiles = this.unsavedFiles.get();
      const newUnsavedFiles = new Set<string>();

      for (const file of unsavedFiles) {
        if (!file.startsWith(folderPath + '/')) {
          newUnsavedFiles.add(file);
        }
      }

      if (newUnsavedFiles.size !== unsavedFiles.size) {
        this.unsavedFiles.set(newUnsavedFiles);
      }

      if (isInCurrentFolder) {
        const files = this.files.get();
        let nextFile: string | undefined = undefined;

        for (const [path, dirent] of Object.entries(files)) {
          if (dirent && 'type' in dirent && dirent.type === 'file') {
            nextFile = path;
            break;
          }
        }

        this.setSelectedFile(nextFile);
      }
    }

    return success;
  }

  setPreviewUrl(url: string | undefined) {
    this.previewUrl.set(url);
  }
}
