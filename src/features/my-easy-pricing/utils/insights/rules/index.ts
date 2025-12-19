// =============================================================================
// Rules Index - Combina todas as regras de insight (OCP)
// =============================================================================
// Novas regras podem ser adicionadas sem modificar o analyzer

import type { InsightRule } from '../../../types/insights.types';
import { marginRules } from './marginRules';
import { marketRules } from './marketRules';
import { breakEvenRules } from './breakEvenRules';
import { costRules } from './costRules';
import { dataRules } from './dataRules';

// Combinacao de todas as regras
export const ALL_RULES: InsightRule[] = [
  ...marginRules,
  ...marketRules,
  ...breakEvenRules,
  ...costRules,
  ...dataRules,
];

// Re-export para acesso individual se necessario
export { marginRules, marketRules, breakEvenRules, costRules, dataRules };

// Funcao utilitaria para filtrar regras por categoria
export function getRulesByCategory(category: InsightRule['category']): InsightRule[] {
  return ALL_RULES.filter(rule => rule.category === category);
}

// Funcao utilitaria para filtrar regras por severidade
export function getRulesBySeverity(severity: InsightRule['severity']): InsightRule[] {
  return ALL_RULES.filter(rule => rule.severity === severity);
}

// Funcao utilitaria para obter apenas regras de nivel de loja
export function getStoreLevelRules(): InsightRule[] {
  return ALL_RULES.filter(rule => rule.isStoreLevel === true);
}

// Funcao utilitaria para obter apenas regras de nivel de produto
export function getProductLevelRules(): InsightRule[] {
  return ALL_RULES.filter(rule => rule.isStoreLevel !== true);
}
