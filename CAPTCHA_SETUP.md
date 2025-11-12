# Guia de Configuração - CAPTCHA Turnstile e Proteção de Senha Vazada

## ⚠️ STATUS ATUAL: USUÁRIOS DE TESTE ACUMULADOS

**Data**: 12/11/2025

### Situação Atual dos Testes

✅ **Frontend CAPTCHA**: Desabilitado com `VITE_TEST_MODE=true`
✅ **Backend CAPTCHA**: Desabilitado no Supabase (Enable Captcha protection: OFF)
✅ **Email Confirmation**: Desabilitado no Supabase (Confirm email: OFF)
❌ **Usuários Acumulados**: **114 usuários de teste** causando erro 422

### Erro Atual
```
POST https://abmixlwlizdyvlxrizmi.supabase.co/auth/v1/signup 422 (Unprocessable Content)
Erro ao criar conta: Failed to fetch
```

### Causa do Problema
Após múltiplas execuções de testes E2E, **114 usuários de teste** foram acumulados no banco de dados Supabase (todos com email `teste-*@myeasyai.test`). O Supabase está rejeitando novos signups devido a:
1. Rate limiting por excesso de requisições
2. Possível quota de usuários no plano gratuito
3. Acúmulo de registros não deletados

### Arquivos Modificados
- `src/components/SignupModal.tsx` - CAPTCHA desabilitado e alert de email removido
- `src/components/LoginModal.tsx` - CAPTCHA desabilitado
- `e2e/auth.spec.ts` - Seletores corrigidos
- `e2e/fixtures/auth.fixture.ts` - Ajustado para arquitetura baseada em estado
- `e2e/setup/cleanup-test-users.ts` - Script de limpeza criado

### Resultado dos Testes E2E
✅ **14/44 testes passando**
- 11/11 testes de autenticação
- 3/3 testes básicos de homepage

❌ **30/44 testes falhando**
- Todos os testes que tentam criar novos usuários
- Bloqueados por erro 422 devido a usuários acumulados

### 🎯 Ação Necessária

Para fazer os testes funcionarem, você precisa **limpar os usuários de teste**:

**Opção 1 - SQL no Supabase Dashboard (Mais Rápido)**
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione projeto: `abmixlwlizdyvlxrizmi`
3. Vá em **SQL Editor** → **New query**
4. Execute:
   ```sql
   DELETE FROM auth.users WHERE email LIKE 'teste-%@myeasyai.test';
   ```
5. Execute os testes: `npm run test:e2e -- --project=chromium`

**Opção 2 - Script Automatizado (Requer Service Role Key)**
1. Obtenha a service_role key: **Settings** → **API** → **Project API keys**
2. Adicione no `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
   ```
3. Execute: `npm run test:e2e:cleanup`
4. Execute os testes: `npm run test:e2e`

**📄 Guia Completo**: Veja [LIMPEZA_USUARIOS_TESTE.md](LIMPEZA_USUARIOS_TESTE.md) para instruções detalhadas

---

Este guia contém instruções completas para configurar o Cloudflare Turnstile (CAPTCHA) e habilitar a proteção de senha vazada no Supabase.

## 📋 O que foi implementado

⏸️ **Cloudflare Turnstile (CAPTCHA)** nos formulários de:
- Cadastro (SignupModal) - **TEMPORARIAMENTE DESABILITADO**
- Login (LoginModal) - **TEMPORARIAMENTE DESABILITADO**

✅ **Integração com Supabase Auth**
- Token do CAPTCHA enviado automaticamente para o Supabase (quando reativado)
- Validação no lado do servidor

## 🔧 Configuração do Cloudflare Turnstile

### 1. Criar conta no Cloudflare (se ainda não tiver)

1. Acesse: https://dash.cloudflare.com/sign-up
2. Crie sua conta gratuitamente

### 2. Configurar Turnstile

1. Faça login no Cloudflare Dashboard: https://dash.cloudflare.com/
2. No menu lateral, procure por **Turnstile**
3. Clique em **"Add site"** (Adicionar site)
4. Preencha os campos:
   - **Site name**: `MyEasyAI` (ou o nome que preferir)
   - **Domain**: `radiant-druid-0e3862.netlify.app` (seu domínio de produção)
   - Para desenvolvimento local, adicione também: `localhost`
   - **Widget Mode**: Selecione **"Managed"** (recomendado - é invisível para usuários reais)
