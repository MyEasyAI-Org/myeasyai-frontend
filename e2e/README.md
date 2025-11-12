# Testes E2E - MyEasyAI Frontend

## 📚 Documentação

Este diretório contém os testes End-to-End (E2E) da aplicação MyEasyAI Frontend.

Para uma explicação completa e detalhada sobre testes E2E, consulte o [GUIA_TESTES_E2E.md](../GUIA_TESTES_E2E.md) na raiz do projeto.

## 🚀 Quick Start

### Instalação

Os navegadores já foram instalados durante a configuração. Se precisar reinstalar:

```bash
npx playwright install
```

### Executar Todos os Testes

```bash
npm run test:e2e
```

### Executar com Interface Visual

```bash
npm run test:e2e:ui
```

### Executar com Navegador Visível

```bash
npm run test:e2e:headed
```

### Executar em Modo Debug

```bash
npm run test:e2e:debug
```

### Ver Relatório dos Últimos Testes

```bash
npm run test:e2e:report
```

## 📁 Estrutura de Arquivos

```
e2e/
├── fixtures/
│   └── auth.fixture.ts          # Fixture para autenticação reutilizável
├── utils/
│   └── test-helpers.ts          # Funções auxiliares para testes
├── auth.spec.ts                 # Testes de autenticação (signup, login, logout)
├── dashboard.spec.ts            # Testes do dashboard
├── site-creation.spec.ts        # Testes de criação de sites (MyEasyWebsite)
└── README.md                    # Este arquivo
```

## 🧪 Suites de Testes

### 1. Autenticação (`auth.spec.ts`)

Cobre:
- ✅ Cadastro de novos usuários
- ✅ Login com credenciais válidas
- ✅ Validações de formulário
- ✅ Tratamento de erros
- ✅ Logout
- ✅ Recuperação de senha

**Executar apenas estes testes:**
```bash
npx playwright test auth.spec.ts
```

### 2. Dashboard (`dashboard.spec.ts`)

Cobre:
- ✅ Visualização de informações do usuário
- ✅ Estatísticas de uso (tokens, sites)
- ✅ Navegação entre produtos
- ✅ Edição de perfil
- ✅ Gerenciamento de conta
- ✅ Responsividade mobile

**Executar apenas estes testes:**
```bash
npx playwright test dashboard.spec.ts
```

### 3. Criação de Sites (`site-creation.spec.ts`)

Cobre:
- ✅ Fluxo completo de criação de site
- ✅ Diferentes áreas de negócio
- ✅ Customização (cores, logo)
- ✅ Salvamento de progresso
- ✅ Validações de input
- ✅ Tratamento de erros

**Executar apenas estes testes:**
```bash
npx playwright test site-creation.spec.ts
```

## 🎯 Comandos Úteis

### Executar em Navegadores Específicos

```bash
# Apenas Chrome
npm run test:e2e:chromium

# Apenas Firefox
npm run test:e2e:firefox

# Apenas Safari/WebKit
npm run test:e2e:webkit

# Apenas mobile
npm run test:e2e:mobile
```

### Executar Teste Específico

```bash
# Por arquivo
npx playwright test auth.spec.ts

# Por nome do teste
npx playwright test -g "usuário pode se cadastrar"

# Por describe block
npx playwright test -g "Autenticação - Cadastro"
```

### Debug de Teste Específico

```bash
npx playwright test auth.spec.ts --debug
```

### Executar em Modo Watch (Re-executar ao salvar)

```bash
npx playwright test --watch
```

## 🔧 Fixtures Customizadas

### `authenticatedPage`

Fornece uma página já autenticada, criando automaticamente um usuário de teste e fazendo login.

**Uso:**

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('teste que requer autenticação', async ({ authenticatedPage: page }) => {
  // Usuário já está logado!
  await expect(page).toHaveURL(/dashboard/);
});
```

### `testUser`

Fornece dados de um usuário de teste gerado.

**Uso:**

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('teste com dados de usuário', async ({ testUser }) => {
  console.log(testUser.email);
  console.log(testUser.password);
});
```

