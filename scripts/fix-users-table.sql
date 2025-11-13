-- ========================================================================
-- Script para corrigir problemas na tabela users após deletar todos usuários
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/abmixlwlizdyvlxrizmi/sql/new
-- ========================================================================

-- PASSO 1: Verificar se a tabela users existe e sua estrutura
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- PASSO 2: Verificar constraints e triggers que podem estar causando problemas
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- PASSO 3: Verificar triggers na tabela users
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- PASSO 4: Se houver problema com sequences, resetar
-- (Isso pode acontecer após deletar todos os registros)
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1), false)
FROM users;

-- PASSO 5: Verificar permissões RLS (Row Level Security)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- PASSO 6: Teste de inserção para identificar o erro específico
-- Descomente e execute para testar:
/*
INSERT INTO users (
    uuid,
    email,
    name,
    created_at,
    last_online,
    preferred_language
) VALUES (
    'test-uuid-' || gen_random_uuid()::text,
    'test@example.com',
    'Test User',
    NOW(),
    NOW(),
    'pt'
);
*/

-- PASSO 7: Se o problema for RLS, temporariamente desabilitar para teste
-- (NÃO USE EM PRODUÇÃO - apenas para diagnóstico)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- PASSO 8: Recriar política RLS básica se necessário
-- DROP POLICY IF EXISTS "Users can read their own data" ON users;
-- DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Permitir inserção por usuários autenticados
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
CREATE POLICY "Enable insert for authenticated users"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir leitura do próprio registro
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = uuid::uuid);

-- Permitir atualização do próprio registro
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = uuid::uuid)
WITH CHECK (auth.uid() = uuid::uuid);

-- PASSO 9: Verificar se há triggers que podem estar bloqueando
-- Se houver algum trigger problemático, você pode desabilitá-lo temporariamente:
-- ALTER TABLE users DISABLE TRIGGER trigger_name;

-- PASSO 10: Reabilitar RLS se estava desabilitada
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- PASSO 11: Teste final - tentar inserir um usuário
-- Verifique se isso funciona agora:
/*
INSERT INTO users (
    uuid,
    email,
    name,
    created_at,
    last_online,
    preferred_language
) VALUES (
    gen_random_uuid()::text,
    'newtest@example.com',
    'New Test User',
    NOW(),
    NOW(),
    'pt'
);
*/

-- PASSO 12: Limpar usuário de teste
-- DELETE FROM users WHERE email IN ('test@example.com', 'newtest@example.com');

-- ========================================================================
-- DIAGNÓSTICO ADICIONAL
-- ========================================================================

-- Verificar se há problemas com o campo uuid
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'uuid';

-- Verificar foreign keys que podem estar causando problemas
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'users';
