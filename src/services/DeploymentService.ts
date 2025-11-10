// Serviço de deploy e gerenciamento de sites
// Contém lógica de negócio para orquestração de deploys no Netlify

import { netlifyClient, type NetlifySite } from '../lib/api-clients/netlify-client';
import { calculateSHA1 } from '../lib/utils/formatters';

export interface NetlifyUsage {
  bandwidth: {
    used: number;
    limit: number;
    percentage: number;
  };
  buildMinutes: {
    used: number;
    limit: number;
    percentage: number;
  };
  sites: {
    count: number;
    limit: number;
  };
}

export interface DeployResult {
  id: string;
  site_id: string;
  url: string;
  deploy_url: string;
  admin_url: string;
  state: string;
  created_at: string;
}

/**
 * Serviço responsável pela orquestração de deploys
 * Gerencia todo o ciclo de vida de sites: criação, verificação, upload e deploy
 */
export class DeploymentService {
  /**
   * Obtém informações de uso da conta Netlify
   */
  async getNetlifyUsage(): Promise<NetlifyUsage> {
    try {
      const [accountInfo, sites] = await Promise.all([
        netlifyClient.getAccounts(),
        netlifyClient.getSites(),
      ]);

      const account = accountInfo[0];

      const FREE_PLAN_LIMITS = {
        bandwidth: 100 * 1024 * 1024 * 1024, // 100GB
        buildMinutes: 300,
        sites: 500,
      };

      const bandwidthUsed = sites.reduce((total: number, site: any) => {
        return total + (site.bandwidth_used || 0);
      }, 0);

      const buildMinutesUsed = account.build_minutes_used || 0;

      return {
        bandwidth: {
          used: bandwidthUsed,
          limit: FREE_PLAN_LIMITS.bandwidth,
          percentage: (bandwidthUsed / FREE_PLAN_LIMITS.bandwidth) * 100,
        },
        buildMinutes: {
          used: buildMinutesUsed,
          limit: FREE_PLAN_LIMITS.buildMinutes,
          percentage: (buildMinutesUsed / FREE_PLAN_LIMITS.buildMinutes) * 100,
        },
        sites: {
          count: sites.length,
          limit: FREE_PLAN_LIMITS.sites,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao obter uso do Netlify:', error);
      return {
        bandwidth: { used: 0, limit: 100 * 1024 * 1024 * 1024, percentage: 0 },
        buildMinutes: { used: 0, limit: 300, percentage: 0 },
        sites: { count: 0, limit: 500 },
      };
    }
  }

  /**
   * Lista todos os sites do usuário
   */
  async listSites(): Promise<NetlifySite[]> {
    try {
      return await netlifyClient.getSites();
    } catch (error) {
      console.error('❌ Erro ao listar sites:', error);
      return [];
    }
  }

  /**
   * Verifica se um site com nome específico já existe
   */
  private async findExistingSite(siteName: string): Promise<NetlifySite | null> {
    try {
      const sites = await this.listSites();
      const cleanName = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      return sites.find((site) => site.name === cleanName) || null;
    } catch (error) {
      console.error('❌ Erro ao verificar sites existentes:', error);
      return null;
    }
  }

  /**
   * Cria um novo site OU retorna site existente
   * Implementa lógica de negócio para reutilização de sites
   */
  async createOrGetSite(
    siteName: string,
  ): Promise<{ site: NetlifySite; isExisting: boolean }> {
    const cleanName = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Verificar se site já existe
    const existingSite = await this.findExistingSite(cleanName);

    if (existingSite) {
      console.log(
        '🔄 [DEPLOYMENT SERVICE] Site já existe, reutilizando:',
        existingSite.name,
      );
      return { site: existingSite, isExisting: true };
    }

    // Criar novo site
    try {
      const site = await netlifyClient.createSite(cleanName);
      console.log('✅ [DEPLOYMENT SERVICE] Novo site criado:', site.name);
      return { site, isExisting: false };
    } catch (error: any) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes('exceeded usage limit') ||
        errorMessage.includes('cannot create more sites')
      ) {
        throw new Error(
          `❌ Limite de sites atingido! Você excedeu o limite de sites gratuitos do Netlify.`,
        );
      }

      if (
        errorMessage.includes('422') &&
        (errorMessage.includes('unique') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('taken'))
      ) {
        throw new Error(
          `❌ O nome "${cleanName}" já está em uso por outro usuário. Escolha um nome diferente.`,
        );
      }

      throw error;
    }
  }

