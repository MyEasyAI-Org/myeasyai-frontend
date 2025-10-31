import { useState } from 'react';
import { Grid3x3, LayoutGrid, SlidersHorizontal, Layers, Grid2x2, CheckCircle2 } from 'lucide-react';
import { useEditing } from './EditingContext';

export type GalleryStyle = 'grid' | 'masonry' | 'carousel' | 'stacked' | 'irregular';

interface GalleryStyleOption {
  id: GalleryStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: string;
}

const galleryStyles: GalleryStyleOption[] = [
  {
    id: 'grid',
    name: 'Grade Clássica',
    description: 'Layout em grade uniforme com 3 colunas',
    icon: <Grid3x3 className="h-6 w-6" />,
    preview: 'grid-cols-3 gap-4'
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Estilo Pinterest com alturas variadas',
    icon: <LayoutGrid className="h-6 w-6" />,
    preview: 'columns-3 gap-4'
  },
  {
    id: 'carousel',
    name: 'Carrossel',
    description: 'Slider horizontal com navegação',
    icon: <SlidersHorizontal className="h-6 w-6" />,
    preview: 'flex overflow-x-auto'
  },
  {
    id: 'stacked',
    name: 'Empilhado',
    description: 'Imagens sobrepostas em cascata',
    icon: <Layers className="h-6 w-6" />,
    preview: 'stacked-layout'
  },
  {
    id: 'irregular',
    name: 'Grid Irregular',
    description: 'Grade com tamanhos diferentes',
    icon: <Grid2x2 className="h-6 w-6" />,
    preview: 'grid-irregular'
  }
];

export function GalleryStyleSelector() {
  const { selectedElement, updateElement } = useEditing();
  const [selectedStyle, setSelectedStyle] = useState<GalleryStyle>(
    (selectedElement?.currentValue as GalleryStyle) || 'grid'
  );
  const [columns, setColumns] = useState(3);
  const [gap, setGap] = useState(4);
  const [showCaptions, setShowCaptions] = useState(true);
  const [enableLightbox, setEnableLightbox] = useState(true);

  const handleStyleSelect = (style: GalleryStyle) => {
    setSelectedStyle(style);
    if (selectedElement) {
      updateElement(selectedElement.id, {
        galleryStyle: {
          type: style,
          columns,
          gap,
          showCaptions,
          enableLightbox
        }
      });
    }
  };

  const handleOptionChange = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        galleryStyle: {
          type: selectedStyle,
          columns,
          gap,
          showCaptions,
          enableLightbox
        }
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Estilos de galeria */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Escolher Estilo
        </label>
        <div className="space-y-2">
          {galleryStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedStyle === style.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${selectedStyle === style.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-900 text-slate-400'
                  }
                `}>
                  {style.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{style.name}</h4>
                    {selectedStyle === style.id && (
                      <CheckCircle2 className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{style.description}</p>
                </div>
              </div>

              {/* Preview visual */}
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                {style.id === 'grid' && (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-square bg-slate-700 rounded" />
                    ))}
                  </div>
                )}
                {style.id === 'masonry' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-[3/4] bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                    <div className="aspect-[3/5] bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                    <div className="aspect-[3/4] bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                  </div>
                )}
                {style.id === 'carousel' && (
                  <div className="flex space-x-2 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-20 aspect-square bg-slate-700 rounded flex-shrink-0" />
                    ))}
                  </div>
                )}
                {style.id === 'stacked' && (
                  <div className="relative h-24">
                    <div className="absolute top-0 left-4 w-20 aspect-square bg-slate-700 rounded rotate-3" />
                    <div className="absolute top-2 left-8 w-20 aspect-square bg-slate-600 rounded -rotate-2" />
                    <div className="absolute top-4 left-12 w-20 aspect-square bg-slate-500 rounded rotate-1" />
                  </div>
                )}
                {style.id === 'irregular' && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 row-span-2 aspect-square bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                    <div className="aspect-square bg-slate-700 rounded" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configurações adicionais */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h4 className="text-sm font-semibold text-slate-300">Configurações</h4>

        {/* Número de colunas (apenas para grid/masonry/irregular) */}
        {['grid', 'masonry', 'irregular'].includes(selectedStyle) && (
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Número de Colunas: {columns}
            </label>
            <input
              type="range"
              min="2"
              max="5"
              value={columns}
              onChange={(e) => {
                setColumns(Number(e.target.value));
                handleOptionChange();
              }}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        )}

        {/* Espaçamento */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Espaçamento: {gap * 4}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={gap}
            onChange={(e) => {
              setGap(Number(e.target.value));
              handleOptionChange();
            }}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Pequeno</span>
            <span>Grande</span>
          </div>
        </div>

        {/* Toggle options */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
            <span className="text-sm text-white">Mostrar legendas</span>
            <input
              type="checkbox"
              checked={showCaptions}
              onChange={(e) => {
                setShowCaptions(e.target.checked);
                handleOptionChange();
              }}
              className="w-5 h-5 accent-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
            <span className="text-sm text-white">Ativar lightbox (zoom)</span>
            <input
              type="checkbox"
              checked={enableLightbox}
              onChange={(e) => {
                setEnableLightbox(e.target.checked);
                handleOptionChange();
              }}
              className="w-5 h-5 accent-purple-500"
            />
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400">
          💡 <strong className="text-slate-300">Dica:</strong> O estilo Masonry funciona melhor com imagens de diferentes alturas. O Carrossel é ideal para galerias com muitas imagens.
        </p>
      </div>

      {/* Preview summary */}
      <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
        <h4 className="text-sm font-semibold text-white mb-2">Configuração Atual</h4>
        <div className="space-y-1 text-xs text-slate-300">
          <p>• <strong>Estilo:</strong> {galleryStyles.find(s => s.id === selectedStyle)?.name}</p>
          {['grid', 'masonry', 'irregular'].includes(selectedStyle) && (
            <p>• <strong>Colunas:</strong> {columns}</p>
          )}
          <p>• <strong>Espaçamento:</strong> {gap * 4}px</p>
          <p>• <strong>Legendas:</strong> {showCaptions ? 'Ativadas' : 'Desativadas'}</p>
          <p>• <strong>Lightbox:</strong> {enableLightbox ? 'Ativado' : 'Desativado'}</p>
        </div>
      </div>
    </div>
  );
}
