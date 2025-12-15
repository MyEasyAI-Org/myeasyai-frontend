# Comparativo de Hospedagem Multi-Tenant para MyEasyWebsite

> **Meta:** 100.000 sites em 12 meses
> **Data:** Novembro 2025
> **Decisão:** Cloudflare R2 + Workers

---

## 📊 Resumo Executivo

| Plataforma | Custo/mês (100K sites) | Viável? | Recomendação |
|------------|------------------------|---------|--------------|
| **Cloudflare R2+Workers** | **~$5-10** | ✅ | **🏆 ESCOLHIDO** |
| Bunny CDN | ~$10-20 | ✅ | Alternativa simples |
| AWS S3+CloudFront | ~$20-50 | ✅ | Muito complexo |
| Netlify | IMPOSSÍVEL | ❌ | Limite 500 sites |
| Vercel | $500+ | ❌ | Enterprise obrigatório |

---

## 🏆 Cloudflare R2 + Workers (ESCOLHIDO)

### Visão Geral
| Item | Valor |
|------|-------|
| **Tipo** | Object Storage + Edge Computing |
| **CDN** | 300+ PoPs globais |
| **Empresa** | Cloudflare (USA) |
| **Uptime SLA** | 99.9% |

### Pricing Detalhado

#### Storage (R2)
| Faixa | Preço |
|-------|-------|
| Primeiros 10GB | **GRÁTIS** |
| Acima de 10GB | $0.015/GB/mês |

#### Operações (R2)
| Tipo | Preço | Free Tier |
|------|-------|-----------|
| Class A (write, list) | $4.50/milhão | 1M grátis/mês |
| Class B (read, head) | $0.36/milhão | 10M grátis/mês |
| Delete | **GRÁTIS** | - |

#### Workers (Compute)
| Item | Free | Paid ($5/mês) |
|------|------|---------------|
| Requests/dia | 100.000 | 10 milhões inclusos |
| Requests extras | - | $0.30/milhão |
| CPU time | 10ms/request | 30s/request |

#### Bandwidth
| | Cloudflare | Outros |
|-|------------|--------|
| Egress | **$0 (GRÁTIS)** | $0.05-0.12/GB |

### Cálculo para 100K Sites - BAIXO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO CONSERVADOR: BAIXO TRÁFEGO
═══════════════════════════════════════════════════════════════

PREMISSAS:
• 100.000 sites HTML estático
• ~50KB por site (média)
• 10 visitas/site/mês = 1M pageviews total
• ~50GB bandwidth/mês

───────────────────────────────────────────────────────────────
STORAGE (R2):
  5GB total (100K × 50KB)................ GRÁTIS (10GB free)

OPERAÇÕES:
  Uploads iniciais (100K × Class A)...... ~$0.45
  Leituras mensais (1M × Class B)........ ~$0.36

WORKERS:
  Plano Paid base........................ $5.00
  1M requests × $0.30/milhão............. $0.30

BANDWIDTH:
  50GB egress............................ $0.00 (ZERO!)

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$6-10/mês
═══════════════════════════════════════════════════════════════
```

### Cálculo para 100K Sites - ALTO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO OTIMISTA: ALTO TRÁFEGO
═══════════════════════════════════════════════════════════════

PREMISSAS:
• 100.000 sites HTML estático
• ~50KB por site (média)
• 10.000 visitas/site/mês = 1 BILHÃO pageviews total
• ~50TB bandwidth/mês (1000x mais!)

───────────────────────────────────────────────────────────────
STORAGE (R2):
  5GB................................... GRÁTIS (10GB free)

REQUESTS (Workers):
  1 bilhão requests
  - 10M inclusos no plano $5............. $0
  - 990M extras × $0.30/milhão........... $297

BANDWIDTH:
  50TB egress............................ $0 (ZERO!)

PLANO WORKERS PAID:
  Base.................................. $5

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$302/mês
═══════════════════════════════════════════════════════════════
```

### Comparação por Tráfego

| Cenário | Visitas/mês | Cloudflare | Bunny | AWS |
|---------|-------------|------------|-------|-----|
| Baixo | 1M | **$10** | $20 | $50 |
| Médio | 100M | **$35** | $200 | $500 |
| Alto | 1B | **$302** | $1.500 | $5.000 |

**Cloudflare é 5-15x mais barato em alto tráfego porque bandwidth = $0**

### Vantagens
- ✅ **Zero egress fees** - Bandwidth 100% grátis
- ✅ **Storage generoso** - 10GB grátis cobre 200K sites
- ✅ **CDN mais rápido** - 300+ PoPs, <50ms latência global
- ✅ **Wildcard DNS** - Via Workers (*.seudominio.com.br)
- ✅ **Não proíbe multi-tenant** - Permitido em todos os planos
- ✅ **API S3-compatible** - Fácil migração
- ✅ **SSL automático** - Certificados grátis

