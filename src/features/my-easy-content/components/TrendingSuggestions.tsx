import {
  TrendingUp,
  Hash,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { BusinessNiche, SocialNetwork } from '../types';
import {
  getTrendingForNiche,
  getHashtagsForNetwork,
  getTopHashtags,
  type TrendingHashtag,
  type TrendingTopic,
} from '../constants/trendingData';

interface TrendingSuggestionsProps {
  niche: BusinessNiche;
  network?: SocialNetwork;
  onSelectHashtag?: (hashtag: string) => void;
  onSelectTopic?: (topic: TrendingTopic) => void;
  onGenerateContent?: (topic: string) => void;
  compact?: boolean;
}

const POPULARITY_COLORS = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rising: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const POPULARITY_LABELS = {
  high: 'Popular',
  medium: 'Estavel',
  rising: 'Em alta',
};

export function TrendingSuggestions({
  niche,
  network,
  onSelectHashtag,
  onSelectTopic,
  onGenerateContent,
  compact = false,
}: TrendingSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'hashtags' | 'topics' | 'tips'>('hashtags');

  const trends = useMemo(() => getTrendingForNiche(niche), [niche]);

  const displayHashtags = useMemo(() => {
    if (network) {
      return getHashtagsForNetwork(niche, network);
    }
    return trends.hashtags;
  }, [niche, network, trends.hashtags]);

  const topHashtags = useMemo(() => getTopHashtags(niche, 6), [niche]);

  const handleCopyHashtag = async (tag: string) => {
    await navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleCopyAllHashtags = async () => {
    const allTags = displayHashtags.map((h) => h.tag).join(' ');
    await navigator.clipboard.writeText(allTags);
    setCopiedTag('all');
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Compact view - just shows top hashtags
  if (compact && !isExpanded) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Tendencias</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex flex-wrap gap-1 mt-2">
          {topHashtags.slice(0, 4).map((hashtag) => (
            <button
              key={hashtag.tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectHashtag?.(hashtag.tag);
              }}
              className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500/30 transition-colors"
            >
              {hashtag.tag}
            </button>
          ))}
          <span className="text-xs text-slate-500">+{displayHashtags.length - 4}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Tendencias para seu Nicho</h3>
        </div>
        {compact && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button
          type="button"
          onClick={() => setActiveSection('hashtags')}
          className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
            activeSection === 'hashtags'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            <span>Hashtags</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('topics')}
          className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
            activeSection === 'topics'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Ideias</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tips')}
          className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
            activeSection === 'tips'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Dicas</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Hashtags Section */}
        {activeSection === 'hashtags' && (
          <div className="space-y-3">
            {/* Copy All Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopyAllHashtags}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copiedTag === 'all' ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar todas</span>
                  </>
                )}
              </button>
            </div>

            {/* Hashtag Grid */}
            <div className="flex flex-wrap gap-2">
              {displayHashtags.map((hashtag) => (
                <HashtagBadge
                  key={hashtag.tag}
                  hashtag={hashtag}
                  isCopied={copiedTag === hashtag.tag}
                  onCopy={() => handleCopyHashtag(hashtag.tag)}
                  onSelect={() => onSelectHashtag?.(hashtag.tag)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">Legenda:</span>
              {Object.entries(POPULARITY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      key === 'high'
                        ? 'bg-green-400'
                        : key === 'rising'
                          ? 'bg-orange-400'
                          : 'bg-blue-400'
                    }`}
                  />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics Section */}
        {activeSection === 'topics' && (
          <div className="space-y-3">
            {trends.topics.map((topic, index) => (
              <TopicCard
                key={index}
                topic={topic}
                onSelect={() => onSelectTopic?.(topic)}
                onGenerate={() => onGenerateContent?.(topic.title)}
              />
            ))}
          </div>
        )}

        {/* Tips Section */}
        {activeSection === 'tips' && (
          <div className="space-y-2">
            {trends.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
              >
                <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Hashtag Badge Component
function HashtagBadge({
  hashtag,
  isCopied,
  onCopy,
  onSelect,
}: {
  hashtag: TrendingHashtag;
  isCopied: boolean;
  onCopy: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`group relative flex items-center gap-1 px-2 py-1 rounded-lg border text-sm cursor-pointer transition-all ${POPULARITY_COLORS[hashtag.popularity]} hover:scale-105`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <span>{hashtag.tag}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded"
        title="Copiar"
      >
        {isCopied ? (
          <Check className="w-3 h-3" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

// Topic Card Component
function TopicCard({
  topic,
  onSelect,
  onGenerate,
}: {
  topic: TrendingTopic;
  onSelect: () => void;
  onGenerate: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div>
          <h4 className="font-medium text-white">{topic.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{topic.description}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700/50 pt-3">
          {/* Hashtags */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Hashtags sugeridas:</p>
            <div className="flex flex-wrap gap-1">
              {topic.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content Ideas */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Ideias de conteudo:</p>
            <ul className="space-y-1">
              {topic.contentIdeas.map((idea, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-orange-400">•</span>
                  {idea}
                </li>
              ))}
            </ul>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={onGenerate}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar conteudo sobre isso</span>
          </button>
        </div>
      )}
    </div>
  );
}
