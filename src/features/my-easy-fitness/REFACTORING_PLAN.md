# Plano de Refatoração - MyEasyFitness Module

> **Princípio:** Uma fase = Um problema = Um PR

---

## Resumo dos Problemas Identificados

| # | Problema | Severidade | Arquivos Afetados |
|---|----------|------------|-------------------|
| 1 | 12 campos não salvos no banco | CRÍTICA | FitnessService.ts, d1-client.ts |
| 2 | FitnessVisualizationPanel monolítico (1056 linhas) | Alta | FitnessVisualizationPanel.tsx |
| 3 | Código duplicado em PersonalInfoTab (5 pares add/remove) | Alta | FitnessVisualizationPanel.tsx |
| 4 | workoutGenerator com 12 funções duplicadas | Alta | workoutGenerator.ts |
| 5 | Prop drilling excessivo (~15 props) | Alta | MyEasyFitness.tsx, componentes |
| 6 | useFitnessData muito grande (611 linhas, 40+ funções) | Alta | useFitnessData.ts |
| 7 | useAnamneseFlow com responsabilidades misturadas | Média | useAnamneseFlow.ts |
| 8 | constants/index.ts muito grande (983 linhas) | Média | constants/index.ts |
| 9 | onKeyPress deprecado (15+ ocorrências) | Média | Vários componentes |
| 10 | Index como key em maps | Média | FitnessChatPanel.tsx, outros |
| 11 | Falta de memoização | Média | Todos componentes |
| 12 | Falta de Error Boundary | Média | MyEasyFitness.tsx |
| 13 | Constantes mágicas espalhadas | Baixa | Vários arquivos |
| 14 | Falta de testes | Baixa | Nenhum teste existe |

---

## FASE 1: Fix Crítico de Persistência

**Problema:** 12 campos do perfil não estão sendo salvos no banco D1
**Impacto:** Usuários perdem preferências de treino/dieta ao recarregar
**Estimativa:** 2-4 horas

### 1.1 Atualizar tipo D1FitnessProfile

**Arquivo:** `src/lib/api-clients/d1-client.ts`

```typescript
// Adicionar campos faltantes ao tipo
export interface D1FitnessProfile {
  // ... campos existentes ...

  // Novos campos de treino
  dias_treino_semana?: number;
  tempo_treino_minutos?: number;
  preferencia_treino?: string;
  experiencia_treino?: string;
  local_treino?: string;

  // Novos campos de dieta
  restricoes_alimentares?: string;
  comidas_favoritas?: string;
  comidas_evitar?: string;
  numero_refeicoes?: number;
  horario_treino?: string;

  // Campos de gênero
  genero?: string;
  genero_outro?: string;
}
```

### 1.2 Corrigir FitnessService.saveProfile()

**Arquivo:** `src/features/my-easy-fitness/services/FitnessService.ts`

Adicionar os 12 campos faltantes na chamada `upsertFitnessProfile()`.

### Critério de Conclusão
- [ ] Todos os 22 campos de UserPersonalInfo são salvos
- [ ] Dados persistem após reload da página
- [ ] Sem erros no console

---

## FASE 2: Extrair TabButton e EditableField

**Problema:** Componentes reutilizáveis estão inline no FitnessVisualizationPanel
**Impacto:** Dificulta manutenção e reutilização
**Estimativa:** 1-2 horas

### 2.1 Criar TabButton.tsx

**Arquivo:** `src/features/my-easy-fitness/components/shared/TabButton.tsx`

Extrair linhas 51-75 do FitnessVisualizationPanel.

### 2.2 Criar EditableField.tsx

**Arquivo:** `src/features/my-easy-fitness/components/shared/EditableField.tsx`

Extrair linhas 78-155 do FitnessVisualizationPanel.

### Critério de Conclusão
- [ ] TabButton é um arquivo separado
- [ ] EditableField é um arquivo separado
- [ ] FitnessVisualizationPanel importa ambos
- [ ] Funcionalidade inalterada

---

## FASE 3: Extrair VisaoGeralTab

**Problema:** VisaoGeralTab está inline no FitnessVisualizationPanel
**Impacto:** Arquivo muito grande, difícil navegação
**Estimativa:** 1-2 horas

