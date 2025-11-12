# 🧹 Guia: Limpeza de Usuários de Teste

## ⚠️ Problema Atual

Você tem **114 usuários de teste** acumulados no Supabase, causando erro **422 (Unprocessable Content)** ao tentar criar novos usuários durante os testes E2E.

**Erro observado:**
```
POST https://abmixlwlizdyvlxrizmi.supabase.co/auth/v1/signup 422 (Unprocessable Content)
Erro ao criar conta: Failed to fetch
```

## 🎯 Solução Completa

### Problema Identificado

Você tem **2 problemas simultâneos**:

1. ❌ **114 usuários de teste acumulados** causando erro 422
2. ❌ **Falta de trigger automático** - usuários criados em `auth.users` não são salvos em `public.users`

### Passo 1: Configurar Trigger Automático (IMPORTANTE!)

**Antes de limpar, configure o trigger para evitar o problema no futuro.**

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: `abmixlwlizdyvlxrizmi`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**
5. Execute o SQL completo do arquivo **[SUPABASE_TRIGGER_SETUP.md](SUPABASE_TRIGGER_SETUP.md)**

**SQL resumido**:
```sql
-- Criar função que insere usuário em public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uuid, email, name, preferred_name, created_at, last_online, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_name', NULL),
    NOW(),
    NOW(),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'pt')
  )
  ON CONFLICT (uuid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Passo 2: Limpar Usuários de Teste

Agora limpe os 114 usuários acumulados:

```sql
-- Deletar usuários de teste de ambas as tabelas
-- Primeiro, deletar de public.users (se existir)
DELETE FROM public.users
WHERE email LIKE 'teste-%@myeasyai.test';

-- Depois, deletar de auth.users
DELETE FROM auth.users
WHERE email LIKE 'teste-%@myeasyai.test';

-- Verificar quantos usuários restaram
SELECT COUNT(*) as usuarios_restantes FROM auth.users;
SELECT COUNT(*) as usuarios_public FROM public.users;
```

### Passo 3: Verificar Resultado

Após executar, você deve ver:
- Mensagem de sucesso indicando quantos usuários foram deletados
- A contagem de usuários restantes deve ser menor

### Passo 4: Executar Testes Novamente

```bash
npm run test:e2e -- --project=chromium
```

---

## 🔧 Solução Automatizada (Recomendado para Futuro)

Para automatizar a limpeza antes dos testes, você pode configurar a service role key.

### 1. Obter Service Role Key

1. No Supabase Dashboard: **Settings** → **API**
2. Na seção **Project API keys**, copie a **service_role key** (secret)
   - ⚠️ **ATENÇÃO**: Esta chave tem privilégios de administrador - nunca exponha no frontend!

### 2. Adicionar no .env

Adicione no arquivo `.env` (NÃO commite este arquivo!):

```env
# Service Role Key (admin) - apenas para scripts backend
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 3. Executar Script de Limpeza

```bash
# Limpar usuários de teste manualmente
npm run test:e2e:cleanup

# Limpar E executar testes em sequência
npm run test:e2e:clean
```

---

## 🚨 Prevenção: Executar Limpeza Automaticamente

### Opção A: Antes de Cada Teste

Adicione no `playwright.config.ts`:

```typescript
export default defineConfig({
  // ... outras configurações
  globalSetup: './e2e/setup/global-setup.ts',
});
```

E crie `e2e/setup/global-setup.ts`:

```typescript
import { execSync } from 'child_process';

async function globalSetup() {
  console.log('🧹 Limpando usuários de teste antes de executar testes...');

  try {
    execSync('npm run test:e2e:cleanup', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Falha ao limpar usuários. Continuando com os testes...');
  }
}

export default globalSetup;
```

### Opção B: Cleanup Manual Periódico

Execute manualmente quando necessário:

```bash
npm run test:e2e:cleanup
```

---

## 📊 Verificação

### Ver Usuários de Teste Atuais

Execute no SQL Editor:

```sql
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email LIKE 'teste-%@myeasyai.test'
ORDER BY created_at DESC;
```

### Contar Usuários por Domínio

```sql
SELECT
  CASE
    WHEN email LIKE 'teste-%@myeasyai.test' THEN 'Teste'
    ELSE 'Real'
  END as tipo,
  COUNT(*) as quantidade
FROM auth.users
GROUP BY tipo;
```

---

## ✅ Checklist de Resolução

- [ ] Acessei o Supabase Dashboard
- [ ] Executei o SQL de limpeza no SQL Editor
- [ ] Verifiquei que os 114 usuários de teste foram deletados
- [ ] Executei `npm run test:e2e -- --project=chromium`
- [ ] Todos os 44 testes estão passando
- [ ] (Opcional) Configurei SUPABASE_SERVICE_ROLE_KEY para limpeza automática

---

## 🔍 Troubleshooting

### SQL retorna erro de permissão

**Solução**: Use a service role key ou execute via script com privilégios de admin.

### Alguns usuários não foram deletados

**Solução**: Execute novamente o SQL ou use o script automatizado.

### Erro 422 continua após limpeza

**Possíveis causas:**
1. Usuários não foram completamente deletados - verifique com `SELECT COUNT(*)`
2. Rate limiting do Supabase - aguarde alguns minutos
3. Restrições de quota do plano gratuito - considere upgrade

---

## 📚 Recursos Adicionais

- [Documentação Supabase Auth Admin](https://supabase.com/docs/guides/auth/managing-user-data)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- Script de limpeza: [e2e/setup/cleanup-test-users.ts](e2e/setup/cleanup-test-users.ts)

---

**Última atualização**: 2025-11-12
**Status**: 114 usuários de teste acumulados - **AÇÃO NECESSÁRIA**
