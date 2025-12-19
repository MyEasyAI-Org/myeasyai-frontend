// =============================================================================
// CostCompositionChart - Donut chart showing cost breakdown
// =============================================================================

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ProductCalculation } from '../../../hooks/useCalculations';
import type { Product } from '../../../types/pricing.types';

// =============================================================================
// Types
// =============================================================================

interface CostCompositionChartProps {
  calculations: ProductCalculation[];
  products: Product[];
}

interface CostData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

// =============================================================================
// Constants
// =============================================================================

const COLORS = {
  direct: '#64748b',    // slate-500
  indirect: '#f59e0b',  // amber-500
  hidden: '#ef4444',    // red-500
  taxes: '#3b82f6',     // blue-500
};

// =============================================================================
// Custom Tooltip
// =============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CostData }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm text-white font-medium">{data.name}</p>
      <p className="text-sm text-slate-300">
        R$ {data.value.toFixed(2)}
      </p>
    </div>
  );
}

// =============================================================================
// Custom Legend
// =============================================================================

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function CostCompositionChart({ calculations, products }: CostCompositionChartProps) {
  // Calculate aggregated costs
  const costData = useMemo<CostData[]>(() => {
    if (calculations.length === 0) return [];

    // Create a map of product monthly units
    const productUnitsMap = new Map<string, number>();
    for (const product of products) {
      productUnitsMap.set(product.id, product.monthly_units_estimate || 1);
    }

    // Aggregate costs weighted by monthly units
    let totalDirect = 0;
    let totalIndirect = 0;
    let totalHidden = 0;
    let totalTaxes = 0;

    for (const calc of calculations) {
      const units = productUnitsMap.get(calc.productId) || 1;
      totalDirect += calc.directCost * units;
      totalIndirect += calc.indirectCostAllocated * units;
      totalHidden += calc.hiddenCostAllocated * units;
      totalTaxes += calc.taxValue * units;
    }

    const data: CostData[] = [];

    if (totalDirect > 0) {
      data.push({ name: 'Custos Diretos', value: totalDirect, color: COLORS.direct });
    }
    if (totalIndirect > 0) {
      data.push({ name: 'Custos Indiretos', value: totalIndirect, color: COLORS.indirect });
    }
    if (totalHidden > 0) {
      data.push({ name: 'Custos Ocultos', value: totalHidden, color: COLORS.hidden });
    }
    if (totalTaxes > 0) {
      data.push({ name: 'Impostos', value: totalTaxes, color: COLORS.taxes });
    }

    return data;
  }, [calculations, products]);

  // Calculate total for percentage labels
  const total = useMemo(() => {
    return costData.reduce((sum, item) => sum + item.value, 0);
  }, [costData]);

  // Empty state
  if (costData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-slate-500">Sem dados de custos</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={costData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ value }) => {
              const percent = ((value / total) * 100).toFixed(0);
              return `${percent}%`;
            }}
            labelLine={false}
            isAnimationActive={false}
          >
            {costData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} animationDuration={0} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