### 3.1 Criar VisaoGeralTab.tsx

**Arquivo:** `src/features/my-easy-fitness/components/tabs/VisaoGeralTab.tsx`

Extrair linhas 158-299 do FitnessVisualizationPanel.

### Critério de Conclusão
- [ ] VisaoGeralTab é um arquivo separado (~140 linhas)
- [ ] Props tipadas corretamente
- [ ] Funcionalidade inalterada

---

## FASE 4: Extrair DietaTab

**Problema:** DietaTab está inline no FitnessVisualizationPanel
**Impacto:** Arquivo muito grande
**Estimativa:** 1-2 horas

### 4.1 Criar DietaTab.tsx

**Arquivo:** `src/features/my-easy-fitness/components/tabs/DietaTab.tsx`

Extrair linhas 759-957 do FitnessVisualizationPanel.

### Critério de Conclusão
- [ ] DietaTab é um arquivo separado (~200 linhas)
- [ ] Props tipadas corretamente
- [ ] Funcionalidade inalterada

---

## FASE 5: Criar EditableListField (Eliminar código duplicado)

**Problema:** 5 padrões idênticos de lista editável no PersonalInfoTab
**Impacto:** ~200 linhas de código duplicado
**Estimativa:** 2-3 horas

### 5.1 Criar EditableListField.tsx

**Arquivo:** `src/features/my-easy-fitness/components/shared/EditableListField.tsx`

```typescript
interface EditableListFieldProps {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  colorScheme: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  icon?: React.ReactNode;
}
```

### 5.2 Substituir código duplicado

Substituir os 5 blocos duplicados em PersonalInfoTab por `<EditableListField />`.

### Critério de Conclusão
- [ ] EditableListField criado e testado
- [ ] 5 blocos duplicados substituídos
- [ ] PersonalInfoTab reduzido em ~150 linhas

---

## FASE 6: Extrair PersonalInfoTab

**Problema:** PersonalInfoTab (450 linhas) está inline
**Impacto:** FitnessVisualizationPanel ainda muito grande
**Estimativa:** 2-3 horas

### 6.1 Criar PersonalInfoTab.tsx

**Arquivo:** `src/features/my-easy-fitness/components/tabs/PersonalInfoTab.tsx`

Extrair após aplicar Fase 5 (deve ter ~200 linhas agora).

### Critério de Conclusão
- [ ] PersonalInfoTab é um arquivo separado
- [ ] FitnessVisualizationPanel reduzido para ~150 linhas
- [ ] Funcionalidade inalterada

---

## FASE 7: Criar configuração de splits (workoutGenerator)

**Problema:** 6 funções getXXXSplit() com padrão idêntico
**Impacto:** ~250 linhas de código duplicado
**Estimativa:** 2-3 horas

### 7.1 Criar splitConfigs.ts

**Arquivo:** `src/features/my-easy-fitness/utils/workout/splitConfigs.ts`

```typescript
export const SPLIT_CONFIGS: Record<TrainingModality, SplitDefinition> = {
  musculacao: {
    1: [{ template: 'full_body_a', dia: 'Segunda' }],
    2: [{ template: 'full_body_a', dia: 'Segunda' }, { template: 'full_body_b', dia: 'Quinta' }],
    // ...
  },
  corrida: { /* ... */ },
  // ...
};
```

### 7.2 Criar função getSplitForModality()

```typescript
export function getSplitForModality(
  modality: TrainingModality,
  diasPorSemana: number
): SplitItem[] {
  const config = SPLIT_CONFIGS[modality];
  return config[diasPorSemana] || config[3];
}
```

### Critério de Conclusão
- [ ] 6 funções getXXXSplit() removidas
- [ ] Configuração declarativa em splitConfigs.ts
- [ ] workoutGenerator reduzido em ~200 linhas

---

## FASE 8: Unificar funções generateXXXWorkout

**Problema:** 6 funções generateXXXWorkout() com padrão idêntico
**Impacto:** ~100 linhas de código duplicado
**Estimativa:** 1-2 horas

### 8.1 Criar generateWorkoutByModality()

