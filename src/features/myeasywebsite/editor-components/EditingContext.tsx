import { createContext, useContext, useState, ReactNode } from 'react';

// Tipos de elementos editáveis
export type ElementType = 'text' | 'icon' | 'image' | 'button' | 'section' | 'color' | 'background' | 'spacing';

// Interface para elemento selecionado
export interface SelectedElement {
  id: string;
  type: ElementType;
  parentSection?: string;
  currentValue?: any;
  metadata?: Record<string, any>;
}

// Interface do contexto
interface EditingContextType {
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  hoveredElement: string | null;
  setHoveredElement: (id: string | null) => void;
  updateElement: (id: string, updates: any) => void;
  history: any[];
  addToHistory: (action: any) => void;
  undo: () => void;
  canUndo: boolean;
}

// Criar contexto
const EditingContext = createContext<EditingContextType | undefined>(undefined);

// Provider
export function EditingProvider({ 
  children,
  onUpdate
}: { 
  children: ReactNode;
  onUpdate?: (updates: any) => void;
}) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const updateElement = (id: string, updates: any) => {
    // Adicionar ao histórico antes de atualizar
    addToHistory({
      type: 'update',
      elementId: id,
      updates,
      timestamp: Date.now()
    });

    // Chamar callback de atualização se fornecido
    if (onUpdate) {
      onUpdate({ id, updates });
    }
  };

  const addToHistory = (action: any) => {
    setHistory(prev => [...prev, action]);
  };

  const undo = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1];
      // Implementar lógica de desfazer
      setHistory(prev => prev.slice(0, -1));
      
      // Notificar sobre o undo
      if (onUpdate) {
        onUpdate({ type: 'undo', action: lastAction });
      }
    }
  };

  const value: EditingContextType = {
    selectedElement,
    setSelectedElement,
    isEditing,
    setIsEditing,
    hoveredElement,
    setHoveredElement,
    updateElement,
    history,
    addToHistory,
    undo,
    canUndo: history.length > 0
  };

  return (
    <EditingContext.Provider value={value}>
      {children}
    </EditingContext.Provider>
  );
}

// Hook personalizado
export function useEditing() {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error('useEditing must be used within an EditingProvider');
  }
  return context;
}
