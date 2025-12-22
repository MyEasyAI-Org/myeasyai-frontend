# Guia de Migração: Supabase → Cloudflare

## Visão Geral

Este guia documenta a migração gradual do MyEasyAI de Supabase para Cloudflare como stack principal.

### Stack Atual vs Nova Stack

| Componente | Antes (Supabase) | Depois (Cloudflare) |
|------------|------------------|---------------------|
| **Auth** | Supabase Auth | Supabase Auth (mantido) |
| **Database** | PostgreSQL | D1 (SQLite) |
| **Storage** | - | R2 (já em uso) |
| **API** | Supabase Client | Workers |
| **Visual** | Supabase Dashboard | Drizzle Studio |

---

## Arquitetura da Migração

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  UserManagementServiceV2                                    │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ supabase-    │  │ d1-client.ts │                        │
│  │ client.ts    │  │              │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
└─────────┼─────────────────┼────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   SUPABASE      │  │   CLOUDFLARE    │
│                 │  │                 │
│  ┌───────────┐  │  │  ┌───────────┐  │
│  │   Auth    │  │  │  │  Workers  │  │
│  │  (OAuth)  │  │  │  │   (API)   │  │
│  └───────────┘  │  │  └─────┬─────┘  │
│                 │  │        │        │
│  ┌───────────┐  │  │  ┌─────▼─────┐  │
│  │ PostgreSQL│  │  │  │    D1     │  │
│  │ (backup)  │  │  │  │ (SQLite)  │  │
│  └───────────┘  │  │  └───────────┘  │
└─────────────────┘  │                 │
                     │  ┌───────────┐  │
                     │  │    R2     │  │
                     │  │ (Storage) │  │
                     │  └───────────┘  │
                     └─────────────────┘
```

---

## Fases da Migração

### Fase 1: Setup (Atual)

**Status:** ✅ Completo

1. **Worker API criado** em `workers/api-d1/`
2. **Schema D1** definido com Drizzle ORM
3. **Cliente D1** criado no frontend
4. **Service V2** com dual-write implementado

### Fase 2: Deploy do Worker

**Status:** 🔄 Pendente

```bash
# 1. Entrar na pasta do worker
cd workers/api-d1

# 2. Instalar dependências
npm install

# 3. Criar o banco D1
npm run db:create
# Copie o database_id gerado para wrangler.toml

# 4. Rodar migrations
npm run db:migrate

# 5. Deploy do worker
npm run deploy

# 6. Anotar a URL do worker (ex: https://myeasyai-api.xxx.workers.dev)
```

### Fase 3: Configuração do Frontend

**Status:** 🔄 Pendente

1. Atualizar `.env`:
```env
VITE_CLOUDFLARE_D1_API_URL=https://myeasyai-api.xxx.workers.dev
VITE_DATABASE_MODE=supabase-primary
```

2. Testar em desenvolvimento:
```bash
npm run dev
```

3. Verificar logs do console para dual-write:
```
✅ [SUPABASE] Usuário criado: user@email.com
✅ [D1] Usuário criado: user@email.com
```

### Fase 4: Validação

**Status:** 🔄 Pendente

1. Criar script de validação para comparar dados:
```bash
# Comparar users entre Supabase e D1
npm run db:validate
```

2. Monitorar por 1-2 semanas em dual-write

### Fase 5: Flip (D1 como Primary)

**Status:** 🔄 Pendente

```env
# Mudar modo
VITE_DATABASE_MODE=d1-primary
```

Neste modo:
- Leituras vêm do D1
- Escritas vão para ambos
- Supabase é fallback para leituras

### Fase 6: Desativar Supabase DB

**Status:** 🔄 Pendente

```env
# Modo final
VITE_DATABASE_MODE=d1-only
```

---

## Estrutura de Arquivos Criados

```
myeasyai-frontend/
├── workers/
│   └── api-d1/
│       ├── src/
│       │   ├── index.ts              # Entry point (Hono)
│       │   ├── db/
│       │   │   ├── schema.ts         # Drizzle schema
│       │   │   └── index.ts          # DB client factory
│       │   └── routes/
│       │       ├── users.ts          # Users CRUD
│       │       ├── products.ts       # Products CRUD
│       │       ├── sites.ts          # Sites CRUD
│       │       └── health.ts         # Health checks
│       ├── migrations/
│       │   └── 0001_initial.sql      # Schema SQL
│       ├── wrangler.toml             # Cloudflare config
│       ├── drizzle.config.ts         # Drizzle config
│       ├── package.json              # Dependencies
│       └── tsconfig.json             # TypeScript config
│
├── src/
│   ├── lib/api-clients/
│   │   ├── supabase-client.ts        # (existente)
│   │   ├── cloudflare-client.ts      # (existente - R2)
│   │   └── d1-client.ts              # NOVO - Cliente D1
│   │
│   └── services/
│       ├── UserManagementService.ts  # (existente - legacy)
│       └── UserManagementServiceV2.ts # NOVO - Dual write
│
└── .env.example                       # Atualizado
```

---

## API Endpoints do Worker

### Users

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users/:uuid` | Busca por UUID |
| GET | `/users/email/:email` | Busca por email |
| POST | `/users` | Cria usuário |
| PATCH | `/users/:uuid` | Atualiza por UUID |
| PATCH | `/users/email/:email` | Atualiza por email |
| POST | `/users/ensure` | Upsert (login social) |
| GET | `/users/email/:email/onboarding-status` | Verifica onboarding |