```typescript
export function generateWorkoutByModality(
  modality: TrainingModality,
  personalInfo: UserPersonalInfo
): Treino[] {
  const split = getSplitForModality(modality, personalInfo.diasTreinoSemana || 3);
  const templates = getTemplatesForModality(modality);

  return split.map((item) => ({
    id: generateUniqueId(),
    nome: templates[item.template].nome,
    diaSemana: item.dia,
    exercicios: processExercises(templates[item.template].exercicios, personalInfo),
  }));
}
```

### 8.2 Remover funções individuais

Remover: generateMusculacaoWorkout, generateCorridaWorkout, etc.

### Critério de Conclusão
- [ ] 6 funções removidas
- [ ] Uma função genérica as substitui
- [ ] workoutGenerator reduzido para ~500 linhas

---

## FASE 9: Criar FitnessContext (Eliminar prop drilling)

**Problema:** ~15 props passadas através de múltiplos níveis
**Impacto:** Código difícil de manter, componentes acoplados
**Estimativa:** 3-4 horas

### 9.1 Criar FitnessContext.tsx

**Arquivo:** `src/features/my-easy-fitness/contexts/FitnessContext.tsx`

```typescript
interface FitnessContextValue {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  activeTab: FitnessTab;
  isLoading: boolean;

  updatePersonalInfo: (updates: Partial<UserPersonalInfo>) => void;
  setTreinos: (treinos: Treino[]) => void;
  setDieta: (dieta: Dieta | null) => void;
  setActiveTab: (tab: FitnessTab) => void;
}
```

### 9.2 Criar FitnessProvider.tsx

Mover lógica de estado do MyEasyFitness para o Provider.

### 9.3 Atualizar componentes

Substituir props por `useFitnessContext()`.

### Critério de Conclusão
- [ ] Context criado e funcional
- [ ] MyEasyFitness simplificado
- [ ] Componentes usam context em vez de props

---

## FASE 10: Dividir useFitnessData

**Problema:** Hook com 611 linhas e 40+ funções
**Impacto:** Difícil manutenção e teste
**Estimativa:** 3-4 horas

### 10.1 Criar useFitnessProfile.ts

Funções relacionadas a personalInfo (~150 linhas).

### 10.2 Criar useFitnessWorkouts.ts

Funções relacionadas a treinos (~100 linhas).

### 10.3 Criar useFitnessDiet.ts

Funções relacionadas a dieta (~80 linhas).

### 10.4 Criar useFitnessAutoSave.ts

Lógica de auto-save e debounce (~100 linhas).

### 10.5 Atualizar useFitnessData.ts

Compor os hooks menores (~50 linhas).

### Critério de Conclusão
- [ ] 4 hooks menores criados
- [ ] Cada hook tem responsabilidade única
- [ ] useFitnessData apenas compõe os outros

---

## FASE 11: Substituir onKeyPress por onKeyDown

**Problema:** onKeyPress deprecado (15+ ocorrências)
**Impacto:** Acessibilidade, compatibilidade futura
**Estimativa:** 1 hora

### 11.1 Localizar e substituir

```typescript
// ANTES
onKeyPress={(e) => e.key === 'Enter' && action()}

// DEPOIS
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    action();
  }
}}
```

### Arquivos afetados
- FitnessChatPanel.tsx (linha 115)
- FitnessVisualizationPanel.tsx (linhas 536, 575, 676, 709, 742)
- EditableField.tsx (após extração)

### Critério de Conclusão
- [ ] 0 ocorrências de onKeyPress
- [ ] Todos os inputs funcionam com Enter

---

## FASE 12: Corrigir keys em maps

**Problema:** Index usado como key (anti-pattern React)
**Impacto:** Bugs de renderização, performance
**Estimativa:** 1 hora

### 12.1 Adicionar IDs únicos às mensagens

```typescript
// types/index.ts
export interface FitnessMessage {
  id: string; // Novo campo
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}
```

### 12.2 Gerar IDs ao criar mensagens

```typescript
const newMessage: FitnessMessage = {
  id: crypto.randomUUID(),
  role: 'user',
  content: text,
  timestamp: new Date(),
};
```

### 12.3 Usar IDs como keys

```typescript
{messages.map((message) => (
  <div key={message.id}>...
```

### Critério de Conclusão
- [ ] Mensagens têm IDs únicos
- [ ] Nenhum map usa index como key

---