5. Clique em **"Create"**

### 3. Copiar as chaves

Após criar o site, você verá duas chaves:

- **Site Key** (chave pública) - pode ser exposta no frontend
- **Secret Key** (chave secreta) - NUNCA exponha esta chave

### 4. Adicionar a Site Key no projeto

Abra o arquivo `.env` e substitua a chave placeholder:

```env
VITE_TURNSTILE_SITE_KEY=sua-site-key-aqui
```

**⚠️ IMPORTANTE**: Não adicione a Secret Key no arquivo `.env`! Ela será configurada diretamente no Supabase.

## 🔐 Configuração no Supabase

### 1. Habilitar CAPTCHA no Supabase

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto: **myeasyai-main**
3. No menu lateral, vá em: **Authentication** → **Settings** → **Bot and Abuse Protection**
4. Encontre a seção **"Enable CAPTCHA protection"**
5. Ative o toggle
6. Selecione **"Cloudflare Turnstile"** no dropdown de provider
7. Cole a **Secret Key** do Turnstile no campo indicado
8. Clique em **"Save"**

### 2. Habilitar Proteção de Senha Vazada

1. Ainda no Dashboard do Supabase, mesmo projeto
2. No menu lateral, vá em: **Authentication** → **Settings** → **Password Settings**
3. Encontre **"Leaked Password Protection"**
4. Ative o toggle para **"Enable leaked password protection"**
5. Clique em **"Save"**

**O que isso faz?**
- Verifica senhas contra o banco de dados HaveIBeenPwned.org
- Impede usuários de usar senhas que já foram comprometidas em vazamentos
- Aumenta significativamente a segurança da plataforma

## 🧪 Testando a Implementação

### Teste Local

1. Inicie o servidor de desenvolvimento:
```bash
cd myeasyai-frontend
npm run dev
```

2. Acesse a aplicação em `http://localhost:5173`

3. Tente se cadastrar ou fazer login:
   - O CAPTCHA deve aparecer automaticamente
   - O botão "Criar conta" / "Entrar" só será habilitado após validar o CAPTCHA
   - Se o CAPTCHA falhar, uma mensagem de erro será exibida

### Teste em Produção

1. Faça o deploy para Netlify:
```bash
npm run build
# Deploy via Netlify CLI ou através do dashboard
```

2. Acesse sua aplicação em: `https://radiant-druid-0e3862.netlify.app`

3. Teste os mesmos fluxos de cadastro e login

## 🎨 Personalização do Turnstile

O Turnstile está configurado com:
- **Theme**: Dark (compatível com o design da plataforma)
- **Size**: Normal
- **Mode**: Managed (invisível para usuários reais, só aparece para suspeitos)

Para alterar, edite nos arquivos `SignupModal.tsx` e `LoginModal.tsx`:

```tsx
<Turnstile
  ref={captchaRef}
  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setCaptchaToken(token)}
  onError={() => {
    setCaptchaToken('');
    alert('Erro ao validar CAPTCHA. Por favor, tente novamente.');
  }}
  onExpire={() => setCaptchaToken('')}
  options={{
    theme: 'dark',  // 'light' | 'dark' | 'auto'
    size: 'normal', // 'normal' | 'compact'
  }}
/>
```

## 📊 Monitoramento

### Dashboard do Cloudflare

Acesse o dashboard do Turnstile para ver:
- Número de desafios resolvidos
- Taxa de sucesso/falha
- Tentativas de bots bloqueadas

### Dashboard do Supabase

1. Vá em **Authentication** → **Users**
2. Monitore tentativas de cadastro/login
3. Verifique os logs em **Logs** → **Auth**

## ⚠️ Resolução de Problemas

### CAPTCHA não aparece

**Problema**: O widget do Turnstile não é exibido

**Soluções**:
1. Verifique se a `VITE_TURNSTILE_SITE_KEY` está correta no `.env`
2. Confirme que reiniciou o servidor após adicionar a chave
3. Verifique o console do navegador para erros
4. Confirme que o domínio está na lista de domínios permitidos no Cloudflare

### Erro "Invalid Site Key"