### Products

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products/user/:userUuid` | Lista produtos do user |
| GET | `/products/user/:userUuid/active` | Lista produtos ativos |
| POST | `/products` | Adiciona produto |
| PATCH | `/products/:id` | Atualiza produto |
| DELETE | `/products/:id` | Remove produto |

### Sites

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/sites/user/:userUuid` | Lista sites do user |
| GET | `/sites/slug/:slug` | Busca por slug |
| GET | `/sites/slug/:slug/available` | Verifica disponibilidade |
| POST | `/sites` | Cria site |
| PATCH | `/sites/:id` | Atualiza site |
| PATCH | `/sites/slug/:slug/publish` | Publica site |
| DELETE | `/sites/:id` | Remove site |

### Health

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check básico |
| GET | `/health/db` | Verifica conexão D1 |
| GET | `/health/detailed` | Métricas completas |
| GET | `/health/ping` | Ping simples |

---

## Drizzle Studio (Visual Dashboard)

Para acessar interface visual igual ao Supabase:

```bash
cd workers/api-d1

# Configurar variáveis de ambiente
export CLOUDFLARE_ACCOUNT_ID=xxx
export CLOUDFLARE_D1_DATABASE_ID=xxx
export CLOUDFLARE_API_TOKEN=xxx

# Abrir Drizzle Studio
npm run db:studio
```

Acesse: http://localhost:4983

---

## Custos Estimados

| Usuários | Cloudflare | Supabase Pro |
|----------|------------|--------------|
| 500 | ~$5.75 | $25 |
| 1.000 | ~$6.50 | $25 |
| 5.000 | ~$15 | $25 |
| 50.000 | ~$100 | $599 |
| 100.000 | ~$220 | $599+ |

**Economia:** 60-90% dependendo da escala

---

## Troubleshooting

### Worker não responde

```bash
# Verificar logs
wrangler tail

# Verificar status
curl https://myeasyai-api.xxx.workers.dev/health
```

### Erros de CORS

Verificar `wrangler.toml`:
```toml
[vars]
CORS_ORIGIN = "https://myeasyai.com"
```

### D1 connection failed

1. Verificar `database_id` no `wrangler.toml`
2. Verificar se migrations rodaram: `npm run db:migrate`
3. Testar localmente: `npm run dev`

### Dados inconsistentes

```bash
# Script para sync manual
npm run db:sync-from-supabase
```

---

## Checklist de Migração

- [x] Worker API implementado
- [x] Schema D1 definido
- [x] Cliente D1 no frontend
- [x] Service V2 com dual-write
- [x] .env.example atualizado
- [ ] Deploy do Worker em staging
- [ ] Criar banco D1 no Cloudflare
- [ ] Rodar migrations
- [ ] Configurar variáveis no frontend
- [ ] Testar dual-write em dev
- [ ] Deploy para produção em dual-write
- [ ] Monitorar por 1-2 semanas
- [ ] Flip para d1-primary
- [ ] Monitorar por mais 1 semana
- [ ] Desativar Supabase DB

---

## Contatos

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Drizzle Docs:** https://orm.drizzle.team/docs/overview

---

**Última atualização:** Dezembro 2024