  /**
   * Realiza o deploy de arquivos para um site
   * Orquestra todo o processo: digest, upload, aguardar processamento
   */
  async deployFiles(
    siteId: string,
    files: { [path: string]: string },
    onProgress?: (progress: number) => void,
  ): Promise<DeployResult> {
    try {
      console.log('🚀 [DEPLOYMENT SERVICE] Iniciando deploy para site:', siteId);
      console.log('📊 [DEPLOYMENT SERVICE] Arquivos:', Object.keys(files));

      onProgress?.(10);

      // Passo 1: Calcular SHA1 dos arquivos
      console.log('📦 [DEPLOYMENT SERVICE] Calculando SHA1 dos arquivos...');
      const fileDigest: { [path: string]: string } = {};
      const shaToPath: { [sha: string]: string } = {};
      const shaToContent: { [sha: string]: string } = {};

      for (const [path, content] of Object.entries(files)) {
        const sha1 = await calculateSHA1(content);
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        fileDigest[normalizedPath] = sha1;
        shaToPath[sha1] = normalizedPath;
        shaToContent[sha1] = content;
      }

      console.log(
        '✅ [DEPLOYMENT SERVICE] Digest calculado:',
        Object.keys(fileDigest).length,
        'arquivos',
      );
      onProgress?.(20);

      // Passo 2: Criar deploy
      console.log('🌐 [DEPLOYMENT SERVICE] Criando deploy...');
      const deploy = await netlifyClient.createDeploy(siteId, fileDigest);

      console.log('✅ [DEPLOYMENT SERVICE] Deploy criado:', deploy.id);
      console.log('📊 [DEPLOYMENT SERVICE] Estado:', deploy.state);
      console.log(
        '📋 [DEPLOYMENT SERVICE] Arquivos requeridos:',
        deploy.required?.length || 0,
      );

      onProgress?.(40);

      // Passo 3: Upload dos arquivos requeridos
      if (deploy.required && deploy.required.length > 0) {
        console.log(
          '📤 [DEPLOYMENT SERVICE] Fazendo upload de',
          deploy.required.length,
          'arquivos...',
        );

        for (let i = 0; i < deploy.required.length; i++) {
          const sha = deploy.required[i];
          const filePath = shaToPath[sha];
          const fileContent = shaToContent[sha];

          console.log(
            `📤 [DEPLOYMENT SERVICE] Uploading ${i + 1}/${deploy.required.length}: ${filePath}`,
          );

          await netlifyClient.uploadFile(deploy.id, filePath, fileContent);

          const uploadProgress = 40 + ((i + 1) / deploy.required.length) * 40;
          onProgress?.(uploadProgress);
        }

        console.log('✅ [DEPLOYMENT SERVICE] Todos os arquivos enviados!');
      } else {
        console.log('✅ [DEPLOYMENT SERVICE] Nenhum arquivo novo (cache)');
      }

      onProgress?.(80);

      // Passo 4: Aguardar processamento
      console.log('⏳ [DEPLOYMENT SERVICE] Aguardando processamento...');
      let deployStatus = deploy;
      let attempts = 0;
      const maxAttempts = 30;

      while (
        deployStatus.state !== 'ready' &&
        deployStatus.state !== 'error' &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        deployStatus = await netlifyClient.getDeploy(deploy.id);
        console.log('🔍 [DEPLOYMENT SERVICE] Status:', deployStatus.state);
        attempts++;

        const statusProgress = 80 + (attempts / maxAttempts) * 15;
        onProgress?.(Math.min(statusProgress, 95));
      }

      if (deployStatus.state === 'error') {
        throw new Error('Deploy failed during processing');
      }

      // Passo 5: Obter URL final
      const siteInfo = await netlifyClient.getSite(siteId);
      const siteUrl =
        siteInfo.ssl_url || siteInfo.url || `https://${siteInfo.name}.netlify.app`;

      console.log('🎉 [DEPLOYMENT SERVICE] Deploy concluído!');
      console.log('🌐 [DEPLOYMENT SERVICE] URL:', siteUrl);

      onProgress?.(100);

      return {
        id: deployStatus.id,
        site_id: siteId,
        url: siteUrl,
        deploy_url: deployStatus.deploy_ssl_url || deployStatus.deploy_url || siteUrl,
        admin_url: deployStatus.admin_url || siteInfo.admin_url,
        state: deployStatus.state,
        created_at: deployStatus.created_at,
      };
    } catch (error) {
      console.error('❌ [DEPLOYMENT SERVICE] Erro no deploy:', error);
      throw error;
    }
  }

  /**
   * Deploy completo: verifica limites, cria/atualiza site, faz upload
   * Função principal que orquestra todo o processo de deploy
   */
  async deployWebsite(
    siteName: string,
    htmlContent: string,
    onProgress?: (progress: number, message: string) => void,
  ): Promise<{ site: NetlifySite; deploy: DeployResult; isExisting: boolean }> {
    try {
      onProgress?.(0, 'Verificando limites de uso...');

      // Verificar limites
      const usage = await this.getNetlifyUsage();

      if (usage.sites.count >= usage.sites.limit) {
        throw new Error(
          'Limite de sites atingido. Plano gratuito permite até 500 sites.',
        );
      }

      if (usage.buildMinutes.percentage >= 90) {
        throw new Error(
          'Limite de build minutes quase atingido. Considere fazer upgrade.',
        );
      }

      onProgress?.(10, 'Verificando disponibilidade do nome...');

      // Criar ou obter site
      const { site, isExisting } = await this.createOrGetSite(siteName);

      if (isExisting) {
        onProgress?.(20, `Site "${site.name}" já existe, atualizando...`);
        console.log('🔄 [DEPLOYMENT SERVICE] Atualizando site existente');
      } else {
        onProgress?.(20, `Site "${site.name}" criado! Fazendo upload...`);
        console.log('✅ [DEPLOYMENT SERVICE] Novo site criado');
      }

      // Preparar arquivos
      const files = {
        'index.html': htmlContent,
      };

      // Deploy
      const deploy = await this.deployFiles(site.id, files, (progress) => {
        const adjustedProgress = 20 + progress * 0.8;
        const message =
          progress === 100
            ? isExisting
              ? 'Site atualizado com sucesso!'
              : 'Deploy concluído!'
            : isExisting
              ? 'Atualizando...'
              : 'Fazendo upload...';
        onProgress?.(adjustedProgress, message);
      });

      return { site, deploy, isExisting };
    } catch (error) {
      console.error('❌ [DEPLOYMENT SERVICE] Erro no deploy completo:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const deploymentService = new DeploymentService();
