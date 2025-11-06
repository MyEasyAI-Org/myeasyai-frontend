// Serviço de integração com Netlify API para deploy automático
const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const NETLIFY_ACCESS_TOKEN = import.meta.env.VITE_NETLIFY_ACCESS_TOKEN;

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

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  custom_domain?: string;
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
 * Chama a API do Netlify
 */
async function callNetlifyAPI(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const url = `${NETLIFY_API_BASE}${endpoint}`;

  const headers = {
    Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  console.log('🌐 [NETLIFY API] Chamando:', endpoint);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [NETLIFY API] Erro:', response.status, errorText);
    throw new Error(`Netlify API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ [NETLIFY API] Resposta recebida');
  return data;
}

/**
 * Obtém informações de uso da conta Netlify
 */
export async function getNetlifyUsage(): Promise<NetlifyUsage> {
  try {
    const [accountInfo, sites] = await Promise.all([
      callNetlifyAPI('/accounts'),
      callNetlifyAPI('/sites'),
    ]);

    const account = accountInfo[0]; // Primeira conta

    // Limites do plano gratuito
    const FREE_PLAN_LIMITS = {
      bandwidth: 100 * 1024 * 1024 * 1024, // 100GB em bytes
      buildMinutes: 300, // 300 minutos por mês
      sites: 500, // 500 sites
    };

    // Calcular uso de bandwidth (aproximado)
    const bandwidthUsed = sites.reduce((total: number, site: any) => {
      return total + (site.bandwidth_used || 0);
    }, 0);

    // Calcular uso de build minutes (aproximado)
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
    // Retorna dados de fallback
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
export async function getNetlifySites(): Promise<NetlifySite[]> {
  try {
    const sites = await callNetlifyAPI('/sites');
    return sites.map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.url,
      admin_url: site.admin_url,
      state: site.state,
      created_at: site.created_at,
      updated_at: site.updated_at,
      custom_domain: site.custom_domain,
    }));
  } catch (error) {
    console.error('❌ Erro ao listar sites:', error);
    return [];
  }
}

/**
 * Verifica se um site com nome específico já existe na conta
 */
async function findExistingSite(siteName: string): Promise<NetlifySite | null> {
  try {
    const sites = await getNetlifySites();
    const cleanName = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return sites.find((site) => site.name === cleanName) || null;
  } catch (error) {
    console.error('❌ Erro ao verificar sites existentes:', error);
    return null;
  }
}

/**
 * Cria um novo site no Netlify com nome limpo OU retorna site existente se for do mesmo usuário
 */
export async function createOrGetNetlifySite(
  siteName: string,
): Promise<{ site: NetlifySite; isExisting: boolean }> {
  const cleanName = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Primeiro, verificar se site já existe na nossa conta
  const existingSite = await findExistingSite(cleanName);

  if (existingSite) {
    console.log(
      '🔄 [NETLIFY] Site já existe na conta, reutilizando:',
      existingSite.name,
    );
    return { site: existingSite, isExisting: true };
  }

  // Se não existe, tentar criar novo
  const siteData = {
    name: cleanName,
  };

  try {
    const site = await callNetlifyAPI('/sites', {
      method: 'POST',
      body: JSON.stringify(siteData),
    });

    console.log('✅ [NETLIFY] Novo site criado:', site.name);

    return {
      site: {
        id: site.id,
        name: site.name,
        url: site.url,
        admin_url: site.admin_url,
        state: site.state,
        created_at: site.created_at,
        updated_at: site.updated_at,
        custom_domain: site.custom_domain,
      },
      isExisting: false,
    };
  } catch (error: any) {
    // Parsear a mensagem de erro para identificar o problema real
    const errorMessage = error.message.toLowerCase();

    // Erro de limite de conta excedido
    if (
      errorMessage.includes('exceeded usage limit') ||
      errorMessage.includes('cannot create more sites')
    ) {
      throw new Error(
        `❌ Limite de sites atingido! Você excedeu o limite de sites gratuitos do Netlify. Exclua alguns sites antigos ou faça upgrade do plano.`,
      );
    }

    // Erro de nome já em uso (único/duplicate)
    if (
      errorMessage.includes('422') &&
      (errorMessage.includes('unique') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('taken'))
    ) {
      throw new Error(
        `❌ O nome "${cleanName}" já está em uso por outro usuário. Por favor, escolha um nome diferente.`,
      );
    }

    // Qualquer outro erro 422
    if (errorMessage.includes('422')) {
      throw new Error(`❌ Erro ao criar site: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Cria um novo site no Netlify - função legada mantida para compatibilidade
 */
export async function createNetlifySite(
  siteName: string,
): Promise<NetlifySite> {
  const result = await createOrGetNetlifySite(siteName);
  return result.site;
}

/**
 * Calcula SHA1 hash de uma string
 */
async function calculateSHA1(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Faz upload de arquivos para o Netlify usando o método correto (file digest)
 */
export async function deployToNetlify(
  siteId: string,
  files: { [path: string]: string },
  onProgress?: (progress: number) => void,
): Promise<DeployResult> {
  try {
    console.log('🚀 [NETLIFY] Iniciando deploy para site:', siteId);
    console.log('📊 [NETLIFY] Arquivos a serem enviados:', Object.keys(files));

    onProgress?.(10);

    // Passo 1: Criar digest dos arquivos (SHA1 para cada arquivo)
    console.log('📦 [NETLIFY] Calculando SHA1 dos arquivos...');
    const fileDigest: { [path: string]: string } = {};
    const shaToPath: { [sha: string]: string } = {};
    const shaToContent: { [sha: string]: string } = {};

    for (const [path, content] of Object.entries(files)) {
      const sha1 = await calculateSHA1(content);
      // Netlify espera caminhos começando com /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      fileDigest[normalizedPath] = sha1;
      shaToPath[sha1] = normalizedPath;
      shaToContent[sha1] = content; // Guardar conteúdo também
    }

    console.log(
      '✅ [NETLIFY] Digest calculado:',
      Object.keys(fileDigest).length,
      'arquivos',
    );
    onProgress?.(20);

    // Passo 2: Criar deploy com o digest
    console.log('🌐 [NETLIFY] Criando deploy com file digest...');
    const deployData = {
      files: fileDigest,
    };

    const deployResponse = await callNetlifyAPI(`/sites/${siteId}/deploys`, {
      method: 'POST',
      body: JSON.stringify(deployData),
    });

    console.log('✅ [NETLIFY] Deploy criado:', deployResponse.id);
    console.log('📊 [NETLIFY] Estado:', deployResponse.state);
    console.log(
      '📋 [NETLIFY] Arquivos requeridos:',
      deployResponse.required?.length || 0,
    );

    onProgress?.(40);

    // Passo 3: Upload dos arquivos requeridos
    if (deployResponse.required && deployResponse.required.length > 0) {
      console.log(
        '📤 [NETLIFY] Fazendo upload de',
        deployResponse.required.length,
        'arquivos...',
      );

      for (let i = 0; i < deployResponse.required.length; i++) {
        const sha = deployResponse.required[i];
        const filePath = shaToPath[sha];
        const fileContent = shaToContent[sha]; // Usar conteúdo do mapa

        console.log(
          `📤 [NETLIFY] Uploading ${i + 1}/${deployResponse.required.length}: ${filePath}`,
        );

        // Upload do arquivo
        const uploadResponse = await fetch(
          `${NETLIFY_API_BASE}/deploys/${deployResponse.id}/files/${encodeURIComponent(filePath)}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
              'Content-Type': 'application/octet-stream',
            },
            body: fileContent,
          },
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error(
            '❌ [NETLIFY] Upload falhou:',
            uploadResponse.status,
            errorText,
          );
          throw new Error(
            `File upload failed: ${uploadResponse.status} - ${errorText}`,
          );
        }

        // Atualizar progresso
        const uploadProgress =
          40 + ((i + 1) / deployResponse.required.length) * 40;
        onProgress?.(uploadProgress);
      }

      console.log('✅ [NETLIFY] Todos os arquivos enviados com sucesso!');
    } else {
      console.log(
        '✅ [NETLIFY] Nenhum arquivo novo para enviar (já existe no cache)',
      );
    }

    onProgress?.(80);

    // Passo 4: Aguardar processamento do deploy
    console.log('⏳ [NETLIFY] Aguardando processamento do deploy...');
    let deployStatus = deployResponse;
    let attempts = 0;
    const maxAttempts = 30; // 30 segundos máximo

    while (
      deployStatus.state !== 'ready' &&
      deployStatus.state !== 'error' &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      deployStatus = await callNetlifyAPI(`/deploys/${deployResponse.id}`);
      console.log('🔍 [NETLIFY] Status do deploy:', deployStatus.state);
      attempts++;

      const statusProgress = 80 + (attempts / maxAttempts) * 15;
      onProgress?.(Math.min(statusProgress, 95));
    }

    if (deployStatus.state === 'error') {
      throw new Error('Deploy failed during processing');
    }

    // Passo 5: Obter informações finais do site
    const siteInfo = await callNetlifyAPI(`/sites/${siteId}`);
    const siteUrl =
      siteInfo.ssl_url ||
      siteInfo.url ||
      `https://${siteInfo.name}.netlify.app`;

    console.log('🎉 [NETLIFY] Deploy concluído com sucesso!');
    console.log('🌐 [NETLIFY] URL:', siteUrl);

    onProgress?.(100);

    return {
      id: deployStatus.id,
      site_id: siteId,
      url: siteUrl,
      deploy_url:
        deployStatus.deploy_ssl_url || deployStatus.deploy_url || siteUrl,
      admin_url: deployStatus.admin_url || siteInfo.admin_url,
      state: deployStatus.state,
      created_at: deployStatus.created_at,
    };
  } catch (error) {
    console.error('❌ [NETLIFY] Erro no deploy:', error);
    throw error;
  }
}

/**
 * Deploy completo: cria/atualiza site + faz upload
 */
export async function deployWebsite(
  siteName: string,
  htmlContent: string,
  onProgress?: (progress: number, message: string) => void,
): Promise<{ site: NetlifySite; deploy: DeployResult; isExisting: boolean }> {
  try {
    onProgress?.(0, 'Verificando limites de uso...');

    // Verificar limites antes do deploy
    const usage = await getNetlifyUsage();

    if (usage.sites.count >= usage.sites.limit) {
      throw new Error(
        'Limite de sites atingido. Plano gratuito permite até 500 sites.',
      );
    }

    if (usage.buildMinutes.percentage >= 90) {
      throw new Error(
        'Limite de build minutes quase atingido. Considere fazer upgrade do plano.',
      );
    }

    onProgress?.(10, 'Verificando disponibilidade do nome...');

    // Criar ou obter site existente
    const { site, isExisting } = await createOrGetNetlifySite(siteName);

    if (isExisting) {
      onProgress?.(
        20,
        `Site "${site.name}" já existe, atualizando conteúdo...`,
      );
      console.log('🔄 [NETLIFY] Atualizando site existente:', site.name);
    } else {
      onProgress?.(20, `Site "${site.name}" criado! Fazendo upload...`);
      console.log('✅ [NETLIFY] Novo site criado:', site.name);
    }

    // Preparar arquivos
    const files = {
      'index.html': htmlContent,
    };

    // Deploy
    const deploy = await deployToNetlify(site.id, files, (progress) => {
      const adjustedProgress = 20 + progress * 0.8; // 20% a 100%
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
    console.error('❌ [NETLIFY] Erro no deploy completo:', error);
    throw error;
  }
}

/**
 * Formata bytes para formato legível
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calcula percentual de uso
 */
export function getUsageColor(percentage: number): string {
  if (percentage < 50) return 'text-green-500';
  if (percentage < 80) return 'text-yellow-500';
  return 'text-red-500';
}
