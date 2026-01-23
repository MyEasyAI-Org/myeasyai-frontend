import { Briefcase, Code2, DollarSign, Dumbbell, ExternalLink, GraduationCap, HelpCircle, Package, PenTool, Target, User } from 'lucide-react';
import type { UserProduct } from '../../hooks/useUserData';
import { ProductCard } from './ProductCard';

type ProductsTabProps = {
  userProducts: UserProduct[];
  isLoading: boolean;
  onAccessProduct: (productName: string) => void;
  onGoToCRM?: () => void;
  onGoToMyEasyContent?: () => void;
  onGoToMyEasyFitness?: () => void;
  onGoToMyEasyAvatar?: () => void;
  onGoToMyEasyCode?: () => void;
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
  onGoToMyEasyFitness,
  onGoToMyEasyAvatar,
  onGoToMyEasyCode,
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

            {/* MyEasyFitness Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-lime-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-lime-500/20 p-3">
                    <Dumbbell className="h-6 w-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyFitness
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-lime-500/20 text-lime-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Treinos, dietas, calorias, suplementos, mobilidade e esportes com IA.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyFitness}
                  className="flex-1 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* MyEasyAvatar Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-violet-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-violet-500/20 p-3">
                    <User className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyAvatar
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-violet-500/20 text-violet-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Crie avatares 3D personalizados para sua marca ou perfil profissional.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyAvatar}
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar</span>
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors">
                  Gerenciar
                </button>
              </div>
            </div>

            {/* MyEasyCode Card - Always visible */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-cyan-500/20 p-3">
                    <Code2 className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      MyEasyCode
                    </h3>
                    <span className="inline-block mt-1 rounded-full bg-cyan-500/20 text-cyan-400 px-2 py-1 text-xs font-semibold">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-slate-400">
                  Crie aplicações web completas com IA diretamente no navegador.
                </p>
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={onGoToMyEasyCode}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors flex items-center justify-center space-x-2"
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

          {/* Summary Card - always show (includes hard-coded products) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">
              Resumo de Assinaturas
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {/* Count userProducts + 8 hard-coded products */}
                  {userProducts.filter((p) => p.product_status === 'active').length + 8}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Produtos Ativos
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {userProducts.reduce(
                    (sum, p) =>
                      sum +
                      (p.sites_created || 0) +
                      (p.consultations_made || 0),
                    0,
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Total de Uso
                </p>
              </div>
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
          </div>
        </>
      )}

      {/* Available Products */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Produtos Disponíveis
        </h2>
        <p className="mt-2 text-slate-400">
          Explore outros produtos que podem ajudar seu negócio.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-slate-700 p-3">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Image Generator
              </h3>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Gere imagens de alta qualidade usando IA.
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-white">
                R$ 59<span className="text-sm text-slate-400">/mês</span>
              </p>
            </div>
            <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
              Adicionar Produto
            </button>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-slate-700 p-3">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Voice AI
              </h3>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Sintetização e reconhecimento de voz avançado.
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-white">
                R$ 89<span className="text-sm text-slate-400">/mês</span>
              </p>
            </div>
            <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
              Adicionar Produto
            </button>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-6 opacity-75">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-slate-700 p-3">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Custom Models
              </h3>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Treine seus próprios modelos de IA personalizados.
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-white">
                R$ 299<span className="text-sm text-slate-400">/mês</span>
              </p>
            </div>
            <button className="mt-4 w-full rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-colors">
              Adicionar Produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
