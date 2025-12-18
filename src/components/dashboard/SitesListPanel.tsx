import { useState, useEffect } from 'react';
import { ExternalLink, Globe, Plus, Lock, Trash2, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSiteLimitForPlan, type SubscriptionPlan } from '../../constants/plans';

export type SiteItem = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  status: 'active' | 'building' | 'inactive';
  created_at: string;
  updated_at?: string;
};

type SitesListPanelProps = {
  sites: SiteItem[];
  currentPlan: SubscriptionPlan;
  isLoading: boolean;
  onCreateSite: () => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite?: (siteId: number) => void;
  onViewSite: (site: SiteItem) => void;
  onUpgrade?: () => void;
};

export function SitesListPanel({
  sites,
  currentPlan,
  isLoading,
  onCreateSite,
  onEditSite,
  onDeleteSite,
  onViewSite,
  onUpgrade,
}: SitesListPanelProps) {
  const siteLimit = getSiteLimitForPlan(currentPlan);
  const sitesUsed = sites.length;
  const canCreateMore = siteLimit === -1 || sitesUsed < siteLimit;
  const isUnlimited = siteLimit === -1;

  const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';

  const getStatusBadge = (status: SiteItem['status']) => {
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Meus Sites</h2>
            <p className="text-slate-400 mt-1">Carregando...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-800/30 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
              <div className="h-4 bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Sites</h2>
          <p className="text-slate-400 mt-1">
            {isUnlimited ? (
              <span>{sitesUsed} site{sitesUsed !== 1 ? 's' : ''} criado{sitesUsed !== 1 ? 's' : ''} (ilimitado)</span>
            ) : (
              <span>{sitesUsed} de {siteLimit} site{siteLimit !== 1 ? 's' : ''} usado{sitesUsed !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Progress bar */}
        {!isUnlimited && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${sitesUsed >= siteLimit ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                style={{ width: `${Math.min((sitesUsed / siteLimit) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">{sitesUsed}/{siteLimit}</span>
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
            sites.map((site) => (
              <div
                key={site.id}
                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {site.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {site.slug}.{domain}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(site.status)}
                </div>

                {site.description && (
                  <p className="text-sm text-slate-400 mt-3 line-clamp-2">{site.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">
                    Criado em {new Date(site.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    {site.status === 'active' && (
                      <button
                        onClick={() => onViewSite(site)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Ver site online"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditSite(site)}
                      className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      title="Editar site"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    {onDeleteSite && (
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir "${site.name}"?`)) {
                            onDeleteSite(site.id);
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
            ))
          )}
        </div>

        {/* Botao Adicionar Site - Grande e Chamativo */}
        <div className="lg:w-72 flex-shrink-0">
          {canCreateMore ? (
            <button
              onClick={onCreateSite}
              className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-blue-500/5 hover:from-purple-500/10 hover:to-blue-500/10 hover:border-purple-400 transition-all group flex flex-col items-center justify-center gap-4 p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Criar Novo Site
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isUnlimited ? 'Sites ilimitados' : `${siteLimit - sitesUsed} restante${siteLimit - sitesUsed !== 1 ? 's' : ''}`}
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
                  Seu plano permite {siteLimit} site{siteLimit !== 1 ? 's' : ''}
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
