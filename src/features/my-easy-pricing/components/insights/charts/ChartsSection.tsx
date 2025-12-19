// =============================================================================
// ChartsSection - Container for pricing charts
// =============================================================================

import type { ProductCalculation } from '../../../hooks/useCalculations';
import type { Product } from '../../../types/pricing.types';
import { CostCompositionChart } from './CostCompositionChart';
import { PriceVsMarketChart } from './PriceVsMarketChart';

// =============================================================================
// Types
// =============================================================================

interface ChartsSectionProps {
  calculations: ProductCalculation[];
  products: Product[];
}

// =============================================================================
// Component
// =============================================================================

export function ChartsSection({ calculations, products }: ChartsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-lg font-medium text-white">Análise Visual</h3>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Composition Chart */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Composição de Custos
          </h4>
          <div className="h-[220px]">
            <CostCompositionChart calculations={calculations} products={products} />
          </div>
        </div>

        {/* Price vs Market Chart */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Preço vs Mercado
          </h4>
          <div className="h-[220px]">
            <PriceVsMarketChart calculations={calculations} products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
