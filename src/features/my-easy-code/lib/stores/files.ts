import { map, type MapStore } from 'nanostores';
import { createScopedLogger } from '../../utils/logger';

const logger = createScopedLogger('FilesStore');

export interface File {
  type: 'file';
  content: string;
  isBinary?: boolean;
}

export interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;

export type FileMap = Record<string, Dirent | undefined>;

export class FilesStore {
  #size = 0;
  #modifiedFiles: Map<string, string> = new Map();

  files: MapStore<FileMap> = map({});

  get filesCount() {
    return this.#size;
  }

  getFile(filePath: string) {
    const dirent = this.files.get()[filePath];

    if (!dirent || dirent.type !== 'file') {
      return undefined;
    }

    return dirent;
  }

  setFile(filePath: string, dirent: Dirent | undefined) {
    const currentFiles = this.files.get();
    const existingDirent = currentFiles[filePath];

    // Update size counter
    if (dirent?.type === 'file' && existingDirent?.type !== 'file') {
      this.#size++;
    } else if (dirent?.type !== 'file' && existingDirent?.type === 'file') {
      this.#size--;
    }

    this.files.setKey(filePath, dirent);
  }

  getFileContent(filePath: string): string | undefined {
    const file = this.getFile(filePath);
    return file?.content;
  }

  setFileContent(filePath: string, content: string) {
    const file = this.getFile(filePath);

    if (file) {
      this.files.setKey(filePath, {
        ...file,
        content,
      });
    }
  }

  isFileModified(filePath: string) {
    return this.#modifiedFiles.has(filePath);
  }

  markFileAsModified(filePath: string, originalContent: string) {
    this.#modifiedFiles.set(filePath, originalContent);
  }

  clearFileModification(filePath: string) {
    this.#modifiedFiles.delete(filePath);
  }

  deleteFile(filePath: string): boolean {
    try {
      const dirent = this.files.get()[filePath];

      if (!dirent || dirent.type !== 'file') {
        logger.warn(`Cannot delete non-existent file: ${filePath}`);
        return false;
      }

      this.files.setKey(filePath, undefined);
      this.#size--;
      this.#modifiedFiles.delete(filePath);

      logger.info(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  deleteFolder(folderPath: string): boolean {
    try {
      const dirent = this.files.get()[folderPath];

      if (!dirent || dirent.type !== 'folder') {
        logger.warn(`Cannot delete non-existent folder: ${folderPath}`);
        return false;
      }

      this.files.setKey(folderPath, undefined);

      const allFiles = this.files.get();

      for (const [p, d] of Object.entries(allFiles)) {
        if (p.startsWith(folderPath + '/')) {
          this.files.setKey(p, undefined);

          if (d && 'type' in d && d.type === 'file') {
            this.#size--;
          }

          if (d && 'type' in d && d.type === 'file' && this.#modifiedFiles.has(p)) {
            this.#modifiedFiles.delete(p);
          }
        }
      }

      logger.info(`Folder deleted: ${folderPath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete folder: ${folderPath}`, error);
      return false;
    }
  }

  reset() {
    this.files.set({});
    this.#size = 0;
    this.#modifiedFiles.clear();
  }
}
