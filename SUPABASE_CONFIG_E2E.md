# Configuração do Supabase para Testes E2E

## Problema Atual

Os testes E2E estão falhando porque o Supabase está configurado para exigir confirmação de email. Quando um usuário se cadastra através da UI:

1. O Supabase cria o usuário mas NÃO o autentica automaticamente
2. Um email de confirmação é enviado para o endereço do usuário
3. O usuário precisa clicar no link de confirmação antes de poder fazer login
4. Nos testes E2E, não temos acesso aos emails, então os usuários nunca conseguem fazer login

## Solução

Para permitir que os testes E2E funcionem, você precisa **desabilitar a confirmação de email** no projeto Supabase usado para testes.

### Passos para Configurar:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: `abmixlwlizdyvlxrizmi`
3. Vá para **Authentication** → **Settings** → **Email Auth**
4. **Desabilite** a opção "Confirm email"
5. Salve as alterações

### Alternativa: Usar Projeto Supabase Separado para Testes

Uma melhor prática é usar um projeto Supabase separado apenas para testes E2E:

1. Crie um novo projeto Supabase específico para testes
2. Configure este projeto com:
   - **Email confirmation**: DISABLED
   - **Autoconfirm users**: ENABLED
3. Atualize o arquivo `.env.test` com as credenciais do projeto de teste:
   ```
   VITE_SUPABASE_URL=<url-do-projeto-de-teste>
   VITE_SUPABASE_ANON_KEY=<chave-do-projeto-de-teste>
   ```

## Verificação

Após fazer as alterações, execute os testes novamente:

```bash
npm run test:e2e
```

Os testes de autenticação devem passar e os usuários criados devem conseguir fazer login imediatamente após o cadastro.

## Status Atual dos Testes

- ✅ 11/11 testes de autenticação (auth.spec.ts)
- ✅ 3/3 testes básicos de homepage (example.spec.ts)
- ❌ 19/19 testes de dashboard (falhando por falta de autenticação)
- ❌ 11/11 testes de criação de sites (falhando por falta de autenticação)

**Total**: 14/44 testes passando

Após a configuração do Supabase, esperamos que todos os 44 testes passem.
