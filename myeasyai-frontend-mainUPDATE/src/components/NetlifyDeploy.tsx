import { useState } from 'react';
import { Upload, ExternalLink, Loader2, CheckCircle, XCircle, Globe, Settings } from 'lucide-react';
import { deployWebsite, type NetlifySite, type DeployResult } from '../lib/netlify';
import { NetlifyUsageMonitor } from './NetlifyUsageMonitor';

interface NetlifyDeployProps {
  htmlContent: string;
  siteName: string;
  onDeploySuccess?: (site: NetlifySite, deploy: DeployResult) => void;
  className?: string;
}

export function NetlifyDeploy({ htmlContent, siteName, onDeploySuccess, className = '' }: NetlifyDeployProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployMessage, setDeployMessage] = useState('');
  const [deployResult, setDeployResult] = useState<{ site: NetlifySite; deploy: DeployResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUsageMonitor, setShowUsageMonitor] = useState(false);
  const [customSiteName, setCustomSiteName] = useState(siteName);

  const handleDeploy = async () => {
    if (!htmlContent || !customSiteName.trim()) {
      setError('Nome do site e conteúdo HTML são obrigatórios');
      return;
    }

    try {
      setIsDeploying(true);
      setError(null);
      setDeployProgress(0);
      setDeployMessage('Iniciando deploy...');

      const result = await deployWebsite(
        customSiteName.trim(),
        htmlContent,
        (progress, message) => {
          setDeployProgress(progress);
          setDeployMessage(message);
        }
      );

      setDeployResult(result);
      onDeploySuccess?.(result.site, result.deploy);
      
    } catch (err: any) {
      console.error('Erro no deploy:', err);
      setError(err.message || 'Erro desconhecido durante o deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  const formatSiteName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSiteNameChange = (value: string) => {
    setCustomSiteName(formatSiteName(value));
  };

  if (deployResult) {
    return (
      <div className={`rounded-lg border border-green-700 bg-green-900/20 p-6 space-y-4 ${className}`}>
        {/* Success Header */}
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-bold text-green-300">🎉 Site Publicado com Sucesso!</h3>
        </div>

        {/* Site Info */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nome do Site:</span>
            <span className="text-white font-medium">{deployResult.site.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-green-400 font-medium">✅ Ativo</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Deploy ID:</span>
            <span className="text-white text-sm font-mono">{deployResult.deploy.id.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href={deployResult.site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            <Globe className="h-5 w-5" />
            <span>Ver Site Online</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a
            href={deployResult.site.admin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Painel Netlify</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Site URL */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-sm text-slate-400 mb-1">URL do seu site:</p>
          <div className="flex items-center justify-between bg-slate-800 rounded px-3 py-2">
            <code className="text-blue-300 text-sm">{deployResult.site.url}</code>
            <button
              onClick={() => navigator.clipboard.writeText(deployResult.site.url)}
              className="text-slate-400 hover:text-slate-300 text-sm"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* New Deploy Button */}
        <button
          onClick={() => {
            setDeployResult(null);
            setError(null);
            setDeployProgress(0);
            setDeployMessage('');
          }}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Fazer Novo Deploy
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Usage Monitor Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Publicar no Netlify</h3>
        <button
          onClick={() => setShowUsageMonitor(!showUsageMonitor)}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-300"
        >
          <Settings className="h-4 w-4" />
          <span>{showUsageMonitor ? 'Ocultar' : 'Ver'} Uso</span>
        </button>
      </div>

      {/* Usage Monitor */}
      {showUsageMonitor && (
        <NetlifyUsageMonitor />
      )}

      {/* Deploy Form */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 space-y-4">
        {/* Site Name Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nome do Site
          </label>
          <input
            type="text"
            value={customSiteName}
            onChange={(e) => handleSiteNameChange(e.target.value)}
            placeholder="meu-site-incrivel"
            disabled={isDeploying}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Será usado como subdomínio: <code className="text-blue-400">{customSiteName || 'nome'}.netlify.app</code>
          </p>
        </div>

        {/* Site Preview */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prévia do Conteúdo
          </label>
          <div className="bg-slate-900 rounded-lg p-3 max-h-32 overflow-y-auto">
            <code className="text-slate-400 text-xs whitespace-pre-wrap">
              {htmlContent.substring(0, 300)}
              {htmlContent.length > 300 && '...'}
            </code>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {htmlContent.length.toLocaleString()} caracteres • Arquivo HTML completo
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-900/30 border border-red-700 p-3">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Erro no Deploy</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Deploy Progress */}
        {isDeploying && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <span className="text-slate-300">{deployMessage}</span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deployProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-slate-500">
              <span>{deployProgress.toFixed(0)}% concluído</span>
              <span>{deployMessage}</span>
            </div>
          </div>
        )}

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !customSiteName.trim() || !htmlContent}
          className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Publicando...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>🚀 Publicar Site no Netlify</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="rounded-lg bg-blue-900/30 border border-blue-700 p-3">
          <p className="text-sm text-blue-300">
            💡 <strong>Grátis:</strong> Até 500 sites, 100GB bandwidth/mês, 300 min build/mês. 
            Seu site estará disponível instantaneamente em uma URL .netlify.app!
          </p>
        </div>
      </div>
    </div>
  );
}
