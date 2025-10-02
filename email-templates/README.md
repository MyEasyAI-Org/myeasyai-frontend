# Email Templates para MyEasyAI

Este diretório contém templates de email personalizados para o projeto MyEasyAI.

## 📧 Templates Disponíveis

### 1. Confirmation Email (English)
**Arquivo:** `confirmation-email-en.html`

Template de confirmação de conta em inglês com design consistente ao site MyEasyAI.

**Características:**
- ✅ Design responsivo (mobile + desktop)
- ✅ Cores e gradientes consistentes com o site
- ✅ Branding MyEasyAI
- ✅ CTA button destacado
- ✅ Fallback link alternativo
- ✅ Texto profissional e claro

## 🚀 Como Configurar no Supabase

### Passo 1: Acessar Email Templates
1. Vá para o Supabase Dashboard
2. Navegue até **Authentication** → **Email Templates**

### Passo 2: Configurar Template de Confirmação
1. Selecione **"Confirm signup"**
2. Mude de **"Default"** para **"Custom"**
3. Cole o conteúdo do arquivo `confirmation-email-en.html`
4. Clique em **"Save"**

### Passo 3: Configurar SMTP (Recomendado)
Para emails profissionais, configure um provedor SMTP:

1. Vá em **Settings** → **Authentication** → **SMTP Settings**
2. Configure com um provedor como:
   - **SendGrid**
   - **Mailgun** 
   - **Amazon SES**
   - **Resend**

### Exemplo de Configuração SMTP (SendGrid):
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [sua-api-key-do-sendgrid]
Sender Email: noreply@myeasyai.com
Sender Name: MyEasyAI
```

## 📝 Variáveis Disponíveis

O Supabase oferece as seguintes variáveis que podem ser usadas nos templates:

- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Token }}` - Token de confirmação
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site
- `{{ .Email }}` - Email do usuário

## 🎨 Personalização

Para personalizar o template:

1. Edite o arquivo HTML conforme necessário
2. Mantenha a variável `{{ .ConfirmationURL }}` no link/botão
3. Teste o design em diferentes dispositivos
4. Atualize no Supabase Dashboard

## 📱 Preview do Email

O template criado terá este visual:

- **Header:** Fundo gradient roxo/azul com logo MyEasyAI
- **Conteúdo:** Fundo escuro elegante com texto claro
- **CTA:** Botão destacado "Confirm My Account"
- **Footer:** Informações adicionais e disclaimers

## 🔧 Troubleshooting

### Email não está sendo enviado:
1. Verifique se o SMTP está configurado
2. Confirme se o domínio está verificado
3. Verifique os logs em Authentication → Logs

### Template não está sendo aplicado:
1. Certifique-se de salvar as alterações
2. Teste com um novo registro
3. Verifique se selecionou "Custom" em vez de "Default"

### Styling não funciona:
- Use inline CSS (já implementado no template)
- Teste em diferentes clientes de email
- Considere fallbacks para clientes mais antigos
