/**
 * MyEasyAI Frontend Proxy Worker
 * Serve o frontend principal do R2 bucket com suporte a SPA routing
 *
 * Para: myeasyai.com e www.myeasyai.com
 * Arquivos em: myeasyai-sites/red-purple-amora/
 */

export interface Env {
  FRONTEND_BUCKET: R2Bucket;
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

// Folder no R2 onde está o frontend
const FRONTEND_FOLDER = 'red-purple-amora';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname;

    // Redirect www para non-www
    if (host === 'www.myeasyai.com') {
      const newUrl = new URL(request.url);
      newUrl.hostname = 'myeasyai.com';
      return Response.redirect(newUrl.toString(), 301);
    }

    // Caminho do arquivo
    let path = url.pathname === '/' ? '/index.html' : url.pathname;

    // Remover leading slash
    path = path.startsWith('/') ? path.slice(1) : path;

    // Key completa no R2: red-purple-amora/path
    const key = `${FRONTEND_FOLDER}/${path}`;

    console.log(`[FRONTEND] Fetching: ${key}`);

    // Tentar buscar o arquivo
    let object = await env.FRONTEND_BUCKET.get(key);

    // Se não encontrou e não tem extensão, tentar como SPA (serve index.html)
    // Isso permite que rotas como /dashboard, /settings funcionem
    if (!object && !path.includes('.')) {
      console.log(`[FRONTEND] SPA fallback: ${FRONTEND_FOLDER}/index.html`);
      object = await env.FRONTEND_BUCKET.get(`${FRONTEND_FOLDER}/index.html`);
      path = 'index.html'; // Para content-type correto
    }

    if (!object) {
      // Se ainda não encontrou, retorna 404 com o index.html (para SPA)
      const indexObject = await env.FRONTEND_BUCKET.get(`${FRONTEND_FOLDER}/index.html`);
      if (indexObject) {
        const headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Cache-Control', 'no-cache');
        return new Response(indexObject.body, { headers, status: 200 });
      }
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

    return new Response(object.body, { headers });
  },
};
