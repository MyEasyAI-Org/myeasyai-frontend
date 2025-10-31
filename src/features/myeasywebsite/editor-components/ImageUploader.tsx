import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Check } from 'lucide-react';
import { useEditing } from './EditingContext';

export function ImageUploader() {
  const { selectedElement, updateElement } = useEditing();
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      // Mostrar mensagem de erro no console ao invés de alert
      console.error('Por favor, selecione apenas arquivos de imagem (JPG, PNG, WebP, SVG)');
      return;
    }

    setIsLoading(true);
    
    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      
      if (selectedElement) {
        updateElement(selectedElement.id, {
          image: {
            url,
            type: 'local',
            filename: file.name
          }
        });
      }
      
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;
    
    setIsLoading(true);
    
    // Validar URL da imagem
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(imageUrl);
      if (selectedElement) {
        updateElement(selectedElement.id, {
          image: {
            url: imageUrl,
            type: 'url'
          }
        });
      }
      setIsLoading(false);
    };
    img.onerror = () => {
      // Mostrar mensagem de erro no console ao invés de alert
      console.error('Não foi possível carregar a imagem. Verifique se a URL está correta.');
      setIsLoading(false);
    };
    img.src = imageUrl;
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Método de upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Método de Upload
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setUploadMethod('file')}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2
              ${uploadMethod === 'file'
                ? 'border-purple-500 bg-purple-500/10 text-white'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm font-semibold">Upload Local</span>
          </button>
          <button
            onClick={() => setUploadMethod('url')}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2
              ${uploadMethod === 'url'
                ? 'border-purple-500 bg-purple-500/10 text-white'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            <LinkIcon className="h-4 w-4" />
            <span className="text-sm font-semibold">URL</span>
          </button>
        </div>
      </div>

      {/* Upload de arquivo */}
      {uploadMethod === 'file' && (
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Upload de Imagem
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg transition-all duration-200
              ${isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-slate-900 rounded-full">
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                </div>
              </div>
              <p className="text-white font-semibold mb-1">
                Arraste e solte ou clique para selecionar
              </p>
              <p className="text-sm text-slate-400">
                JPG, PNG, WebP ou SVG (máx. 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* URL de imagem */}
      {uploadMethod === 'url' && (
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            URL da Imagem
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Cole a URL completa da imagem e pressione Enter ou clique no botão
          </p>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-300">
              Preview
            </label>
            <button
              onClick={clearPreview}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Remover</span>
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-900">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs text-white font-semibold">Imagem carregada com sucesso</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-purple-500" />
            <p className="text-sm text-slate-400">Carregando imagem...</p>
          </div>
        </div>
      )}

      {/* Info sobre formatos */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400 mb-2">
          <strong className="text-slate-300">Formatos suportados:</strong>
        </p>
        <ul className="text-xs text-slate-400 space-y-1 ml-4">
          <li>• JPG/JPEG - Fotos e imagens complexas</li>
          <li>• PNG - Imagens com transparência</li>
          <li>• WebP - Formato moderno e otimizado</li>
          <li>• SVG - Gráficos vetoriais e ícones</li>
        </ul>
      </div>

      {/* Dicas */}
      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <p className="text-xs text-purple-300">
          💡 <strong>Dica:</strong> Para melhor desempenho, use imagens otimizadas. Recomendamos dimensões de até 1920x1080px.
        </p>
      </div>
    </div>
  );
}
