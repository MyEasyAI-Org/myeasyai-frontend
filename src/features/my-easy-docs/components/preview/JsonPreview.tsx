// =============================================
// MyEasyDocs - JsonPreview Component
// =============================================
// Wraps CodePreview (read mode) and JsonEditor (edit mode)
// for JSON files, following the TextPreview editing pattern.
// =============================================

import { useState, useCallback } from 'react';
import { CodePreview } from './CodePreview';
import { JsonEditor } from './JsonEditor';

// =============================================
// PROPS
// =============================================
interface JsonPreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave?: (content: string) => Promise<void>;
}

// =============================================
// COMPONENT
// =============================================
export function JsonPreview({
  content,
  name,
  isLoading = false,
  isSaving = false,
  onSave,
}: JsonPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(async (editedContent: string) => {
    if (onSave) {
      try {
        await onSave(editedContent);
        setIsEditing(false);
      } catch (err) {
        console.error('Error saving JSON:', err);
      }
    }
  }, [onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (isEditing && content !== null) {
    return (
      <JsonEditor
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
