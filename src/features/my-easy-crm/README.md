# MyEasyCRM - Módulo de CRM

## Visão Geral

O MyEasyCRM é um módulo completo de Customer Relationship Management (CRM) desenvolvido para a plataforma MyEasyAI. Ele permite gerenciar contatos, empresas, negociações (deals), tarefas e atividades de forma integrada.

## Funcionalidades

### Contatos
- Cadastro completo com nome, email, telefone, cargo
- Associação a empresas
- Tags para categorização
- Origem do lead (website, indicação, redes sociais, etc.)
- Histórico de atividades por contato

### Empresas
- Cadastro com CNPJ, website, setor de atuação
- Endereço completo
- Visualização de contatos e deals relacionados
- Contadores automáticos

### Pipeline de Vendas (Deals)
- Kanban visual com drag & drop
- Fases configuráveis: Lead, Qualificação, Proposta, Negociação, Ganho, Perdido
- Probabilidade de fechamento por fase
- Valor do deal e valor ponderado
- Motivo de perda obrigatório

### Tarefas
- Tipos: Ligação, Email, Reunião, Follow-up, Prazo, Outros
- Prioridades: Baixa, Média, Alta, Urgente
- Data de vencimento com indicador de atraso
- Associação a contatos e deals

### Atividades
- Registro de ligações, emails, reuniões e notas
- Direção (enviado/recebido) para calls e emails
- Templates rápidos para agilizar o registro
- Timeline por contato e por deal

### Dashboard
- Valor total do pipeline
- Deals em andamento
- Performance mensal (ganhos x perdidos)
- Tarefas pendentes e atrasadas
- Atividades recentes

## Estrutura de Arquivos

```
src/features/my-easy-crm/
├── components/
│   ├── activities/      # Componentes de atividades
│   ├── companies/       # Componentes de empresas
│   ├── contacts/        # Componentes de contatos
│   ├── dashboard/       # Dashboard do CRM
│   ├── deals/           # Pipeline e deals
│   ├── layout/          # Layout (Sidebar, Header)
│   ├── shared/          # Componentes compartilhados
│   └── tasks/           # Componentes de tarefas
├── constants/           # Constantes (stages, types, etc.)
├── database/            # Schema SQL para Supabase
├── hooks/               # Custom hooks
├── services/            # Serviços de API
├── types/               # TypeScript interfaces
├── utils/               # Funções utilitárias
├── MyEasyCRM.tsx        # Componente principal
├── index.ts             # Exports públicos
└── README.md            # Esta documentação
```

## Instalação do Banco de Dados

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo de `database/schema.sql`
4. Execute o script
5. Verifique se as tabelas foram criadas:
   - `crm_companies`
   - `crm_contacts`
   - `crm_deals`
   - `crm_tasks`
   - `crm_activities`

## Integração com o App Principal

### Opção 1: Importação direta

```tsx
import { MyEasyCRM } from '@/features/my-easy-crm';

function App() {
  return (
    <MyEasyCRM
      userName="Guilherme"
      userEmail="guilherme@email.com"
      onLogout={() => {/* logout logic */}}
      onBackToMain={() => {/* navigate back */}}
    />
  );
}
```

### Opção 2: Rota dedicada

```tsx
// Em seu arquivo de rotas
import { MyEasyCRM } from '@/features/my-easy-crm';

const routes = [
  // ... outras rotas
  {
    path: '/crm',
    element: <MyEasyCRM />,
  },
];
```

### Opção 3: Tab no Dashboard existente

```tsx
// No componente de Dashboard ou Tabs
import { MyEasyCRM } from '@/features/my-easy-crm';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('website');

  return (
    <div>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="website">MyEasyWebsite</Tab>
        <Tab value="guru">Business Guru</Tab>
        <Tab value="crm">MyEasyCRM</Tab>
      </Tabs>

      {activeTab === 'crm' && <MyEasyCRM />}
    </div>
  );
}
```

## Props do Componente Principal

```tsx
interface MyEasyCRMProps {
  userName?: string;      // Nome do usuário logado
  userEmail?: string;     // Email do usuário logado
  onLogout?: () => void;  // Callback para logout
  onBackToMain?: () => void; // Callback para voltar ao app principal
}
```

## Usando Hooks Individualmente

Os hooks podem ser usados em componentes customizados:

```tsx
import { useContacts, useDeals, usePipeline } from '@/features/my-easy-crm';

function MyCustomComponent() {
  const { contacts, isLoading, createContact } = useContacts();
  const { pipeline, moveDealToStage } = usePipeline();

  // ...
}
```

## Usando Services Diretamente

Para integrações avançadas:

```tsx
import { ContactService, DealService } from '@/features/my-easy-crm';

// Criar contato
const contact = await ContactService.create({
  name: 'João Silva',
  email: 'joao@empresa.com',
});

// Buscar pipeline
const pipeline = await DealService.getPipeline();
```

## Customização

### Adicionando novas fases ao pipeline

Edite `constants/index.ts`:

```tsx
export const DEAL_STAGES = [
  // ... fases existentes
  {
    value: 'demo',
    label: 'Demonstração',
    color: '#8B5CF6',
    probability: 40,
  },
];
```

### Adicionando novos tipos de tarefa

```tsx
export const TASK_TYPES = [
  // ... tipos existentes
  {
    value: 'proposal',
    label: 'Proposta',
    icon: FileText,
    color: 'text-indigo-600',
  },
];
```

## Requisitos

- React 19+
- TypeScript 5+
- Tailwind CSS 4+
- Supabase Client
- Lucide React (ícones)

## Dependências Necessárias

Todas as dependências já devem estar instaladas no projeto principal:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "^0.x",
    "react": "^19.x",
    "tailwindcss": "^4.x"
  }
}
```

## Suporte

Para dúvidas ou problemas, consulte a documentação principal do MyEasyAI ou entre em contato com a equipe de desenvolvimento.

---

**MyEasyCRM v1.0** - Desenvolvido para MyEasyAI Platform
