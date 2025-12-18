// Hook para gerenciar o site do usuário no MyEasyWebsite
// Integra com SiteManagementService (D1 Primary, Supabase Fallback)

import { useCallback, useEffect, useState } from 'react';
import { siteManagementService, type SiteData, type SiteSettings } from '../../../services/SiteManagementService';
import { authService } from '../../../services/AuthServiceV2';
import { getSiteLimitForPlan, type SubscriptionPlan } from '../../../constants/plans';
import { d1Client } from '../../../lib/api-clients/d1-client';

interface UseUserSiteReturn {
  // Estado
  userSite: SiteData | null;
  allUserSites: SiteData[];
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;

  // Limites
  canCreateSite: boolean;
  sitesCount: number;
  sitesLimit: number;
  userPlan: string;

  // Ações
  loadUserSite: () => Promise<void>;
  loadAllSites: () => Promise<SiteData[]>;
  selectSite: (site: SiteData) => void;
  createSite: (name: string, slug: string, settings?: SiteSettings) => Promise<SiteData | null>;
  updateSite: (settings: Partial<SiteSettings>) => Promise<boolean>;
  saveSiteHtml: (html: string) => Promise<boolean>;
  publishSite: () => Promise<boolean>;
  deleteSite: (siteId: number) => Promise<boolean>;
  checkSlugAvailable: (slug: string) => Promise<{ available: boolean; ownedByUser?: boolean }>;

  // Info
  hasExistingSite: boolean;
  isPublished: boolean;
  siteUrl: string | null;
}

