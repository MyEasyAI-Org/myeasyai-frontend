import type { LanguageSupport } from '@codemirror/language';

const languageMap: Record<string, () => Promise<LanguageSupport>> = {
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true, typescript: false })),
  typescript: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true, typescript: true })),
  jsx: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true })),
  tsx: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true, typescript: true })),
  html: () => import('@codemirror/lang-html').then((m) => m.html()),
  css: () => import('@codemirror/lang-css').then((m) => m.css()),
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  markdown: () => import('@codemirror/lang-markdown').then((m) => m.markdown()),
  python: () => import('@codemirror/lang-python').then((m) => m.python()),
};

const extensionToLanguage: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  json: 'json',
  md: 'markdown',
  mdx: 'markdown',
  py: 'python',
  pyw: 'python',
};

export async function getLanguage(filePath: string): Promise<LanguageSupport | null> {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  const languageId = extensionToLanguage[extension];

  if (!languageId) {
    return null;
  }

  const loader = languageMap[languageId];

  if (!loader) {
    return null;
  }

  try {
    return await loader();
  } catch (error) {
    console.warn(`Failed to load language support for ${languageId}:`, error);
    return null;
  }
}
