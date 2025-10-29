import { useState, useRef } from 'react';
import { X, Type, Palette, Image as ImageIcon, Layout, Undo, Redo, Monitor, Tablet, Smartphone, Plus, Trash2, Save, Upload } from 'lucide-react';
import { EditableSiteTemplate } from '../features/myeasywebsite/EditableSiteTemplate';

interface SiteEditorProps {
  siteData: any;
  onUpdate: (updatedData: any) => void;
  onClose: () => void;
}

type EditMode = 'text' | 'colors' | 'images' | 'layout' | 'sections' | null;
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export function SiteEditor({ siteData, onUpdate, onClose }: SiteEditorProps) {
  const [editMode, setEditMode] = useState<EditMode>('text');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [history, setHistory] = useState<any[]>([siteData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [tempData, setTempData] = useState(siteData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Parse cores
  let colors = {
    primary: '#f97316',
    secondary: '#facc15',
    accent: '#f97316',
    dark: '#1a1a1a',
    light: '#f5f5f5'
  };

  try {
    if (tempData.colors) {
      colors = JSON.parse(tempData.colors);
    }
  } catch (e) {
    // Use default colors
  }

  const [selectedColors, setSelectedColors] = useState(colors);

  // Atualizar dados com histórico
  const updateData = (newData: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setTempData(newData);
    onUpdate(newData);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousData = history[newIndex];
      setTempData(previousData);
      onUpdate(previousData);
      
      // Atualizar cores
      try {
        if (previousData.colors) {
          setSelectedColors(JSON.parse(previousData.colors));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextData = history[newIndex];
      setTempData(nextData);
      onUpdate(nextData);
      
      // Atualizar cores
      try {
        if (nextData.colors) {
          setSelectedColors(JSON.parse(nextData.colors));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  // Atualizar texto
  const handleTextUpdate = (field: string, value: string) => {
    const updated = { ...tempData, [field]: value };
    updateData(updated);
  };

  // Atualizar cor
  const handleColorUpdate = (colorKey: string, value: string) => {
    const newColors = { ...selectedColors, [colorKey]: value };
    setSelectedColors(newColors);
    const updated = { ...tempData, colors: JSON.stringify(newColors) };
    updateData(updated);
  };

  // Adicionar serviço
  const handleAddService = () => {
    const newService = 'Novo Serviço';
    const updated = { 
      ...tempData, 
      services: [...(tempData.services || []), newService] 
    };
    updateData(updated);
  };

  // Remover serviço
  const handleRemoveService = (index: number) => {
    const updated = { 
      ...tempData, 
      services: tempData.services.filter((_: any, i: number) => i !== index)
    };
    updateData(updated);
  };

  // Atualizar serviço
  const handleServiceUpdate = (index: number, value: string) => {
    const newServices = [...tempData.services];
    newServices[index] = value;
    const updated = { ...tempData, services: newServices };
    updateData(updated);
  };

  // Upload de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      
      if (selectedImageIndex !== null) {
        // Substituir imagem existente
        const newGallery = [...(tempData.gallery || [])];
        newGallery[selectedImageIndex] = imageUrl;
        const updated = { ...tempData, gallery: newGallery };
        updateData(updated);
        setSelectedImageIndex(null);
      } else {
        // Adicionar nova imagem
        const updated = { 
          ...tempData, 
          gallery: [...(tempData.gallery || []), imageUrl] 
        };
        updateData(updated);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    const newGallery = tempData.gallery.filter((_: any, i: number) => i !== index);
    const updated = { ...tempData, gallery: newGallery };
    updateData(updated);
  };

  // Trocar ordem de seções
  const handleToggleSection = (section: string) => {
    const currentSections = tempData.sections || [];
    const sectionIndex = currentSections.indexOf(section);
    
    if (sectionIndex > -1) {
      // Remover seção
      const newSections = currentSections.filter((s: string) => s !== section);
      updateData({ ...tempData, sections: newSections });
    } else {
      // Adicionar seção
      const newSections = [...currentSections, section];
      updateData({ ...tempData, sections: newSections });
    }
  };

  // Salvar alterações
  const handleSave = () => {
    onUpdate(tempData);
    alert('Alterações salvas com sucesso!');
  };

  // Viewport dimensions - Usando larguras FIXAS para ativar media queries
  const getViewportDimensions = () => {
    switch (viewportMode) {
      case 'tablet':
        return { width: 'w-[768px]', scale: 'scale-90' };
      case 'mobile':
        return { width: 'w-[375px]', scale: 'scale-100' };
      default:
        return { width: 'w-full', scale: 'scale-100' };
    }
  };

  // Seções disponíveis
  const availableSections = [
    { key: 'hero', label: 'Hero (Início)', icon: '🏠' },
    { key: 'about', label: 'Sobre Nós', icon: '👥' },
    { key: 'services', label: 'Serviços', icon: '⚙️' },
    { key: 'faq', label: 'FAQ', icon: '❓' },
    { key: 'pricing', label: 'Preços', icon: '�' },
    { key: 'team', label: 'Equipe', icon: '�' },
    { key: 'testimonials', label: 'Depoimentos', icon: '⭐' },
    { key: 'gallery', label: 'Galeria', icon: '🖼️' },
    { key: 'app', label: 'App Download', icon: '📱' },
    { key: 'contact', label: 'Contato', icon: '📞' },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex">
      {/* Left Sidebar - Tools */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 space-y-4">
        <button
          onClick={() => setEditMode(editMode === 'text' ? null : 'text')}
          className={`p-3 rounded-lg transition-colors ${
            editMode === 'text' 
              ? 'bg-purple-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Editar Textos"
        >
          <Type className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => setEditMode(editMode === 'colors' ? null : 'colors')}
          className={`p-3 rounded-lg transition-colors ${
            editMode === 'colors' 
              ? 'bg-purple-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Editar Cores"
        >
          <Palette className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => setEditMode(editMode === 'images' ? null : 'images')}
          className={`p-3 rounded-lg transition-colors ${
            editMode === 'images' 
              ? 'bg-purple-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Editar Imagens"
        >
          <ImageIcon className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => setEditMode(editMode === 'sections' ? null : 'sections')}
          className={`p-3 rounded-lg transition-colors ${
            editMode === 'sections' 
              ? 'bg-purple-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Gerenciar Seções"
        >
          <Layout className="h-6 w-6" />
        </button>

        <div className="flex-1" />

        <button
          onClick={handleUndo}
          disabled={historyIndex === 0}
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Desfazer"
        >
          <Undo className="h-5 w-5" />
        </button>

        <button
          onClick={handleRedo}
          disabled={historyIndex === history.length - 1}
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Refazer"
        >
          <Redo className="h-5 w-5" />
        </button>

        <button
          onClick={handleSave}
          className="p-3 text-green-400 hover:text-green-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Salvar"
        >
          <Save className="h-5 w-5" />
        </button>
      </div>

      {/* Right Sidebar - Edit Panel */}
      {editMode && (
        <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              {editMode === 'text' && <><Type className="h-5 w-5" /><span>Editar Textos</span></>}
              {editMode === 'colors' && <><Palette className="h-5 w-5" /><span>Editar Cores</span></>}
              {editMode === 'images' && <><ImageIcon className="h-5 w-5" /><span>Editar Imagens</span></>}
              {editMode === 'sections' && <><Layout className="h-5 w-5" /><span>Gerenciar Seções</span></>}
            </h3>

            {/* TEXT EDIT MODE */}
            {editMode === 'text' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => handleTextUpdate('name', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    value={tempData.slogan}
                    onChange={(e) => handleTextUpdate('slogan', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={tempData.description}
                    onChange={(e) => handleTextUpdate('description', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {tempData.sections?.includes('services') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Serviços
                      </label>
                      <button
                        onClick={handleAddService}
                        className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Adicionar Serviço"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(tempData.services || []).map((service: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => handleServiceUpdate(index, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => handleRemoveService(index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tempData.sections?.includes('contact') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={tempData.address || ''}
                        onChange={(e) => handleTextUpdate('address', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={tempData.phone || ''}
                        onChange={(e) => handleTextUpdate('phone', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={tempData.email || ''}
                        onChange={(e) => handleTextUpdate('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* COLOR EDIT MODE */}
            {editMode === 'colors' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Primária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors.primary}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      className="h-12 w-12 rounded-lg cursor-pointer border-2 border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedColors.primary}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors.secondary}
                      onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                      className="h-12 w-12 rounded-lg cursor-pointer border-2 border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedColors.secondary}
                      onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor de Destaque
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors.accent}
                      onChange={(e) => handleColorUpdate('accent', e.target.value)}
                      className="h-12 w-12 rounded-lg cursor-pointer border-2 border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedColors.accent}
                      onChange={(e) => handleColorUpdate('accent', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Escura
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors.dark}
                      onChange={(e) => handleColorUpdate('dark', e.target.value)}
                      className="h-12 w-12 rounded-lg cursor-pointer border-2 border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedColors.dark}
                      onChange={(e) => handleColorUpdate('dark', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cor Clara
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={selectedColors.light}
                      onChange={(e) => handleColorUpdate('light', e.target.value)}
                      className="h-12 w-12 rounded-lg cursor-pointer border-2 border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedColors.light}
                      onChange={(e) => handleColorUpdate('light', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400">
                    💡 As alterações são aplicadas em tempo real no preview
                  </p>
                </div>
              </div>
            )}

            {/* IMAGES EDIT MODE */}
            {editMode === 'images' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Galeria de Imagens
                    </label>
                    <button
                      onClick={() => {
                        setSelectedImageIndex(null);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {tempData.gallery && tempData.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {tempData.gallery.map((img: string, idx: number) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={img} 
                            alt={`Galeria ${idx + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border border-slate-700" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedImageIndex(idx);
                                fileInputRef.current?.click();
                              }}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Substituir"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveImage(idx)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 mb-3">Nenhuma imagem adicionada</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        Adicionar Imagem
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400">
                    💡 Clique em "Substituir" para trocar uma imagem ou "Remover" para excluí-la
                  </p>
                </div>
              </div>
            )}

            {/* SECTIONS EDIT MODE */}
            {editMode === 'sections' && (
              <div className="space-y-6">
                <p className="text-sm text-slate-400 mb-4">
                  Ative ou desative as seções do seu site
                </p>

                <div className="space-y-3">
                  {availableSections.map((section) => {
                    const isActive = tempData.sections?.includes(section.key);
                    return (
                      <button
                        key={section.key}
                        onClick={() => handleToggleSection(section.key)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{section.icon}</span>
                          <span className="font-medium">{section.label}</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          isActive ? 'bg-purple-600' : 'bg-slate-700'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform mt-0.5 ${
                            isActive ? 'ml-6' : 'ml-0.5'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400">
                    💡 As seções desativadas não aparecerão no site final
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Preview */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-white">Editor do Site</h2>
            <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-2 rounded transition-colors ${
                  viewportMode === 'desktop'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-2 rounded transition-colors ${
                  viewportMode === 'tablet'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-2 rounded transition-colors ${
                  viewportMode === 'mobile'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-slate-400">
              {historyIndex > 0 && `${historyIndex} alteração${historyIndex > 1 ? 'ões' : ''}`}
            </div>

            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">Fechar</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-900">
          <div className={`${getViewportDimensions().width} transition-all duration-300 shadow-2xl origin-top`} style={{ transform: getViewportDimensions().scale }}>
            <EditableSiteTemplate siteData={tempData} onUpdate={updateData} viewportMode={viewportMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
