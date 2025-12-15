# Guia de Implementação: Cloudflare R2 + Workers para MyEasyWebsite

> **Status:** Em Andamento - Etapa 1
> **Data:** Novembro 2025
> **Objetivo:** Migrar hospedagem de sites do Netlify para Cloudflare
> **Domínio:** myeasyai.com (GoDaddy)

---

## 📋 Visão Geral do Processo

```
┌─────────────────────────────────────────────────────────────┐
│                    ETAPAS DA MIGRAÇÃO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ETAPA 1: Setup Cloudflare (Manual - Dashboard)             │
│     └─► Domínio, R2, Tokens                                 │
│                                                             │
│  ETAPA 2: Worker de Roteamento (Cloudflare Dashboard)       │
│     └─► Código que roteia subdomain → R2                    │
│                                                             │
│  ETAPA 3: Cloudflare Client (Código)                        │
│     └─► src/lib/api-clients/cloudflare-client.ts            │
│                                                             │
│  ETAPA 4: Deployment Service (Código)                       │
│     └─► src/services/CloudflareDeploymentService.ts         │
│                                                             │
│  ETAPA 5: Componente de Deploy (Código)                     │
│     └─► src/components/CloudflareDeploy.tsx                 │
│                                                             │
│  ETAPA 6: Integração no MyEasyWebsite (Código)              │
│     └─► Trocar Netlify por Cloudflare                       │
│                                                             │
│  ETAPA 7: Testes e Validação                                │
│     └─► Deploy de sites piloto                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 ETAPA 1: Setup Cloudflare (Manual)

### Objetivo
Configurar a infraestrutura base no Cloudflare Dashboard.

### Pré-requisitos
- [x] Conta Cloudflare criada
- [x] Cartão de crédito cadastrado (para R2)
- [ ] Domínio myeasyai.com registrado no GoDaddy

### Passos

#### 1.1 Adicionar Domínio ao Cloudflare
```
Dashboard → Add a Site → myeasyai.com → Free Plan
```
**Resultado esperado:** Cloudflare fornece 2 nameservers (ex: ada.ns.cloudflare.com, bob.ns.cloudflare.com)

#### 1.2 Atualizar Nameservers no GoDaddy

```
1. Acesse: https://dcc.godaddy.com/manage/myeasyai.com/dns
2. Ou: GoDaddy → My Products → Domains → myeasyai.com → DNS

3. Na seção "Nameservers", clique em "Change"

4. Selecione "I'll use my own nameservers"

5. Cole os nameservers do Cloudflare:
   Nameserver 1: ada.ns.cloudflare.com (ou o que Cloudflare forneceu)
   Nameserver 2: bob.ns.cloudflare.com (ou o que Cloudflare forneceu)

6. Clique em "Save"

7. GoDaddy vai mostrar um aviso que pode levar até 48h para propagar
   (geralmente leva 15min a 2h)
```

**IMPORTANTE - GoDaddy:**
- NÃO delete os registros DNS existentes antes de mudar os nameservers
- O Cloudflare vai importar automaticamente os registros atuais
- Se tiver email configurado (MX records), o Cloudflare vai manter

**Resultado esperado:** Status "Active" no Cloudflare (pode levar até 24h, geralmente 1-2h)

#### 1.3 Verificar Status no Cloudflare
```
Dashboard → myeasyai.com → Overview
Status deve mostrar: "Active" com check verde
```

Se ainda mostrar "Pending":
- Verifique se os nameservers foram alterados corretamente no GoDaddy
- Use: https://dnschecker.org para verificar propagação
- Clique em "Check nameservers" no Cloudflare

#### 1.4 Ativar R2 Storage
```
Dashboard → R2 → Purchase R2 Plan → Adicionar cartão
```
**Resultado esperado:** R2 ativado, $0 cobrado (paga só pelo uso)

#### 1.5 Criar Bucket R2
```
R2 → Create Bucket → Nome: "myeasyai-sites" → Location: Auto
```
**Resultado esperado:** Bucket criado, vazio

#### 1.6 Gerar API Token
```
Perfil (canto superior direito) → API Tokens → Create Token → Custom Token

Nome: MyEasyAI Deploy Token

Permissões necessárias:
┌────────────────────────────────────────────────────────────┐
│ Permission                                    │ Access     │
├────────────────────────────────────────────────────────────┤
│ Account > Cloudflare Workers R2 Storage       │ Edit       │
│ Account > Workers Scripts                     │ Edit       │
│ Zone > DNS                                    │ Edit       │
└────────────────────────────────────────────────────────────┘

