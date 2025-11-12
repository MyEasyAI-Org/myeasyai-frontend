# 🔧 Configuração de Triggers Automáticos - Supabase

## Problema

Quando um usuário é criado em `auth.users` (seja via signup ou manualmente):
1. ❌ Ele **não é automaticamente criado na tabela `public.users`**
2. ❌ Ele **não recebe acesso aos produtos MyEasyWebsite e BusinessGuru**

Atualmente, o código do `App.tsx` só cria o registro em `public.users` quando:
- O usuário faz login pela primeira vez (`SIGNED_IN` event)
- A sessão é restaurada (`INITIAL_SESSION` event)

Isso causa problemas quando:
1. Usuários são criados manualmente no Supabase Dashboard
2. Testes E2E criam usuários programaticamente
3. O frontend não dispara os eventos de autenticação

## Solução: Triggers Automáticos

Execute o SQL abaixo no Supabase para criar **triggers automáticos** que:
1. Inserem o usuário em `public.users`
2. Concedem acesso aos produtos MyEasyWebsite e BusinessGuru automaticamente

### Passo 1: Acessar SQL Editor

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: `abmixlwlizdyvlxrizmi`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**

### Passo 2: Executar SQL Completo

Cole e execute o seguinte SQL:

```sql
-- =====================================================
-- TRIGGER 1: Criar usuário na tabela public.users
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo usuário na tabela public.users
  INSERT INTO public.users (
    uuid,
    email,
    name,
    preferred_name,
    created_at,
    last_online,
    preferred_language
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Usuário'
    ),
    COALESCE(NEW.raw_user_meta_data->>'preferred_name', NULL),
    NOW(),
    NOW(),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'pt')
  )
  ON CONFLICT (uuid) DO NOTHING; -- Evita erros se já existir

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER 2: Conceder produtos padrão automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.grant_default_products()
RETURNS TRIGGER AS $$
BEGIN
  -- Conceder acesso ao MyEasyWebsite
  INSERT INTO public.user_products (
    user_uuid,
    product_name,
    product_status,
    subscribed_at,
    sites_created,
    consultations_made
  )
  VALUES (
    NEW.uuid,
    'MyEasyWebsite',
    'active',
    NOW(),
    0,
    0
  );

  -- Conceder acesso ao BusinessGuru
  INSERT INTO public.user_products (
    user_uuid,
    product_name,
    product_status,
    subscribed_at,
    sites_created,
    consultations_made
  )
  VALUES (
    NEW.uuid,
    'BusinessGuru',
    'active',
    NOW(),
    0,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa após inserir em public.users
DROP TRIGGER IF EXISTS on_user_created_grant_products ON public.users;
CREATE TRIGGER on_user_created_grant_products
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_default_products();
```

### Passo 3: Verificar Configuração

Execute para confirmar que o trigger foi criado:

```sql
-- Verificar se o trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado**: Você deve ver 1 linha com o trigger `on_auth_user_created`.

### Passo 4: Testar o Trigger

Crie um usuário de teste manualmente:

```sql
-- Criar usuário de teste no auth.users (apenas para validação)
-- Nota: Você normalmente faria isso via Dashboard ou signup
```

Depois verifique se foi criado automaticamente em `public.users`:

```sql
-- Ver usuários recentes
SELECT
  uuid,
  email,
  name,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;
```

## Como Funciona

1. **Quando**: Sempre que um novo usuário é inserido em `auth.users`
2. **O que**: O trigger `on_auth_user_created` é disparado automaticamente
3. **Ação**: A função `handle_new_user()` cria o registro correspondente em `public.users`
4. **Dados copiados**:
   - `uuid` → ID do usuário do auth
   - `email` → Email do usuário
   - `name` → full_name ou name dos metadata (ou 'Usuário' como fallback)
   - `preferred_name` → preferred_name dos metadata (se existir)
   - `preferred_language` → 'pt' como padrão
   - `created_at` e `last_online` → timestamp atual

5. **Proteção**: `ON CONFLICT DO NOTHING` evita erros se o registro já existir

## Vantagens

✅ **Automático**: Não depende do código frontend
✅ **Consistente**: Funciona para signup via UI, OAuth, admin API, etc.
✅ **Confiável**: Sempre garante que `auth.users` e `public.users` estão sincronizados
✅ **Testes E2E**: Resolve problema dos testes criarem usuários que não aparecem em `public.users`

## Limpeza de Usuários Existentes

Se você já tem usuários em `auth.users` que não estão em `public.users`, execute:

```sql
-- Criar registros em public.users para usuários que não existem lá
INSERT INTO public.users (
  uuid,
  email,
  name,
  preferred_name,
  created_at,
  last_online,
  preferred_language
)
SELECT
  au.id as uuid,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    'Usuário'
  ) as name,
  au.raw_user_meta_data->>'preferred_name' as preferred_name,
  au.created_at,
  NOW() as last_online,
  COALESCE(au.raw_user_meta_data->>'preferred_language', 'pt') as preferred_language
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.uuid
WHERE pu.uuid IS NULL; -- Apenas usuários que NÃO estão em public.users

-- Verificar quantos foram criados
SELECT COUNT(*) as usuarios_sincronizados
FROM public.users;
```

## Troubleshooting

### Erro: "permission denied for schema auth"

**Causa**: Usuário não tem permissão para criar triggers em `auth.users`

**Solução**: Execute o SQL como **service_role** (use o SQL Editor do dashboard, não o cliente JS)

### Trigger não dispara

**Verificações**:
1. Confirme que o trigger está ativo:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. Verifique se a função existe:
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_name = 'handle_new_user';
   ```

3. Teste criando um usuário via Supabase Dashboard (Authentication → Users → Add user)

### Usuário criado mas sem nome

**Causa**: Metadata `full_name` ou `name` não foi fornecido

**Solução**: O trigger usa 'Usuário' como fallback. Para corrigir:
```sql
UPDATE public.users
SET name = 'Nome Correto'
WHERE uuid = '<uuid-do-usuario>';
```

## Desabilitar Trigger (se necessário)

Se precisar desabilitar temporariamente:

```sql
-- Desabilitar
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Reabilitar
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Remover completamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

---

## ✅ Checklist de Implementação

- [ ] Acessei o Supabase Dashboard
- [ ] Executei o SQL para criar a função `handle_new_user()`
- [ ] Executei o SQL para criar o trigger `on_auth_user_created`
- [ ] Verifiquei que o trigger foi criado com sucesso
- [ ] (Opcional) Sincronizei usuários existentes
- [ ] Testei criando um novo usuário manualmente
- [ ] Confirmei que o usuário aparece automaticamente em `public.users`

---

**Última atualização**: 2025-11-12
**Autor**: Claude Code Assistant
**Projeto**: MyEasyAI - Sincronização auth.users → public.users