### Desvantagens
- ⚠️ Wildcard requer Worker (config extra)
- ⚠️ Curva de aprendizado Workers
- ⚠️ Dashboard pode ser confuso inicialmente

### Links
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [R2 Calculator](https://r2-calculator.cloudflare.com/)

---

## 🥈 Bunny CDN + Edge Storage (Alternativa)

### Visão Geral
| Item | Valor |
|------|-------|
| **Tipo** | CDN + Edge Storage |
| **CDN** | 100+ PoPs |
| **Empresa** | BunnyWay (Eslovênia/EU) |
| **GDPR** | ✅ Compliant |

### Pricing Detalhado

#### Storage
| Região | Preço |
|--------|-------|
| Europa/NA | $0.01/GB/mês |
| Ásia | $0.02/GB/mês |
| Latam | $0.03/GB/mês |

#### Bandwidth
| Região | Preço |
|--------|-------|
| Europa/NA | $0.01/GB |
| Ásia | $0.03/GB |
| Latam/África | $0.06/GB |

### Cálculo para 100K Sites - BAIXO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO CONSERVADOR: BAIXO TRÁFEGO
═══════════════════════════════════════════════════════════════

STORAGE:
  5GB × $0.02/GB......................... $0.10

BANDWIDTH:
  50GB × $0.03/GB (Latam)................ $1.50

CRÉDITO INICIAL (único):
  Depósito mínimo........................ $10.00

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$10-20/mês
═══════════════════════════════════════════════════════════════
```

### Cálculo para 100K Sites - ALTO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO OTIMISTA: ALTO TRÁFEGO
═══════════════════════════════════════════════════════════════

STORAGE:
  5GB × $0.02/GB......................... $0.10

BANDWIDTH:
  50TB × $0.03/GB (Latam)................ $1.500

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$1.500/mês
═══════════════════════════════════════════════════════════════
```

### Vantagens
- ✅ Empresa europeia (GDPR)
- ✅ Pricing simples e transparente
- ✅ Wildcard DNS nativo
- ✅ Dashboard intuitivo
- ✅ Suporte responsivo

### Desvantagens
- ⚠️ Bandwidth pago (diferente do Cloudflare)
- ⚠️ Menos documentação multi-tenant
- ⚠️ API menos robusta
- ⚠️ Crédito inicial $10

### Links
- [Bunny Pricing](https://bunny.net/pricing/)
- [Edge Storage](https://bunny.net/storage/)

---

## 🥉 AWS S3 + CloudFront

### Visão Geral
| Item | Valor |
|------|-------|
| **Tipo** | Object Storage + CDN |
| **CDN** | 400+ PoPs |
| **Empresa** | Amazon (USA) |
| **Uptime SLA** | 99.99% |

### Pricing Detalhado

#### S3 Storage
| Classe | Preço |
|--------|-------|
| Standard | $0.023/GB/mês |
| Intelligent-Tiering | $0.0125/GB/mês |

#### CloudFront Bandwidth
| Faixa | Preço (NA/EU) |
|-------|---------------|
| Primeiros 10TB | $0.085/GB |
| 10-50TB | $0.080/GB |
| 50-150TB | $0.060/GB |

#### CloudFront Flat-Rate (Novo 2025)
| Plano | Preço | Incluído |
|-------|-------|----------|
| Free | $0 | 3 distributions |
| Standard | $15/mês | 10M requests, 50TB, WAF |

#### Outros Custos
| Serviço | Preço |
|---------|-------|
| Route 53 (DNS) | $0.50/zona/mês |
| ACM (SSL) | Grátis |

### Cálculo para 100K Sites - BAIXO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO CONSERVADOR: BAIXO TRÁFEGO
═══════════════════════════════════════════════════════════════

S3 STORAGE:
  5GB × $0.023/GB........................ $0.12

CLOUDFRONT:
  Plano Flat-Rate Standard............... $15.00
  OU Pay-as-you-go: 50GB × $0.085........ $4.25

ROUTE 53:
  1 hosted zone.......................... $0.50

REQUESTS:
  1M × $0.0075/10K....................... $0.75

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$20-50/mês
═══════════════════════════════════════════════════════════════
```

### Cálculo para 100K Sites - ALTO TRÁFEGO

```
═══════════════════════════════════════════════════════════════
              CENÁRIO OTIMISTA: ALTO TRÁFEGO
═══════════════════════════════════════════════════════════════

S3 STORAGE:
  5GB × $0.023/GB........................ $0.12

CLOUDFRONT:
  50TB × $0.085/GB....................... $4.250

ROUTE 53:
  1 hosted zone.......................... $0.50

REQUESTS:
  1B × $0.0075/10K....................... $750

───────────────────────────────────────────────────────────────
TOTAL MENSAL ESTIMADO:                    ~$5.000/mês
═══════════════════════════════════════════════════════════════
```

### Vantagens
- ✅ Infraestrutura enterprise mais robusta
- ✅ 99.99% SLA
- ✅ Multi-tenant nativo (CloudFront SaaS Manager)
- ✅ Ecossistema AWS completo
- ✅ Flat-rate previsível

### Desvantagens
- ❌ Mais caro que Cloudflare
- ❌ Muito mais complexo de configurar
- ❌ Múltiplos serviços para gerenciar
- ❌ Billing confuso
- ❌ Surpresas de custo possíveis

### Links
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)

---

## ❌ Netlify (Atual - NÃO RECOMENDADO)

### Visão Geral
| Item | Valor |
|------|-------|
| **Tipo** | Jamstack Hosting |
| **CDN** | Global |
| **Empresa** | Netlify (USA) |

### Pricing

| Plano | Preço | Sites | Bandwidth |
|-------|-------|-------|-----------|
| Free | $0 | **500** | 100GB |
| Pro | $19/user/mês | 500 | 1TB |
| Business | $99/user/mês | 500 | 1TB |
| Enterprise | $450+/mês | Custom | Custom |

### Por que NÃO serve para 100K sites

```
═══════════════════════════════════════════════════════════════
                    ❌ IMPOSSÍVEL
═══════════════════════════════════════════════════════════════

PROBLEMA #1: Limite de sites
  Máximo por conta: 500 sites
  Sua meta: 100.000 sites
  Resultado: IMPOSSÍVEL

PROBLEMA #2: White-label proibido
  Planos Free/Pro/Business: ❌ Proibido
  Plano Enterprise: ✅ Permitido ($450+/mês)

PROBLEMA #3: Subdomínios
  Disponível: *.netlify.app
  Você quer: *.myeasyai.com.br
  Resultado: Só no Enterprise

───────────────────────────────────────────────────────────────
VEREDICTO: Não atende os requisitos
═══════════════════════════════════════════════════════════════
```

### Links
- [Netlify Pricing](https://www.netlify.com/pricing/)

---

## ❌ Vercel (NÃO RECOMENDADO)

### Visão Geral
| Item | Valor |
|------|-------|
| **Tipo** | Frontend Platform |
| **CDN** | Global Edge |
| **Empresa** | Vercel (USA) |
| **Foco** | Next.js |

### Pricing

| Plano | Preço | Bandwidth |
|-------|-------|-----------|
| Hobby | $0 | 100GB |
| Pro | $20/user/mês | 1TB |
| Enterprise | $500+/mês | Custom |

### Por que NÃO serve para multi-tenant

```
═══════════════════════════════════════════════════════════════
                    ❌ PROIBIDO NOS TOS
═══════════════════════════════════════════════════════════════

PROBLEMA: Terms of Service
  Hobby/Pro: Multi-tenant/white-label PROIBIDO
  Enterprise: Permitido ($500+/mês)

CUSTO MÍNIMO VIÁVEL:
  Enterprise: ~$500/mês (50x mais caro que Cloudflare!)

───────────────────────────────────────────────────────────────
VEREDICTO: Muito caro para o use case
═══════════════════════════════════════════════════════════════
```

### Links
- [Vercel Pricing](https://vercel.com/pricing)

---

## 📈 Comparativo Visual de Custos

### Custo Mensal por Número de Sites (Baixo Tráfego)

```
Custo ($)
    │
500 ┤                                          ┌─── Vercel Enterprise
    │                                          │
450 ┤                                    ┌─────┘    Netlify Enterprise
    │                                    │
    │                                    │
100 ┤                              ┌─────┘
    │                        ┌─────┘
 50 ┤               ┌────────┘                      AWS S3+CloudFront
    │         ┌─────┘
 20 ┤    ┌────┘                                    Bunny CDN
    │ ┌──┘
 10 ┤─┘                                           Cloudflare R2+Workers
    │
  0 ┼────┬────┬────┬────┬────┬────┬────┬────┬───►
       1K   10K  25K  50K  75K 100K 150K 200K    Sites
```

### Custo Mensal com Alto Tráfego (1B requests)

```
Custo ($)
      │
5.000 ┤                                    ┌─── AWS S3+CloudFront
      │                              ┌─────┘
      │                        ┌─────┘
1.500 ┤                  ┌─────┘                 Bunny CDN
      │            ┌─────┘
      │      ┌─────┘
  500 ┤──────┘                                  Vercel Enterprise
      │
  302 ┤──────────────────────────────────────── Cloudflare R2+Workers
      │
    0 ┼────┬────┬────┬────┬────┬────┬────┬───►
         100M  200M  400M  600M  800M   1B     Requests/mês
```

### Comparativo de Features

| Feature | Cloudflare | Bunny | AWS | Netlify | Vercel |
|---------|:----------:|:-----:|:---:|:-------:|:------:|
| Bandwidth grátis | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sites ilimitados | ✅ | ✅ | ✅ | ❌ | ❌ |
| Wildcard DNS | ✅* | ✅ | ✅ | ❌ | ❌ |
| Multi-tenant permitido | ✅ | ✅ | ✅ | 💰 | 💰 |
| SSL automático | ✅ | ✅ | ✅ | ✅ | ✅ |
| API robusta | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Simplicidade | ⚠️ | ✅ | ❌ | ✅ | ✅ |
| Custo 100K sites (baixo) | **$10** | $20 | $50 | ❌ | $500 |
| Custo 100K sites (alto) | **$302** | $1.500 | $5.000 | ❌ | $500+ |

*Via Workers

---

## 🎯 Decisão Final

### Cloudflare R2 + Workers

**Motivos:**
1. **10-50x mais barato** que alternativas enterprise
2. **Zero bandwidth fees** - Único com egress grátis
3. **Escala infinita** - Suporta milhões de sites
4. **Wildcard funciona** - Via Workers
5. **Não viola TOS** - Multi-tenant permitido

### Arquitetura Escolhida

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                             │
│                           │                                 │
│                           ▼                                 │
│              meunegocio.myeasyai.com.br                     │
│                           │                                 │
│                           ▼                                 │
│              ┌────────────────────────┐                     │
│              │   Cloudflare Worker    │ ← Wildcard DNS      │
│              │   (roteamento)         │                     │
│              └───────────┬────────────┘                     │
│                          │                                  │
│                          ▼                                  │
│              ┌────────────────────────┐                     │
│              │    Cloudflare R2       │                     │
│              │  bucket: myeasyai-sites│                     │
│              │  /meunegocio/index.html│                     │
│              └────────────────────────┘                     │
│                          │                                  │
│                          ▼                                  │
│              ┌────────────────────────┐                     │
│              │   Cloudflare CDN       │ ← 300+ PoPs         │
│              │   (cache global)       │                     │
│              └───────────┬────────────┘                     │
│                          │                                  │
│                          ▼                                  │
│                      VISITANTE                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 Requisitos de Cartão de Crédito

| Serviço | Cartão Necessário? | Cobra no Free Tier? |
|---------|-------------------|---------------------|
| Conta Cloudflare | ❌ Não | - |
| Workers (free) | ❌ Não | Não |
| Workers (paid $5) | ✅ Sim | $5/mês |
| **R2 Storage** | ✅ **Sim** | **Não** (até 10GB) |

**R2 é "produto pago com free tier"** - precisa de cartão cadastrado, mas só cobra se passar dos limites gratuitos.

**Cartões aceitos:**
- Visa, Mastercard internacionais
- Cartões virtuais (Nubank, Inter, etc)
- Pode aparecer pré-autorização de ~$1 (estornada)

---

## 🔧 Guia Rápido de Configuração

### Passo 1: Criar Conta
```
cloudflare.com → Sign Up → Email + Senha → Confirmar email
```

### Passo 2: Adicionar Domínio
```
Dashboard → Add a Site → myeasyai.com.br → Free Plan
Copiar nameservers → Atualizar no registrador (Registro.br)
```

### Passo 3: Ativar R2
```
Dashboard → R2 → Purchase R2 Plan → Adicionar cartão
Criar bucket: "myeasyai-sites"
```

### Passo 4: Criar Worker
```
Dashboard → Workers & Pages → Create Worker → "site-router"
Colar código do worker (ver GUIA-IMPLEMENTACAO-CLOUDFLARE.md)
Vincular R2 bucket ao Worker
```

### Passo 5: Configurar DNS Wildcard
```
DNS → Add Record → CNAME → *.sites → worker.workers.dev → Proxy ON
```

### Passo 6: Gerar API Token
```
Perfil → API Tokens → Create Token
Permissões: R2 Edit, Workers Edit, DNS Edit
```

---

## 📚 Referências

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [R2 Pricing Calculator](https://r2-calculator.cloudflare.com/)
- [Bunny CDN Pricing](https://bunny.net/pricing/)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Netlify Pricing](https://www.netlify.com/pricing/)
- [Vercel Pricing](https://vercel.com/pricing)
- [Community: Credit Card Required](https://community.cloudflare.com/t/free-credit-card-required/399917)
