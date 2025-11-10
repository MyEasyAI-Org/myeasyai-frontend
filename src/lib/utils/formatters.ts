// Funções utilitárias para formatação de dados
// Funções puras e reutilizáveis

/**
 * Formata bytes para formato legível (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Retorna a classe de cor baseada no percentual de uso
 * Usado para indicadores visuais de limite de recursos
 */
export function getUsageColor(percentage: number): string {
  if (percentage < 50) return 'text-green-500';
  if (percentage < 80) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Calcula SHA1 hash de uma string
 * Usado para file digest no Netlify
 */
export async function calculateSHA1(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
