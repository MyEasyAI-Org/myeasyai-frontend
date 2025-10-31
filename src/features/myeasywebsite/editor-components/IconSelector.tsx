import { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useEditing } from './EditingContext';

// Lista de ícones populares do Lucide (adicione mais conforme necessário)
const popularIcons = [
  'Heart', 'Star', 'Sparkles', 'Zap', 'Flame', 'Award', 'TrendingUp',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'Gift', 'Package',
  'Home', 'Building', 'Store', 'MapPin', 'Globe', 'Map',
  'Users', 'User', 'UserPlus', 'Mail', 'Phone', 'MessageCircle',
  'Calendar', 'Clock', 'Bell', 'AlertCircle', 'CheckCircle', 'Info',
  'Settings', 'Search', 'Filter', 'Menu', 'MoreHorizontal', 'ChevronRight',
  'Camera', 'Image', 'Video', 'Music', 'Headphones', 'Mic',
  'Briefcase', 'FileText', 'Folder', 'Download', 'Upload', 'Link',
  'Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Wifi', 'Bluetooth',
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Snowflake', 'Wind',
  'Coffee', 'Pizza', 'Utensils', 'Wine', 'IceCream', 'Cake',
  'Palette', 'Brush', 'Scissors', 'Ruler', 'Pen', 'Edit',
  'Target', 'TrendingDown', 'Activity', 'BarChart', 'PieChart', 'LineChart',
  'Lock', 'Unlock', 'Shield', 'Eye', 'EyeOff', 'Key',
  'ThumbsUp', 'ThumbsDown', 'Smile', 'Frown', 'Meh', 'Laugh'
];

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
};

export function IconSelector() {
  const { selectedElement, updateElement } = useEditing();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(selectedElement?.currentValue?.name || 'Star');
  const [selectedSize, setSelectedSize] = useState<IconSize>(selectedElement?.currentValue?.size || 'md');
  const [selectedColor, setSelectedColor] = useState(selectedElement?.currentValue?.color || '#ea580c');

  // Filtrar ícones baseado na busca
  const filteredIcons = popularIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    if (selectedElement) {
      updateElement(selectedElement.id, {
        icon: {
          name: iconName,
          size: selectedSize,
          color: selectedColor
        }
      });
    }
  };

  const handleSizeChange = (size: IconSize) => {
    setSelectedSize(size);
    if (selectedElement) {
      updateElement(selectedElement.id, {
        icon: {
          name: selectedIcon,
          size,
          color: selectedColor
        }
      });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    if (selectedElement) {
      updateElement(selectedElement.id, {
        icon: {
          name: selectedIcon,
          size: selectedSize,
          color
        }
      });
    }
  };

  // Renderizar ícone dinamicamente
  const renderIcon = (iconName: string, size: number = 24) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Preview do ícone selecionado */}
      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700">
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Preview
        </label>
        <div className="flex items-center justify-center p-8 bg-slate-950/50 rounded-lg">
          <div style={{ color: selectedColor }}>
            {renderIcon(selectedIcon, iconSizes[selectedSize])}
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-white">{selectedIcon}</p>
          <p className="text-xs text-slate-400">Tamanho: {selectedSize.toUpperCase()}</p>
        </div>
      </div>

      {/* Busca */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Buscar Ícone
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do ícone..."
            className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {filteredIcons.length} ícones encontrados
        </p>
      </div>

      {/* Grid de ícones */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Escolher Ícone
        </label>
        <div className="max-h-96 overflow-y-auto bg-slate-900/50 rounded-lg border border-slate-700 p-2">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleIconSelect(iconName)}
                className={`
                  p-3 rounded-lg transition-all duration-200 flex items-center justify-center
                  ${selectedIcon === iconName
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-110'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }
                `}
                title={iconName}
              >
                {renderIcon(iconName, 20)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tamanho do ícone */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Tamanho
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['sm', 'md', 'lg', 'xl'] as IconSize[]).map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2
                ${selectedSize === size
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }
              `}
            >
              {renderIcon(selectedIcon, size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 24)}
              <span className="text-xs font-semibold uppercase">{size}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cor do ícone */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Cor do Ícone
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className="w-16 h-10 rounded-lg cursor-pointer border-2 border-slate-700"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                handleColorChange({ target: { value } } as any);
              }
            }}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Cores rápidas */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Cores Rápidas
        </label>
        <div className="grid grid-cols-8 gap-2">
          {['#ea580c', '#fb923c', '#3b82f6', '#60a5fa', '#10b981', '#f59e0b', '#a855f7', '#ec4899'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange({ target: { value: color } } as any)}
              className="w-full aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? '#a855f7' : '#475569'
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400">
          💡 <strong className="text-slate-300">Dica:</strong> Use a busca para encontrar ícones rapidamente. Todos os ícones são da biblioteca Lucide React.
        </p>
      </div>
    </div>
  );
}
