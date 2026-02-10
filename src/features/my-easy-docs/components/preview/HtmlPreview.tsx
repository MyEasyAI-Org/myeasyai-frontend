// =============================================
// MyEasyDocs - HtmlPreview Component
// =============================================
// Wraps CodePreview (read mode) and HtmlEditor (edit mode)
// for HTML files, following the TextPreview editing pattern.
// =============================================

import { useState, useCallback } from 'react';
import { CodePreview } from './CodePreview';
import { HtmlEditor } from './HtmlEditor';

// =============================================
// PROPS
// =============================================
interface HtmlPreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: (content: string) => Promise<void>;
}

// =============================================
// COMPONENT
// =============================================
export function HtmlPreview({
  content,
  name,
  isLoading = false,
  isSaving = false,
  onSave,
}: HtmlPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(async (editedContent: string) => {
    if (onSave) {
      try {
        await onSave(editedContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error saving HTML:', err);
      }
    }
  }, [onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (isEditing && content !== null) {
    return (
      <HtmlEditor
        content={content}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <CodePreview
      content={content}
      name={name}
      isLoading={isLoading}
      onEdit={onSave ? () => setIsEditing(true) : undefined}
    />
  );
}
