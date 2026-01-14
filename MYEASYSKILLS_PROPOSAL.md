# MyEasySkills - Proposta de Novo Módulo

## 📋 Sumário Executivo

**Nome do Produto:** MyEasySkills
**Tagline:** "Transforme seus objetivos em habilidades reais"
**Objetivo:** Ferramenta de criação de planos de estudo personalizados com IA para profissionais que buscam requalificação e crescimento de carreira.

**Veredicto de Viabilidade:** ✅ **ALTAMENTE RECOMENDADO**

---

## 🎯 Análise de Viabilidade

### ✅ Por que vale a pena criar

#### 1. **Sinergia com MyEasyResume**
- Ciclo natural do usuário: estudar → atualizar currículo → conseguir emprego
- Cross-sell orgânico entre produtos
- Integração nativa: "Quais habilidades do meu CV preciso melhorar?"
- Público-alvo já validado e presente na plataforma

#### 2. **Mercado em Crescimento**
- **Educação online:** Mercado global de US$ 319 bilhões (2025)
- **Requalificação profissional:** 54% dos trabalhadores precisarão de upskilling até 2030 (World Economic Forum)
- **Público 35-40 anos:** Segmento mais ativo em transição de carreira
- **Brasil:** Crescimento de 20% ao ano em cursos online profissionalizantes

#### 3. **Diferencial Competitivo**

| Aspecto | Concorrentes | MyEasySkills |
|---------|--------------|--------------|
| **Tipo** | Ferramentas genéricas (Notion, Trello, Google Sheets) | Especializado em aprendizado profissional |
| **IA** | Sem IA ou IA básica | IA contextualizada (Gemini) + Hand-holding |
| **Foco** | Qualquer tipo de tarefa | Exclusivo para desenvolvimento de habilidades |
| **UX** | Complexo, curva de aprendizado | Conversação guiada, zero configuração |
| **Integração** | Isolado | Integrado com MyEasyResume |
| **Público** | Geral | Profissionais 35-40 anos |

#### 4. **Baixo Custo de Desenvolvimento**
- **Reaproveitamento de código:** 60-70% do MyEasyResume
- **Infraestrutura existente:** D1, Gemini AI, componentes React
- **Time-to-market:** 4-6 semanas para MVP
- **Manutenção:** Compartilha serviços com produtos existentes

#### 5. **Modelo de Monetização Claro**

**Freemium:**
- **Grátis:** 1 plano ativo + recursos básicos
- **Pro (R$ 29,90/mês):** Planos ilimitados + IA avançada + templates premium + integração com MyEasyResume
- **Bundle (R$ 49,90/mês):** MyEasyResume + MyEasySkills com desconto

**Upsell Natural:**
```
Usuário cria CV → Percebe gaps → Cria plano de estudo → Aprende → Atualiza CV
```

---

## 🎨 Naming e Branding

### Nome Recomendado: **MyEasySkills**

**Alternativas Consideradas:**
- MyEasyLearn (genérico demais)
- MyEasyGrow (ambíguo)
- MyEasyStudy (foco acadêmico, não profissional)

**Por que MyEasySkills vence:**
1. ✅ Consistente com família "MyEasy"
2. ✅ Foco claro: desenvolvimento de habilidades
3. ✅ Diferencia de plataformas acadêmicas
4. ✅ Alinha com público profissional (35-40 anos)
5. ✅ SEO: alta busca por "skills development", "professional skills"

