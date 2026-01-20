import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Category } from '../store';
import { PHOTO_POSES, UI_MODES, useConfiguratorStore } from '../store';
import { AssetThumbnail } from './AssetThumbnail';

// Category translations
const categoryTranslations: Record<string, string> = {
  Head: 'Cabeca',
  Hair: 'Cabelo',
  EyeBrow: 'Sobrancelhas',
  Eyes: 'Olhos',
  Nose: 'Nariz',
  Face: 'Rosto',
  FacialHair: 'Barba',
  Glasses: 'Oculos',
  FaceMask: 'Mascara',
  Hat: 'Chapeu',
  Earring: 'Brincos',
  Bow: 'Laco',
  Top: 'Camiseta',
  Bottom: 'Calca',
  Outfit: 'Acessorio',
  Shoes: 'Sapatos',
};

// Pose translations
const poseTranslations: Record<string, string> = {
  Idle: 'Parado',
  Chill: 'Relaxado',
  Cool: 'Estiloso',
  Punch: 'Soco',
  Ninja: 'Ninja',
  King: 'Rei',
  Busy: 'Ocupado',
};

// Icons
const RandomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

// Action button component
type ActionButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const ActionButton = ({ onClick, children, variant = 'primary', size = 'md' }: ActionButtonProps) => {
  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  };

  return (
    <button
      className={`rounded-xl pointer-events-auto transition-all duration-200 flex items-center justify-center font-medium ${sizes[size]} ${variants[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Poses selection component
const PosesBox = () => {
  const curPose = useConfiguratorStore((state) => state.pose);
  const setPose = useConfiguratorStore((state) => state.setPose);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-white text-lg font-semibold">Escolha uma Pose</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(PHOTO_POSES).map((pose) => (
          <button
            key={pose}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left
              ${curPose === PHOTO_POSES[pose as keyof typeof PHOTO_POSES]
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            onClick={() => setPose(PHOTO_POSES[pose as keyof typeof PHOTO_POSES])}
          >
            {poseTranslations[pose] || pose}
          </button>
        ))}
      </div>
    </div>
  );
};

// Color picker icon
const ColorPickerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
  </svg>
);

// Color picker with expanded palette and custom color picker
const ColorPicker = () => {
  const updateColor = useConfiguratorStore((state) => state.updateColor);
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const customization = useConfiguratorStore((state) => state.customization);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');
  const containerRef = useRef<HTMLDivElement>(null);

  const categoryName = currentCategory?.name || '';
  const hasAsset = customization[categoryName]?.asset;

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCustomPicker(false);
      }
    };

    if (showCustomPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomPicker]);

  if (!hasAsset) {
    return null;
  }

  const colors = currentCategory?.expand?.colorPalette?.colors || [];
  if (colors.length === 0) return null;

  const currentColor = customization[categoryName]?.color || colors[0];

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    updateColor(color);
  };

  return (
    <div className="flex flex-col gap-2 flex-shrink-0" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h4 className="text-white/80 text-sm font-medium">Cor</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllColors(!showAllColors)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showAllColors ? 'Menos cores' : 'Mais cores'}
          </button>
        </div>
      </div>

      <div className={`flex flex-wrap gap-2 items-center ${showAllColors ? 'max-h-40 overflow-y-auto' : ''}`}>
        {/* Preset colors */}
        {colors.map((color, index) => (
          <button
            key={`${index}-${color}`}
            className={`w-8 h-8 rounded-lg transition-all duration-200
              ${currentColor === color
                ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110'
                : 'border border-white/20 hover:border-white/40 hover:scale-105'
              }`}
            style={{ backgroundColor: color }}
            onClick={() => updateColor(color)}
          />
        ))}

        {/* Custom color picker button */}
        <div className="relative">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center
              ${showCustomPicker
                ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-slate-900 bg-gradient-to-br from-red-500 via-green-500 to-blue-500'
                : 'border border-dashed border-white/30 hover:border-white/50 bg-gradient-to-br from-red-500/50 via-green-500/50 to-blue-500/50'
              }`}
            title="Escolher cor personalizada"
          >
            <ColorPickerIcon />
          </button>
        </div>
      </div>

      {/* Custom color picker popup */}
      {showCustomPicker && (
        <div className="mt-2 p-4 bg-slate-800 rounded-xl border border-white/20 shadow-xl shadow-black/50">
          <div className="flex gap-4">
            <HexColorPicker color={customColor} onChange={handleCustomColorChange} />
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-white/60 text-xs">Cor selecionada</span>
                <div
                  className="w-16 h-16 rounded-lg border border-white/20"
                  style={{ backgroundColor: customColor }}
                />
              </div>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="mt-auto py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category tabs with grid layout
type CategoryTabsProps = {
  categories: Category[];
  currentCategory: Category | null;
  setCurrentCategory: (category: Category) => void;
};

const CategoryTabs = ({ categories, currentCategory, setCurrentCategory }: CategoryTabsProps) => (
  <div className="flex flex-wrap gap-2">
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => setCurrentCategory(category)}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm
          ${currentCategory?.name === category.name
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
          }`}
      >
        {categoryTranslations[category.name] || category.name}
      </button>
    ))}
  </div>
);

// Assets grid
const AssetsGrid = () => {
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const changeAsset = useConfiguratorStore((state) => state.changeAsset);
  const customization = useConfiguratorStore((state) => state.customization);
  const lockedGroups = useConfiguratorStore((state) => state.lockedGroups);

  if (!currentCategory) return null;

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {lockedGroups[currentCategory.name] && (
        <p className="text-amber-400 text-sm px-3 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
          Oculto por: {lockedGroups[currentCategory.name]
            .map((asset) => asset.name)
            .join(', ')}
        </p>
      )}

      <div className="grid grid-cols-5 gap-2 overflow-y-auto flex-1">
        {currentCategory.removable && (
          <button
            onClick={() => changeAsset(currentCategory.name, null)}
            className={`aspect-square rounded-xl overflow-hidden transition-all duration-200 flex items-center justify-center
              ${!customization[currentCategory.name]?.asset
                ? 'bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-2 border-purple-500'
                : 'bg-white/5 border border-white/10 hover:border-white/30'
              }`}
          >
            <CloseIcon />
          </button>
        )}

        {currentCategory.assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => changeAsset(currentCategory.name, asset)}
            className={`aspect-square rounded-xl overflow-hidden transition-all duration-200
              ${customization[currentCategory.name]?.asset?.id === asset.id
                ? 'border-2 border-purple-500 ring-2 ring-purple-500/30'
                : 'border border-white/10 hover:border-white/30'
              }`}
          >
            <AssetThumbnail asset={asset} />
          </button>
        ))}
      </div>
    </div>
  );
};

// Customization panel
const CustomizationPanel = () => {
  const categories = useConfiguratorStore((state) => state.categories);
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const setCurrentCategory = useConfiguratorStore((state) => state.setCurrentCategory);

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {/* Category tabs */}
      <div className="flex-shrink-0">
        <CategoryTabs
          categories={categories}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
        />
      </div>

      {/* Color picker */}
      <ColorPicker />

      {/* Assets grid */}
      <AssetsGrid />
    </div>
  );
};

// Mode switch
type ModeSwitchProps = {
  mode: string;
  setMode: (mode: typeof UI_MODES.CUSTOMIZE | typeof UI_MODES.PHOTO) => void;
};

const ModeSwitch = ({ mode, setMode }: ModeSwitchProps) => (
  <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
    <button
      className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
        ${mode === UI_MODES.CUSTOMIZE
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-white/60 hover:text-white'
        }`}
      onClick={() => setMode(UI_MODES.CUSTOMIZE)}
    >
      Personalizar
    </button>
    <button
      className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
        ${mode === UI_MODES.PHOTO
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-white/60 hover:text-white'
        }`}
      onClick={() => setMode(UI_MODES.PHOTO)}
    >
      Poses
    </button>
  </div>
);

// Selfie icon
const SelfieIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

// Avatar name input component
const AvatarNameInput = () => {
  const avatarName = useConfiguratorStore((state) => state.avatarName);
  const setAvatarName = useConfiguratorStore((state) => state.setAvatarName);
  const avatarSelfie = useConfiguratorStore((state) => state.avatarSelfie);
  const takeSelfie = useConfiguratorStore((state) => state.takeSelfie);

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-center gap-3">
        {/* Avatar selfie preview or placeholder */}
        <div className="relative flex-shrink-0">
          {avatarSelfie ? (
            <img
              src={avatarSelfie}
              alt="Avatar selfie"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-2 border-white/20 flex items-center justify-center">
              <SelfieIcon />
            </div>
          )}
          <button
            type="button"
            onClick={takeSelfie}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 border-2 border-slate-900 flex items-center justify-center transition-colors"
            title="Tirar selfie do avatar"
          >
            <CameraIcon />
          </button>
        </div>

        {/* Name input */}
        <div className="flex-1">
          <label htmlFor="avatar-name" className="text-xs text-white/60 mb-1 block">
            Nome do seu avatar
          </label>
          <input
            id="avatar-name"
            type="text"
            value={avatarName}
            onChange={(e) => setAvatarName(e.target.value)}
            placeholder="Ex: Bia, Max, Luna..."
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
            maxLength={20}
          />
        </div>
      </div>
    </div>
  );
};

// Main UI component
type UIProps = {
  onBack?: () => void;
};

export const UI = ({ onBack }: UIProps) => {
  const mode = useConfiguratorStore((state) => state.mode);
  const setMode = useConfiguratorStore((state) => state.setMode);
  const loading = useConfiguratorStore((state) => state.loading);
  const saving = useConfiguratorStore((state) => state.saving);
  const randomize = useConfiguratorStore((state) => state.randomize);
  const screenshot = useConfiguratorStore((state) => state.screenshot);
  const download = useConfiguratorStore((state) => state.download);
  const saveAvatar = useConfiguratorStore((state) => state.saveAvatar);
  const loadSavedAvatar = useConfiguratorStore((state) => state.loadSavedAvatar);
  const isAuthenticated = useConfiguratorStore((state) => state.isAuthenticated);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);

  // Auto-load saved avatar when component mounts and user is authenticated
  useEffect(() => {
    const loadSaved = async () => {
      if (!loading && isAuthenticated() && !hasLoadedSaved) {
        setHasLoadedSaved(true);
        const result = await loadSavedAvatar();
        if (result.success) {
          console.log('[UI] Loaded saved avatar');
        }
      }
    };
    loadSaved();
  }, [loading, isAuthenticated, loadSavedAvatar, hasLoadedSaved]);

  const handleSave = async () => {
    const result = await saveAvatar();
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <main className="pointer-events-none fixed z-10 inset-0 select-none">
      {/* Loading screen */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 z-10 pointer-events-none flex flex-col items-center justify-center gap-6 transition-opacity duration-1000 ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <img src="/avatar/images/bone-logo-512.png" className="w-24 animate-bounce" alt="Carregando" />
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-2xl font-bold text-transparent animate-pulse">
          MyEasyAI Avatar
        </span>
        <p className="text-white/50 text-sm">Carregando...</p>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>

      {/* Main layout */}
      <div className="h-full w-full flex flex-col lg:flex-row">
        {/* Left side - Header floating over avatar */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <header className="flex items-center p-4 lg:p-6 gap-4 pointer-events-auto">
            {onBack && (
              <ActionButton onClick={onBack} variant="ghost" size="md">
                <BackIcon />
              </ActionButton>
            )}
            <div className="flex items-center gap-3">
              <img src="/avatar/images/bone-logo-512.png" className="w-10 h-10" alt="Logo" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent hidden sm:block">
                MyEasyAI Avatar
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <ActionButton onClick={randomize} variant="secondary" size="md">
                <RandomIcon />
                <span className="hidden sm:inline">Aleatorio</span>
              </ActionButton>

              <ActionButton onClick={screenshot} variant="secondary" size="md">
                <CameraIcon />
                <span className="hidden sm:inline">Foto</span>
              </ActionButton>

              <ActionButton onClick={download} variant="secondary" size="md">
                <DownloadIcon />
                <span className="hidden sm:inline">Baixar</span>
              </ActionButton>

              {isAuthenticated() && (
                <ActionButton onClick={handleSave} variant="primary" size="md">
                  {saving ? (
                    <SpinnerIcon />
                  ) : saveSuccess ? (
                    <CheckIcon />
                  ) : (
                    <SaveIcon />
                  )}
                  <span className="hidden sm:inline">
                    {saving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar'}
                  </span>
                </ActionButton>
              )}
            </div>
          </header>

          {/* Avatar space - visual only */}
          <div className="flex-1" />
        </div>

        {/* Right panel - Customization */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl lg:border-l border-white/10 p-5 lg:p-6 flex flex-col gap-4 lg:w-[400px] xl:w-[440px] max-h-[50vh] lg:max-h-full overflow-hidden">
          {/* Avatar name input */}
          <AvatarNameInput />

          {/* Mode switch */}
          <ModeSwitch mode={mode} setMode={setMode} />

          {/* Content based on mode */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {mode === UI_MODES.CUSTOMIZE && <CustomizationPanel />}
            {mode === UI_MODES.PHOTO && <PosesBox />}
          </div>
        </div>
      </div>
    </main>
  );
};
