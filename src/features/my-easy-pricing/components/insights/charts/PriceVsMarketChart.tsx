// =============================================================================
// PriceVsMarketChart - Horizontal bar chart comparing prices to market
// =============================================================================

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import type { ProductCalculation } from '../../../hooks/useCalculations';
import type { Product } from '../../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface PriceVsMarketChartProps {
  calculations: ProductCalculation[];
  products: Product[];
}

interface ChartData {
  name: string;
  productName: string;
  price: number;
  market: number;
  diff: number;
}

// =============================================================================
// Constants
// =============================================================================

const COLORS = {
  price: '#eab308',   // yellow-500
  market: '#94a3b8',  // slate-400
  above: '#ef4444',   // red-500 (above market)
  below: '#22c55e',   // green-500 (below market)
};

const MAX_PRODUCTS = 6;
const MAX_NAME_LENGTH = 12;

// =============================================================================
// Helpers
// =============================================================================

function truncateName(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return `${name.substring(0, MAX_NAME_LENGTH - 2)}...`;
}

// =============================================================================
// Custom Tooltip
// =============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: ChartData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const diffText = data.diff > 0
    ? `+${data.diff.toFixed(0)}% acima`
    : `${data.diff.toFixed(0)}% abaixo`;
  const diffColor = data.diff > 0 ? 'text-red-400' : 'text-green-400';

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm text-white font-medium mb-1">{data.productName}</p>
      <div className="space-y-0.5">
        <p className="text-xs text-slate-300">
          <span className="text-yellow-400">Seu preço:</span> R$ {data.price.toFixed(2)}
        </p>
        <p className="text-xs text-slate-300">
          <span className="text-slate-400">Mercado:</span> R$ {data.market.toFixed(2)}
        </p>
        <p className={`text-xs font-medium ${diffColor}`}>
          {diffText}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Custom Legend
// =============================================================================

function CustomLegend() {
  return (
    <div className="flex justify-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.price }} />
        <span className="text-xs text-slate-400">Seu Preço</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.market }} />
        <span className="text-xs text-slate-400">Mercado</span>
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function PriceVsMarketChart({ calculations, products }: PriceVsMarketChartProps) {
  // Prepare chart data
  const chartData = useMemo<ChartData[]>(() => {
    // Create product map for quick lookup
    const productMap = new Map<string, Product>();
    for (const product of products) {
      productMap.set(product.id, product);
    }

    // Filter products with market price and create data
    const data: ChartData[] = [];

    for (const calc of calculations) {
      const product = productMap.get(calc.productId);
      if (!product || product.market_price === null) continue;

      const price = calc.suggestedPrice;
      const market = product.market_price;
      const diff = ((price - market) / market) * 100;

      data.push({
        name: truncateName(product.name),
        productName: product.name,
        price,
        market,
        diff,
      });
    }

    // Sort by absolute difference (largest first) and limit
    return data
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, MAX_PRODUCTS);
  }, [calculations, products]);

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-sm text-slate-500 mb-1">Sem dados de mercado</p>
        <p className="text-xs text-slate-600">
          Adicione preços de mercado aos produtos
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={(value) => `R$${value}`}
            axisLine={{ stroke: '#475569' }}
            tickLine={{ stroke: '#475569' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            width={80}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} animationDuration={0} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="price" name="Seu Preço" fill={COLORS.price} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
          <Bar dataKey="market" name="Mercado" fill={COLORS.market} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
