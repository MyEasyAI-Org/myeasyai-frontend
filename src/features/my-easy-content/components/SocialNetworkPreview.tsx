import {
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Music,
  MoreHorizontal,
  Send,
  Bookmark,
  Share2,
  ThumbsUp,
  Twitter,
  Youtube,
  X,
  Play,
  Eye,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { GeneratedContent, SocialNetwork } from '../types';

interface SocialNetworkPreviewProps {
  content: GeneratedContent;
  isOpen: boolean;
  onClose: () => void;
}

type PreviewNetwork = SocialNetwork;

const NETWORK_TABS: { id: PreviewNetwork; name: string; icon: React.ElementType }[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter },
  { id: 'tiktok', name: 'TikTok', icon: Music },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
];

// Instagram Feed Preview
function InstagramPreview({ content }: { content: GeneratedContent }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden max-w-[350px] mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
          <span className="text-sm font-semibold text-gray-900">seu_perfil</span>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-900" />
      </div>

      {/* Image Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {content.imageDescription || 'Sua imagem aqui'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-gray-900 cursor-pointer hover:text-red-500" />
            <MessageCircle className="w-6 h-6 text-gray-900" />
            <Send className="w-6 h-6 text-gray-900" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-900" />
        </div>

        {/* Likes */}
        <p className="text-sm font-semibold text-gray-900 mb-1">1.234 curtidas</p>

        {/* Caption */}
        <div className="text-sm text-gray-900">
          <span className="font-semibold">seu_perfil </span>
          <span className="whitespace-pre-wrap">{content.content}</span>
        </div>

        {/* Hashtags */}
        {content.hashtags && content.hashtags.length > 0 && (
          <p className="text-sm text-blue-600 mt-1">
            {content.hashtags.join(' ')}
          </p>
        )}

        {/* Time */}
        <p className="text-xs text-gray-400 mt-2 uppercase">Ha 2 horas</p>
      </div>
    </div>
  );
}