## FASE 13: Adicionar memoização

**Problema:** Componentes rerenderizam desnecessariamente
**Impacto:** Performance
**Estimativa:** 2-3 horas

### 13.1 Memoizar componentes de tab

```typescript
export const VisaoGeralTab = memo(function VisaoGeralTab({...}) {...});
export const PersonalInfoTab = memo(function PersonalInfoTab({...}) {...});
export const TreinosTab = memo(function TreinosTab({...}) {...});
// etc.
```

### 13.2 Memoizar callbacks no Context

```typescript
const updatePersonalInfo = useCallback(
  (updates: Partial<UserPersonalInfo>) => {...},
  [/* deps */]
);
```

### Critério de Conclusão
- [ ] Tabs memoizados
- [ ] Callbacks memoizados no provider
- [ ] Sem re-renders desnecessários (verificar com React DevTools)

---

## FASE 14: Adicionar Error Boundary

**Problema:** Erros não tratados crasham toda a aplicação
**Impacto:** UX ruim, perda de dados
**Estimativa:** 1-2 horas

### 14.1 Criar FitnessErrorBoundary.tsx

**Arquivo:** `src/features/my-easy-fitness/components/FitnessErrorBoundary.tsx`

```typescript
export class FitnessErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Algo deu errado</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 14.2 Envolver MyEasyFitness

```typescript
<FitnessErrorBoundary>
  <FitnessProvider>
    <MyEasyFitnessContent />
  </FitnessProvider>
</FitnessErrorBoundary>
```

### Critério de Conclusão
- [ ] Error boundary criado
- [ ] Erros são capturados e exibidos graciosamente
- [ ] Usuário pode tentar novamente

---

## FASE 15: Extrair constantes de UI

**Problema:** Valores mágicos espalhados pelo código
**Impacto:** Difícil ajustar, inconsistência
**Estimativa:** 1 hora

### 15.1 Criar constants/ui.ts

```typescript
export const UI_CONFIG = {
  CHAT_PANEL_WIDTH: '28%',
  VISUALIZATION_PANEL_WIDTH: '72%',
  MESSAGE_RESPONSE_DELAY_MS: 800,
  AUTO_SAVE_DELAY_MS: 2000,
  MINUTES_PER_EXERCISE: 8,
} as const;
```

### 15.2 Substituir valores hardcoded

Buscar e substituir os valores nos arquivos.

### Critério de Conclusão
- [ ] Constantes centralizadas
- [ ] Nenhum valor mágico no código

---

## FASE 16: Dividir constants/index.ts

**Problema:** Arquivo com 983 linhas
**Impacto:** Difícil navegação, imports pesados
**Estimativa:** 2-3 horas

### 16.1 Criar arquivos separados

```
constants/
├── config.ts              # Configurações gerais
├── keywords.ts            # Keywords para parser
├── modalities.ts          # TRAINING_MODALITY_CONFIG
├── workoutTemplates.ts    # WORKOUT_TEMPLATES, CORRIDA_TEMPLATES, etc.
├── nutritionalDatabase.ts # NUTRITIONAL_DATABASE
├── foodSubstitutions.ts   # FOOD_SUBSTITUTIONS
├── injuryAlternatives.ts  # INJURY_EXERCISE_ALTERNATIVES
└── index.ts               # Re-exports
```

### Critério de Conclusão
- [ ] constants/index.ts < 50 linhas (apenas re-exports)
- [ ] Cada arquivo tem uma responsabilidade
- [ ] Imports funcionam corretamente

---

## FASE 17: Adicionar testes para workoutGenerator

**Problema:** Funções críticas sem testes
**Impacto:** Risco de regressão
**Estimativa:** 3-4 horas

### 17.1 Criar workoutGenerator.test.ts

```typescript
describe('generatePersonalizedWorkoutPlan', () => {
  it('generates correct number of workouts for each day count', () => {...});
  it('avoids exercises for joelho injury', () => {...});
  it('adjusts intensity for iniciante', () => {...});
  it('filters gym exercises for home workouts', () => {...});
});