Zone Resources: Include > Specific Zone > myeasyai.com
Account Resources: Include > Specific Account > sua conta

TTL: Deixar em branco (não expira)
```
**Resultado esperado:** Token gerado (COPIE E SALVE EM LOCAL SEGURO!)

#### 1.7 Obter Account ID
```
Dashboard → Workers & Pages → lado direito da tela → Account ID
```
**Resultado esperado:** String tipo "a1b2c3d4e5f6g7h8i9j0..."

### Checklist Etapa 1
- [x] R2 ativado (cartão cadastrado)
- [ ] Domínio myeasyai.com adicionado no Cloudflare
- [ ] Nameservers atualizados no GoDaddy
- [ ] Status "Active" no Cloudflare
- [ ] Bucket "myeasyai-sites" criado
- [ ] API Token gerado e salvo
- [ ] Account ID anotado

### Variáveis que serão obtidas
```env
VITE_CLOUDFLARE_ACCOUNT_ID=seu_account_id
VITE_CLOUDFLARE_API_TOKEN=seu_token
VITE_CLOUDFLARE_R2_BUCKET=myeasyai-sites
VITE_SITE_DOMAIN=myeasyai.com
```

---

## 🔧 ETAPA 2: Worker de Roteamento

### Objetivo
Criar Worker que roteia `{slug}.myeasyai.com` → arquivo no R2.

### Passos

#### 2.1 Criar Worker
```
Dashboard → Workers & Pages → Create Application → Create Worker
Nome: "site-router"
```

#### 2.2 Código do Worker
```javascript
// site-router worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Extrai o subdomain: meunegocio.myeasyai.com → meunegocio
    const subdomain = hostname.split('.')[0];

    // Ignora subdomains reservados do sistema
    const RESERVED = ['www', 'app', 'api', 'admin', 'dashboard', 'mail', 'smtp', 'ftp'];
    if (RESERVED.includes(subdomain)) {
      return new Response('Subdomínio reservado', { status: 404 });
    }

    try {
      // Busca o HTML no R2
      const object = await env.R2_BUCKET.get(`${subdomain}/index.html`);

      if (!object) {
        return new Response('Site não encontrado', {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // Retorna o HTML com headers apropriados
      return new Response(object.body, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // 1 hora de cache
        },
      });
    } catch (error) {
      return new Response('Erro interno', { status: 500 });
    }
  },
};
```

#### 2.3 Vincular R2 ao Worker
```
Worker Settings → Variables → R2 Bucket Bindings
Variable name: R2_BUCKET
R2 bucket: myeasyai-sites
```
**Resultado esperado:** Worker consegue acessar o bucket

#### 2.4 Configurar Custom Domain (Método Preferido)
```
Worker → Settings → Triggers → Custom Domains
Adicionar: *.myeasyai.com
```
**Resultado esperado:** Wildcard configurado

#### 2.5 Configurar DNS Wildcard (alternativa se Custom Domain não funcionar)
```
DNS → myeasyai.com → Add Record

Type: CNAME
Name: *
Target: site-router.seu-subdomain.workers.dev
Proxy: ON (nuvem laranja)
TTL: Auto
```

**NOTA:** Para o domínio principal (myeasyai.com), você pode querer:
```
Type: A
Name: @
Target: 192.0.2.1 (ou CNAME para seu app principal)
Proxy: ON

Type: CNAME
Name: www
Target: myeasyai.com
Proxy: ON
```

### Checklist Etapa 2
- [ ] Worker "site-router" criado
- [ ] Código colado e deployado
- [ ] R2 Bucket vinculado ao Worker
- [ ] Custom Domain ou DNS wildcard configurado
- [ ] Teste manual: acessar teste.myeasyai.com retorna 404 (esperado, bucket vazio)

### Teste Manual
```bash
# Fazer upload manual de teste
# No dashboard R2 → myeasyai-sites → Upload

# Criar pasta: teste
# Upload arquivo: index.html

# Conteúdo do arquivo:
<html><body><h1>Teste funcionando!</h1></body></html>

# Acessar:
https://teste.myeasyai.com

# Resultado esperado: "Teste funcionando!"
```

---

## 🔧 ETAPA 3: Cloudflare Client (Código)

### Objetivo
Criar cliente HTTP para API do Cloudflare R2.

### Arquivo a criar
`src/lib/api-clients/cloudflare-client.ts`

### Funcionalidades
```typescript
// Interface do cliente
interface CloudflareClient {
  // Upload de arquivo para R2
  uploadFile(path: string, content: string | Blob): Promise<void>

