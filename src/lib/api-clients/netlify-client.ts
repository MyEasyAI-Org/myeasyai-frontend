// Cliente HTTP para integração com Netlify API
// Este arquivo contém APENAS os wrappers HTTP, sem lógica de negócio

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const NETLIFY_ACCESS_TOKEN = import.meta.env.VITE_NETLIFY_ACCESS_TOKEN;

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  custom_domain?: string;
  ssl_url?: string;
  bandwidth_used?: number;
}

export interface NetlifyDeploy {
  id: string;
  site_id: string;
  state: string;
  deploy_url?: string;
  deploy_ssl_url?: string;
  admin_url: string;
  created_at: string;
  required?: string[];
}

export interface NetlifyAccount {
  id: string;
  name: string;
  slug: string;
  build_minutes_used?: number;
}

/**
 * Cliente HTTP para Netlify API
 * Contém apenas chamadas HTTP básicas, sem orquestração ou lógica de negócio
 */
export class NetlifyClient {
  /**
   * Wrapper genérico para chamadas à API do Netlify
   */
  private async call(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${NETLIFY_API_BASE}${endpoint}`;

    const headers = {
      Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log('🌐 [NETLIFY CLIENT] Chamando:', endpoint);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [NETLIFY CLIENT] Erro:', response.status, errorText);
      throw new Error(`Netlify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [NETLIFY CLIENT] Resposta recebida');
    return data;
  }

  /**
   * Lista todas as contas do usuário
   */
  async getAccounts(): Promise<NetlifyAccount[]> {
    return await this.call('/accounts');
  }

  /**
   * Lista todos os sites do usuário
   */
  async getSites(): Promise<NetlifySite[]> {
    return await this.call('/sites');
  }

  /**
   * Obtém informações de um site específico
   */
  async getSite(siteId: string): Promise<NetlifySite> {
    return await this.call(`/sites/${siteId}`);
  }

  /**
   * Cria um novo site
   */
  async createSite(siteName: string): Promise<NetlifySite> {
    return await this.call('/sites', {
      method: 'POST',
      body: JSON.stringify({ name: siteName }),
    });
  }

  /**
   * Cria um novo deploy com file digest
   */
  async createDeploy(
    siteId: string,
    fileDigest: { [path: string]: string },
  ): Promise<NetlifyDeploy> {
    return await this.call(`/sites/${siteId}/deploys`, {
      method: 'POST',
      body: JSON.stringify({ files: fileDigest }),
    });
  }

  /**
   * Obtém informações de um deploy específico
   */
  async getDeploy(deployId: string): Promise<NetlifyDeploy> {
    return await this.call(`/deploys/${deployId}`);
  }

  /**
   * Faz upload de um arquivo para um deploy
   */
  async uploadFile(
    deployId: string,
    filePath: string,
    fileContent: string,
  ): Promise<void> {
    const url = `${NETLIFY_API_BASE}/deploys/${deployId}/files/${encodeURIComponent(filePath)}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileContent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File upload failed: ${response.status} - ${errorText}`);
    }
  }
}

// Export singleton instance
export const netlifyClient = new NetlifyClient();
