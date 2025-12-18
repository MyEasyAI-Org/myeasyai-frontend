import {
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Rocket,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type CloudflareDeployResult,
  cloudflareDeploymentService,
} from '../services/CloudflareDeploymentService';
import { siteManagementService, type SiteSettings } from '../services/SiteManagementService';
import { authService } from '../services/AuthServiceV2';

interface CloudflareDeployProps {
  htmlContent: string;
  siteName: string;
  siteSettings?: SiteSettings;
  onDeploySuccess?: (result: CloudflareDeployResult) => void;
  onClose?: () => void;
  className?: string;
  /** Se passado, indica que estamos editando um site existente */
  editingSiteId?: number | null;
  /** Slug do site existente (opcional) */
  editingSiteSlug?: string | null;
  /** Status do site - só trava slug se for 'active' (já publicado) */
  siteStatus?: 'building' | 'active' | 'inactive' | null;
}

export function CloudflareDeploy({
  htmlContent,
  siteName,
  siteSettings,
  onDeploySuccess,
  onClose,
  className = '',
  editingSiteId,
  editingSiteSlug,
  siteStatus,
}: CloudflareDeployProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployMessage, setDeployMessage] = useState('');
  const [deployResult, setDeployResult] = useState<CloudflareDeployResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customSiteName, setCustomSiteName] = useState(siteName);
  const [copied, setCopied] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [existingSiteId, setExistingSiteId] = useState<number | null>(null);
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | 'owned' | null>(null);

  const user = authService.getUser();
  const userUuid = user?.uuid || '';
  const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';

  // Configurar com base nas props (editando site existente vs novo site)
  useEffect(() => {
    // Só trava o slug se o site JÁ FOI PUBLICADO (status 'active')
    // Sites com status 'building' ainda podem ter o slug alterado na primeira publicação
    const isAlreadyPublished = siteStatus === 'active';

    if (editingSiteId && editingSiteSlug && isAlreadyPublished) {
      // Site já foi publicado - slug travado
      setCustomSiteName(editingSiteSlug);
      setSlugLocked(true);
      setExistingSiteId(editingSiteId);
      console.log('🔒 [CloudflareDeploy] Site já publicado - slug travado:', editingSiteSlug);
      setIsLoading(false);
      return;
    }

    // Site novo OU site em building (primeira publicação) - permite escolher slug
    const normalizedSlug = cloudflareDeploymentService.normalizeSlug(editingSiteSlug || siteName);
    setCustomSiteName(normalizedSlug);
    setSlugLocked(false);
    setExistingSiteId(editingSiteId || null);
    console.log('🆕 [CloudflareDeploy] Primeira publicação - slug livre');
    setIsLoading(false);
  }, [editingSiteId, editingSiteSlug, siteName, siteStatus]);

  // Verificar disponibilidade do slug quando mudar
  useEffect(() => {
    if (slugLocked || !customSiteName.trim()) {
      setSlugStatus(null);
      return;
    }

    const checkSlug = async () => {
      setSlugStatus('checking');
      const result = await siteManagementService.checkSlugAvailability(customSiteName, userUuid);

      if (result.ownedByUser) {
        setSlugStatus('owned');
      } else if (result.available) {
        setSlugStatus('available');
      } else {
        setSlugStatus('taken');
      }
    };

    const debounce = setTimeout(checkSlug, 500);
    return () => clearTimeout(debounce);
  }, [customSiteName, slugLocked, userUuid]);

  const handleCopyUrl = () => {
    if (deployResult) {
      navigator.clipboard.writeText(deployResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeploy = async () => {
    if (!htmlContent || !customSiteName.trim()) {
      setError('Por favor, escolha um nome para seu site');
      return;
    }

    if (slugStatus === 'taken') {
      setError('Este nome já está em uso. Escolha outro.');
      return;
    }

    try {
      setIsDeploying(true);
      setError(null);
      setDeployProgress(0);
      setDeployMessage('Preparando seu site...');

      // 1. Criar ou atualizar registro do site no banco
      setDeployProgress(10);
      setDeployMessage('Salvando configurações...');

      if (existingSiteId) {
        // Atualizar site existente
        // Se o slug mudou (primeira publicação), atualizar também o slug
        const slugToUseInWhere = editingSiteSlug || customSiteName;
        await siteManagementService.updateSite(existingSiteId, slugToUseInWhere, {
          slug: customSiteName, // Atualizar para o novo slug escolhido
          name: siteSettings?.businessName || siteName,
          settings: JSON.stringify({
            ...siteSettings,
            generatedHtml: htmlContent,
          }),
        });
        console.log('✅ [CloudflareDeploy] Site atualizado no banco com slug:', customSiteName);
      } else if (userUuid) {
        // Criar novo site
        const createResult = await siteManagementService.createSite({
          user_uuid: userUuid,
          slug: customSiteName,
          name: siteSettings?.businessName || siteName,
          business_type: siteSettings?.description ? 'business' : undefined,
          status: 'building',
          settings: JSON.stringify({
            ...siteSettings,
            generatedHtml: htmlContent,
          }),
        });

        if (!createResult.success) {
          throw new Error(createResult.error || 'Erro ao salvar site');
        }

        setExistingSiteId(createResult.data!.id!);
        setSlugLocked(true); // Travar slug após criar
        console.log('✅ [CloudflareDeploy] Site criado no banco:', createResult.data!.slug);
      }

      setDeployProgress(30);
      setDeployMessage('Enviando para a nuvem...');

      // 2. Fazer deploy no Cloudflare R2
      const result = await cloudflareDeploymentService.deploySinglePage(
        customSiteName.trim(),
        htmlContent,
        ({ progress, message }) => {
          // Mapear progresso de 30% a 90%
          const mappedProgress = 30 + (progress * 0.6);
          setDeployProgress(mappedProgress);
          const friendlyMessages: Record<string, string> = {
            'Iniciando deploy...': 'Enviando arquivos...',
            'Validando slug...': 'Verificando nome...',
            'Fazendo upload dos arquivos...': 'Enviando seu site...',
            'Verificando publicacao...': 'Quase pronto...',
            'Site publicado com sucesso!': 'Finalizando...',
          };
          setDeployMessage(friendlyMessages[message] || message);
        },
      );

      if (result.success) {
        // 3. Marcar site como publicado no banco
        setDeployProgress(95);
        setDeployMessage('Ativando site...');

        await siteManagementService.publishSite(customSiteName);

        setDeployProgress(100);
        setDeployMessage('Pronto!');
        setDeployResult(result);
        onDeploySuccess?.(result);
        console.log('✅ [CloudflareDeploy] Site publicado:', result.url);
      } else {
        setError('Ops! Algo deu errado. Tente novamente.');
      }
    } catch (err: unknown) {
      console.error('Erro no deploy:', err);
      setError(err instanceof Error ? err.message : 'Ops! Nao foi possivel publicar seu site. Tente novamente.');
    } finally {
      setIsDeploying(false);
    }
  };

  const formatSiteName = (name: string) => {
    return cloudflareDeploymentService.normalizeSlug(name);
  };

  const handleSiteNameChange = (value: string) => {
    if (slugLocked) return; // Não permitir mudança se travado
    setCustomSiteName(formatSiteName(value));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (deployResult) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-2">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Seu site esta no ar!</h3>
          <p className="text-slate-400">Parabens! Seu site ja pode ser acessado por qualquer pessoa.</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-400 text-center">Endereco do seu site:</p>
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-4 py-3">
            <Globe className="h-5 w-5 text-orange-400 flex-shrink-0" />
            <span className="text-orange-300 font-medium flex-1 truncate">{deployResult.url}</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={deployResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4 text-white font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/25"
          >
            <ExternalLink className="h-5 w-5" />
            <span>Visitar Meu Site</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
          <p className="text-sm text-blue-300 text-center">
            <strong>Dica:</strong> Compartilhe este link com seus amigos e clientes!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/20 mb-2">
          <Rocket className="h-7 w-7 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-white">
          {slugLocked ? 'Atualizar seu Site' : 'Publicar seu Site'}
        </h3>
        <p className="text-slate-400 text-sm">
          {slugLocked
            ? 'Seu site será atualizado no mesmo endereço'
            : 'Escolha um nome e seu site estara online em segundos!'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {slugLocked ? 'Endereço do seu site (fixo)' : 'Nome do seu site'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={customSiteName}
              onChange={(e) => handleSiteNameChange(e.target.value)}
              placeholder="minha-empresa"
              disabled={isDeploying || slugLocked}
              className={`w-full rounded-xl border ${
                slugLocked
                  ? 'border-slate-700 bg-slate-800 text-slate-400'
                  : 'border-slate-600 bg-slate-900 text-white'
              } px-4 py-3 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 transition-all ${
                slugLocked ? 'pr-10' : ''
              }`}
            />
            {slugLocked && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </div>

          {/* Status do slug */}
          {!slugLocked && slugStatus && (
            <div className="mt-2 text-sm">
              {slugStatus === 'checking' && (
                <span className="text-slate-400">Verificando disponibilidade...</span>
              )}
              {slugStatus === 'available' && (
                <span className="text-green-400">✓ Nome disponível</span>
              )}
              {slugStatus === 'taken' && (
                <span className="text-red-400">✗ Nome já está em uso</span>
              )}
              {slugStatus === 'owned' && (
                <span className="text-blue-400">✓ Este nome é seu</span>
              )}
            </div>
          )}

          {slugLocked && (
            <p className="mt-2 text-xs text-slate-500">
              O endereço do seu site é permanente e não pode ser alterado.
            </p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">
            {slugLocked ? 'Seu site está em:' : 'Seu site ficara disponivel em:'}
          </p>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-orange-400" />
            <span className="text-orange-300 font-medium">{customSiteName || 'seu-site'}.{domain}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-700/50 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isDeploying && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 text-orange-400 animate-spin" />
              <span className="text-slate-300">{deployMessage}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${deployProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleDeploy}
          disabled={isDeploying || !customSiteName.trim() || !htmlContent || slugStatus === 'taken'}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4 text-white font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isDeploying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{slugLocked ? 'Atualizando...' : 'Publicando...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>{slugLocked ? 'Atualizar Site' : 'Publicar Site'}</span>
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">Gratis - Seguro (HTTPS) - Super rapido</p>
        </div>
      </div>
    </div>
  );
}
