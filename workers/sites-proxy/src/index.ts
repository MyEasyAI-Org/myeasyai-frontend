/**
 * MyEasyAI Sites Proxy Worker
 * Serve sites do R2 bucket com suporte a SPA routing
 *
 * Cada subdomínio (ex: red-purple-amora.myeasyai.com) serve
 * arquivos do folder correspondente no R2 (red-purple-amora/)
 */

export interface Env {
  SITES_BUCKET: R2Bucket;
}

// Content types por extensão
const CONTENT_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml',
  webmanifest: 'application/manifest+json',
};

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

// Extrai o slug do subdomínio
function getSlugFromHost(host: string): string | null {
  // red-purple-amora.myeasyai.com -> red-purple-amora
  const match = host.match(/^([a-z0-9-]+)\.myeasyai\.com$/i);
  if (match) {
    const slug = match[1].toLowerCase();
    // Ignorar subdomínios reservados
    if (['www', 'api', 'connect', 'staging', 'app', 'admin'].includes(slug)) {
      return null;
    }
    return slug;
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname;

    // Extrair slug do subdomínio
    const slug = getSlugFromHost(host);
    if (!slug) {
      return new Response('Site não encontrado', { status: 404 });
    }

    // Caminho do arquivo no R2
    let path = url.pathname === '/' ? '/index.html' : url.pathname;

    // Remover leading slash
    path = path.startsWith('/') ? path.slice(1) : path;

    // Key completa no R2: slug/path
    const key = `${slug}/${path}`;

    console.log(`[SITES] Fetching: ${key}`);

    // Tentar buscar o arquivo
    let object = await env.SITES_BUCKET.get(key);

    // Se não encontrou e não tem extensão, tentar como SPA (serve index.html)
    if (!object && !path.includes('.')) {
      console.log(`[SITES] Not found, trying SPA fallback: ${slug}/index.html`);
      object = await env.SITES_BUCKET.get(`${slug}/index.html`);
      path = 'index.html'; // Para content-type correto
    }

    if (!object) {
      return new Response('Arquivo não encontrado', { status: 404 });
    }

    // Headers de cache
    const headers = new Headers();
    headers.set('Content-Type', getContentType(path));
    headers.set('ETag', object.httpEtag);

    // Cache mais agressivo para assets, menos para HTML
    if (path.includes('/assets/') || path.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    // CORS para permitir requisições
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  },
};
