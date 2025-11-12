/**
 * Script para limpar usuários de teste do Supabase antes de executar os testes E2E
 *
 * Este script deleta todos os usuários com email teste-*@myeasyai.test
 * para evitar acúmulo de usuários de teste no banco de dados
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço (admin)

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL não está definida');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY não está definida');
  console.warn('   Cleanup de usuários via SQL precisa de service role key');
  console.warn('   Os testes continuarão, mas usuários antigos não serão removidos');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanupTestUsers() {
  console.log('🧹 Limpando usuários de teste...');

  try {
    // Buscar todos os usuários de teste
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    if (!users || !users.users) {
      console.log('✅ Nenhum usuário encontrado');
      return;
    }

    // Filtrar usuários de teste
    const testUsers = users.users.filter(user =>
      user.email?.includes('@myeasyai.test')
    );

    if (testUsers.length === 0) {
      console.log('✅ Nenhum usuário de teste para limpar');
      return;
    }

    console.log(`📊 Encontrados ${testUsers.length} usuários de teste`);

    // Deletar cada usuário
    let deleted = 0;
    let failed = 0;

    for (const user of testUsers) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        if (error) {
          console.error(`   ❌ Falha ao deletar ${user.email}:`, error.message);
          failed++;
        } else {
          deleted++;
        }
      } catch (err) {
        console.error(`   ❌ Erro ao deletar ${user.email}:`, err);
        failed++;
      }
    }

    console.log(`✅ Limpeza concluída: ${deleted} deletados, ${failed} falharam`);
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
    process.exit(1);
  }
}

// Executar cleanup
cleanupTestUsers()
  .then(() => {
    console.log('✅ Script de cleanup finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha no cleanup:', error);
    process.exit(1);
  });