export function useUserSite(): UseUserSiteReturn {
  const [userSite, setUserSite] = useState<SiteData | null>(null);
  const [allUserSites, setAllUserSites] = useState<SiteData[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sitesCount, setSitesCount] = useState(0);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('individual');

  const user = authService.getUser();
  const userUuid = user?.uuid || '';

  // Calcular limite baseado no plano do usuário
  const sitesLimit = getSiteLimitForPlan(userPlan);
  const canCreateSite = sitesLimit === -1 || sitesCount < sitesLimit;
  const hasExistingSite = userSite !== null;
  const isPublished = userSite?.status === 'active';
  const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
  const siteUrl = userSite?.slug ? `https://${userSite.slug}.${domain}` : null;

  /**
   * Normaliza o plano do banco para SubscriptionPlan
   * Planos: individual, plus, premium
   */
  const normalizeUserPlan = (plan: string | null | undefined): SubscriptionPlan => {
    if (!plan) return 'individual';
    const planMap: Record<string, SubscriptionPlan> = {
      'free': 'individual',
      'personal': 'individual',
      'individual': 'individual',
      'basic': 'plus',
      'plus': 'plus',
      'pro': 'premium',
      'premium': 'premium',
    };
    return planMap[plan.toLowerCase()] || 'individual';
  };

  /**
   * Carrega o plano do usuário do D1
   */
  const loadUserPlan = useCallback(async () => {
    if (!userUuid) return;

    try {
      const result = await d1Client.getUserByUuid(userUuid);
      if (!result.error && result.data) {
        const plan = normalizeUserPlan(result.data.subscription_plan);
        setUserPlan(plan);
        console.log('✅ [useUserSite] Plano do usuário:', plan);
      }
    } catch (err) {
      console.error('❌ [useUserSite] Erro ao carregar plano:', err);
    }
  }, [userUuid]);

  /**
   * Carrega todos os sites do usuário
   */
  const loadAllSites = useCallback(async (): Promise<SiteData[]> => {
    if (!userUuid) {
      return [];
    }

    try {
      const result = await siteManagementService.getUserSites(userUuid);

      if (result.success && result.data) {
        setAllUserSites(result.data);
        setSitesCount(result.data.length);
        console.log('✅ [useUserSite] Todos os sites carregados:', result.data.length);
        return result.data;
      }
      return [];
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao carregar sites:', err);
      return [];
    }
  }, [userUuid]);

  /**
   * Carrega o site do usuário (primeiro site ou site selecionado)
   */
  const loadUserSite = useCallback(async () => {
    if (!userUuid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Carregar plano do usuário primeiro
      await loadUserPlan();

      // Carregar todos os sites do usuário
      const allSites = await loadAllSites();

      // Carregar site atual do usuário (mais recente)
      const result = await siteManagementService.getCurrentUserSite(userUuid);

      if (result.success) {
        setUserSite(result.data || null);

        if (result.data?.settings) {
          const settings = siteManagementService.parseSiteSettings(result.data);
          setSiteSettings(settings);
        }
      }

      console.log('✅ [useUserSite] Site principal carregado:', result.data?.slug || 'nenhum');
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao carregar site:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userUuid, loadAllSites, loadUserPlan]);

  /**
   * Seleciona um site específico para editar
   */
  const selectSite = useCallback((site: SiteData) => {
    setUserSite(site);
    if (site.settings) {
      const settings = siteManagementService.parseSiteSettings(site);
      setSiteSettings(settings);
    } else {
      setSiteSettings(null);
    }
    console.log('✅ [useUserSite] Site selecionado:', site.slug);
  }, []);

  /**
   * Cria um novo site
   */
  const createSite = useCallback(async (
    name: string,
    slug: string,
    settings?: SiteSettings
  ): Promise<SiteData | null> => {
    if (!userUuid) {
      setError('Usuário não autenticado');
      return null;
    }

    if (!canCreateSite) {
      setError(`Limite de sites atingido (${sitesLimit} sites)`);
      return null;
    }

    setError(null);

    try {
      const result = await siteManagementService.createSite({
        user_uuid: userUuid,
        slug,
        name,
        status: 'building',
        settings: settings ? JSON.stringify(settings) : undefined,
      });

      if (result.success && result.data) {
        setUserSite(result.data);
        setSitesCount(prev => prev + 1);
        if (settings) {
          setSiteSettings(settings);
        }
        console.log('✅ [useUserSite] Site criado:', result.data.slug);
        return result.data;
      }

      setError(result.error || 'Erro ao criar site');
      return null;
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao criar site:', err);
      setError(err.message);
      return null;
    }
  }, [userUuid, canCreateSite, sitesLimit]);

  /**
   * Atualiza as configurações do site
   */
  const updateSite = useCallback(async (settings: Partial<SiteSettings>): Promise<boolean> => {
    if (!userSite) {
      setError('Nenhum site para atualizar');
      return false;
    }

    setError(null);

    try {
      const currentSettings = siteSettings || {};
      const newSettings = { ...currentSettings, ...settings };

      const result = await siteManagementService.saveSiteSettings(
        userSite.id!,
        userSite.slug,
        newSettings as SiteSettings
      );

      if (result.success) {
        setSiteSettings(newSettings as SiteSettings);
        if (result.data) {
          setUserSite(result.data);
        }
        console.log('✅ [useUserSite] Site atualizado');
        return true;
      }

      setError(result.error || 'Erro ao atualizar site');
      return false;
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao atualizar site:', err);
      setError(err.message);
      return false;
    }
  }, [userSite, siteSettings]);

  /**
   * Salva o HTML gerado do site
   */
  const saveSiteHtml = useCallback(async (html: string): Promise<boolean> => {
    if (!siteSettings) {
      return false;
    }

    return updateSite({ ...siteSettings, generatedHtml: html });
  }, [siteSettings, updateSite]);

  /**
   * Publica o site
   */
  const publishSite = useCallback(async (): Promise<boolean> => {
    if (!userSite) {
      setError('Nenhum site para publicar');
      return false;
    }

    setError(null);

    try {
      const result = await siteManagementService.publishSite(userSite.slug);

      if (result.success && result.data) {
        setUserSite(result.data);
        console.log('✅ [useUserSite] Site publicado:', result.data.slug);
        return true;
      }

      setError(result.error || 'Erro ao publicar site');
      return false;
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao publicar site:', err);
      setError(err.message);
      return false;
    }
  }, [userSite]);

  /**
   * Verifica se um slug está disponível
   */
  const checkSlugAvailable = useCallback(async (slug: string): Promise<{ available: boolean; ownedByUser?: boolean }> => {
    const result = await siteManagementService.checkSlugAvailability(slug, userUuid);
    return { available: result.available, ownedByUser: result.ownedByUser };
  }, [userUuid]);

  /**
   * Deleta um site
   */
  const deleteSite = useCallback(async (siteId: number): Promise<boolean> => {
    setError(null);

    // Encontrar o slug do site
    const siteToDelete = allUserSites.find(s => s.id === siteId);
    if (!siteToDelete) {
      setError('Site não encontrado');
      return false;
    }

    try {
      const result = await siteManagementService.deleteSite(siteId, siteToDelete.slug);

      if (result.success) {
        // Remover da lista local
        setAllUserSites(prev => prev.filter(s => s.id !== siteId));
        setSitesCount(prev => prev - 1);

        // Se era o site atual, limpar
        if (userSite?.id === siteId) {
          setUserSite(null);
          setSiteSettings(null);
        }

        console.log('✅ [useUserSite] Site deletado:', siteId);
        return true;
      }

      setError(result.error || 'Erro ao deletar site');
      return false;
    } catch (err: any) {
      console.error('❌ [useUserSite] Erro ao deletar site:', err);
      setError(err.message);
      return false;
    }
  }, [userSite, allUserSites]);

  // Carregar site ao montar
  useEffect(() => {
    loadUserSite();
  }, [loadUserSite]);

  return {
    // Estado
    userSite,
    allUserSites,
    siteSettings,
    isLoading,
    error,

    // Limites
    canCreateSite,
    sitesCount,
    sitesLimit,
    userPlan,

    // Ações
    loadUserSite,
    loadAllSites,
    selectSite,
    createSite,
    updateSite,
    saveSiteHtml,
    publishSite,
    deleteSite,
    checkSlugAvailable,

    // Info
    hasExistingSite,
    isPublished,
    siteUrl,
  };
}
