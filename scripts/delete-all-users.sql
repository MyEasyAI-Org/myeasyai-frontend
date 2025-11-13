-- ⚠️ ATENÇÃO: Este script irá DELETAR TODOS OS USUÁRIOS do sistema
-- Execute apenas se tiver certeza absoluta do que está fazendo
-- FAÇA BACKUP antes de executar!

-- Este script deve ser executado no Supabase SQL Editor
-- em: https://supabase.com/dashboard/project/abmixlwlizdyvlxrizmi/sql/new

-- ==============================================================
-- PASSO 1: Verificar quantos usuários existem (EXECUTAR PRIMEIRO)
-- ==============================================================
SELECT
  'Total de usuários na tabela users' as info,
  COUNT(*) as total
FROM users;

SELECT
  'Total de usuários no auth.users' as info,
  COUNT(*) as total
FROM auth.users;

-- ==============================================================
-- PASSO 2: Deletar dados relacionados primeiro (EXECUTAR SEGUNDO)
-- ==============================================================

-- Deletar produtos dos usuários
DELETE FROM user_products;

-- Deletar outras tabelas relacionadas (se existirem)
-- DELETE FROM user_activity;
-- DELETE FROM user_sessions;
-- DELETE FROM notifications;

-- ==============================================================
-- PASSO 3: Deletar usuários da tabela 'users' (EXECUTAR TERCEIRO)
-- ==============================================================
DELETE FROM users;

-- ==============================================================
-- PASSO 4: Deletar usuários do sistema de autenticação (EXECUTAR POR ÚLTIMO)
-- ==============================================================
-- ⚠️ IMPORTANTE: Este comando deleta os usuários do sistema de autenticação
-- Após executar isso, nenhum usuário poderá fazer login
-- DELETE FROM auth.users;

-- ==============================================================
-- VERIFICAÇÃO FINAL: Confirmar que tudo foi deletado
-- ==============================================================
SELECT
  'Verificação final - users' as tabela,
  COUNT(*) as registros_restantes
FROM users;

SELECT
  'Verificação final - auth.users' as tabela,
  COUNT(*) as registros_restantes
FROM auth.users;

SELECT
  'Verificação final - user_products' as tabela,
  COUNT(*) as registros_restantes
FROM user_products;

-- ==============================================================
-- ALTERNATIVA: Deletar apenas usuários de teste (MAIS SEGURO)
-- ==============================================================
-- Se você quiser deletar apenas usuários específicos, use:

-- Deletar usuários com emails específicos:
-- DELETE FROM user_products WHERE user_uuid IN (
--   SELECT uuid FROM users WHERE email LIKE '%@example.com'
-- );
-- DELETE FROM users WHERE email LIKE '%@example.com';
-- DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- Deletar usuários criados em uma data específica:
-- DELETE FROM user_products WHERE user_uuid IN (
--   SELECT uuid FROM users WHERE created_at > '2025-01-01'
-- );
-- DELETE FROM users WHERE created_at > '2025-01-01';
-- DELETE FROM auth.users WHERE created_at > '2025-01-01';
