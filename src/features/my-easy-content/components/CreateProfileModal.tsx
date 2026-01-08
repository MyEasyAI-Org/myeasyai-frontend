import {
  X,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  FileText,
  MessageSquare,
  Smartphone,
  Video,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type {
  BusinessNiche,
  ContentBusinessProfile,
  ContentTone,
  ContentType,
  CreateContentProfileInput,
  SocialNetwork,
} from '../types';

interface CreateProfileModalProps {
  isOpen: boolean;
  editProfile?: ContentBusinessProfile | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (profile: CreateContentProfileInput) => Promise<void>;
}

const PROFILE_ICONS = ['🏪', '🍽️', '🛍️', '💼', '🏥', '💄', '📚', '💻', '💪', '🏠', '🔧', '🎯', '🎨', '🎵', '📱', '✨'];

// Niche options with emojis
const NICHE_OPTIONS = [
  { id: 'restaurant', name: 'Restaurante', emoji: '🍽️' },
  { id: 'retail', name: 'Varejo/Loja', emoji: '🛍️' },
  { id: 'consulting', name: 'Consultoria', emoji: '💼' },
  { id: 'health', name: 'Saude', emoji: '🏥' },
  { id: 'beauty', name: 'Beleza', emoji: '💄' },
  { id: 'education', name: 'Educacao', emoji: '📚' },
  { id: 'technology', name: 'Tecnologia', emoji: '💻' },
  { id: 'fitness', name: 'Fitness', emoji: '💪' },
  { id: 'real_estate', name: 'Imobiliario', emoji: '🏠' },
  { id: 'services', name: 'Servicos', emoji: '🔧' },
  { id: 'other', name: 'Outro', emoji: '📌' },
];

// Tone options
const TONE_OPTIONS = [
  { id: 'professional', name: 'Profissional' },
  { id: 'casual', name: 'Casual' },
  { id: 'funny', name: 'Divertido' },
  { id: 'inspirational', name: 'Inspiracional' },
  { id: 'educational', name: 'Educativo' },
  { id: 'promotional', name: 'Promocional' },
];

// Network icon component
const NetworkIcon = ({ network, className }: { network: string; className?: string }) => {
  const props = { className: className || 'w-4 h-4' };
  switch (network) {
    case 'instagram':
      return <Instagram {...props} />;
    case 'facebook':
      return <Facebook {...props} />;
    case 'linkedin':
      return <Linkedin {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
    case 'tiktok':
      return <Music {...props} />;
    case 'youtube':
      return <Youtube {...props} />;
    default:
      return null;
  }
};

// Network options
const NETWORK_OPTIONS = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'Twitter/X' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
];

// Content type icon component
const ContentTypeIcon = ({ type, className }: { type: string; className?: string }) => {
  const props = { className: className || 'w-4 h-4' };
  switch (type) {
    case 'feed_post':
      return <FileText {...props} />;
    case 'caption':
      return <MessageSquare {...props} />;
    case 'story':
      return <Smartphone {...props} />;
    case 'reel':
      return <Video {...props} />;
    default:
      return null;
  }
};

// Content type options
const CONTENT_TYPE_OPTIONS = [
  { id: 'feed_post', name: 'Post Feed' },
  { id: 'caption', name: 'Legenda' },
  { id: 'story', name: 'Story' },
  { id: 'reel', name: 'Reel/TikTok' },
];

export function CreateProfileModal({
  isOpen,
  editProfile,
  isSaving,
  onClose,
  onSave,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<CreateContentProfileInput>({
    name: '',
    business_niche: 'other',
    target_audience: '',
    brand_voice: 'professional',
    selected_networks: [],
    preferred_content_types: [],
    icon: '🏪',
    is_default: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editProfile) {
      setFormData({
        name: editProfile.name,
        business_niche: editProfile.business_niche,
        target_audience: editProfile.target_audience || '',
        brand_voice: editProfile.brand_voice,
        selected_networks: editProfile.selected_networks || [],
        preferred_content_types: editProfile.preferred_content_types || [],
        icon: editProfile.icon || '🏪',
        is_default: editProfile.is_default,
      });
    } else {
      setFormData({
        name: '',
        business_niche: 'other',
        target_audience: '',
        brand_voice: 'professional',
        selected_networks: [],
        preferred_content_types: [],
        icon: '🏪',
        is_default: false,
      });
    }
    setErrors({});
  }, [editProfile, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do perfil e obrigatorio';
    }

    if (formData.business_niche === 'other' && !formData.target_audience) {
      // Allow without target audience but it's recommended
    }

    if (formData.selected_networks && formData.selected_networks.length === 0) {
      newErrors.networks = 'Selecione pelo menos uma rede social';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSave(formData);
  };

  const toggleNetwork = (network: SocialNetwork) => {
    setFormData((prev) => ({
      ...prev,
      selected_networks: prev.selected_networks?.includes(network)
        ? prev.selected_networks.filter((n) => n !== network)
        : [...(prev.selected_networks || []), network],
    }));
  };

  const toggleContentType = (contentType: ContentType) => {
    setFormData((prev) => ({
      ...prev,
      preferred_content_types: prev.preferred_content_types?.includes(contentType)
        ? prev.preferred_content_types.filter((ct) => ct !== contentType)
        : [...(prev.preferred_content_types || []), contentType],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white">
            {editProfile ? 'Editar Perfil' : 'Criar Novo Perfil'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Icon & Name */}
          <div className="flex items-start space-x-4">
            {/* Icon selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Icone</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-14 h-14 text-2xl bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors flex items-center justify-center"
                  onClick={() => {
                    // Simple icon rotation
                    const currentIndex = PROFILE_ICONS.indexOf(formData.icon || '🏪');
                    const nextIndex = (currentIndex + 1) % PROFILE_ICONS.length;
                    setFormData((prev) => ({ ...prev, icon: PROFILE_ICONS[nextIndex] }));
                  }}
                >
                  {formData.icon}
                </button>
                <span className="text-xs text-slate-500 mt-1 block text-center">Clique</span>
              </div>
            </div>

            {/* Name input */}
            <div className="flex-1">
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-2">
                Nome do Perfil *
              </label>
              <input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Restaurante do Joao"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Business Niche */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Segmento do Negocio
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, business_niche: niche.id as BusinessNiche }))
                  }
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.business_niche === niche.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="mr-1">{niche.emoji}</span>
                  {niche.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-2">
              Publico-Alvo
            </label>
            <textarea
              id="target-audience"
              value={formData.target_audience}
              onChange={(e) => setFormData((prev) => ({ ...prev, target_audience: e.target.value }))}
              placeholder="Ex: Jovens 18-35 anos, amantes de hamburguer artesanal"
              rows={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tom de Voz</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, brand_voice: tone.id as ContentTone }))
                  }
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    formData.brand_voice === tone.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {tone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Social Networks */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Redes Sociais *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NETWORK_OPTIONS.map((network) => (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => toggleNetwork(network.id as SocialNetwork)}
                  className={`flex items-center justify-center space-x-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                    formData.selected_networks?.includes(network.id as SocialNetwork)
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <NetworkIcon network={network.id} className="w-4 h-4" />
                  <span>{network.name}</span>
                </button>
              ))}
            </div>
            {errors.networks && <p className="text-red-400 text-sm mt-1">{errors.networks}</p>}
          </div>

          {/* Content Types */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipos de Conteudo Preferidos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONTENT_TYPE_OPTIONS.map((contentType) => (
                <button
                  key={contentType.id}
                  type="button"
                  onClick={() => toggleContentType(contentType.id as ContentType)}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.preferred_content_types?.includes(contentType.id as ContentType)
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <ContentTypeIcon type={contentType.id} className="w-4 h-4" />
                  <span>{contentType.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default profile toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, is_default: !prev.is_default }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                formData.is_default ? 'bg-orange-500' : 'bg-slate-600'
              }`}
              role="switch"
              aria-checked={formData.is_default}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.is_default ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-slate-300">Definir como perfil padrao</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{editProfile ? 'Salvar Alteracoes' : 'Criar Perfil'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