// Facebook Post Preview
function FacebookPreview({ content }: { content: GeneratedContent }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden max-w-[400px] mx-auto shadow-xl">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Sua Pagina</p>
            <p className="text-xs text-gray-500">2 h · 🌐</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{content.content}</p>
        {content.hashtags && content.hashtags.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {content.hashtags.join(' ')}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <Facebook className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {content.imageDescription || 'Sua imagem aqui'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-3 h-3 text-white" />
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>
          <span>234</span>
        </div>
        <span>45 comentarios · 12 compartilhamentos</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around py-2 px-3">
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm font-medium">Curtir</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comentar</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Compartilhar</span>
        </button>
      </div>
    </div>
  );
}

// LinkedIn Post Preview
function LinkedInPreview({ content }: { content: GeneratedContent }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden max-w-[400px] mx-auto shadow-xl">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-700" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Seu Nome</p>
            <p className="text-xs text-gray-500">Titulo Profissional</p>
            <p className="text-xs text-gray-400">2h · 🌐</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
          {content.content}
        </p>
        {content.hashtags && content.hashtags.length > 0 && (
          <p className="text-sm text-blue-600 mt-3">
            {content.hashtags.join(' ')}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <Linkedin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {content.imageDescription || 'Sua imagem aqui'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </div>
          <span>1.234</span>
        </div>
        <span>89 comentarios · 23 republicacoes</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around py-2 px-3 border-t border-gray-100">
        <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm">Gostei</span>
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Comentar</span>
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">Republicar</span>
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <Send className="w-5 h-5" />
          <span className="text-sm">Enviar</span>
        </button>
      </div>
    </div>
  );
}

// Twitter/X Post Preview
function TwitterPreview({ content }: { content: GeneratedContent }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden max-w-[400px] mx-auto shadow-xl">
      {/* Header */}
      <div className="p-3 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900">Seu Perfil</span>
            <span className="text-sm text-gray-500">@seu_perfil · 2h</span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-900 whitespace-pre-wrap mt-1">
            {content.content}
          </p>

          {content.hashtags && content.hashtags.length > 0 && (
            <p className="text-sm text-blue-500 mt-1">
              {content.hashtags.join(' ')}
            </p>
          )}

          {/* Image */}
          <div className="mt-3 rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center p-4">
              <Twitter className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {content.imageDescription || 'Sua imagem aqui'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 text-gray-500">
            <button className="flex items-center gap-1 hover:text-blue-500">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">234</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500">
              <Share2 className="w-4 h-4" />
              <span className="text-xs">89</span>
            </button>
            <button className="flex items-center gap-1 hover:text-red-500">
              <Heart className="w-4 h-4" />
              <span className="text-xs">1.2K</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500">
              <Eye className="w-4 h-4" />
              <span className="text-xs">12K</span>
            </button>
            <button className="hover:text-blue-500">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TikTok Post Preview
function TikTokPreview({ content }: { content: GeneratedContent }) {
  return (
    <div className="bg-black rounded-xl overflow-hidden max-w-[280px] mx-auto shadow-xl relative" style={{ aspectRatio: '9/16' }}>
      {/* Video Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-4">
          <Play className="w-16 h-16 text-white/50 mx-auto mb-2" />
          <p className="text-xs text-white/50">Preview do video</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">12.3K</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">234</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">890</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white">456</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <span className="text-sm font-semibold text-white">@seu_perfil</span>
        </div>
        <p className="text-sm text-white line-clamp-3">{content.content}</p>
        {content.hashtags && content.hashtags.length > 0 && (
          <p className="text-sm text-white/80 mt-1">
            {content.hashtags.slice(0, 3).join(' ')}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Music className="w-4 h-4 text-white" />
          <span className="text-xs text-white">som original - seu_perfil</span>
        </div>
      </div>
    </div>
  );
}

// YouTube Post Preview (Community/Short)
function YouTubePreview({ content }: { content: GeneratedContent }) {
  const isShort = content.type === 'reel' || content.type === 'story';

  if (isShort) {
    return (
      <div className="bg-black rounded-xl overflow-hidden max-w-[280px] mx-auto shadow-xl relative" style={{ aspectRatio: '9/16' }}>
        {/* Video Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center p-4">
            <Play className="w-16 h-16 text-white/50 mx-auto mb-2" />
            <p className="text-xs text-white/50">Preview do Short</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">45K</span>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">1.2K</span>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-white">Share</span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-600" />
            <span className="text-sm font-semibold text-white">Seu Canal</span>
          </div>
          <p className="text-sm text-white font-medium">{content.title}</p>
          <p className="text-xs text-white/70 line-clamp-2 mt-1">{content.content}</p>
        </div>
      </div>
    );
  }

  // Community Post
  return (
    <div className="bg-white rounded-lg overflow-hidden max-w-[400px] mx-auto shadow-xl">
      {/* Header */}
      <div className="p-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-900">Seu Canal</span>
            <span className="text-xs text-gray-500">· 2 horas atras</span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-900 whitespace-pre-wrap mt-2 leading-relaxed">
            {content.content}
          </p>

          {content.hashtags && content.hashtags.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              {content.hashtags.join(' ')}
            </p>
          )}

          {/* Image */}
          <div className="mt-3 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center p-4">
              <Youtube className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {content.imageDescription || 'Sua imagem aqui'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3 text-gray-600">
            <button className="flex items-center gap-1 hover:text-gray-900">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-sm">1.2K</span>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-900">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">89</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SocialNetworkPreview({ content, isOpen, onClose }: SocialNetworkPreviewProps) {
  const [activeNetwork, setActiveNetwork] = useState<PreviewNetwork>(content.network);

  if (!isOpen) return null;

  const renderPreview = () => {
    switch (activeNetwork) {
      case 'instagram':
        return <InstagramPreview content={content} />;
      case 'facebook':
        return <FacebookPreview content={content} />;
      case 'linkedin':
        return <LinkedInPreview content={content} />;
      case 'twitter':
        return <TwitterPreview content={content} />;
      case 'tiktok':
        return <TikTokPreview content={content} />;
      case 'youtube':
        return <YouTubePreview content={content} />;
      default:
        return <InstagramPreview content={content} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Preview por Rede</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Network Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-700 overflow-x-auto">
          {NETWORK_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNetwork === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNetwork(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-slate-800/50">
          <div className="flex justify-center">
            {renderPreview()}
          </div>

          {/* Content Info */}
          <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Informacoes do Conteudo</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Tipo:</span>
                <span className="ml-2 text-white">{content.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500">Rede Original:</span>
                <span className="ml-2 text-white">{content.network}</span>
              </div>
              {content.bestTime && (
                <div>
                  <span className="text-slate-500">Melhor Horario:</span>
                  <span className="ml-2 text-orange-400">{content.bestTime}</span>
                </div>
              )}
              {content.hashtags && content.hashtags.length > 0 && (
                <div>
                  <span className="text-slate-500">Hashtags:</span>
                  <span className="ml-2 text-white">{content.hashtags.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