**Problema**: Mensagem de erro sobre site key inválida

**Soluções**:
1. Verifique se copiou a **Site Key** corretamente (não a Secret Key!)
2. Confirme que a chave está no arquivo `.env` com o nome correto
3. Reinicie o servidor de desenvolvimento

### CAPTCHA sempre falha

**Problema**: Token não é validado no servidor

**Soluções**:
1. Verifique se configurou a **Secret Key** no Supabase corretamente
2. Confirme que habilitou CAPTCHA protection no Supabase
3. Verifique se selecionou "Cloudflare Turnstile" como provider

### Botão permanece desabilitado

**Problema**: Botão não habilita após resolver o CAPTCHA

**Soluções**:
1. Verifique o console do navegador para erros JavaScript
2. Confirme que a função `onSuccess` está sendo chamada
3. Teste em outro navegador

## 🔒 Segurança - Boas Práticas

### ✅ Fazer

- Manter a Secret Key segura, apenas no Supabase
- Usar HTTPS em produção (já configurado no Netlify)
- Monitorar logs regularmente
- Atualizar dependências periodicamente
- Adicionar rate limiting adicional se necessário

### ❌ Não Fazer

- **NUNCA** expor a Secret Key no código frontend
- **NUNCA** commitar chaves no Git
- Não desabilitar CAPTCHA mesmo que pareça "inconveniente"
- Não usar a mesma chave em múltiplos projetos

## 📚 Recursos Adicionais

- [Documentação do Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Documentação do Supabase Auth CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha)
- [Supabase Security Advisor](https://supabase.com/dashboard/project/_/database/security-advisor)
- [Documentação @marsidev/react-turnstile](https://github.com/marsidev/react-turnstile)

## 🎉 Pronto!

Sua plataforma agora está protegida contra:
- ✅ Bots automatizados
- ✅ Ataques de força bruta
- ✅ Senhas comprometidas
- ✅ Spam de cadastros

---

## 🔄 Como Reativar o CAPTCHA

Quando precisar reativar o CAPTCHA para produção, siga estes passos:

### 1. SignupModal.tsx (`src/components/SignupModal.tsx`)

Descomentar as seguintes linhas:

```typescript
// Linha 1-7: Import
import { useState, useRef } from 'react'; // Adicionar useRef
import { Turnstile } from '@marsidev/react-turnstile';

// Linhas 23-28: Estados
const [captchaToken, setCaptchaToken] = useState<string>('');
const captchaRef = useRef<any>(null);
const isTestEnvironment = import.meta.env.VITE_TEST_MODE === 'true';

// Linhas 49-54: Validação
if (!isTestEnvironment && !captchaToken) {
  alert('Por favor, complete o desafio de segurança (CAPTCHA)');
  return;
}

// Linhas 77-85: Finally block
finally {
  if (captchaRef.current) {
    captchaRef.current.reset();
  }
  setCaptchaToken('');
}

// Linhas 229-244: Componente Turnstile
{!isTestEnvironment && (
  <Turnstile
    ref={captchaRef}
    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
    onSuccess={(token) => setCaptchaToken(token)}
    onError={() => {
      setCaptchaToken('');
      alert('Erro ao validar CAPTCHA. Por favor, tente novamente.');
    }}
    onExpire={() => setCaptchaToken('')}
    options={{
      theme: 'dark',
      size: 'normal',
    }}
  />
)}

// Linha 247: Adicionar disabled
<DSButton variant="primary" className="w-full mt-4" disabled={!isTestEnvironment && !captchaToken}>
  Criar conta
</DSButton>
```

### 2. LoginModal.tsx (`src/components/LoginModal.tsx`)

Aplicar as mesmas mudanças do SignupModal.tsx, alterando apenas:
- Botão: "Entrar" ao invés de "Criar conta"

### 3. Modo de Teste (Opcional)

Se quiser manter a capacidade de desabilitar o CAPTCHA em modo de teste:

1. Use `VITE_TEST_MODE=true` no `.env.test`
2. Execute testes com: `npm run dev -- --mode test`
3. O CAPTCHA será automaticamente desabilitado em modo de teste

---

**Última atualização**: 11/01/2025

Para dúvidas ou suporte, consulte a documentação oficial ou entre em contato com o suporte.
