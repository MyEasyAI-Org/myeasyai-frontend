# 🔧 Diagnóstico e Correções dos Testes E2E

## ⚠️ PROBLEMA ATUAL: Auth Hook validando CAPTCHA no Backend

### Erro Identificado
```
Erro ao criar conta: captcha verification process failed
```

### Análise
O erro vem do **backend Supabase**, não do frontend:
- ✅ Frontend: CAPTCHA desabilitado com `VITE_TEST_MODE=true`
- ❌ Backend: **Auth Hook** (Edge Function) valida CAPTCHA mesmo sem token do frontend

### Causa Raiz
O Supabase tem um **Auth Hook configurado** que:
1. Intercepta todas as requisições de signup/signin
2. Valida token CAPTCHA no backend
3. Rejeita requisições sem token válido

## 🎯 Soluções Disponíveis

### Solução 1: Desabilitar Auth Hook Temporariamente (MAIS RÁPIDA)

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione projeto: `abmixlwlizdyvlxrizmi`
3. **Authentication** → **Hooks**
4. Desabilite o hook de CAPTCHA

⚠️ **Atenção**: Desabilita CAPTCHA para todos. Reative após testes.

### Solução 2: Modificar Auth Hook (SE TIVER ACESSO AO CÓDIGO)

No código da Edge Function do Auth Hook:

```typescript
// Permitir emails de teste sem CAPTCHA
const isTestEmail = request.body.email?.includes('@myeasyai.test');

if (!isTestEmail && !captchaToken) {
  return new Response(
    JSON.stringify({ error: 'captcha verification process failed' }),
    { status: 400 }
  );
}
```

### Solução 3: Projeto Supabase Separado para Testes (MELHOR PRÁTICA)

1. Criar novo projeto Supabase exclusivo para E2E
2. Configurar SEM Auth Hooks ou CAPTCHA
3. Atualizar `.env.test` com credenciais do projeto de teste

**Vantagens:**
- Testes isolados
- Segurança mantida em produção
- Sem conflitos entre testes e desenvolvimento

---

## 📋 Resumo das Correções JÁ APLICADAS

Ajustei os testes E2E para corresponder aos seletores corretos da sua aplicação:

### 1. ✅ Seletores Corrigidos

| Antes (Errado) | Depois (Correto) | Local |
|----------------|------------------|-------|
| `text=Cadastre-se` | `text=Quero experimentar` | Hero (botão principal de cadastro) |
| `text=Entrar` | `text=Login` | NavBar (botão de login) |
| `text=/chega mais\|cadastr/i` | `[name="fullName"]` | Modal de cadastro (verificação de abertura) |

### 2. ✅ Configuração do Playwright Otimizada

- **Workers reduzidos:** De `undefined` (automático) para `2` workers
- **Motivo:** Evitar erro `ERR_INSUFFICIENT_RESOURCES` ao rodar muitos testes em paralelo

### 3. ✅ Testes Validados

Os testes de exemplo estão **100% funcionais**:
- ✅ `aplicação carrega a homepage`
- ✅ `pode visualizar botões de CTA na homepage`
- ✅ `navegação básica funciona`

---

## ⚠️ Limitação Importante: CAPTCHA

### Problema Identificado

Os testes de autenticação **não podem ser completamente automatizados** porque:

1. O formulário de cadastro usa **Cloudflare Turnstile CAPTCHA**
2. O botão "Criar conta" só é habilitado após validação do CAPTCHA:
   ```typescript
   <DSButton variant="primary" disabled={!captchaToken}>
     Criar conta
   </DSButton>
   ```
3. **CAPTCHA não pode ser bypassado em testes E2E** (é a natureza do CAPTCHA!)

### Arquivos Afetados

- ✅ `e2e/example.spec.ts` - **Funciona 100%**
- ⚠️ `e2e/auth.spec.ts` - **Bloqueado pelo CAPTCHA**
- ⚠️ `e2e/dashboard.spec.ts` - **Depende de autenticação**
- ⚠️ `e2e/site-creation.spec.ts` - **Depende de autenticação**
- ⚠️ `e2e/fixtures/auth.fixture.ts` - **Bloqueado pelo CAPTCHA**

