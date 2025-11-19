import { ExternalLink, Package } from 'lucide-react';
import type { UserProduct } from '../../hooks/useUserData';

type ProductCardProps = {
  product: UserProduct;
  colorIndex: number;
  onAccessProduct: (productName: string) => void;
};

export function ProductCard({
  product,
  colorIndex,
  onAccessProduct,
}: ProductCardProps) {
  const colors = ['blue', 'purple', 'amber', 'green', 'pink'] as const;
  const color = colors[colorIndex % colors.length];
  const isActive = product.product_status === 'active';

  // Static color mapping for Tailwind JIT compiler
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
    },
    purple: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
    },
    amber: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
    },
    green: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
    },
    pink: {
      bg: 'bg-pink-500/20',
      text: 'text-pink-400',
    },
  } as const;

  const selectedColor = colorClasses[color];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 hover:border-blue-500 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-lg ${selectedColor.bg} p-3`}>
            <Package className={`h-6 w-6 ${selectedColor.text}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {product.product_name}
            </h3>
            <span
              className={`inline-block mt-1 rounded-full ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'} px-2 py-1 text-xs font-semibold`}
            >
              {isActive ? 'Ativo' : product.product_status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Assinado em:</span>
          <span className="text-white">
            {new Date(product.subscribed_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        {product.product_name.toLowerCase().includes('website') && (
          <div className="flex justify-between text-slate-400">
            <span>Sites criados:</span>
            <span className="text-white font-semibold">
              {product.sites_created || 0}
            </span>
          </div>
        )}
        {product.product_name.toLowerCase().includes('guru') && (
          <div className="flex justify-between text-slate-400">
            <span>Consultas:</span>
            <span className="text-white font-semibold">
              {product.consultations_made || 0}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-2">
        <button
          onClick={() => onAccessProduct(product.product_name)}
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
  );
}
