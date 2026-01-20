const extensionToLanguage: Record<string, string> = {
  // JavaScript/TypeScript
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  mjs: 'javascript',
  cjs: 'javascript',

  // Web
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',

  // Data
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  toml: 'toml',

  // Markdown
  md: 'markdown',
  mdx: 'markdown',

  // Python
  py: 'python',
  pyw: 'python',

  // Shell
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',

  // Config
  env: 'shell',
  gitignore: 'shell',
  dockerfile: 'dockerfile',

  // Other
  sql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  vue: 'vue',
  svelte: 'svelte',
  rs: 'rust',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  rb: 'ruby',
  php: 'php',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  swift: 'swift',
};

export function getLanguageFromExtension(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  return extensionToLanguage[extension] || 'plaintext';
}

export function getLanguageFromFileName(fileName: string): string {
  const lowerName = fileName.toLowerCase();

  // Special files
  if (lowerName === 'dockerfile') return 'dockerfile';
  if (lowerName === 'makefile') return 'makefile';
  if (lowerName === '.gitignore') return 'shell';
  if (lowerName === '.env' || lowerName.startsWith('.env.')) return 'shell';

  return getLanguageFromExtension(fileName);
}
