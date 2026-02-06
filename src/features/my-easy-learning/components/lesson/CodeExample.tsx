/**
 * CodeExample Component
 *
 * Displays code snippets with syntax highlighting and copy functionality.
 */

import { memo, useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import type { CodeSnippet } from '../../types/lesson';

interface CodeExampleProps {
  title: string;
  codeSnippet: CodeSnippet;
  explanation?: string;
  isCompleted: boolean;
}

export const CodeExample = memo(function CodeExample({
  title,
  codeSnippet,
  explanation,
  isCompleted,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Language display names
  const languageNames: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    java: 'Java',
    csharp: 'C#',
    cpp: 'C++',
    go: 'Go',
    rust: 'Rust',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    bash: 'Bash',
    text: 'Texto',
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isCompleted
          ? 'bg-green-900/10 border-green-500/30'
          : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'}`}>
            <Code className={`h-5 w-5 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className="text-xs text-slate-500">
              {languageNames[codeSnippet.language] || codeSnippet.language}
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code block */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          <code className="text-slate-300 whitespace-pre-wrap">{codeSnippet.code}</code>
        </pre>
      </div>

      {/* Explanation */}
      {(explanation || codeSnippet.explanation) && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-300">Explicacao: </span>
            {explanation || codeSnippet.explanation}
          </p>
        </div>
      )}
    </div>
  );
});

export default CodeExample;
