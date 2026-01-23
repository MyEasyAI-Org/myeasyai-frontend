/**
 * FitnessErrorBoundary
 *
 * Error boundary component for the fitness module.
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI.
 */

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FitnessErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('FitnessErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-gradient-to-br from-black-main to-blue-main flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Ops! Algo deu errado
            </h2>

            <p className="text-slate-400 mb-6">
              Ocorreu um erro inesperado no módulo de fitness.
              Tente recarregar a página ou voltar ao dashboard.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-900/50 rounded-lg text-left">
                <p className="text-xs text-slate-500 mb-1">Detalhes do erro:</p>
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