**Cor de Marca Sugerida:**
- **Primária:** Azul (#3B82F6) - Associado a aprendizado, confiança, crescimento
- **Secundária:** Verde (#10B981) - Progresso, conquista, objetivos alcançados
- **Acento:** Amarelo (#FBBF24) - Energia, motivação, iluminação

**Ícone:**
- Lucide: `GraduationCap`, `TrendingUp`, `Brain`, `Target`

---

## 🚀 Funcionalidades Detalhadas

### 🏗️ MVP (Fase 1) - 2-3 semanas

#### 1.1 Conversação Guiada Passo-a-Passo

**Fluxo Completo:**

```typescript
// Step 1: Welcome
"👋 Olá! Vou te ajudar a criar um plano de estudos personalizado para alavancar sua carreira."
"🎯 Com minha ajuda, você vai transformar seus objetivos em um caminho claro e alcançável!"

// Step 2: Skill Selection
"💡 Primeiro, me diga: qual habilidade você quer aprender?"
"Por exemplo:"
"• Excel avançado"
"• Inglês para negócios"
"• Python"
"• Marketing Digital"
"• Gestão de Projetos"

// Step 3: Current Level
"📊 E qual seu nível atual nessa habilidade?"
Opções:
- Nenhum (Nunca tive contato)
- Básico (Já vi/usei algumas vezes)
- Intermediário (Uso regularmente, mas quero dominar)

// Step 4: Target Level
"🎯 Até que nível você quer chegar?"
Opções:
- Básico (Entender o essencial)
- Intermediário (Usar com confiança no trabalho)
- Avançado (Dominar completamente)
- Expert (Me tornar referência)

// Step 5: Time Availability
"⏰ Quanto tempo você tem disponível para estudar POR SEMANA?"
"Seja honesto! É melhor um plano realista do que um plano impossível 😊"
Exemplos: "2 horas", "5 horas", "10 horas"

// Step 6: Deadline
"📅 Quando você quer dominar [HABILIDADE]?"
"Pense em um prazo realista para seu objetivo."
Exemplos: "Em 3 meses", "Em 6 meses", "Em 1 ano"

// Step 7: Motivation
"🔥 Por último, me conte: por que você quer aprender isso?"
"Isso me ajuda a personalizar seu plano!"
Opções:
- Mudar de carreira
- Conseguir promoção no trabalho atual
- Aumentar minha renda
- Desenvolver um projeto pessoal
- Satisfação pessoal

// Step 8: Review
"📋 Perfeito! Vamos revisar tudo:"
"✓ Habilidade: [SKILL]"
"✓ Nível atual: [CURRENT_LEVEL]"
"✓ Objetivo: [TARGET_LEVEL]"
"✓ Tempo semanal: [HOURS]h"
"✓ Prazo: [DEADLINE]"
"✓ Motivação: [MOTIVATION]"
""
"👀 Está tudo certinho?"
"Se sim, digite 'gerar' para eu criar seu plano personalizado!"

// Step 9: Generating
"✨ Perfeito! Estou criando seu plano de estudos personalizado..."
"⏳ Usando Inteligência Artificial para organizar tudo da melhor forma. Isso leva apenas alguns segundos..."

// Step 10: Result
"🎉 Seu plano está pronto!"
"📚 Criei um cronograma de [X] semanas com tudo que você precisa estudar."
"👉 Veja o plano completo no painel ao lado."
"Você pode editar qualquer item, marcar como concluído e acompanhar seu progresso!"
```

#### 1.2 Geração de Plano com IA (Google Gemini)

**Prompt Engineering para Gemini:**

```typescript
const STUDY_PLAN_GENERATION_PROMPT = `
Você é um especialista em educação profissional e criação de planos de estudo personalizados.

Crie um plano de estudos detalhado com as seguintes informações:

**Dados do Usuário:**
- Habilidade a aprender: {skill_name}
- Nível atual: {current_level}
- Nível desejado: {target_level}
- Tempo disponível: {weekly_hours} horas por semana
- Prazo: {deadline_weeks} semanas
- Motivação: {motivation}

**Instruções:**

1. ESTRUTURA DO PLANO:
   - Divida em semanas (máximo {deadline_weeks} semanas)
   - Cada semana deve ter um tema/objetivo claro
   - Distribua {weekly_hours} horas semanais de forma realista
   - Inclua teoria (40%), prática (40%) e revisão (20%)

2. PARA CADA SEMANA, FORNEÇA:
   - Título da semana (ex: "Semana 1: Fundamentos de Python")
   - Lista de 3-5 tarefas específicas
   - Para cada tarefa:
     * Descrição clara (1 linha)
     * Tipo: video | article | practice | project
     * Tempo estimado em minutos
     * Link de recurso gratuito (YouTube, Coursera, Medium, etc.)

3. INCLUIR MARCOS (MILESTONES):
   - A cada 25% do progresso, definir um mini-projeto prático
   - Projeto deve validar aprendizado até aquele ponto

4. ADAPTAR AO NÍVEL:
   - Iniciantes: Mais fundamentos, ritmo gradual
   - Intermediários: Menos teoria, mais prática
   - Para expert: Foco em casos avançados e projeto final robusto

5. FORMATO DE RESPOSTA (JSON):
{
  "plan_summary": {
    "total_weeks": number,
    "estimated_completion": "DD/MM/YYYY",
    "total_hours": number,
    "main_topics": string[]
  },
  "weeks": [
    {
      "week_number": number,
      "title": string,
      "focus": string,
      "estimated_hours": number,
      "tasks": [
        {
          "description": string,
          "resource_type": "video" | "article" | "practice" | "project",
          "resource_url": string,
          "resource_title": string,
          "estimated_minutes": number
        }
      ]
    }
  ],
  "milestones": [
    {
      "week": number,
      "title": string,
      "description": string,
      "deliverable": string
    }
  ]
}

**IMPORTANTE:**
- Use apenas recursos GRATUITOS (YouTube, Coursera free, Medium, documentações oficiais)
- Links devem ser reais e funcionais
- Linguagem motivadora e acessível (público 35-40 anos)
- Evite jargões técnicos excessivos
- Seja realista com o tempo: não sobrecarregue o usuário
`;
```

#### 1.3 Preview do Plano Gerado

**Componente: `StudyPlanPreview.tsx`**

Layout:
```
┌─────────────────────────────────────────────┐
│ 📚 Seu Plano de Estudos                     │
│ Python para Iniciantes                      │
│                                             │
│ ⏰ 12 semanas • 48 horas totais            │
│ 🎯 Objetivo: Avançado                       │
│                                             │
│ [████████░░░░░░░░░░] 40% concluído         │
│                                             │
├─────────────────────────────────────────────┤
│ ✅ Semana 1: Fundamentos (Concluída)       │
│ ✅ Semana 2: Estruturas de Dados (Concluída)│
│ ▶  Semana 3: Funções e Módulos (Atual)    │
│    ☐ Assistir: Python Functions (45min)    │
│    ☐ Ler: Artigo sobre Lambda (30min)      │
│    ☐ Praticar: 10 exercícios (90min)       │
│                                             │
│ 🎯 Milestone: Mini-projeto calculadora      │
│                                             │
│ ⏭ Semana 4: Orientação a Objetos          │
│ ⏭ Semana 5: Trabalhando com Arquivos      │
│ ... (7 semanas restantes)                   │
│                                             │
│ [Salvar] [Exportar PDF] [Editar]           │
└─────────────────────────────────────────────┘
```

**Features do Preview:**
- ✅ Barra de progresso visual
- ✅ Accordion por semana (expandir/colapsar)
- ✅ Checkbox para marcar tarefas concluídas
- ✅ Links clicáveis para recursos
- ✅ Badges de tipo (🎥 Video, 📄 Artigo, 💻 Prática, 🚀 Projeto)
- ✅ Estimativa de tempo por tarefa
- ✅ Indicador de semana atual
- ✅ Edição inline (como MyEasyResume)

#### 1.4 Biblioteca de Planos

**Componente: `StudyPlanLibrary.tsx`**

**Features:**
- Listar todos os planos salvos do usuário
- Filtrar por:
  - Status: Ativos | Concluídos | Arquivados
  - Categoria: Tecnologia | Idiomas | Soft Skills | Ferramentas
  - Progresso: 0-25% | 25-50% | 50-75% | 75-100%
- Ações:
  - ⭐ Favoritar plano
  - 📊 Ver progresso detalhado
  - ✏️ Editar plano
  - 🗑️ Deletar plano
  - 📤 Exportar plano

**Card do Plano:**
```
┌────────────────────────────────┐
│ 🐍 Python para Iniciantes      │
│ ⭐ Favorito                     │
│                                │
│ [████████░░░░░░░░░░] 40%      │
│                                │
│ ⏰ 12 semanas • 6 restantes    │
│ 🔥 Streak: 7 dias              │
│ 🎯 Mudar de carreira           │
│                                │
│ Tags: [Tecnologia] [Programação]│
│                                │
│ [Continuar] [Detalhes]         │
└────────────────────────────────┘
```

---

### 🎁 Pós-MVP (Fase 2) - 1-2 semanas

#### 2.1 Tracking de Progresso Avançado

**Features:**
- **Dashboard de Progresso:**
  - Gráfico de horas estudadas por semana
  - Streak de dias consecutivos estudando
  - Taxa de conclusão (% de tarefas completadas no prazo)
  - Comparação: planejado vs. realizado

- **Notificações e Lembretes:**
  - Lembrete de estudo diário (horário configurável)
  - Alerta: "Você está atrasado 2 semanas no plano"
  - Celebração: "Parabéns! Você completou a Semana 5! 🎉"

- **Estatísticas:**
  - Total de horas estudadas
  - Habilidades em progresso
  - Habilidades concluídas
  - Tempo médio de estudo por sessão

#### 2.2 Edição Inline do Plano

**Componente: Reutilizar lógica do `ResumePreview.tsx`**

**Ações de Edição:**
- Clicar em tarefa para editar descrição
- Ajustar tempo estimado
- Adicionar/remover tarefas
- Reorganizar ordem (drag-and-drop)
- Mudar tipo de recurso
- Atualizar links

**Save State:**
- Auto-save local (localStorage)
- Sincronização com D1 a cada 30 segundos
- Indicador visual: "Salvando..." → "Salvo ✓"

#### 2.3 Templates de Planos Prontos

**Biblioteca de Templates:**

1. **Tecnologia:**
   - Python do Zero em 6 meses
   - JavaScript + React em 4 meses
   - SQL para Análise de Dados em 3 meses
   - Excel Avançado em 2 meses
   - Git e GitHub em 1 mês

2. **Idiomas:**
   - Inglês Intermediário para Profissionais em 12 meses
   - Inglês Técnico para TI em 6 meses
   - Espanhol Básico para Negócios em 8 meses

3. **Soft Skills:**
   - Oratória e Comunicação em 3 meses
   - Liderança e Gestão de Equipes em 4 meses
   - Inteligência Emocional no Trabalho em 2 meses

4. **Ferramentas:**
   - Power BI para Análise de Dados em 3 meses
   - Figma para Designers em 2 meses
   - Google Analytics em 1 mês

**Personalização de Template:**
- Usuário escolhe template
- IA ajusta baseado em:
  - Tempo disponível
  - Prazo desejado
  - Nível atual
- Permite edição completa após geração

---

### 🚀 Pós-MVP (Fase 3) - 2 semanas

#### 3.1 Integração com MyEasyResume

**Features de Integração:**

1. **Análise de Gap de Habilidades:**
```
Usuário no MyEasyResume → CV gerado
↓
[Botão: "Melhorar minhas habilidades"]
↓
IA analisa CV e vaga desejada
↓
Sugere 3-5 habilidades para aprender
↓
Cria plano de estudo para cada skill
```

2. **Sincronização Automática:**
- Ao completar plano de estudo → Adiciona skill ao CV
- Ao adicionar skill ao CV → Sugere plano de aprimoramento

3. **Smart Recommendations:**
- "Você está aplicando para Desenvolvedor Front-end. Recomendo aprender React."
- "93% dos Analistas de Dados dominam SQL. Quer criar um plano?"

#### 3.2 Gamificação Leve

**Sistema de Badges:**
- 🎯 **Focado:** 7 dias de streak
- 🔥 **Comprometido:** 30 dias de streak
- 💪 **Determinado:** 90 dias de streak
- ⭐ **Primeira Conquista:** Completou primeiro plano
- 🚀 **Multitarefa:** 3 planos ativos simultaneamente
- 🏆 **Expert:** Completou 10 planos

**Motivação Positiva:**
- "Você está 80% mais próximo do seu objetivo! Continue assim! 💪"
- "Parabéns! Você já estudou 20 horas este mês! 🎉"
- "Incrível! Você completou 15 tarefas esta semana! 🌟"

**Comparação Anônima:**
- "Você está estudando mais que 68% dos usuários! 📈"
- "Sua taxa de conclusão (85%) está acima da média (72%)! 🏅"

#### 3.3 Exportação e Compartilhamento

**Formatos de Export:**
1. **PDF Estilizado:**
   - Template profissional
   - Gráficos de progresso
   - Cronograma visual
   - Lista de recursos

2. **Integração Google Calendar:**
   - Criar eventos automáticos para sessões de estudo
   - Lembretes nativos do Google
   - Sincronização bidirecional (marcar evento como concluído = marcar tarefa)

3. **Link Público (Opcional):**
   - Gerar link compartilhável do plano
   - Útil para mentoria, grupos de estudo
   - Controle de privacidade (on/off)

4. **Export JSON/CSV:**
   - Para usuários avançados
   - Importar em outras ferramentas

---

## 🏗️ Arquitetura Técnica

### Estrutura de Pastas (Seguindo padrão MyEasyResume)

```
src/
├── features/
│   └── my-easy-skills/
│       ├── components/
│       │   ├── CreateStudyPlanModal.tsx
│       │   ├── StudyPlanChatPanel.tsx
│       │   ├── StudyPlanPreview.tsx
│       │   ├── StudyPlanLibrary.tsx
│       │   ├── StudyPlanCard.tsx
│       │   ├── WeekAccordion.tsx
│       │   ├── TaskCheckbox.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── ProgressDashboard.tsx
│       │   ├── TemplateSelector.tsx
│       │   └── BadgeDisplay.tsx
│       │
│       ├── hooks/
│       │   ├── useStudyPlanData.ts
│       │   ├── useStudyPlans.ts (CRUD com D1)
│       │   ├── useStudyPlanLibrary.ts
│       │   └── useProgressTracking.ts
│       │
│       ├── services/
│       │   ├── StudyPlanGenerationService.ts (IA)
│       │   ├── ProgressCalculationService.ts
│       │   └── StudyPlanExportService.ts (PDF, Calendar)
│       │
│       ├── types/
│       │   └── index.ts
│       │
│       ├── constants/
│       │   └── index.ts
│       │
│       └── MyEasySkills.tsx (Main Component)
│
├── lib/
│   └── api-clients/
│       └── d1-client.ts (Adicionar endpoints de study plans)
│
└── routes.ts (Adicionar ROUTES.MY_EASY_SKILLS)
```

### Modelo de Dados (TypeScript)

```typescript
// ============================================================================
// TYPES - src/features/my-easy-skills/types/index.ts
// ============================================================================

export type SkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';

export type SkillCategory =
  | 'technology'      // Python, React, SQL
  | 'language'        // Inglês, Espanhol
  | 'soft_skill'      // Liderança, Comunicação
  | 'tool'            // Excel, Power BI, Figma
  | 'business'        // Gestão, Marketing
  | 'other';

export type ResourceType = 'video' | 'article' | 'practice' | 'project' | 'book' | 'course';

export type StudyMotivation =
  | 'career_change'
  | 'promotion'
  | 'income_increase'
  | 'personal_project'
  | 'personal_satisfaction';

export type ConversationStep =
  | 'welcome'
  | 'skill_selection'
  | 'current_level'
  | 'target_level'
  | 'time_availability'
  | 'deadline'
  | 'motivation'
  | 'review'
  | 'generating'
  | 'result';

// Study Plan Profile
export interface StudyPlanProfile {
  id: string;
  user_id: string;
  skill_name: string;                // "Python", "Excel Avançado"
  skill_category: SkillCategory;
  current_level: SkillLevel;
  target_level: SkillLevel;
  weekly_hours: number;              // 2, 5, 10
  deadline_weeks: number;            // 12, 24, 52
  deadline_date: string;             // "2026-06-14"
  motivation: StudyMotivation;
  is_active: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

// Study Plan Week
export interface StudyPlanWeek {
  id: string;
  plan_id: string;
  week_number: number;               // 1, 2, 3...
  title: string;                     // "Semana 1: Fundamentos de Python"
  focus: string;                     // "Variáveis, tipos de dados, operadores"
  estimated_hours: number;           // 4
  is_completed: boolean;
  completed_at: string | null;
  tasks: StudyTask[];
}

// Study Task
export interface StudyTask {
  id: string;
  week_id: string;
  description: string;               // "Assistir tutorial sobre funções"
  resource_type: ResourceType;
  resource_url: string;
  resource_title: string;            // "Python Functions - Corey Schafer"
  estimated_minutes: number;         // 45
  is_completed: boolean;
  completed_at: string | null;
}

// Milestone (Marco do Plano)
export interface StudyMilestone {
  id: string;
  plan_id: string;
  week_number: number;               // Semana em que ocorre
  title: string;                     // "Mini-projeto: Calculadora"
  description: string;
  deliverable: string;               // "Criar calculadora com 4 operações"
  is_completed: boolean;
  completed_at: string | null;
}

// Progress Tracking
export interface StudyProgress {
  plan_id: string;
  total_weeks: number;
  completed_weeks: number;
  current_week: number;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;       // 0-100
  total_hours_planned: number;
  hours_studied: number;
  streak_days: number;               // Dias consecutivos estudando
  last_study_date: string;
  on_track: boolean;                 // Se está dentro do prazo
  weeks_behind: number;              // Semanas de atraso (se houver)
}

// Generated Study Plan (Response da IA)
export interface GeneratedStudyPlan {
  id: string;
  profile_id: string;
  plan_summary: {
    total_weeks: number;
    estimated_completion: string;
    total_hours: number;
    main_topics: string[];
  };
  weeks: StudyPlanWeek[];
  milestones: StudyMilestone[];
  created_at: Date;
}

// Study Plan Library Item (Saved Plan)
export interface StudyPlanLibraryItem {
  id: string;
  user_id: string;
  profile_id: string;
  version_name: string;              // "Python - Janeiro 2026"
  plan_data: GeneratedStudyPlan;
  progress: StudyProgress;
  tags: string[];                    // ["Tecnologia", "Programação"]
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string | null;
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  step?: ConversationStep;
  timestamp: Date;
}

// Study Plan Generation Request (Para a IA)
export interface StudyPlanGenerationRequest {
  profile: StudyPlanProfile;
  user_context?: {
    current_resume_skills?: string[];  // Para integração com MyEasyResume
    target_job_role?: string;
  };
}

// Study Plan Data State
export interface StudyPlanData {
  profile: StudyPlanProfile | null;
  generatedPlan: GeneratedStudyPlan | null;
  progress: StudyProgress | null;
  currentStep: ConversationStep;
  conversationHistory: ChatMessage[];
}

// Badge System
export type BadgeType =
  | 'first_plan'
  | 'streak_7'
  | 'streak_30'
  | 'streak_90'
  | 'completed_5'
  | 'completed_10'
  | 'multi_tasker'
  | 'early_bird'
  | 'night_owl';

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

// Template System
export interface StudyPlanTemplate {
  id: string;
  name: string;                      // "Python do Zero em 6 meses"
  skill_category: SkillCategory;
  description: string;
  target_level: SkillLevel;
  duration_weeks: number;
  weekly_hours_min: number;
  weekly_hours_max: number;
  popularity: number;                // Para ordenar por mais populares
  preview_topics: string[];          // Tópicos principais
  is_premium: boolean;
}
```

### Database Schema (Cloudflare D1)

```sql
-- ============================================================================
-- STUDY PLANS TABLES
-- ============================================================================

-- Study Plan Profiles
CREATE TABLE study_plan_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  current_level TEXT NOT NULL,
  target_level TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL,
  deadline_weeks INTEGER NOT NULL,
  deadline_date TEXT NOT NULL,
  motivation TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  is_favorite BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(uuid)
);

CREATE INDEX idx_study_plans_user ON study_plan_profiles(user_id);
CREATE INDEX idx_study_plans_active ON study_plan_profiles(user_id, is_active);

-- Study Plan Weeks
CREATE TABLE study_plan_weeks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  focus TEXT NOT NULL,
  estimated_hours REAL NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES study_plan_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_weeks_plan ON study_plan_weeks(plan_id, week_number);

-- Study Tasks
CREATE TABLE study_tasks (
  id TEXT PRIMARY KEY,
  week_id TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_url TEXT,
  resource_title TEXT,
  estimated_minutes INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (week_id) REFERENCES study_plan_weeks(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_week ON study_tasks(week_id);
CREATE INDEX idx_tasks_completed ON study_tasks(week_id, is_completed);

-- Study Milestones
CREATE TABLE study_milestones (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES study_plan_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_plan ON study_milestones(plan_id);

-- Study Sessions (Para tracking detalhado)
CREATE TABLE study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  task_id TEXT,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  session_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  FOREIGN KEY (plan_id) REFERENCES study_plan_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES study_tasks(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_user ON study_sessions(user_id, session_date);
CREATE INDEX idx_sessions_plan ON study_sessions(plan_id);

-- User Badges
CREATE TABLE user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);

-- Study Plan Templates
CREATE TABLE study_plan_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  description TEXT NOT NULL,
  target_level TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  weekly_hours_min INTEGER NOT NULL,
  weekly_hours_max INTEGER NOT NULL,
  popularity INTEGER DEFAULT 0,
  preview_topics TEXT NOT NULL, -- JSON array
  template_data TEXT NOT NULL,  -- JSON with weeks and tasks
  is_premium BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_templates_category ON study_plan_templates(skill_category);
CREATE INDEX idx_templates_popularity ON study_plan_templates(popularity DESC);
```

### API Endpoints (D1 Client)

```typescript
// ============================================================================
// src/lib/api-clients/d1-client.ts - ADICIONAR
// ============================================================================

// Study Plan Profiles
export async function getStudyPlanProfiles(userId: string): Promise<D1Response<D1StudyPlanProfile[]>>
export async function getStudyPlanProfile(planId: string): Promise<D1Response<D1StudyPlanProfile>>
export async function createStudyPlanProfile(data: CreateStudyPlanProfileInput): Promise<D1Response<D1StudyPlanProfile>>
export async function updateStudyPlanProfile(planId: string, data: Partial<CreateStudyPlanProfileInput>): Promise<D1Response<D1StudyPlanProfile>>
export async function deleteStudyPlanProfile(planId: string): Promise<D1Response<void>>
export async function toggleFavoriteStudyPlan(planId: string): Promise<D1Response<void>>

// Study Plan Weeks & Tasks
export async function getStudyPlanWeeks(planId: string): Promise<D1Response<D1StudyPlanWeek[]>>
export async function createStudyPlanWeek(data: CreateStudyPlanWeekInput): Promise<D1Response<D1StudyPlanWeek>>
export async function updateStudyPlanWeek(weekId: string, data: Partial<CreateStudyPlanWeekInput>): Promise<D1Response<D1StudyPlanWeek>>
export async function deleteStudyPlanWeek(weekId: string): Promise<D1Response<void>>

export async function getStudyTasks(weekId: string): Promise<D1Response<D1StudyTask[]>>
export async function createStudyTask(data: CreateStudyTaskInput): Promise<D1Response<D1StudyTask>>
export async function updateStudyTask(taskId: string, data: Partial<CreateStudyTaskInput>): Promise<D1Response<D1StudyTask>>
export async function toggleTaskComplete(taskId: string): Promise<D1Response<void>>

// Progress Tracking
export async function getStudyProgress(planId: string): Promise<D1Response<StudyProgress>>
export async function logStudySession(data: LogStudySessionInput): Promise<D1Response<void>>

// Badges
export async function getUserBadges(userId: string): Promise<D1Response<Badge[]>>
export async function checkAndAwardBadges(userId: string): Promise<D1Response<Badge[]>> // Auto-check conquistas

// Templates
export async function getStudyPlanTemplates(category?: SkillCategory): Promise<D1Response<StudyPlanTemplate[]>>
export async function getStudyPlanTemplate(templateId: string): Promise<D1Response<StudyPlanTemplate>>
export async function applyTemplate(templateId: string, customization: TemplateCustomization): Promise<D1Response<GeneratedStudyPlan>>
```

### Services

#### 1. StudyPlanGenerationService.ts

```typescript
// ============================================================================
// src/features/my-easy-skills/services/StudyPlanGenerationService.ts
// ============================================================================

import { geminiClient } from '../../../lib/api-clients/gemini-client';
import type { StudyPlanGenerationRequest, GeneratedStudyPlan } from '../types';

class StudyPlanGenerationService {
  /**
   * Generate a complete study plan using Gemini AI
   */
  async generateStudyPlan(request: StudyPlanGenerationRequest): Promise<GeneratedStudyPlan> {
    const { profile, user_context } = request;

    const prompt = this.buildPrompt(profile, user_context);

    const response = await geminiClient.generateContent({
      prompt,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const parsedPlan = this.parseAIResponse(response);

    return {
      id: crypto.randomUUID(),
      profile_id: profile.id,
      plan_summary: parsedPlan.plan_summary,
      weeks: parsedPlan.weeks,
      milestones: parsedPlan.milestones,
      created_at: new Date(),
    };
  }

  /**
   * Build the AI prompt based on user profile
   */
  private buildPrompt(profile: StudyPlanProfile, context?: any): string {
    // Ver STUDY_PLAN_GENERATION_PROMPT acima
    // Inclui todos os dados do perfil + contexto do MyEasyResume
  }

  /**
   * Parse AI response into structured plan
   */
  private parseAIResponse(response: string): any {
    // Parse JSON response from Gemini
    // Validate structure
    // Add IDs to weeks and tasks
  }

  /**
   * Suggest study plans based on MyEasyResume CV analysis
   */
  async suggestPlansFromResume(resumeData: any): Promise<StudyPlanProfile[]> {
    // Analyze resume skills vs. target job
    // Identify skill gaps
    // Suggest 3-5 learning paths
  }
}

export const studyPlanGenerationService = new StudyPlanGenerationService();
```

#### 2. ProgressCalculationService.ts

```typescript
// ============================================================================
// src/features/my-easy-skills/services/ProgressCalculationService.ts
// ============================================================================

class ProgressCalculationService {
  /**
   * Calculate overall progress for a study plan
   */
  calculateProgress(weeks: StudyPlanWeek[]): StudyProgress {
    const totalWeeks = weeks.length;
    const completedWeeks = weeks.filter(w => w.is_completed).length;

    const allTasks = weeks.flatMap(w => w.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.is_completed).length;

    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    const currentWeekIndex = weeks.findIndex(w => !w.is_completed);
    const currentWeek = currentWeekIndex >= 0 ? currentWeekIndex + 1 : totalWeeks;

    // Calculate if on track
    const expectedProgress = this.calculateExpectedProgress(weeks[0].created_at, totalWeeks);
    const onTrack = progressPercentage >= expectedProgress;

    return {
      plan_id: weeks[0].plan_id,
      total_weeks: totalWeeks,
      completed_weeks: completedWeeks,
      current_week: currentWeek,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percentage: progressPercentage,
      total_hours_planned: this.calculatePlannedHours(weeks),
      hours_studied: this.calculateStudiedHours(allTasks),
      streak_days: 0, // Calculated from study_sessions
      last_study_date: this.getLastStudyDate(allTasks),
      on_track: onTrack,
      weeks_behind: onTrack ? 0 : this.calculateWeeksBehind(currentWeek, totalWeeks),
    };
  }

  /**
   * Calculate expected progress based on elapsed time
   */
  private calculateExpectedProgress(startDate: string, totalWeeks: number): number {
    const start = new Date(startDate);
    const now = new Date();
    const weeksElapsed = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.round((weeksElapsed / totalWeeks) * 100), 100);
  }

  /**
   * Calculate streak days from study sessions
   */
  calculateStreak(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    // Sort sessions by date (most recent first)
    const sorted = sessions.sort((a, b) =>
      new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sorted) {
      const sessionDate = new Date(session.session_date);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }
}

export const progressCalculationService = new ProgressCalculationService();
```

#### 3. StudyPlanExportService.ts

```typescript
// ============================================================================
// src/features/my-easy-skills/services/StudyPlanExportService.ts
// ============================================================================

class StudyPlanExportService {
  /**
   * Export study plan to PDF
   */
  async exportToPDF(plan: GeneratedStudyPlan): Promise<Blob> {
    // Use jsPDF or react-pdf
    // Generate styled PDF with:
    // - Cover page with plan summary
    // - Weekly breakdown
    // - Task lists with checkboxes
    // - Progress charts
    // - Resource links
  }

  /**
   * Export to Google Calendar
   */
  async exportToGoogleCalendar(plan: GeneratedStudyPlan, userEmail: string): Promise<void> {
    // Create recurring events for each study session
    // Use Google Calendar API
    // Set reminders
  }

  /**
   * Generate shareable link
   */
  async generateShareableLink(planId: string): Promise<string> {
    // Create public UUID link
    // Store in D1 with privacy settings
    // Return URL: myeasyai.com/study-plans/share/{uuid}
  }

  /**
   * Export to JSON
   */
  exportToJSON(plan: GeneratedStudyPlan): string {
    return JSON.stringify(plan, null, 2);
  }

  /**
   * Export to CSV
   */
  exportToCSV(plan: GeneratedStudyPlan): string {
    // Convert weeks and tasks to CSV format
    // Include: Week, Task, Type, Duration, Link, Status
  }
}

export const studyPlanExportService = new StudyPlanExportService();
```

---

## 💰 Modelo de Negócio Detalhado

### Pricing Tiers

#### 🆓 Free Tier
**Preço:** R$ 0/mês

**Limites:**
- 1 plano de estudo ativo
- Geração básica com IA
- Biblioteca com até 3 planos salvos
- Recursos gratuitos apenas
- Sem integração com MyEasyResume
- Sem badges e gamificação
- Export básico (PDF simples)

**Objetivo:** Aquisição e validação de produto

---

#### ⭐ Pro Tier
**Preço:** R$ 29,90/mês

**Incluído:**
- ✅ Planos de estudo ilimitados
- ✅ IA avançada (prompts otimizados)
- ✅ Biblioteca ilimitada
- ✅ Templates premium (20+ prontos)
- ✅ Integração completa com MyEasyResume
- ✅ Sistema de badges e gamificação
- ✅ Dashboard de progresso avançado
- ✅ Notificações e lembretes personalizados
- ✅ Export premium (PDF estilizado, Google Calendar)
- ✅ Suporte prioritário

**Objetivo:** Usuários sérios sobre crescimento profissional

---

#### 🎁 Bundle: MyEasyResume + MyEasySkills
**Preço:** R$ 49,90/mês (economiza R$ 9,90)

**Incluído:**
- Tudo do MyEasyResume Pro
- Tudo do MyEasySkills Pro
- Integração nativa entre produtos
- IA que sugere habilidades do CV
- Sincronização automática de skills
- 1 consulta mensal com especialista de carreira (30min)

**Objetivo:** Maximizar LTV e cross-sell

---

### Projeções Financeiras (Conservadoras)

**Premissas:**
- 10% dos usuários de MyEasyResume migram para MyEasySkills
- 20% dos free users convertem para Pro em 3 meses
- 40% dos Pro users compram o Bundle

**Cenário 1: 1.000 usuários MyEasyResume**
```
100 usuários MyEasySkills (10% conversão)
├─ 80 Free (80%)
└─ 20 Pro (20%) → R$ 598/mês → R$ 7.176/ano

8 Bundle upgrades (40% dos Pro) → R$ 399,20/mês → R$ 4.790/ano

Total MRR: R$ 997,20
Total ARR: R$ 11.966
```

**Cenário 2: 5.000 usuários MyEasyResume**
```
500 usuários MyEasySkills
├─ 400 Free
└─ 100 Pro → R$ 2.990/mês → R$ 35.880/ano

40 Bundle upgrades → R$ 1.996/mês → R$ 23.952/ano

Total MRR: R$ 4.986
Total ARR: R$ 59.832
```

**Cenário 3: 10.000 usuários MyEasyResume**
```
1.000 usuários MyEasySkills
├─ 800 Free
└─ 200 Pro → R$ 5.980/mês → R$ 71.760/ano

80 Bundle upgrades → R$ 3.992/mês → R$ 47.904/ano

Total MRR: R$ 9.972
Total ARR: R$ 119.664
```

---

### Estratégias de Aquisição

1. **Cross-sell no MyEasyResume:**
   - Banner: "Quer aprender as habilidades que faltam no seu CV?"
   - Pop-up após geração de CV: "93% dos contratados dominam Excel. Quer criar um plano de estudos?"
   - Email drip campaign

2. **Content Marketing:**
   - Blog posts: "Como aprender Python em 6 meses"
   - YouTube: Tutoriais de planejamento de estudos
   - Instagram: Dicas de produtividade e aprendizado

3. **Parcerias:**
   - Escolas de idiomas (afiliados)
   - Plataformas de curso (Udemy, Coursera) - affiliate links
   - Influencers de carreira

4. **SEO:**
   - Keywords: "plano de estudos", "aprender python", "como estudar inglês"
   - Landing pages para cada skill popular

---

## 📊 KPIs e Métricas de Sucesso

### North Star Metric
**Taxa de Conclusão de Planos:** % de usuários que completam pelo menos 1 plano

**Meta:**
- Mês 1-3: 15%
- Mês 4-6: 25%
- Mês 7-12: 35%

---

### Métricas de Produto

1. **Aquisição:**
   - Novos usuários/semana
   - Taxa de conversão free → pro
   - Taxa de cross-sell (MyEasyResume → MyEasySkills)

2. **Ativação:**
   - % de usuários que criam primeiro plano
   - Tempo médio até criar primeiro plano
   - Taxa de onboarding completo (< 10 minutos ideal)

3. **Engajamento:**
   - DAU / MAU (Daily/Monthly Active Users)
   - Média de sessões de estudo/semana
   - Taxa de conclusão de tarefas
   - Streak médio (dias consecutivos)

4. **Retenção:**
   - Retenção D1, D7, D30 (Day 1, 7, 30)
   - Churn rate
   - Feature adoption (% usando templates, badges, export)

5. **Monetização:**
   - ARPU (Average Revenue Per User)
   - LTV (Lifetime Value)
   - CAC (Customer Acquisition Cost)
   - LTV:CAC ratio (ideal > 3:1)

6. **Qualidade:**
   - NPS (Net Promoter Score)
   - CSAT (Customer Satisfaction)
   - Taxa de planos concluídos vs. abandonados
   - Feedback qualitativo (pesquisas)

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP (Semanas 1-3)
**Objetivo:** Validar conceito e testar com early adopters

**Tarefas:**
- ✅ Setup estrutura de pastas
- ✅ Criar tipos TypeScript
- ✅ Implementar schema D1
- ✅ Desenvolver conversação guiada
- ✅ Integrar Gemini AI para geração
- ✅ Criar StudyPlanPreview component
- ✅ Implementar biblioteca básica
- ✅ Adicionar rota e navegação
- ✅ Testes internos

**Entregáveis:**
- Usuário pode criar plano personalizado
- Visualizar plano gerado
- Salvar na biblioteca
- Preview simples

---

### Fase 2: Tracking e Edição (Semana 4)
**Objetivo:** Adicionar acompanhamento de progresso

**Tarefas:**
- ✅ Implementar checkbox de tarefas
- ✅ Calcular progresso em tempo real
- ✅ Criar ProgressDashboard component
- ✅ Implementar edição inline
- ✅ Adicionar estatísticas básicas
- ✅ Testes com beta users

**Entregáveis:**
- Marcar tarefas como concluídas
- Ver progresso visual
- Editar plano inline
- Dashboard de estatísticas

---

### Fase 3: Templates e Polish (Semana 5)
**Objetivo:** Facilitar criação com templates prontos

**Tarefas:**
- ✅ Criar biblioteca de 10 templates
- ✅ Implementar TemplateSelector
- ✅ Adicionar customização de templates
- ✅ Melhorar UX/UI
- ✅ Adicionar animações
- ✅ Testes de usabilidade

**Entregáveis:**
- 10 templates profissionais
- Sistema de seleção e customização
- UX polida

---

### Fase 4: Integração e Export (Semana 6)
**Objetivo:** Conectar com MyEasyResume e permitir exports

**Tarefas:**
- ✅ Integração com MyEasyResume
- ✅ IA de análise de gap de skills
- ✅ Export PDF estilizado
- ✅ Export Google Calendar
- ✅ Links compartilháveis
- ✅ Testes end-to-end

**Entregáveis:**
- Cross-product integration
- Múltiplos formatos de export
- Share functionality

---

### Fase 5: Gamificação e Retenção (Semanas 7-8)
**Objetivo:** Aumentar engajamento e retenção

**Tarefas:**
- ✅ Sistema de badges
- ✅ Tracking de streak
- ✅ Notificações e lembretes
- ✅ Motivação contextual
- ✅ Comparações sociais
- ✅ A/B testing de features

**Entregáveis:**
- Sistema de badges completo
- Notificações push
- Features de motivação

---

### Fase 6: Monetização e Scale (Semana 9+)
**Objetivo:** Lançamento público e crescimento

**Tarefas:**
- ✅ Implementar paywall (Free/Pro)
- ✅ Stripe integration
- ✅ Bundle com MyEasyResume
- ✅ Marketing campaign
- ✅ SEO optimization
- ✅ Analytics e tracking

**Entregáveis:**
- Sistema de pagamento funcional
- Landing pages otimizadas
- Campanhas de marketing ativas

---

## 🎯 Go-to-Market Strategy

### Pré-Lançamento (2 semanas antes)

1. **Teaser Campaign:**
   - Email para base MyEasyResume: "Novidade chegando!"
   - Social media: Sneak peeks
   - Blog post: "O que vem por aí"

2. **Beta Testing:**
   - Convidar 50 usuários VIP
   - Coletar feedback intensivo
   - Ajustar baseado em insights

3. **Content Creation:**
   - 5 blog posts prontos
   - 10 posts social media agendados
   - 3 vídeos de demo

---

### Lançamento (Dia 1)

1. **Announcement:**
   - Email blast para toda base
   - Posts em todas redes sociais
   - Press release (se aplicável)

2. **Oferta de Lançamento:**
   - 30% OFF no primeiro mês (Pro)
   - 50% OFF no Bundle (primeiros 100)
   - Early adopter badge exclusivo

3. **Live Demo:**
   - YouTube Live mostrando produto
   - Q&A em tempo real
   - Testimonials de beta testers

---

### Pós-Lançamento (Primeiras 4 semanas)

1. **Conteúdo Contínuo:**
   - 2 blog posts/semana
   - 5 posts social media/semana
   - 1 vídeo tutorial/semana

2. **User Acquisition:**
   - Google Ads (keywords específicos)
   - Facebook/Instagram Ads
   - Retargeting de visitantes

3. **Engagement:**
   - Email drip campaign (welcome series)
   - In-app tooltips e onboarding
   - Webinars semanais

4. **Otimização:**
   - A/B testing de landing pages
   - Análise de funil de conversão
   - Iteração rápida baseada em dados

---

## 🤝 Integração com Ecossistema MyEasy

### 1. MyEasyResume Integration

**Fluxo 1: Resume → Skills**
```
Usuário gera CV no MyEasyResume
↓
[Botão: "Melhorar Habilidades"]
↓
IA analisa CV vs. mercado
↓
Sugere 3-5 skills para aprender
↓
Cria planos de estudo automaticamente
```

**Fluxo 2: Skills → Resume**
```
Usuário completa plano no MyEasySkills
↓
[Notificação: "Parabéns! Adicionar ao CV?"]
↓
Skill automaticamente adicionada ao MyEasyResume
↓
CV atualizado e otimizado
```

---

### 2. MyEasyContent Integration (Futuro)

**Fluxo:**
```
Criador de conteúdo precisa aprender novo tool
↓
Cria plano: "Dominar Canva em 4 semanas"
↓
MyEasyContent sugere: "Quer criar posts sobre seu aprendizado?"
↓
Duplo benefício: aprende + cria conteúdo
```

---

### 3. Dashboard Unificado

**Visão do Usuário:**
```
┌─────────────────────────────────────────────┐
│ MyEasyAI Dashboard                          │
├─────────────────────────────────────────────┤
│ 📄 MyEasyResume                             │
│    → Último CV: Desenvolvedor Front-end     │
│    → Skills: React, TypeScript, CSS         │
│                                             │
│ 📚 MyEasySkills                             │
│    → Plano ativo: Python (60% completo)     │
│    → Próxima tarefa: Funções Lambda         │
│    → Streak: 12 dias 🔥                     │
│                                             │
│ 💡 Sugestão: Adicione Python ao seu CV!    │
└─────────────────────────────────────────────┘
```

---

## 📚 Recursos e Referências

### Bibliotecas Recomendadas

1. **PDF Generation:**
   - `@react-pdf/renderer` - Criar PDFs com React components
   - `jspdf` - Alternativa mais leve

2. **Calendar Integration:**
   - `@googleapis/calendar` - Google Calendar API
   - `ical-generator` - Gerar arquivos .ics

3. **Progress Visualization:**
   - `recharts` - Gráficos React
   - `react-circular-progressbar` - Progress circles

4. **Drag and Drop:**
   - `@dnd-kit/core` - Reordenar tarefas

5. **Notifications:**
   - `react-hot-toast` - Já usamos
   - Push notifications via Service Workers

---

### Inspirações de Produto

1. **Duolingo:**
   - Gamificação bem implementada
   - Streak system motivacional
   - Micro-learning approach

2. **Notion:**
   - Templates system
   - Flexibilidade de edição
   - Clean UX

3. **Trello:**
   - Visualização de progresso
   - Simplicidade

4. **Coursera:**
   - Planos de aprendizado estruturados
   - Certificações

---

### Competidores (Análise)

| Produto | Força | Fraqueza | Nossa Vantagem |
|---------|-------|----------|----------------|
| **Notion** | Flexível, poderoso | Curva de aprendizado, genérico | Especialização + IA + Hand-holding |
| **Trello** | Simples, visual | Não focado em estudo | IA generativa + Templates + Tracking |
| **Coursera** | Conteúdo de qualidade | Não cria planos personalizados | Personalização total + Integração CV |
| **Google Sheets** | Grátis, familiar | Manual, sem IA | Automação + Inteligência + UX moderna |

**Conclusão:** Nenhum competitor oferece a combinação de:
- IA personalizada
- Foco em profissionais
- Integração com CV
- Hand-holding UX
- Gamificação leve

---

## ✅ Checklist de Validação de Mercado

Antes de começar desenvolvimento, validar:

- [ ] Pesquisa com 50+ usuários MyEasyResume
  - "Você gostaria de uma ferramenta de planos de estudo?"
  - "Quanto pagaria por isso?"
  - "Quais skills você quer aprender?"

- [ ] Análise de busca (Google Trends)
  - Volume de "plano de estudos"
  - Volume de "aprender [skill]"
  - Tendência crescente/decrescente

- [ ] Benchmark de preço
  - Pesquisar pricing de competitors
  - Testar sensibilidade ao preço (Van Westendorp)

- [ ] Protótipo clickable (Figma)
  - Testar com 20 usuários
  - Medir compreensão e engajamento
  - Identificar pontos de fricção

- [ ] Landing page de pré-venda
  - Criar MVP de marketing
  - Oferecer early bird discount
  - Meta: 100 sign-ups em 2 semanas

**Se ≥80% das validações forem positivas → GO!**

---

## 🎯 Resumo Executivo - TL;DR

### Por que criar MyEasySkills?

1. ✅ **Mercado validado:** US$ 319bi em edtech
2. ✅ **Sinergia perfeita:** Complementa MyEasyResume
3. ✅ **Baixo custo:** 60-70% de código reaproveitado
4. ✅ **Diferencial claro:** IA + Hand-holding + Integração CV
5. ✅ **Monetização óbvia:** Freemium + Bundle

### O que é?

Ferramenta de criação de planos de estudo personalizados com IA para profissionais 35-40 anos que buscam requalificação.

### Como funciona?

1. Conversação guiada (igual MyEasyResume)
2. IA gera cronograma semanal personalizado
3. Usuário acompanha progresso
4. Gamificação motiva conclusão
5. Integra com CV

### Quanto custa desenvolver?

- **Tempo:** 6-8 semanas (MVP + Polish)
- **Equipe:** 1 dev full-stack (você)
- **Infra:** R$ 0 adicional (reusa Cloudflare + Gemini)

### Quanto pode gerar?

- **1K users:** R$ 12K ARR
- **5K users:** R$ 60K ARR
- **10K users:** R$ 120K ARR

### Vale a pena?

**SIM, ABSOLUTAMENTE.** 🚀

---

## 📞 Próximos Passos Sugeridos

1. **Validação (Esta semana):**
   - Criar survey para usuários MyEasyResume
   - Analisar Google Trends
   - Pesquisar competitors

2. **Prototipagem (Próxima semana):**
   - Sketch do fluxo conversacional
   - Wireframes do StudyPlanPreview
   - Testar com 10 usuários

3. **Desenvolvimento (Semanas 3-8):**
   - Seguir roadmap detalhado acima
   - Iteração rápida
   - Testes contínuos

4. **Lançamento (Semana 9):**
   - Beta com 50 usuários
   - Ajustes finais
   - Launch público

---

**Documento criado em:** 2026-01-14
**Versão:** 1.0
**Status:** Proposta para Análise e Validação

**Próxima Revisão:** Após validação de mercado

---

