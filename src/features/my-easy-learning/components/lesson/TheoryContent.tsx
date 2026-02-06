/**
 * TheoryContent Component
 *
 * Renders markdown theory content with proper styling.
 */

import { memo } from 'react';
import { BookOpen } from 'lucide-react';

interface TheoryContentProps {
  title: string;
  content: string;
  isCompleted: boolean;
}

export const TheoryContent = memo(function TheoryContent({
  title,
  content,
  isCompleted,
}: TheoryContentProps) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {trimmed.slice(4)}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {trimmed.slice(3)}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-4">
            {trimmed.slice(2)}
          </h2>
        );
      }
      // Bullet points
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={index} className="text-slate-300 ml-4 mb-1">
            {trimmed.slice(2)}
          </li>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <li key={index} className="text-slate-300 ml-4 mb-1 list-decimal">
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      // Bold text (simple)
      else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        elements.push(
          <p key={index} className="font-semibold text-white mb-2">
            {trimmed.slice(2, -2)}
          </p>
        );
      }
      // Empty lines
      else if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={index} className="text-slate-300 mb-3 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div
      className={`rounded-xl border p-6 transition-all ${
        isCompleted
          ? 'bg-green-900/10 border-green-500/30'
          : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
          <BookOpen className={`h-5 w-5 ${isCompleted ? 'text-green-400' : 'text-blue-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isCompleted && (
          <span className="ml-auto px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
            Concluido
          </span>
        )}
      </div>

      <div className="prose prose-invert max-w-none">{renderContent(content)}</div>
    </div>
  );
});

export default TheoryContent;