describe('processExercises', () => {
  it('replaces exercises based on injuries', () => {...});
  it('adjusts reps for hipertrofia goal', () => {...});
});
```

### Critério de Conclusão
- [ ] ~10 testes para workoutGenerator
- [ ] Cobertura das principais funções
- [ ] Testes passando no CI

---

## FASE 18: Adicionar testes para anamneseParser

**Problema:** Parser complexo sem testes
**Impacto:** Bugs difíceis de detectar
**Estimativa:** 2-3 horas

### 18.1 Criar anamneseParser.test.ts

```typescript
describe('parseBasicInfo', () => {
  it('parses "João, 25 anos, masculino"', () => {...});
  it('parses "Maria 30 feminino"', () => {...});
  it('returns null for invalid input', () => {...});
});

describe('parseMeasurements', () => {
  it('parses "80kg 1.75m"', () => {...});
  it('parses "peso 80 altura 175"', () => {...});
});
```

### Critério de Conclusão
- [ ] ~15 testes para anamneseParser
- [ ] Casos de borda cobertos
- [ ] Testes passando

---

## Resumo das Fases

| Fase | Foco | Estimativa | Prioridade |
|------|------|------------|------------|
| 1 | Fix persistência (BUG) | 2-4h | URGENTE |
| 2 | Extrair TabButton/EditableField | 1-2h | Alta |
| 3 | Extrair VisaoGeralTab | 1-2h | Alta |
| 4 | Extrair DietaTab | 1-2h | Alta |
| 5 | Criar EditableListField | 2-3h | Alta |
| 6 | Extrair PersonalInfoTab | 2-3h | Alta |
| 7 | Configuração de splits | 2-3h | Média |
| 8 | Unificar generateXXXWorkout | 1-2h | Média |
| 9 | Criar FitnessContext | 3-4h | Média |
| 10 | Dividir useFitnessData | 3-4h | Média |
| 11 | onKeyPress → onKeyDown | 1h | Média |
| 12 | Corrigir keys em maps | 1h | Média |
| 13 | Adicionar memoização | 2-3h | Baixa |
| 14 | Error Boundary | 1-2h | Baixa |
| 15 | Extrair constantes UI | 1h | Baixa |
| 16 | Dividir constants | 2-3h | Baixa |
| 17 | Testes workoutGenerator | 3-4h | Baixa |
| 18 | Testes anamneseParser | 2-3h | Baixa |

**Total estimado:** ~35-50 horas

---

## Ordem de Execução Recomendada

```
SEMANA 1: Correções Críticas
├── Fase 1: Fix persistência (URGENTE)
├── Fase 2: Extrair TabButton/EditableField
├── Fase 3: Extrair VisaoGeralTab
└── Fase 4: Extrair DietaTab

SEMANA 2: Eliminar Código Duplicado
├── Fase 5: Criar EditableListField
├── Fase 6: Extrair PersonalInfoTab
├── Fase 7: Configuração de splits
└── Fase 8: Unificar generateXXXWorkout

SEMANA 3: Arquitetura
├── Fase 9: Criar FitnessContext
├── Fase 10: Dividir useFitnessData
├── Fase 11: onKeyPress → onKeyDown
└── Fase 12: Corrigir keys

SEMANA 4: Qualidade
├── Fase 13: Memoização
├── Fase 14: Error Boundary
├── Fase 15: Constantes UI
└── Fase 16: Dividir constants

SEMANA 5: Testes
├── Fase 17: Testes workoutGenerator
└── Fase 18: Testes anamneseParser
```

---

## Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| FitnessVisualizationPanel | 1056 linhas | ~100 linhas |
| workoutGenerator.ts | 1138 linhas | ~400 linhas |
| useFitnessData.ts | 611 linhas | ~50 linhas |
| constants/index.ts | 983 linhas | ~30 linhas |
| Campos persistidos | 10/22 | 22/22 |
| Funções duplicadas | 17 | 0 |
| Testes unitários | 0 | ~25 |
| onKeyPress | 15+ | 0 |
| Index as key | 5+ | 0 |

---

## Checklist por Fase

Cada fase deve:
- [ ] Ter branch próprio (`refactor/fase-XX-descricao`)
- [ ] Passar no build (`npm run build`)
- [ ] Passar no lint (`npm run lint`)
- [ ] Não introduzir regressões visuais
- [ ] Ter PR com descrição clara
- [ ] Ser revisado antes do merge
