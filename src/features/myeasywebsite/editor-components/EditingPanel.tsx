import { X, Undo, Palette, Image, Type, Box, Sparkles, Layout } from 'lucide-react';
import { useEditing } from './EditingContext';
import { ColorPicker } from './ColorPicker';
import { IconSelector } from './IconSelector';
import { ImageUploader } from './ImageUploader';
import { GalleryStyleSelector } from './GalleryStyleSelector';

interface EditingPanelProps {
  onClose: () => void;
}

export function EditingPanel({ onClose }: EditingPanelProps) {
  const { selectedElement, setSelectedElement, updateElement, undo, canUndo } = useEditing();

  if (!selectedElement) return null;

  // Determinar qual editor mostrar baseado no tipo de elemento
  const renderEditor = () => {
    switch (selectedElement.type) {
      case 'color':
        return <ColorPicker />;
      case 'icon':
        return <IconSelector />;
      case 'image':
        return <ImageUploader />;
      case 'section':
        if (selectedElement.id === 'gallery-style') {
          return <GalleryStyleSelector />;
        }
        return <div className="p-4 text-slate-400">Editor de seção em desenvolvimento</div>;
      case 'text':
        return (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {selectedElement.metadata?.label || 'Editar Texto'}
              </label>
              {selectedElement.metadata?.multiline ? (
                <textarea
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  defaultValue={selectedElement.currentValue}
                  placeholder={selectedElement.metadata?.placeholder || "Digite o texto..."}
                  onChange={(e) => {
                    if (selectedElement) {
                      updateElement(selectedElement.id, { text: e.target.value });
                    }
                  }}
                />
              ) : (
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue={selectedElement.currentValue}
                  placeholder={selectedElement.metadata?.placeholder || "Digite o texto..."}
                  onChange={(e) => {
                    if (selectedElement) {
                      updateElement(selectedElement.id, { text: e.target.value });
                    }
                  }}
                />
              )}
            </div>
            
            {/* Preview */}
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">
                <strong className="text-slate-300">Preview:</strong>
              </p>
              <p className="text-sm text-white">
                {selectedElement.currentValue || 'O texto aparecerá aqui...'}
              </p>
            </div>
          </div>
        );
      case 'spacing':
        return (
          <div className="p-4">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Espaçamento
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Margin</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-4 text-slate-400">Selecione um elemento para editar</div>;
    }
  };

  // Obter ícone do tipo de elemento
  const getElementIcon = () => {
    switch (selectedElement.type) {
      case 'color':
        return <Palette className="h-5 w-5" />;
      case 'icon':
        return <Sparkles className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'text':
        return <Type className="h-5 w-5" />;
      case 'spacing':
        return <Box className="h-5 w-5" />;
      case 'section':
        return <Layout className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Obter título amigável do tipo
  const getElementTitle = () => {
    const titles: Record<string, string> = {
      color: 'Editar Cor',
      icon: 'Escolher Ícone',
      image: 'Upload de Imagem',
      text: 'Editar Texto',
      spacing: 'Ajustar Espaçamento',
      section: 'Configurar Seção',
      background: 'Editar Background'
    };
    return titles[selectedElement.type] || 'Editar Elemento';
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            {getElementIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{getElementTitle()}</h3>
            {selectedElement.parentSection && (
              <p className="text-xs text-slate-400">
                Seção: {selectedElement.parentSection}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canUndo && (
            <button
              onClick={undo}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Desfazer"
            >
              <Undo className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedElement(null);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-slate-400">ID:</span>
          <code className="px-2 py-1 bg-slate-800 rounded text-purple-400 font-mono text-xs">
            {selectedElement.id}
          </code>
        </div>
      </div>

      {/* Content - Editor específico */}
      <div className="flex-1 overflow-y-auto">
        {renderEditor()}
      </div>

      {/* Footer com ações */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedElement(null)}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm font-semibold shadow-lg shadow-purple-500/50"
          >
            Aplicar Mudanças
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
