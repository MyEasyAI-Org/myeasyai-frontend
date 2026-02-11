// =============================================
// Preview Registry - Strategy Pattern (OCP)
// =============================================
// Allows registering new preview types without
// modifying FilePreview.tsx routing logic.
// =============================================

import type { ComponentType } from 'react';
import type { DocsDocument } from '../../types';

// Standardized props that all preview components receive
export interface PreviewComponentProps {
  document: DocsDocument;
  fileUrl: string | null;
  textContent?: string | null;
  isLoadingContent?: boolean;
  isSavingContent?: boolean;
  onSave?: (content: string) => Promise<void>;
  onFullscreen?: () => void;
  onDownload: () => void;
}

interface PreviewRegistryEntry {
  key: string;
  canHandle: (document: DocsDocument) => boolean;
  component: ComponentType<PreviewComponentProps>;
  priority: number;
}

const registry: PreviewRegistryEntry[] = [];

export function registerPreview(entry: PreviewRegistryEntry): void {
  const existingIndex = registry.findIndex(e => e.key === entry.key);
  if (existingIndex >= 0) {
    registry[existingIndex] = entry;
  } else {
    registry.push(entry);
  }
  registry.sort((a, b) => b.priority - a.priority);
}

export function resolvePreview(
  document: DocsDocument
): ComponentType<PreviewComponentProps> | null {
  for (const entry of registry) {
    if (entry.canHandle(document)) {
      return entry.component;
    }
  }
  return null;
}
