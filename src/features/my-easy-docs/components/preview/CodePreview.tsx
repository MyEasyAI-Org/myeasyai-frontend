// =============================================
// MyEasyDocs - CodePreview Component
// =============================================
// Preview component for code files with syntax highlighting.
// Uses prism-react-renderer for highlighting.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { FileCode, Copy, Check, Loader2, Edit3 } from 'lucide-react';
import { getCodeLanguage } from '../../utils';

// =============================================
// PROPS
// =============================================
interface CodePreviewProps {
  content: string | null;
  name: string;
  isLoading?: boolean;
  onEdit?: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function CodePreview({ content, name, isLoading = false, onEdit }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const language = getCodeLanguage(name);

  // Reset copied state after timeout
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Carregando código...</p>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-800 rounded-full">
          <FileCode className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-slate-400">Não foi possível carregar o código</p>
      </div>
    );
  }

  const lineCount = content.split('\n').length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 text-slate-300">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium truncate max-w-[200px]">{name}</span>
          <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded uppercase">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copiar código"
          >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        <Highlight theme={themes.vsDark} code={content} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} text-sm font-mono leading-relaxed p-4`}
              style={{ ...style, background: 'transparent', margin: 0 }}
            >
              <table className="border-collapse w-full">
                <tbody>
                  {tokens.map((line, i) => (
                    <tr key={i} {...getLineProps({ line })} className="hover:bg-slate-800/30">
                      <td className="text-right pr-4 text-slate-600 select-none w-12 align-top">
                        {i + 1}
                      </td>
                      <td className="pl-2">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </pre>
          )}
        </Highlight>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>{lineCount.toLocaleString()} linhas</span>
        <span>{content.length.toLocaleString()} caracteres</span>
      </div>
    </div>
  );
}