  // Verificar se arquivo existe
  fileExists(path: string): Promise<boolean>

  // Deletar arquivo
  deleteFile(path: string): Promise<void>

  // Listar arquivos de um site
  listFiles(prefix: string): Promise<string[]>
}
```

### Resultado esperado
- Cliente funcional para operações R2
- Tipagem TypeScript completa
- Tratamento de erros
- Logs para debug

### Dependências
- Nenhuma nova (usa fetch nativo)

---

## 🔧 ETAPA 4: Deployment Service (Código)

### Objetivo
Criar serviço que orquestra o deploy de sites para Cloudflare.

### Arquivo a criar
`src/services/CloudflareDeploymentService.ts`

### Funcionalidades
```typescript
interface CloudflareDeploymentService {
  // Deploy completo de um site
  deployWebsite(
    siteSlug: string,
    htmlContent: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<DeployResult>

  // Verificar se slug está disponível
  isSlugAvailable(slug: string): Promise<boolean>

  // Deletar site
  deleteSite(siteSlug: string): Promise<void>

  // Obter URL do site
  getSiteUrl(siteSlug: string): string
}

interface DeployResult {
  success: boolean
  url: string
  slug: string
  error?: string
}
```

### Fluxo do deployWebsite
```
1. Validar slug (só letras, números, hífens)
2. Verificar se slug já existe (opcional: permitir sobrescrever)
3. Upload do index.html para R2: {slug}/index.html
4. Retornar URL: https://{slug}.myeasyai.com
```

### Resultado esperado
- Service funcional
- Progress callback para UI
- Validação de slug
- URL formatada corretamente

---

## 🔧 ETAPA 5: Componente de Deploy (Código)

### Objetivo
Criar componente React para interface de deploy.

### Arquivo a criar
`src/components/CloudflareDeploy.tsx`

### Funcionalidades
- Input para slug do site (com validação)
- Preview da URL final
- Botão de deploy
- Barra de progresso
- Mensagens de sucesso/erro
- Link para o site publicado

### Props
```typescript
interface CloudflareDeployProps {
  htmlContent: string           // HTML gerado do site
  suggestedSlug?: string        // Slug sugerido (nome do negócio)
  onDeploySuccess?: (url: string) => void
  onDeployError?: (error: string) => void
}
```

### Resultado esperado
- Componente visual similar ao NetlifyDeploy atual
- UX intuitiva
- Feedback de progresso
- Tratamento de erros amigável

---

## 🔧 ETAPA 6: Integração no MyEasyWebsite (Código)

### Objetivo
Substituir o deploy Netlify pelo Cloudflare no fluxo principal.

### Arquivos a modificar

#### 6.1 MyEasyWebsite.tsx
```
- Remover: import NetlifyDeploy
- Adicionar: import CloudflareDeploy
- Trocar componente no JSX
```

#### 6.2 .env
```
- Adicionar variáveis VITE_CLOUDFLARE_*
```

#### 6.3 .env.example
```
- Documentar novas variáveis
```

### Resultado esperado
- MyEasyWebsite usando Cloudflare para deploy
- Netlify code ainda existe (mas não usado)
- Variáveis de ambiente configuradas

---

## 🔧 ETAPA 7: Testes e Validação

### Objetivo
Garantir que tudo funciona antes de ir para produção.

### Testes a realizar

#### 7.1 Teste de Deploy
```
1. Criar site no MyEasyWebsite
2. Preencher dados básicos
3. Clicar em publicar
4. Verificar progresso
5. Acessar URL gerada
6. Confirmar site funcionando
```

#### 7.2 Teste de Slug Duplicado
```
1. Tentar criar site com slug já existente
2. Verificar mensagem de erro apropriada
```

#### 7.3 Teste de Atualização
```
1. Modificar site existente
2. Republicar
3. Verificar alterações refletidas
```

#### 7.4 Teste de Performance
```
1. Acessar site de diferentes regiões (ou VPN)
2. Verificar tempo de carregamento
3. Verificar headers de cache
```

### Checklist Final
- [ ] Deploy de novo site funciona
- [ ] URL correta gerada (https://slug.myeasyai.com)
- [ ] Site acessível publicamente
- [ ] HTTPS funcionando (Cloudflare fornece SSL automático)
- [ ] Cache funcionando
- [ ] Atualização de site funciona
- [ ] Erro amigável para slug duplicado
- [ ] Erro amigável para falha de rede

---

## 📁 Estrutura de Arquivos Final

```
src/
├── lib/
│   └── api-clients/
│       ├── netlify-client.ts      (manter, legado)
│       └── cloudflare-client.ts   (NOVO)
│
├── services/
│   ├── DeploymentService.ts       (manter, legado)
│   └── CloudflareDeploymentService.ts (NOVO)
│
├── components/
│   ├── NetlifyDeploy.tsx          (manter, legado)
│   └── CloudflareDeploy.tsx       (NOVO)
│
└── features/
    └── my-easy-website/
        └── MyEasyWebsite.tsx      (MODIFICAR - usar CloudflareDeploy)

.env
├── VITE_CLOUDFLARE_ACCOUNT_ID     (NOVO)
├── VITE_CLOUDFLARE_API_TOKEN      (NOVO)
├── VITE_CLOUDFLARE_R2_BUCKET      (NOVO)
└── VITE_SITE_DOMAIN               (NOVO - myeasyai.com)
```

---

## ⏱️ Ordem de Execução

```
MANUAL (você faz no Dashboard):
├── Etapa 1: Setup Cloudflare + GoDaddy ... ~30-45 min
│   ├── Adicionar domínio no Cloudflare
│   ├── Alterar nameservers no GoDaddy
│   ├── Aguardar propagação (15min - 2h)
│   ├── Criar bucket R2
│   └── Gerar API Token
│
└── Etapa 2: Worker de Roteamento ......... ~15 min

CÓDIGO (eu faço):
├── Etapa 3: cloudflare-client.ts ......... ~10 min
├── Etapa 4: CloudflareDeploymentService.ts ~15 min
├── Etapa 5: CloudflareDeploy.tsx ......... ~15 min
└── Etapa 6: Integração ................... ~10 min

VALIDAÇÃO (juntos):
└── Etapa 7: Testes ....................... ~20 min
```

---

## 🚨 Pontos de Atenção

### Migração GoDaddy → Cloudflare

**O que acontece quando você muda os nameservers:**
- DNS passa a ser gerenciado pelo Cloudflare
- GoDaddy continua sendo o registrador (dono do domínio)
- Renovação do domínio continua no GoDaddy
- Cloudflare importa os registros DNS existentes automaticamente

**Se você tiver email no domínio (Google Workspace, etc):**
- Cloudflare vai importar os registros MX
- Verifique no Cloudflare DNS se os registros MX estão lá
- Email deve continuar funcionando sem interrupção

**Tempo de propagação:**
- GoDaddy diz "até 48h", mas geralmente leva 15min a 2h
- Use https://dnschecker.org para verificar

### CORS
O upload para R2 via browser pode ter problemas de CORS. Soluções:
1. Usar Cloudflare Worker como proxy para upload
2. Ou fazer upload via backend (se tiver)

### Segurança do Token
- NUNCA commitar token no git
- Usar variáveis de ambiente
- Token no frontend é visível (considerar proxy)

### Slug Único
- Validar no banco de dados antes de criar
- Ou verificar se arquivo existe no R2

### Cache
- Sites são cacheados por 1 hora (configurável)
- Usuário pode não ver alterações imediatas
- Considerar cache purge na atualização

---

## 🌐 URLs Finais

Após configuração, os sites ficarão em:

```
https://meunegocio.myeasyai.com
https://barbearia-do-ze.myeasyai.com
https://pizzaria-bella.myeasyai.com
```

Domínio principal (opcional):
```
https://myeasyai.com → seu app principal
https://www.myeasyai.com → redireciona para myeasyai.com
```

---

## ✅ Próximo Passo

**Você precisa completar a Etapa 1 e Etapa 2 no Dashboard do Cloudflare e GoDaddy.**

### Passo a passo resumido:

1. **Cloudflare:** Adicionar domínio myeasyai.com
2. **GoDaddy:** Alterar nameservers para os do Cloudflare
3. **Aguardar:** Propagação DNS (15min - 2h)
4. **Cloudflare:** Verificar status "Active"
5. **Cloudflare:** Criar bucket R2 "myeasyai-sites"
6. **Cloudflare:** Gerar API Token
7. **Cloudflare:** Criar Worker "site-router"
8. **Cloudflare:** Configurar wildcard DNS

Quando terminar, me avise com:
1. Account ID
2. Nome do bucket criado
3. Confirmação que o domínio está "Active"
4. Confirmação que o Worker está funcionando

Então eu começo a Etapa 3 (código).