## 🛠️ Funções Auxiliares

### `generateTestEmail()`

Gera um email único para testes.

```typescript
import { generateTestEmail } from './utils/test-helpers';

const email = generateTestEmail();
// teste-1699999999999-123@myeasyai.test
```

### `generateTestUser()`

Gera dados completos de usuário para cadastro.

```typescript
import { generateTestUser } from './utils/test-helpers';

const user = generateTestUser();
// {
//   fullName: 'João Silva Santos',
//   preferredName: 'João',
//   email: 'teste-...',
//   password: 'SenhaSegura123!'
// }
```

### `fillForm(page, formData)`

Preenche um formulário com dados.

```typescript
import { fillForm } from './utils/test-helpers';

await fillForm(page, {
  email: 'user@test.com',
  password: 'pass123'
});
```

### `waitForLoadingToDisappear(page)`

Aguarda que elementos de loading desapareçam.

```typescript
import { waitForLoadingToDisappear } from './utils/test-helpers';

await page.click('button');
await waitForLoadingToDisappear(page);
```

## 📊 Relatórios

Após executar os testes, os relatórios são gerados em:

- **HTML:** `playwright-report/index.html`
- **JSON:** `test-results/results.json`
- **Screenshots:** `test-results/screenshots/`
- **Vídeos:** `test-results/`

### Ver Relatório HTML

```bash
npm run test:e2e:report
```

## 🐛 Debug e Troubleshooting

### Teste está falhando?

1. **Execute em modo headed para ver o que está acontecendo:**
   ```bash
   npm run test:e2e:headed
   ```

2. **Execute em modo debug para pausar e inspecionar:**
   ```bash
   npm run test:e2e:debug
   ```

3. **Verifique o relatório HTML:**
   ```bash
   npm run test:e2e:report
   ```

4. **Adicione `page.pause()` no código para pausar em um ponto específico:**
   ```typescript
   test('debug example', async ({ page }) => {
     await page.goto('/');
     await page.pause(); // Pausar aqui
     await page.click('.button');
   });
   ```

### Erros Comuns

**"Timeout: Element not found"**
- O elemento demorou muito para aparecer
- Verifique se o seletor está correto
- Aumente o timeout: `await page.click('.btn', { timeout: 60000 })`

**"Element is not visible"**
- O elemento existe mas está oculto
- Verifique se precisa abrir um modal/dropdown primeiro

**"Navigation timeout"**
- A página demorou muito para carregar
- Verifique se o servidor está rodando
- Aumente o timeout no `playwright.config.ts`

## 🔒 Boas Práticas

### ✅ DO (Faça)

- Use `data-testid` em elementos críticos para testes
- Mantenha testes independentes (não dependam um do outro)
- Limpe o estado antes de cada teste
- Use fixtures para código reutilizável
- Escreva testes que simulam comportamento real do usuário

### ❌ DON'T (Não Faça)

- Não use `waitForTimeout()` fixo - prefira `waitForSelector()`
- Não compartilhe estado entre testes
- Não faça testes muito longos - divida em testes menores
- Não use seletores frágeis (como `.btn-123456`)
- Não ignore falhas - sempre investigue

## 📈 CI/CD

Os testes E2E podem ser executados no CI/CD (GitHub Actions, GitLab CI, etc).

### Exemplo GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Recursos Adicionais

- [Documentação Oficial do Playwright](https://playwright.dev)
- [GUIA_TESTES_E2E.md](../GUIA_TESTES_E2E.md) - Guia completo para iniciantes
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🆘 Precisa de Ajuda?

1. Consulte o [GUIA_TESTES_E2E.md](../GUIA_TESTES_E2E.md)
2. Veja a [documentação do Playwright](https://playwright.dev)
3. Abra uma issue no repositório

---

**Última atualização:** 2025-11-11
**Versão:** 1.0.0
