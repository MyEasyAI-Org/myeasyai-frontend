import { Check, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface EditableSiteTemplateProps {
  siteData: any;
  onUpdate: (updatedData: any) => void;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
}

export function EditableSiteTemplate({
  siteData,
  onUpdate,
  viewportMode = 'desktop',
}: EditableSiteTemplateProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Parse cores ou usar padrão
  let primaryColor = '#ea580c';
  let secondaryColor = '#1a1a1a';
  let accentColor = '#fb923c';
  let darkColor = '#1a1a1a';
  let lightColor = '#f5f5f5';

  try {
    if (siteData.colors) {
      const parsed = JSON.parse(siteData.colors);
      primaryColor = parsed.primary || primaryColor;
      secondaryColor = parsed.secondary || secondaryColor;
      accentColor = parsed.accent || accentColor;
      darkColor = parsed.dark || darkColor;
      lightColor = parsed.light || lightColor;
    }
  } catch {
    // Se não conseguir parsear, usa cores padrão
  }

  // ========== FUNÇÕES DE CÁLCULO DE CONTRASTE ==========

  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const isLightColor = (hex: string): boolean => {
    return getLuminance(hex) > 128;
  };

  const getContrastText = (bgHex: string): string => {
    return isLightColor(bgHex) ? '#1a1a1a' : '#ffffff';
  };

  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(
      255,
      Math.floor((num >> 16) + (255 - (num >> 16)) * percent),
    );
    const g = Math.min(
      255,
      Math.floor(
        ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent,
      ),
    );
    const b = Math.min(
      255,
      Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent),
    );
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const primaryLight = lightenColor(primaryColor, 0.3);

  const vibe = siteData.vibe || 'vibrant';
  let headerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
  };
  let headerClasses = 'backdrop-blur-lg';

  switch (vibe) {
    case 'light':
      headerStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)' };
      headerClasses += ' border-b border-gray-200';
      break;
    case 'dark':
      headerStyle = { backgroundColor: 'rgba(0, 0, 0, 0.95)' };
      break;
    case 'vibrant':
      // Para cores dinâmicas, é melhor usar style inline
      headerStyle = { backgroundColor: primaryColor };
      break;
    case 'corporate':
      headerStyle = { backgroundColor: 'rgba(15, 23, 42, 0.95)' };
      break;
    case 'fun':
      headerStyle = { backgroundColor: 'rgba(147, 51, 234, 0.95)' };
      break;
    case 'elegant':
      headerStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)' };
      headerClasses += ' border-b border-gray-100';
      break;
  }

  // ========== HANDLERS DE EDIÇÃO ==========

  const handleStartEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!editingField || !editInputRef.current) return;

    // Ler o valor diretamente do input
    const currentValue = editInputRef.current.value;

    // Handle nested fields (e.g., "services.0", "heroStats.0.value", "features.0.title")
    const parts = editingField.split('.');

    if (parts[0] === 'services' && parts[1] !== undefined) {
      const newServices = [...siteData.services];
      newServices[parseInt(parts[1])] = currentValue;
      onUpdate({ ...siteData, services: newServices });
    } else if (parts.length === 3) {
      // Handle deeply nested fields like heroStats.0.value or features.0.title
      const [section, index, field] = parts;
      const newArray = [...(siteData[section] || [])];
      newArray[parseInt(index)] = {
        ...newArray[parseInt(index)],
        [field]: currentValue,
      };
      onUpdate({ ...siteData, [section]: newArray });
    } else if (parts.length === 2) {
      // Handle nested objects like sectionLabels.features
      const [section, field] = parts;
      const newSection = {
        ...(siteData[section] || {}),
        [field]: currentValue,
      };
      onUpdate({ ...siteData, [section]: newSection });
    } else {
      // Simple field
      onUpdate({ ...siteData, [editingField]: currentValue });
    }

    setEditingField(null);
    setTempValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleAddService = () => {
    const newServices = [...(siteData.services || []), 'Novo Serviço'];
    onUpdate({ ...siteData, services: newServices });
  };

  const handleRemoveService = (index: number) => {
    const newServices = siteData.services.filter(
      (_: any, i: number) => i !== index,
    );
    onUpdate({ ...siteData, services: newServices });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newGallery = [...(siteData.gallery || []), reader.result as string];
      onUpdate({ ...siteData, gallery: newGallery });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const newGallery = siteData.gallery.filter(
      (_: any, i: number) => i !== index,
    );
    onUpdate({ ...siteData, gallery: newGallery });
  };

  // ========== COMPONENTE DE TEXTO EDITÁVEL ==========

  const EditableText = ({
    field,
    value,
    className = '',
    multiline = false,
    as = 'span',
    style,
  }: {
    field: string;
    value: string;
    className?: string;
    multiline?: boolean;
    as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
    style?: React.CSSProperties;
  }) => {
    const isEditing = editingField === field;
    const isHovered = hoveredElement === field;
    const Tag = as;

    if (isEditing) {
      return (
        <div className="relative inline-block w-full">
          {multiline ? (
            <textarea
              ref={editInputRef as any}
              defaultValue={tempValue}
              className="border-2 border-purple-500 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full shadow-xl"
              style={{
                color: '#1a1a1a',
                backgroundColor: '#ffffff',
                direction: 'ltr',
              }}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              ref={editInputRef as any}
              type="text"
              defaultValue={tempValue}
              className="border-2 border-purple-500 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full shadow-xl"
              style={{
                color: '#1a1a1a',
                backgroundColor: '#ffffff',
                direction: 'ltr',
              }}
              autoFocus
            />
          )}
          <div className="absolute -top-10 right-0 flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg shadow-lg z-50">
            <button
              onClick={handleSaveEdit}
              className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              title="Salvar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              title="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <Tag
        className={`${className} ${isHovered ? 'outline outline-2 outline-purple-500 outline-offset-2' : ''} cursor-pointer relative group transition-all`}
        onClick={() => handleStartEdit(field, value)}
        onMouseEnter={() => setHoveredElement(field)}
        onMouseLeave={() => setHoveredElement(null)}
        style={style}
      >
        {value}
        {isHovered && (
          <span className="absolute -top-6 left-0 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
            ✏️ Clique para editar
          </span>
        )}
      </Tag>
    );
  };

  return (
    <div className="bg-white min-h-full relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .site-template {
          font-family: 'Poppins', sans-serif;
          position: relative;
          --color-primary: ${primaryColor};
          --color-primary-light: ${primaryLight};
          --color-secondary: ${secondaryColor};
          --color-accent: ${accentColor};
        }
        
        .site-template h1, .site-template h2, .site-template h3 {
          font-family: 'Playfair Display', serif;
        }
        
        .site-template-header {
          position: relative; /* Alterado de sticky para relative para corrigir a sobreposição no editor */
          z-index: 50;
        }

        /* Todas as animações do SiteTemplate.tsx */
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-float-element {
          animation: float 6s ease-in-out infinite;
        }

        .hero-float-slow {
          animation: floatSlow 12s ease-in-out infinite;
        }

        .hero-pulse {
          animation: pulse 4s ease-in-out infinite;
        }

        .hero-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .hero-decorative-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="site-template">
        {/* Header */}
        <header
          className={`site-template-header ${headerClasses}`}
          style={headerStyle}
          role="banner"
        >
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <EditableText
              field="name"
              value={siteData.name}
              className={`text-2xl font-bold ${vibe === 'light' || vibe === 'elegant' ? 'text-gray-900' : 'text-white'}`}
            />
            <div
              className={`${viewportMode === 'mobile' ? 'hidden' : 'flex'} items-center gap-8`}
            >
              <nav
                className={`${viewportMode === 'mobile' ? 'hidden' : 'flex'} gap-8`}
              >
                <a
                  href="#"
                  className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}
                >
                  Início
                </a>
                {siteData.sections.includes('services') && (
                  <a
                    href="#servicos"
                    className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}
                  >
                    Serviços
                  </a>
                )}
                {siteData.sections.includes('gallery') && (
                  <a
                    href="#galeria"
                    className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}
                  >
                    Galeria
                  </a>
                )}
                {siteData.sections.includes('contact') && (
                  <a
                    href="#contato"
                    className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}
                  >
                    Contato
                  </a>
                )}
              </nav>
              <button
                className="px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryLight})`,
                  color: getContrastText(primaryColor),
                }}
              >
                Fale Conosco
              </button>
            </div>
            <div className={viewportMode === 'mobile' ? 'block' : 'hidden'}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md"
                style={{
                  color:
                    vibe === 'light' || vibe === 'elegant'
                      ? 'text-gray-900'
                      : 'text-white',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-[100] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div
              className="fixed top-0 right-0 h-full w-[280px] z-[101] shadow-2xl md:hidden"
              style={{
                backgroundColor:
                  vibe === 'light' || vibe === 'elegant'
                    ? '#ffffff'
                    : primaryColor,
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <style>{`
                @keyframes slideInRight {
                  from {
                    transform: translateX(100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }
              `}</style>

              <div className="flex flex-col h-full">
                {/* Header do drawer */}
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{
                    borderColor:
                      vibe === 'light' || vibe === 'elegant'
                        ? '#e5e7eb'
                        : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{
                      color:
                        vibe === 'light' || vibe === 'elegant'
                          ? '#1a1a1a'
                          : '#ffffff',
                    }}
                  >
                    Menu
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-black/10"
                    style={{
                      color:
                        vibe === 'light' || vibe === 'elegant'
                          ? '#1a1a1a'
                          : '#ffffff',
                    }}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Links de navegação */}
                <nav className="flex flex-col p-6 space-y-4 flex-1">
                  <a
                    href="#"
                    className="text-lg font-semibold py-3 px-4 rounded-lg transition"
                    style={{
                      color:
                        vibe === 'light' || vibe === 'elegant'
                          ? '#1a1a1a'
                          : '#ffffff',
                      backgroundColor:
                        vibe === 'light' || vibe === 'elegant'
                          ? '#f3f4f6'
                          : 'rgba(255,255,255,0.1)',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Início
                  </a>
                  {siteData.sections.includes('services') && (
                    <a
                      href="#servicos"
                      className="text-lg font-semibold py-3 px-4 rounded-lg transition hover:bg-black/5"
                      style={{
                        color:
                          vibe === 'light' || vibe === 'elegant'
                            ? '#1a1a1a'
                            : '#ffffff',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Serviços
                    </a>
                  )}
                  {siteData.sections.includes('gallery') && (
                    <a
                      href="#galeria"
                      className="text-lg font-semibold py-3 px-4 rounded-lg transition hover:bg-black/5"
                      style={{
                        color:
                          vibe === 'light' || vibe === 'elegant'
                            ? '#1a1a1a'
                            : '#ffffff',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Galeria
                    </a>
                  )}
                  {siteData.sections.includes('contact') && (
                    <a
                      href="#contato"
                      className="text-lg font-semibold py-3 px-4 rounded-lg transition hover:bg-black/5"
                      style={{
                        color:
                          vibe === 'light' || vibe === 'elegant'
                            ? '#1a1a1a'
                            : '#ffffff',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contato
                    </a>
                  )}
                </nav>

                {/* Botão CTA no fundo */}
                <div
                  className="p-6 border-t"
                  style={{
                    borderColor:
                      vibe === 'light' || vibe === 'elegant'
                        ? '#e5e7eb'
                        : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <button
                    className="w-full px-6 py-4 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg transition transform hover:scale-105"
                    style={{
                      background:
                        vibe === 'light' || vibe === 'elegant'
                          ? `linear-gradient(135deg, ${primaryColor}, ${primaryLight})`
                          : '#ffffff',
                      color:
                        vibe === 'light' || vibe === 'elegant'
                          ? getContrastText(primaryColor)
                          : primaryColor,
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fale Conosco
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hero */}
        {siteData.sections.includes('hero') && (
          <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
            style={{ backgroundColor: primaryColor }}
          >
            {/* Elementos decorativos animados de fundo */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="hero-decorative-circle hero-float-slow"
                style={{
                  width: '500px',
                  height: '500px',
                  top: '-200px',
                  left: '-150px',
                  opacity: 0.15,
                }}
              ></div>

              <div
                className="hero-decorative-circle hero-pulse"
                style={{
                  width: '350px',
                  height: '350px',
                  bottom: '-100px',
                  right: '-80px',
                  animationDelay: '1s',
                }}
              ></div>

              <div
                className="hero-decorative-circle hero-float-element"
                style={{
                  width: '200px',
                  height: '200px',
                  top: '100px',
                  right: '150px',
                  opacity: 0.1,
                  animationDelay: '2s',
                }}
              ></div>

              <div
                className="hero-decorative-circle hero-pulse"
                style={{
                  width: '280px',
                  height: '280px',
                  top: '50%',
                  left: '10%',
                  opacity: 0.12,
                  animationDelay: '3s',
                }}
              ></div>

              {/* Partículas de luz animadas */}
              <div
                className="absolute w-6 h-6 rounded-full bg-white hero-float-element"
                style={{
                  top: '80px',
                  left: '80px',
                  opacity: 0.6,
                  animationDelay: '0.5s',
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-white hero-pulse"
                style={{
                  top: '160px',
                  right: '128px',
                  opacity: 0.5,
                  animationDelay: '1.5s',
                }}
              ></div>
              <div
                className="absolute w-8 h-8 rounded-full bg-white hero-float-slow"
                style={{
                  bottom: '128px',
                  left: '160px',
                  opacity: 0.4,
                  animationDelay: '2.5s',
                }}
              ></div>
              <div
                className="absolute w-4 h-4 rounded-full bg-white hero-pulse"
                style={{
                  top: '240px',
                  left: '25%',
                  opacity: 0.7,
                  animationDelay: '3.5s',
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-white hero-float-element"
                style={{
                  bottom: '160px',
                  right: '25%',
                  opacity: 0.55,
                  animationDelay: '4s',
                }}
              ></div>
              <div
                className="absolute w-6 h-6 rounded-full bg-white hero-float-slow"
                style={{
                  top: '33.333%',
                  right: '80px',
                  opacity: 0.45,
                  animationDelay: '2s',
                }}
              ></div>

              {/* Partículas adicionais */}
              <div
                className="absolute w-7 h-7 rounded-full bg-white hero-pulse"
                style={{
                  top: '40px',
                  right: '25%',
                  opacity: 0.65,
                  animationDelay: '0.8s',
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-white hero-float-element"
                style={{
                  bottom: '80px',
                  left: '33.333%',
                  opacity: 0.6,
                  animationDelay: '1.2s',
                }}
              ></div>
              <div
                className="absolute w-6 h-6 rounded-full bg-white hero-float-slow"
                style={{
                  top: '50%',
                  left: '40px',
                  opacity: 0.5,
                  animationDelay: '3s',
                }}
              ></div>
              <div
                className="absolute w-4 h-4 rounded-full bg-white hero-pulse"
                style={{
                  bottom: '240px',
                  right: '160px',
                  opacity: 0.7,
                  animationDelay: '4.5s',
                }}
              ></div>
              <div
                className="absolute w-8 h-8 rounded-full bg-white hero-float-element"
                style={{
                  top: '320px',
                  right: '40px',
                  opacity: 0.45,
                  animationDelay: '0.3s',
                }}
              ></div>
              <div
                className="absolute w-6 h-6 rounded-full bg-white hero-float-slow"
                style={{
                  bottom: '40px',
                  left: '80px',
                  opacity: 0.55,
                  animationDelay: '5s',
                }}
              ></div>
              <div
                className="absolute w-5 h-5 rounded-full bg-white hero-pulse"
                style={{
                  top: '25%',
                  left: '50%',
                  opacity: 0.6,
                  animationDelay: '1.8s',
                }}
              ></div>
              <div
                className="absolute w-7 h-7 rounded-full bg-white hero-float-element"
                style={{
                  bottom: '33.333%',
                  right: '33.333%',
                  opacity: 0.5,
                  animationDelay: '3.2s',
                }}
              ></div>
              <div
                className="absolute w-4 h-4 rounded-full bg-white hero-float-slow"
                style={{
                  top: '384px',
                  left: '240px',
                  opacity: 0.65,
                  animationDelay: '2.3s',
                }}
              ></div>

              {/* Raios de luz sutis */}
              <div
                className="absolute top-0 w-px h-full opacity-5 bg-gradient-to-b from-transparent via-white to-transparent hero-pulse"
                style={{
                  left: '25%',
                  transform: 'rotate(15deg)',
                  animationDelay: '1s',
                }}
              ></div>
              <div
                className="absolute top-0 w-px h-full opacity-5 bg-gradient-to-b from-transparent via-white to-transparent hero-pulse"
                style={{
                  right: '33.333%',
                  transform: 'rotate(-10deg)',
                  animationDelay: '2s',
                }}
              ></div>
            </div>

            {/* Conteúdo centralizado */}
            <div className="container mx-auto px-6 py-12 relative z-10 text-center">
              <div className="max-w-4xl mx-auto">
                {/* Badge */}
                <div
                  className="hero-slide-up mb-8"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold shadow-2xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: getContrastText(primaryColor),
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span>🔥</span> {siteData.area}
                  </div>
                </div>

                {/* Título principal */}
                <EditableText
                  field="slogan"
                  value={siteData.slogan || siteData.name}
                  className={`hero-slide-up font-black mb-6 leading-tight ${viewportMode === 'mobile' ? 'text-5xl' : 'text-6xl md:text-7xl'}`}
                  as="h1"
                  style={{
                    color: getContrastText(primaryColor),
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                />

                {/* Descrição */}
                <EditableText
                  field="description"
                  value={siteData.description}
                  className={`hero-slide-up mb-12 leading-relaxed max-w-2xl mx-auto ${viewportMode === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl'}`}
                  as="p"
                  multiline
                  style={{
                    color: getContrastText(primaryColor),
                    opacity: 0.95,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                />

                {/* Botões CTA */}
                <div
                  className={`hero-slide-up flex gap-4 justify-center mb-20 ${viewportMode === 'mobile' ? 'flex-col' : 'flex-col sm:flex-row'}`}
                  style={{ animationDelay: '0.4s' }}
                >
                  <button
                    className="px-12 py-5 rounded-full font-bold uppercase text-sm tracking-wide shadow-2xl transition transform hover:scale-105 hover:shadow-3xl"
                    style={{
                      backgroundColor: '#ffffff',
                      color: primaryColor,
                    }}
                  >
                    <span>Começar Agora</span>
                  </button>
                  <button
                    className="px-12 py-5 rounded-full font-bold uppercase text-sm tracking-wide transition transform hover:scale-105"
                    style={{
                      backgroundColor: 'transparent',
                      color: getContrastText(primaryColor),
                      border: `2px solid ${getContrastText(primaryColor)}80`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    Saiba Mais
                  </button>
                </div>

                {/* Estatísticas */}
                <div
                  className={`hero-slide-up grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 md:gap-12'}`}
                  style={{ animationDelay: '0.5s' }}
                >
                  {(
                    siteData.heroStats || [
                      { value: '500+', label: 'Clientes Satisfeitos' },
                      { value: '4.9★', label: 'Avaliação Média' },
                      { value: '10+', label: 'Anos de Experiência' },
                    ]
                  ).map(
                    (stat: { value: string; label: string }, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-2xl"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <EditableText
                          field={`heroStats.${idx}.value`}
                          value={stat.value}
                          className="text-5xl font-black mb-2"
                          as="h3"
                          style={{ color: getContrastText(primaryColor) }}
                        />
                        <EditableText
                          field={`heroStats.${idx}.label`}
                          value={stat.label}
                          className="text-sm uppercase tracking-wider font-semibold opacity-90"
                          as="p"
                          style={{ color: getContrastText(primaryColor) }}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white -mt-12 relative z-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div
              className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br opacity-5 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${primaryColor}, transparent)`,
              }}
            ></div>
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br opacity-5 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${accentColor}, transparent)`,
              }}
            ></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <EditableText
                field="sectionLabels.features"
                value={
                  siteData.sectionLabels?.features ||
                  'Por Que Escolher a Gente?'
                }
                className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                as="span"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              />
              <EditableText
                field="sectionTitles.features"
                value={
                  siteData.sectionTitles?.features || 'Benefícios Exclusivos'
                }
                className="text-5xl font-black text-gray-900"
                as="h2"
              />
            </div>

            <div
              className={`grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
            >
              {(
                siteData.features || [
                  {
                    title: 'Experiência Premium',
                    description:
                      'Muito mais que um serviço, uma verdadeira experiência de luxo e conforto',
                  },
                  {
                    title: 'Profissionais Qualificados',
                    description:
                      'Equipe altamente treinada e experiente no que faz',
                  },
                  {
                    title: 'Atendimento Fácil',
                    description: 'Agende com total praticidade e rapidez',
                  },
                ]
              ).map(
                (
                  feature: { title: string; description: string },
                  idx: number,
                ) => {
                  const icons = [
                    'M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z',
                    'M20 20m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M13 20L18 25L27 16',
                    'M20 20m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M20 15V20L25 25',
                  ];
                  return (
                    <div
                      key={idx}
                      className="bg-white p-10 rounded-3xl text-center border-2 cursor-pointer"
                      style={{
                        borderColor: 'transparent',
                        background:
                          'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(251, 146, 60, 0.1)) border-box',
                      }}
                    >
                      <div
                        className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-2xl relative"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          boxShadow: `0 10px 30px ${primaryColor}40`,
                        }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 40 40"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={icons[idx % icons.length]} />
                        </svg>
                      </div>
                      <EditableText
                        field={`features.${idx}.title`}
                        value={feature.title}
                        className="text-2xl font-bold mb-4 text-gray-900"
                        as="h3"
                      />
                      <EditableText
                        field={`features.${idx}.description`}
                        value={feature.description}
                        className="text-gray-600 leading-relaxed"
                        as="p"
                        multiline
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {siteData.sections.includes('about') && (
          <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-1/4 -right-32 w-96 h-96 rounded-full opacity-5"
                style={{
                  background: `radial-gradient(circle, ${primaryColor}, transparent)`,
                }}
              ></div>
              <div
                className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5"
                style={{
                  background: `radial-gradient(circle, ${accentColor}, transparent)`,
                }}
              ></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div
                className={`grid gap-20 items-center ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'}`}
              >
                <div className="relative h-[600px]">
                  <img
                    src="https://via.placeholder.com/400x500"
                    alt="Sobre"
                    className="absolute top-0 left-0 w-[70%] h-[70%] object-cover rounded-3xl shadow-2xl z-10"
                  />

                  <img
                    src="https://via.placeholder.com/400x500"
                    alt="Sobre"
                    className="absolute bottom-0 right-0 w-[70%] h-[70%] object-cover rounded-3xl shadow-2xl"
                  />

                  <div className="absolute bottom-5 left-5 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 z-20">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      }}
                    >
                      ⭐
                    </div>
                    <div>
                      <strong
                        className="text-4xl font-black block leading-none"
                        style={{ color: primaryColor }}
                      >
                        4.9
                      </strong>
                      <p className="text-sm text-gray-600 font-semibold">
                        Avaliação
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <EditableText
                    field="sectionLabels.about"
                    value={siteData.sectionLabels?.about || 'Sobre Nós'}
                    className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                    as="span"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  />

                  <EditableText
                    field="sectionTitles.about"
                    value={
                      siteData.sectionTitles?.about || 'Do Sonho à Realidade'
                    }
                    className={`font-black mb-6 leading-tight text-gray-900 ${viewportMode === 'mobile' ? 'text-4xl' : 'text-5xl md:text-6xl'}`}
                    as="h2"
                  />

                  <EditableText
                    field="aboutSubtitle"
                    value={
                      siteData.aboutSubtitle ||
                      'Nossa empresa foi projetada para ser um ponto de referência em qualidade, inovação e excelência.'
                    }
                    className="text-xl font-medium text-gray-700 mb-5 leading-relaxed"
                    as="p"
                    multiline
                  />

                  <EditableText
                    field="description"
                    value={siteData.description}
                    className="text-gray-600 mb-8 leading-relaxed"
                    as="p"
                    multiline
                  />

                  <div className="space-y-4 my-8">
                    {(
                      siteData.aboutContent?.checklist || [
                        'Profissionais certificados',
                        'Produtos premium',
                        'Ambiente climatizado',
                      ]
                    ).map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${primaryColor}15`,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={primaryColor}
                            strokeWidth="3"
                          >
                            <path
                              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <EditableText
                          field={`aboutContent.checklist.${idx}`}
                          value={item}
                          className="font-semibold text-gray-800"
                          as="span"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    className="px-12 py-5 rounded-full font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      color: getContrastText(primaryColor),
                    }}
                  >
                    Agende seu horário
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {siteData.sections.includes('services') &&
          siteData.services.length > 0 && (
            <section
              id="servicos"
              className="py-24 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${darkColor})`,
              }}
            >
              <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <EditableText
                    field="sectionLabels.services"
                    value={
                      siteData.sectionLabels?.services || 'Nossos Serviços'
                    }
                    className="inline-block px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-xl"
                    as="span"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: getContrastText(primaryColor),
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  />
                  <EditableText
                    field="sectionTitles.services"
                    value={
                      siteData.sectionTitles?.services ||
                      'Serviços que Transformam'
                    }
                    className="text-5xl md:text-6xl font-black mb-6 leading-tight"
                    as="h2"
                    style={{
                      color: getContrastText(primaryColor),
                      textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  />
                </div>

                <div
                  className={`grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
                >
                  {siteData.services
                    .slice(0, 6)
                    .map((service: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-10 rounded-3xl text-center cursor-pointer border-2 relative group"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderColor: 'rgba(255,255,255,0.2)',
                        }}
                        onMouseEnter={() => setHoveredElement(`service-${idx}`)}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <div
                          className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl text-5xl"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          ✨
                        </div>

                        <EditableText
                          field={`services.${idx}`}
                          value={service}
                          className="text-2xl font-bold mb-4"
                          as="h3"
                          style={{
                            color: getContrastText(primaryColor),
                            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                          }}
                        />

                        <EditableText
                          field={`serviceDescriptions.${idx}.description`}
                          value={
                            siteData.serviceDescriptions?.[idx]?.description ||
                            'Serviço de qualidade premium com resultados excepcionais'
                          }
                          className="leading-relaxed mb-6"
                          as="p"
                          multiline
                          style={{
                            color: getContrastText(primaryColor),
                            opacity: 0.85,
                            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          }}
                        />

                        {hoveredElement === `service-${idx}` && (
                          <button
                            onClick={() => handleRemoveService(idx)}
                            className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}

                  <button
                    onClick={handleAddService}
                    className="bg-white/5 p-10 rounded-3xl text-center border-2 border-dashed border-white/20 hover:border-purple-500 hover:bg-white/10 transition-all flex flex-col items-center justify-center"
                  >
                    <Plus className="h-12 w-12 mb-4 text-purple-400" />
                    <span className="text-lg font-semibold">
                      Adicionar Serviço
                    </span>
                  </button>
                </div>
              </div>
            </section>
          )}

        {/* FAQ Section */}
        {siteData.sections.includes('faq') && (
          <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <EditableText
                  field="sectionLabels.faq"
                  value={siteData.sectionLabels?.faq || 'FAQ'}
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  as="span"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                />
                <EditableText
                  field="sectionTitles.faq"
                  value={siteData.sectionTitles?.faq || 'Perguntas Frequentes'}
                  className="text-5xl font-black text-gray-900"
                  as="h2"
                />
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {(
                  siteData.faq || [
                    {
                      question: 'Como posso agendar um horário?',
                      answer:
                        'Você pode agendar através do nosso site, app ou WhatsApp.',
                    },
                    {
                      question: 'Quais são as formas de pagamento?',
                      answer:
                        'Aceitamos dinheiro, cartão de crédito/débito e PIX.',
                    },
                    {
                      question: 'Vocês atendem aos finais de semana?',
                      answer:
                        'Sim, atendemos de segunda a sábado, das 9h às 18h.',
                    },
                  ]
                ).map(
                  (item: { question: string; answer: string }, idx: number) => (
                    <details
                      key={idx}
                      className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                        <EditableText
                          field={`faq.${idx}.question`}
                          value={item.question}
                          className="text-lg font-bold text-gray-900"
                          as="h3"
                        />
                        <svg
                          className="w-6 h-6 transform group-open:rotate-180 transition-transform"
                          fill="none"
                          stroke={primaryColor}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="px-6 pb-6">
                        <EditableText
                          field={`faq.${idx}.answer`}
                          value={item.answer}
                          className="text-gray-600 leading-relaxed"
                          as="p"
                          multiline
                        />
                      </div>
                    </details>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {siteData.sections.includes('pricing') && (
          <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <EditableText
                  field="sectionLabels.pricing"
                  value={siteData.sectionLabels?.pricing || 'Preços'}
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  as="span"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                />
                <EditableText
                  field="sectionTitles.pricing"
                  value={
                    siteData.sectionTitles?.pricing ||
                    'Planos que Cabem no Bolso'
                  }
                  className="text-5xl font-black text-gray-900"
                  as="h2"
                />
              </div>
              <div
                className={`grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
              >
                {(
                  siteData.pricing || [
                    {
                      name: 'Básico',
                      price: 'R$ 99',
                      features: [
                        'Atendimento básico',
                        'Produtos padrão',
                        'Sem agendamento',
                      ],
                    },
                    {
                      name: 'Premium',
                      price: 'R$ 199',
                      features: [
                        'Atendimento premium',
                        'Produtos premium',
                        'Agendamento prioritário',
                        'Brindes exclusivos',
                      ],
                    },
                    {
                      name: 'VIP',
                      price: 'R$ 299',
                      features: [
                        'Atendimento VIP',
                        'Produtos top de linha',
                        'Agendamento exclusivo',
                        'Tratamento especial',
                        'Benefícios extras',
                      ],
                    },
                  ]
                ).map(
                  (
                    plan: {
                      name: string;
                      price: string;
                      features: string[];
                      popular?: boolean;
                    },
                    idx: number,
                  ) => (
                    <div
                      key={idx}
                      className={`bg-white p-10 rounded-2xl hover:shadow-2xl transition relative ${plan.popular ? 'scale-105 border-2' : 'border'}`}
                      style={{
                        borderColor: plan.popular ? primaryColor : '#e5e7eb',
                      }}
                    >
                      {plan.popular && (
                        <div
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-1 rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          POPULAR
                        </div>
                      )}
                      <EditableText
                        field={`pricing.${idx}.name`}
                        value={plan.name}
                        className="text-2xl font-bold mb-4 text-gray-900"
                        as="h3"
                      />
                      <div className="mb-6">
                        <EditableText
                          field={`pricing.${idx}.price`}
                          value={plan.price}
                          className="text-5xl font-black"
                          as="span"
                          style={{ color: primaryColor }}
                        />
                        <span className="text-gray-600">/mês</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-3">
                            <svg
                              className="w-6 h-6 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke={primaryColor}
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <EditableText
                              field={`pricing.${idx}.features.${fIdx}`}
                              value={feature}
                              className="text-gray-700"
                              as="span"
                            />
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full py-4 rounded-full font-semibold uppercase text-sm tracking-wide transition ${plan.popular ? 'text-white hover:shadow-xl' : 'hover:text-white'}`}
                        style={
                          plan.popular
                            ? {
                                background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                                color: getContrastText(primaryColor),
                              }
                            : {
                                border: `2px solid ${primaryColor}`,
                                color: primaryColor,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!plan.popular) {
                            e.currentTarget.style.backgroundColor =
                              primaryColor;
                            e.currentTarget.style.color =
                              getContrastText(primaryColor);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!plan.popular) {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                            e.currentTarget.style.color = primaryColor;
                          }
                        }}
                      >
                        Escolher Plano
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* Team Section */}
        {siteData.sections.includes('team') && (
          <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <EditableText
                  field="sectionLabels.team"
                  value={siteData.sectionLabels?.team || 'Nossa Equipe'}
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  as="span"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                />
                <EditableText
                  field="sectionTitles.team"
                  value={siteData.sectionTitles?.team || 'Conheça nosso Time'}
                  className="text-5xl font-black text-gray-900"
                  as="h2"
                />
              </div>
              <div
                className={`grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
              >
                {(
                  siteData.team || [
                    { name: 'João Silva', role: 'CEO & Fundador' },
                    { name: 'Maria Santos', role: 'Diretora de Operações' },
                    { name: 'Pedro Costa', role: 'Gerente de Atendimento' },
                  ]
                ).map(
                  (
                    member: { name: string; role: string; photo?: string },
                    idx: number,
                  ) => (
                    <div key={idx} className="text-center group">
                      <div className="relative mb-6 inline-block">
                        <div
                          className="w-48 h-48 mx-auto rounded-full text-white flex items-center justify-center text-5xl font-bold group-hover:scale-105 transition-transform"
                          style={{
                            background: `linear-gradient(to bottom right, ${primaryColor}, ${accentColor})`,
                            color: getContrastText(primaryColor),
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      </div>
                      <EditableText
                        field={`team.${idx}.name`}
                        value={member.name}
                        className="text-2xl font-bold mb-2 text-gray-900"
                        as="h3"
                      />
                      <EditableText
                        field={`team.${idx}.role`}
                        value={member.role}
                        className="font-medium mb-4"
                        as="p"
                        style={{ color: primaryColor }}
                      />
                      <div className="flex justify-center gap-3">
                        <a
                          href="#"
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full transition"
                          style={{ color: '#6b7280' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              primaryColor;
                            e.currentTarget.style.color =
                              getContrastText(primaryColor);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {siteData.sections.includes('testimonials') && (
          <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div
                className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${primaryColor}, transparent)`,
                }}
              ></div>
              <div
                className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${accentColor}, transparent)`,
                }}
              ></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <EditableText
                  field="sectionLabels.testimonials"
                  value={siteData.sectionLabels?.testimonials || 'Depoimentos'}
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  as="span"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                />
                <EditableText
                  field="sectionTitles.testimonials"
                  value={
                    siteData.sectionTitles?.testimonials ||
                    'O que dizem Nossos Clientes'
                  }
                  className="text-5xl md:text-6xl font-black text-gray-900"
                  as="h2"
                />
              </div>

              <div
                className={`grid gap-8 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
              >
                {(
                  siteData.testimonials || [
                    {
                      name: 'Ana Silva',
                      role: 'Cliente Satisfeita',
                      text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível.',
                    },
                    {
                      name: 'Carlos Santos',
                      role: 'Cliente Fiel',
                      text: 'Superou todas as minhas expectativas! Qualidade premium.',
                    },
                    {
                      name: 'Maria Costa',
                      role: 'Cliente VIP',
                      text: 'Simplesmente perfeito! A melhor experiência que já tive.',
                    },
                  ]
                ).map(
                  (
                    testimonial: { name: string; role: string; text: string },
                    idx: number,
                  ) => {
                    const initial = testimonial.name.charAt(0);
                    return (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-3xl border-2 cursor-pointer"
                        style={{
                          borderColor: `${primaryColor}20`,
                        }}
                      >
                        <div className="mb-6" style={{ color: '#fbbf24' }}>
                          {[...Array(5)].map((_, starIdx) => (
                            <svg
                              key={starIdx}
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="inline-block"
                            >
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          ))}
                        </div>

                        <div className="mb-8">
                          <EditableText
                            field={`testimonials.${idx}.text`}
                            value={testimonial.text}
                            className="text-lg italic text-gray-700 leading-relaxed relative z-10"
                            as="p"
                            multiline
                          />
                        </div>

                        <div
                          className="w-16 h-1 mb-6 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                          }}
                        ></div>

                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                              boxShadow: `0 5px 20px ${primaryColor}40`,
                            }}
                          >
                            {initial}
                          </div>

                          <div>
                            <EditableText
                              field={`testimonials.${idx}.name`}
                              value={testimonial.name}
                              className="block text-lg font-bold text-gray-900"
                              as="span"
                            />
                            <EditableText
                              field={`testimonials.${idx}.role`}
                              value={testimonial.role}
                              className="text-sm font-medium"
                              as="span"
                              style={{ color: primaryColor }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {siteData.sections.includes('gallery') &&
          siteData.gallery.length > 0 && (
            <section
              id="galeria"
              className="py-24 bg-gray-50 relative overflow-hidden"
            >
              <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                  <EditableText
                    field="sectionLabels.gallery"
                    value={siteData.sectionLabels?.gallery || 'Galeria'}
                    className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                    as="span"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor,
                    }}
                  />
                  <EditableText
                    field="sectionTitles.gallery"
                    value={siteData.sectionTitles?.gallery || 'Nosso Trabalho'}
                    className="text-5xl md:text-6xl font-black text-gray-900"
                    as="h2"
                  />
                </div>

                <div
                  className={`grid gap-6 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}
                >
                  {siteData.gallery.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
                      onMouseEnter={() => setHoveredElement(`gallery-${idx}`)}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <img
                        src={img}
                        alt={`${siteData.name} - Galeria ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {hoveredElement === `gallery-${idx}` && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveImage(idx)}
                            className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-3xl aspect-[4/3] hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center justify-center"
                  >
                    <ImageIcon className="h-12 w-12 mb-4 text-purple-400" />
                    <span className="text-lg font-semibold text-gray-600">
                      Adicionar Imagem
                    </span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </section>
          )}

        {/* Contact */}
        {siteData.sections.includes('contact') && (
          <section
            id="contato"
            className="py-24 bg-gray-50 relative overflow-hidden"
          >
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <EditableText
                  field="sectionLabels.contact"
                  value={siteData.sectionLabels?.contact || 'Fale Conosco'}
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  as="span"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                />
                <EditableText
                  field="sectionTitles.contact"
                  value={siteData.sectionTitles?.contact || 'Venha nos Visitar'}
                  className="text-5xl md:text-6xl font-black text-gray-900 mb-4"
                  as="h2"
                />
              </div>

              <div
                className={`grid gap-16 items-center ${viewportMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'}`}
              >
                <div>
                  {siteData.address && (
                    <div className="flex gap-5 mb-8 p-6 bg-white rounded-2xl shadow-lg">
                      <div
                        className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor),
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">
                          Endereço
                        </strong>
                        <EditableText
                          field="address"
                          value={siteData.address}
                          className="text-gray-600 leading-relaxed"
                          as="p"
                        />
                      </div>
                    </div>
                  )}

                  {siteData.phone && (
                    <div className="flex gap-5 mb-8 p-6 bg-white rounded-2xl shadow-lg">
                      <div
                        className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor),
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" />
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">
                          Telefone
                        </strong>
                        <EditableText
                          field="phone"
                          value={siteData.phone}
                          className="text-gray-600 font-medium"
                          as="p"
                        />
                      </div>
                    </div>
                  )}

                  {siteData.email && (
                    <div className="flex gap-5 mb-10 p-6 bg-white rounded-2xl shadow-lg">
                      <div
                        className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor),
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 8L10.89 13.26C11.5389 13.7165 12.4611 13.7165 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" />
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">
                          E-mail
                        </strong>
                        <EditableText
                          field="email"
                          value={siteData.email}
                          className="text-gray-600 font-medium"
                          as="p"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(siteData.address || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Localização no Google Maps"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <p>© 2025 {siteData.name}. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {/* WhatsApp Float */}
        {siteData.phone && (
          <a
            href={`https://wa.me/${siteData.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition z-50 animate-pulse"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
