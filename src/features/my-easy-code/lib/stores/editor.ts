import { atom, computed, map, type MapStore, type WritableAtom } from 'nanostores';
import { createScopedLogger } from '../../utils/logger';

export interface ScrollPosition {
  top: number;
  left: number;
}

export interface EditorDocument {
  value: string;
  filePath: string;
  isBinary: boolean;
  scroll?: ScrollPosition;
}

export type EditorDocuments = Record<string, EditorDocument>;

type SelectedFile = WritableAtom<string | undefined>;

const logger = createScopedLogger('EditorStore');

export class EditorStore {
  selectedFile: SelectedFile = atom<string | undefined>();
  documents: MapStore<EditorDocuments> = map({});

  currentDocument = computed(
    [this.documents, this.selectedFile],
    (documents: EditorDocuments, selectedFile: string | undefined) => {
      if (!selectedFile) {
        return undefined;
      }

      return documents[selectedFile];
    }
  );

  setSelectedFile(filePath: string | undefined) {
    this.selectedFile.set(filePath);
  }

  setDocument(filePath: string, doc: EditorDocument) {
    this.documents.setKey(filePath, doc);
  }

  setDocumentValue(filePath: string, value: string) {
    const currentDoc = this.documents.get()[filePath];

    if (currentDoc) {
      this.documents.setKey(filePath, {
        ...currentDoc,
        value,
      });
    }
  }

  updateScrollPosition(filePath: string, position: ScrollPosition) {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return;
    }

    this.documents.setKey(filePath, {
      ...documentState,
      scroll: position,
    });
  }

  updateFile(filePath: string, newContent: string) {
    const documents = this.documents.get();
    const documentState = documents[filePath];

    if (!documentState) {
      return;
    }

    const currentContent = documentState.value;
    const contentChanged = currentContent !== newContent;

    if (contentChanged) {
      this.documents.setKey(filePath, {
        ...documentState,
        value: newContent,
      });
    }
  }

  removeDocument(filePath: string) {
    const docs = this.documents.get();
    const { [filePath]: _, ...rest } = docs;
    this.documents.set(rest);
  }

  setDocuments(files: Record<string, { type: string; content?: string; isBinary?: boolean } | undefined>) {
    for (const [filePath, dirent] of Object.entries(files)) {
      if (dirent?.type === 'file' && dirent.content !== undefined) {
        this.setDocument(filePath, {
          value: dirent.content,
          filePath,
          isBinary: dirent.isBinary ?? false,
        });
      }
    }
  }

  reset() {
    this.documents.set({});
    this.selectedFile.set(undefined);
  }
}
