import { Briefcase, DollarSign, ExternalLink, GraduationCap, PenTool, Target, HelpCircle } from 'lucide-react';
import type { UserProduct } from '../../hooks/useUserData';
import { ProductCard } from './ProductCard';

type ProductsTabProps = {
  userProducts: UserProduct[];
  isLoading: boolean;
  onAccessProduct: (productName: string) => void;
  onGoToCRM?: () => void;
  onGoToMyEasyContent?: () => void;
  onGoToMyEasyResume?: () => void;
  onGoToMyEasyLearning?: () => void;
  onGoToSupport?: () => void;
  accountCreatedAt?: string;
};

export function ProductsTab({
  userProducts,
  isLoading,
  onAccessProduct,
  onGoToCRM,
  onGoToMyEasyContent,
  onGoToMyEasyResume,
  onGoToMyEasyLearning,
  onGoToSupport,
  accountCreatedAt,
}: ProductsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Produtos</h1>
          <p className="mt-2 text-slate-400">
            Produtos e serviços que você está assinando atualmente.
          </p>
        </div>
        {onGoToSupport && (
          <button
            type="button"
            onClick={onGoToSupport}
            className="flex items-center space-x-2 rounded-lg border border-purple-600 bg-purple-600/10 px-6 py-3 font-semibold text-purple-400 transition-colors hover:bg-purple-600/20"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Central de Suporte</span>
          </button>
        )}
      </div>

      {/* Active Products + MyEasyPricing */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Carregando produtos...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* MyEasyPricing Card - Always visible in Meus Produtos */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-yellow-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-yellow-500/20 p-3">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyPricing
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Assinado em:</span>
                  <span className="text-white">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tabelas criadas:</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => onAccessProduct('MyEasyPricing')}
                  className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* User Products */}
            {userProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                colorIndex={index}
                onAccessProduct={onAccessProduct}
              />
            ))}

            {/* MyEasyCRM Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-emerald-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-emerald-500/20 p-3">
                    <Target className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyCRM
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Gerencie contatos, empresas, pipeline de vendas, tarefas e atividades.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToCRM}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* MyEasyContent Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-orange-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-orange-500/20 p-3">
                    <PenTool className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyContent
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-orange-500/20 text-orange-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Crie conteúdos para redes sociais com IA: posts, legendas, roteiros e calendário editorial.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyContent}
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* MyEasyResume Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-purple-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <Briefcase className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyResume
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-purple-500/20 text-purple-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Crie currículos profissionais otimizados com IA para conquistar sua vaga dos sonhos.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyResume}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* MyEasyLearning Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyLearning
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-blue-500/20 text-blue-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Crie planos de estudo personalizados com IA para dominar novas habilidades e alavancar sua carreira.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyLearning}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>
          </div>

          
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {accountCreatedAt
                    ? new Date(accountCreatedAt).toLocaleDateString('pt-BR')
                    : new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Membro desde
                </p>
              </div>
            </div>
        </>
      )}

      
    </div>
  );
}
