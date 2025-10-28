# Configuração OAuth - Supabase

Este documento explica como configurar a autenticação social (OAuth) no dashboard do Supabase para Google, Facebook e Apple.

## 1. Google OAuth

### Passos:
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" (se necessário)
4. Vá em "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `https://scdrhfmtrbilcqewwubh.supabase.co`
   - **Authorized redirect URIs**: `https://scdrhfmtrbilcqewwubh.supabase.co/auth/v1/callback`

### No Supabase Dashboard:
1. Vá em Authentication → Providers → Google
2. Ative o provider
3. Cole o **Client ID** e **Client Secret** do Google
4. Salve as configurações

## 2. Facebook OAuth

### Passos:
1. Acesse o [Facebook for Developers](https://developers.facebook.com/)
2. Crie um novo app ou selecione um existente
3. Adicione o produto "Facebook Login"
4. Configure:
   - **Valid OAuth Redirect URIs**: `https://scdrhfmtrbilcqewwubh.supabase.co/auth/v1/callback`
   - **Valid OAuth Redirect URIs**: `http://localhost:3000/auth/callback` (para desenvolvimento)

### No Supabase Dashboard:
1. Vá em Authentication → Providers → Facebook
2. Ative o provider
3. Cole o **App ID** e **App Secret** do Facebook
4. Salve as configurações

## 3. Apple OAuth

### Passos:
1. Acesse o [Apple Developer Portal](https://developer.apple.com/)
2. Crie um App ID se não tiver
3. Configure Sign in with Apple:
   - **Primary App ID**: Configure seu app principal
   - **Return URLs**: `https://scdrhfmtrbilcqewwubh.supabase.co/auth/v1/callback`
4. Crie um Service ID
5. Gere uma Private Key (.p8 file)

### No Supabase Dashboard:
1. Vá em Authentication → Providers → Apple
2. Ative o provider
3. Configure:
   - **Client ID** (Services ID)
   - **Team ID**
   - **Key ID**
   - **Private Key** (conteúdo do arquivo .p8)
4. Salve as configurações

## 4. URLs de Callback

Certifique-se de configurar estas URLs nos respectivos provedores OAuth:

### Produção:
- `https://scdrhfmtrbilcqewwubh.supabase.co/auth/v1/callback`

### Desenvolvimento:
- `http://localhost:5173/auth/callback` (Vite dev server)
- `http://localhost:3000/auth/callback` (alternativo)

## 5. Testando a Configuração

Após configurar todos os providers:
1. Execute `npm run dev` para iniciar o servidor de desenvolvimento
2. Abra o navegador em `http://localhost:5173`
3. Teste os botões de login social nos modais
4. Verifique se os redirecionamentos funcionam corretamente

## 6. Troubleshooting

### Problemas Comuns:
- **Erro de redirect_uri**: Verifique se as URLs estão exatamente iguais
- **Erro de domínio**: Certifique-se que o domínio está autorizado
- **Erro de configuração**: Verifique se Client ID/Secret estão corretos

### Logs de Debug:
- Use o console do navegador para ver erros
- Verifique os logs no Supabase Dashboard → Logs
- Teste primeiro com um usuário de teste
