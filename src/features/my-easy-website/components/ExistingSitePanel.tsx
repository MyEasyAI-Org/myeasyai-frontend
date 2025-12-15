// Componente que mostra os sites existentes do usuário
// Permite gerenciar múltiplos sites ou criar novos

import { ExternalLink, Globe, Loader2, Plus, RefreshCw, Trash2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteData, SiteSettings } from '../../../services/SiteManagementService';

interface ExistingSitePanelProps {
  sites: SiteData[];
  currentSite: SiteData | null;
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  canCreateMore: boolean;
  sitesCount: number;
  sitesLimit: number;
  onContinueEditing: (site: SiteData) => void;
  onStartNew: () => void;
  onDeleteSite?: (siteId: number) => void;
  onUpgrade?: () => void;
}

export function ExistingSitePanel({
  sites,
  currentSite,
  siteSettings,
  isLoading,
  canCreateMore,
  sitesCount,
  sitesLimit,
  onContinueEditing,
  onStartNew,
  onDeleteSite,
  onUpgrade,
}: ExistingSitePanelProps) {
  const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
  const isUnlimited = sitesLimit === -1;

  const getStatusBadge = (status: SiteData['status']) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      building: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    const labels = {
      active: 'Online',
      building: 'Em construcao',
      inactive: 'Inativo',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status || 'building']}`}>
        {labels[status || 'building']}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Sites</h2>
          <p className="text-slate-400 mt-1">
            {isUnlimited ? (
              <span>{sitesCount} site{sitesCount !== 1 ? 's' : ''} criado{sitesCount !== 1 ? 's' : ''} (ilimitado)</span>
            ) : (
              <span>{sitesCount} de {sitesLimit} site{sitesLimit !== 1 ? 's' : ''} usado{sitesCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Progress bar */}
        {!isUnlimited && sitesLimit > 0 && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${sitesCount >= sitesLimit ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                style={{ width: `${Math.min((sitesCount / sitesLimit) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">{sitesCount}/{sitesLimit}</span>
          </div>
        )}
      </div>

      {/* Grid: Sites + Botao Adicionar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de sites */}
        <div className="flex-1 space-y-4">
          {sites.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center">
              <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum site criado ainda</h3>
              <p className="text-slate-400 text-sm">
                Crie seu primeiro site usando o MyEasyWebsite!
              </p>
            </div>
          ) : (
            sites.map((site) => {
              const siteUrl = `https://${site.slug}.${domain}`;
              const isPublished = site.status === 'active';
              const settings = site.settings ? (typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings) : null;

              return (
                <div
                  key={site.id}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                          {settings?.businessName || site.name || 'Meu Site'}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {site.slug}.{domain}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(site.status)}
                  </div>

                  {settings?.tagline && (
                    <p className="text-sm text-slate-400 mt-3 italic">"{settings.tagline}"</p>
                  )}

                  {settings?.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{settings.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">
                      Criado em {site.created_at ? new Date(site.created_at).toLocaleDateString('pt-BR') : '-'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isPublished && (
                        <a
                          href={siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Ver site online"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onContinueEditing(site)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 transition-colors flex items-center gap-1.5"
                        title="Editar site"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      {onDeleteSite && (
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir "${settings?.businessName || site.name}"?`)) {
                              onDeleteSite(site.id!);
                              toast.success('Site excluido com sucesso');
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir site"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botao Adicionar Site - Grande e Chamativo */}
        <div className="lg:w-72 flex-shrink-0">
          {canCreateMore ? (
            <button
              onClick={onStartNew}
              className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:from-orange-500/10 hover:to-amber-500/10 hover:border-orange-400 transition-all group flex flex-col items-center justify-center gap-4 p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                  Criar Novo Site
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isUnlimited ? 'Sites ilimitados' : `${sitesLimit - sitesCount} restante${sitesLimit - sitesCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            </button>
          ) : (
            <div className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-slate-600 bg-slate-800/30 flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center">
                <Lock className="h-8 w-8 text-slate-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-400">
                  Limite Atingido
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Seu plano permite {sitesLimit} site{sitesLimit !== 1 ? 's' : ''}
                </p>
              </div>
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-blue-700 transition-colors flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Fazer Upgrade
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
