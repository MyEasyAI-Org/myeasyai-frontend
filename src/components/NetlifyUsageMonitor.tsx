import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  formatBytes,
  getNetlifyUsage,
  getUsageColor,
  type NetlifyUsage,
} from '../lib/netlify';

interface NetlifyUsageMonitorProps {
  className?: string;
}

export function NetlifyUsageMonitor({
  className = '',
}: NetlifyUsageMonitorProps) {
  const [usage, setUsage] = useState<NetlifyUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      const usageData = await getNetlifyUsage();
      setUsage(usageData);
    } catch (err) {
      console.error('Erro ao carregar uso do Netlify:', err);
      setError('Erro ao carregar informações de uso');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage < 50)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (percentage < 80)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage < 50) return 'Tudo bem';
    if (percentage < 80) return 'Atenção';
    return 'Limite crítico';
  };

  if (loading) {
    return (
      <div
        className={`rounded-lg border border-slate-700 bg-slate-800 p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
          <span className="text-slate-300">Carregando uso do Netlify...</span>
        </div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div
        className={`rounded-lg border border-red-700 bg-red-900/20 p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-red-300 font-medium">
              Erro ao conectar com Netlify
            </p>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadUsage}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800 p-4 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Uso do Netlify</h3>
        </div>
        <button
          onClick={loadUsage}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          Atualizar
        </button>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bandwidth */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Banda</span>
            </div>
            {getStatusIcon(usage.bandwidth.percentage)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Usado:</span>
              <span className="text-white">
                {formatBytes(usage.bandwidth.used)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Limite:</span>
              <span className="text-white">
                {formatBytes(usage.bandwidth.limit)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.bandwidth.percentage < 50
                    ? 'bg-green-500'
                    : usage.bandwidth.percentage < 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(usage.bandwidth.percentage, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs">
              <span className={getUsageColor(usage.bandwidth.percentage)}>
                {usage.bandwidth.percentage.toFixed(1)}%
              </span>
              <span className="text-slate-500">
                {getStatusMessage(usage.bandwidth.percentage)}
              </span>
            </div>
          </div>
        </div>

        {/* Build Minutes */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Build</span>
            </div>
            {getStatusIcon(usage.buildMinutes.percentage)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Usado:</span>
              <span className="text-white">{usage.buildMinutes.used} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Limite:</span>
              <span className="text-white">{usage.buildMinutes.limit} min</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.buildMinutes.percentage < 50
                    ? 'bg-green-500'
                    : usage.buildMinutes.percentage < 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(usage.buildMinutes.percentage, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs">
              <span className={getUsageColor(usage.buildMinutes.percentage)}>
                {usage.buildMinutes.percentage.toFixed(1)}%
              </span>
              <span className="text-slate-500">
                {getStatusMessage(usage.buildMinutes.percentage)}
              </span>
            </div>
          </div>
        </div>

        {/* Sites Count */}
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Sites</span>
            </div>
            {getStatusIcon((usage.sites.count / usage.sites.limit) * 100)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Criados:</span>
              <span className="text-white">{usage.sites.count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Limite:</span>
              <span className="text-white">{usage.sites.limit}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  (usage.sites.count / usage.sites.limit) * 100 < 50
                    ? 'bg-green-500'
                    : (usage.sites.count / usage.sites.limit) * 100 < 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((usage.sites.count / usage.sites.limit) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs">
              <span
                className={getUsageColor(
                  (usage.sites.count / usage.sites.limit) * 100,
                )}
              >
                {((usage.sites.count / usage.sites.limit) * 100).toFixed(1)}%
              </span>
              <span className="text-slate-500">
                {getStatusMessage(
                  (usage.sites.count / usage.sites.limit) * 100,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning/Info */}
      {(usage.bandwidth.percentage > 80 ||
        usage.buildMinutes.percentage > 80 ||
        (usage.sites.count / usage.sites.limit) * 100 > 80) && (
        <div className="rounded-lg bg-yellow-900/30 border border-yellow-700 p-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium">Atenção aos Limites</p>
              <p className="text-yellow-200 text-sm mt-1">
                Você está próximo dos limites do plano gratuito. Considere fazer
                upgrade ou otimizar o uso para evitar interrupções.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          📊 Plano Gratuito Netlify • Limites mensais
        </p>
      </div>
    </div>
  );
}