---

## 🔧 Soluções Possíveis

### Opção 1: Desabilitar CAPTCHA em Ambiente de Teste (RECOMENDADO)

Modificar o componente `SignupModal.tsx` para desabilitar CAPTCHA quando estiver em modo de teste:

```typescript
// SignupModal.tsx
const isTestEnvironment = import.meta.env.VITE_TEST_MODE === 'true';

// No formulário:
<DSButton
  variant="primary"
  className="w-full mt-4"
  disabled={!isTestEnvironment && !captchaToken} // Desabilitar check em teste
>
  Criar conta
</DSButton>

// CAPTCHA só aparece se não for teste:
{!isTestEnvironment && (
  <Turnstile
    ref={captchaRef}
    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
    // ...
  />
)}
```

Depois criar arquivo `.env.test`:
```bash
VITE_TEST_MODE=true
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

E ajustar `playwright.config.ts`:
```typescript
webServer: {
  command: 'VITE_TEST_MODE=true npm run dev', // Windows: set VITE_TEST_MODE=true && npm run dev
  // ...
}
```

### Opção 2: Usar Turnstile em Modo de Teste

Cloudflare Turnstile oferece chaves de teste que sempre passam:

```typescript
// .env.test
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA // Chave de teste (sempre passa)
```

### Opção 3: Mock do Supabase Auth (Avançado)

Criar usuários de teste diretamente no banco sem passar pelo fluxo de signup:

```typescript
// e2e/setup/create-test-users.ts
import { supabase } from './supabase-admin';

export async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'teste@myeasyai.test',
    password: 'SenhaSegura123!',
    email_confirm: true
  });
  return data;
}
```

### Opção 4: Testes Manuais para Autenticação

Manter testes E2E apenas para funcionalidades que não exigem login:
- ✅ Homepage
- ✅ Navegação
- ✅ Visualização de planos
- ⚠️ Autenticação → **Teste Manual**
- ⚠️ Dashboard → **Teste Manual**
- ⚠️ Criação de sites → **Teste Manual**

---

## 🎯 Recomendação Final

**Implementar Opção 1** (Desabilitar CAPTCHA em modo de teste) porque:

- ✅ Simples de implementar
- ✅ Não compromete segurança em produção
- ✅ Permite testes E2E completos
- ✅ Mantém CAPTCHA funcionando normalmente para usuários reais
- ✅ Prática padrão da indústria

---

## 📊 Status Atual dos Testes

### ✅ Funcionando (3 testes)
- `example.spec.ts` - 3/3 testes passando

### ⚠️ Bloqueados por CAPTCHA (38 testes)
- `auth.spec.ts` - 11 testes
- `dashboard.spec.ts` - 15 testes
- `site-creation.spec.ts` - 12 testes

---

## 🚀 Como Testar Agora

### Testes que Funcionam:
```bash
# Executar testes de validação básica
npm run test:e2e -- example.spec.ts --project=chromium
```

### Para Habilitar Todos os Testes:

1. **Escolher uma das opções acima** (recomendo Opção 1)
2. **Implementar a solução**
3. **Executar todos os testes:**
   ```bash
   npm run test:e2e:ui
   ```

---

## 📝 Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `e2e/auth.spec.ts` | ✅ Seletores corrigidos (`Login`, `Quero experimentar`) |
| `e2e/example.spec.ts` | ✅ Seletores corrigidos, testes passando |
| `e2e/fixtures/auth.fixture.ts` | ✅ Seletores corrigidos |
| `playwright.config.ts` | ✅ Workers reduzidos para 2 |

---

## 💡 Próximos Passos

1. **Decidir qual solução implementar** para o CAPTCHA
2. **Implementar a solução escolhida**
3. **Executar:** `npm run test:e2e:ui`
4. **Validar** que todos os 41 testes passam
5. **Commitar** as mudanças

---

**Data:** 2025-11-11
**Status:** Testes básicos funcionando, autenticação bloqueada por CAPTCHA
**Ação Necessária:** Implementar bypass de CAPTCHA para testes
