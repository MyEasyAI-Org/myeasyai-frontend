import { diffLines, type Change } from 'diff';
import type { FileMap, File } from '../lib/stores/files';

export interface FileModification {
  type: 'added' | 'modified' | 'deleted';
  filePath: string;
  content?: string;
  oldContent?: string;
  diff?: Change[];
}

export function computeFileModifications(
  currentFiles: FileMap,
  modifiedFiles: Map<string, string>
): FileModification[] {
  const modifications: FileModification[] = [];

  for (const [filePath, originalContent] of modifiedFiles) {
    const currentFile = currentFiles[filePath];

    if (!currentFile || currentFile.type !== 'file') {
      // File was deleted
      modifications.push({
        type: 'deleted',
        filePath,
        oldContent: originalContent,
      });
      continue;
    }

    const currentContent = currentFile.content;

    if (currentContent !== originalContent) {
      const diff = diffLines(originalContent, currentContent);
      modifications.push({
        type: 'modified',
        filePath,
        content: currentContent,
        oldContent: originalContent,
        diff,
      });
    }
  }

  return modifications;
}

export function createUnifiedDiff(oldContent: string, newContent: string): string {
  const changes = diffLines(oldContent, newContent);
  let result = '';

  for (const change of changes) {
    const prefix = change.added ? '+' : change.removed ? '-' : ' ';
    const lines = change.value.split('\n');

    for (const line of lines) {
      if (line) {
        result += `${prefix}${line}\n`;
      }
    }
  }

  return result;
}
