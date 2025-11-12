# Guia Completo de Testes E2E para Leigos

**Autor:** Claude Code (Anthropic)
**Data:** 10 de Novembro de 2025
**Para:** Iniciantes em Testes de Software
**Contexto:** MyEasyAI Frontend

---

## 📚 Índice

1. [O Que São Testes E2E?](#1-o-que-são-testes-e2e)
2. [Analogia do Mundo Real](#2-analogia-do-mundo-real)
3. [Tipos de Testes Explicados](#3-tipos-de-testes-explicados)
4. [Por Que Testes E2E São Importantes?](#4-por-que-testes-e2e-são-importantes)
5. [Como Funcionam os Testes E2E?](#5-como-funcionam-os-testes-e2e)
6. [Playwright - A Ferramenta](#6-playwright---a-ferramenta)
7. [Implementação Passo a Passo](#7-implementação-passo-a-passo)
8. [Exemplos Práticos para MyEasyAI](#8-exemplos-práticos-para-myeasyai)
9. [Erros Comuns e Como Evitar](#9-erros-comuns-e-como-evitar)
10. [Perguntas Frequentes](#10-perguntas-frequentes)

---

## 1. O Que São Testes E2E?

### Definição Simples

**E2E** significa **End-to-End** (de ponta a ponta, em português).

Testes E2E são como ter um **robô que usa sua aplicação exatamente como um usuário real faria**.

### O Que Isso Significa na Prática?

Imagine que você tem um site. Um teste E2E seria:

1. **Abrir o navegador** (Chrome, Firefox, Safari)
2. **Navegar até seu site** (como você faria manualmente)
3. **Clicar em botões** (como "Cadastre-se")
4. **Preencher formulários** (nome, email, senha)
5. **Enviar dados** (apertar Enter ou clicar em "Enviar")
6. **Verificar se funcionou** (usuário foi criado? apareceu mensagem de sucesso?)

**A diferença:** Em vez de VOCÊ fazer isso manualmente toda vez, um **programa automatizado** faz por você em segundos.

---

## 2. Analogia do Mundo Real

### 🍔 Pense em um Restaurante Fast-Food

Imagine que você é dono de um McDonald's e quer garantir que **o processo todo funciona perfeitamente** do início ao fim:

#### Teste Manual (Sem Automação)
Você mesmo vai ao restaurante toda vez e:
1. Entra pela porta
2. Olha o cardápio
3. Faz o pedido no caixa
4. Paga
5. Espera o lanche
6. Recebe o lanche
7. Verifica se está correto
8. Come

**Problema:** Isso demora MUITO tempo. Se você mudar algo (novo lanche, novo sistema de pagamento), precisa testar TUDO de novo manualmente.

#### Teste E2E (Automatizado)
Você contrata um **"cliente robô"** que:
1. Entra pela porta automaticamente
2. Lê o cardápio (usando câmeras)
3. Faz o pedido (simulando voz)
4. Paga (cartão de teste)
5. Espera
6. Recebe o lanche
7. **VERIFICA automaticamente** se o lanche está certo (hambúrguer tem queijo? batata veio?)

**Vantagem:** O robô faz isso em 30 segundos. Você pode executar esse teste **100 vezes por dia** sem custo humano.

### 🌐 Aplicando ao MyEasyAI

No seu projeto, um teste E2E seria:

**Cenário: Usuário cria uma conta e faz um site**

```
1. Robô abre o navegador
2. Robô vai até myeasyai.com
3. Robô clica no botão "Cadastre-se"
4. Robô preenche:
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - Senha: "Senha123!"
5. Robô clica em "Criar conta"
6. Robô VERIFICA: Apareceu a mensagem "Conta criada com sucesso"?
7. Robô VERIFICA: Usuário foi redirecionado para o dashboard?
8. Robô clica em "MyEasyWebsite"
9. Robô escolhe "Tecnologia" como área de negócio
10. Robô digita "Minha Startup" como nome do negócio
11. Robô VERIFICA: Site foi gerado?
12. Robô VERIFICA: Preview do site apareceu?
```

**Se alguma etapa falhar, o teste FALHA e você é notificado.**

---

## 3. Tipos de Testes Explicados

Existem 3 tipos principais de testes. Vou explicar cada um com analogias:

### 🔬 Testes Unitários (Unit Tests)

**O que são:** Testam **uma função específica isoladamente**.

**Analogia do Restaurante:**
- Testar se a fritadeira frita batatas na temperatura certa
- Testar se a máquina de refrigerante dispensa a quantidade certa
- Testar se o caixa calcula o troco corretamente

**Exemplo de Código:**

```typescript
// Função que queremos testar
function somar(a: number, b: number): number {
  return a + b;
}

// Teste unitário
test('soma dois números corretamente', () => {
  const resultado = somar(2, 3);
  expect(resultado).toBe(5); // ✅ Passa
});

test('soma números negativos', () => {
  const resultado = somar(-2, -3);
  expect(resultado).toBe(-5); // ✅ Passa
});
```

**Características:**
- ⚡ Muito rápido (milissegundos)
- 🎯 Testa uma coisa só
- 🔄 Fácil de rodar centenas de vezes
- ❌ NÃO testa se o sistema todo funciona junto

---

### 🔗 Testes de Integração (Integration Tests)

**O que são:** Testam se **várias partes funcionam juntas**.

**Analogia do Restaurante:**
- Testar se o pedido do cliente chega corretamente na cozinha
- Testar se a cozinha prepara o lanche e entrega no balcão
- Testar se o sistema de pagamento se conecta com o banco

**Exemplo de Código:**

```typescript
// Testa se o componente LoginModal funciona com o AuthService
test('login com email e senha funciona', async () => {
  // 1. Renderizar componente
  render(<LoginModal />);

  // 2. Preencher campos
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'usuario@teste.com' }
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: 'senha123' }
  });

  // 3. Clicar em login
  fireEvent.click(screen.getByText('Entrar'));

  // 4. Verificar se AuthService foi chamado
  await waitFor(() => {
    expect(mockAuthService.signIn).toHaveBeenCalledWith(
      'usuario@teste.com',
      'senha123'
    );
  });
});
```

**Características:**
- 🐢 Mais lento que unitários (segundos)
- 🔗 Testa interação entre componentes
- 🎯 Testa funcionalidades específicas
- ❌ NÃO testa a experiência completa do usuário

---

### 🌐 Testes E2E (End-to-End Tests)

**O que são:** Testam **o fluxo completo como um usuário real**.

**Analogia do Restaurante:**
- Testar TODO o processo: entrar, pedir, pagar, receber, comer
- Como se um cliente de verdade estivesse testando
- Do início ao fim, sem pular etapas

**Exemplo de Código:**

```typescript
test('usuário se cadastra e cria um site', async ({ page }) => {
  // 1. Abrir o site
  await page.goto('https://myeasyai.com');

  // 2. Clicar em "Cadastre-se"
  await page.click('text=Cadastre-se');

  // 3. Preencher formulário
  await page.fill('[name="fullName"]', 'João Silva');
  await page.fill('[name="email"]', 'joao@teste.com');
  await page.fill('[name="password"]', 'Senha123!');

  // 4. Enviar formulário
  await page.click('button[type="submit"]');

  // 5. Verificar se foi para o dashboard
  await expect(page).toHaveURL(/dashboard/);

  // 6. Clicar em "MyEasyWebsite"
  await page.click('text=MyEasyWebsite');

  // 7. Escolher área de negócio
  await page.click('text=Tecnologia');

  // 8. Preencher nome do negócio
  await page.fill('input[placeholder*="nome"]', 'Minha Startup');
  await page.keyboard.press('Enter');

  // 9. Aguardar geração do site (até 30 segundos)
  await page.waitForSelector('text=/site gerado/i', { timeout: 30000 });

  // 10. Verificar se o preview apareceu
  const preview = await page.locator('.site-preview');
  await expect(preview).toBeVisible();

  // 11. Verificar se o nome está no preview
  const content = await page.textContent('body');
  expect(content).toContain('Minha Startup');
});
```

**Características:**
- 🐌 Mais lento (minutos)
- 🌐 Usa navegador real (Chrome, Firefox)
- 👤 Simula usuário real
- ✅ Testa TUDO funcionando junto
- 💰 Mais "caro" computacionalmente

---

### 📊 Comparação Visual

```
┌─────────────────────────────────────────────────────────┐
│                  PIRÂMIDE DE TESTES                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    /\                                   │
│                   /  \         E2E                      │
│                  /    \        (Poucos, lentos)         │
│                 /──────\                                │
│                /        \      Integração               │
│               /          \     (Alguns, médios)         │
│              /────────────\                             │
│             /              \   Unitários                │
│            /                \  (Muitos, rápidos)        │
│           /──────────────────\                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Regra de Ouro:**
- **70%** testes unitários (rápidos, baratos)
- **20%** testes de integração (médios)
- **10%** testes E2E (lentos, mas essenciais)

---

## 4. Por Que Testes E2E São Importantes?

### 💡 Cenários Reais do MyEasyAI

#### Cenário 1: Você Muda o Botão de Login

**Sem testes E2E:**
```
Você: "Vou mudar a cor do botão de login para roxo"
*Muda o código*
*Faz deploy para produção*
*Usuário tenta fazer login*
Usuário: "O botão não funciona mais! 😡"
Você: "Ops... o botão ficou roxo mas eu esqueci de atualizar
       o código que detecta o clique"
```

**Com testes E2E:**
```
Você: "Vou mudar a cor do botão de login para roxo"
*Muda o código*
*Roda teste E2E*
Teste: ❌ FALHOU - Não consegui clicar no botão de login
Você: "Ah, quebrou! Deixa eu ver o que aconteceu..."
*Corrige o problema*
*Roda teste de novo*
Teste: ✅ PASSOU - Login funcionando!
*Faz deploy com confiança*
```

---

#### Cenário 2: Refatoração do MyEasyWebsite.tsx

**O problema:** O arquivo tem 3889 linhas. Você precisa dividir em componentes menores.

**Sem testes E2E:**
```
Você: *Move 500 linhas para um novo componente*
Você: *Move mais 300 linhas para outro componente*
Você: "Acho que funcionou... 🤞"
*Deploy para produção*
Usuário: "Não consigo mais criar sites! Trava na etapa de cores!"
Você: *Passa 3 dias procurando o bug*
```

**Com testes E2E:**
```
Você: *Move 500 linhas para um novo componente*
*Roda teste E2E: "criar site completo"*
Teste: ✅ PASSOU
Você: *Move mais 300 linhas*
*Roda teste E2E novamente*
Teste: ❌ FALHOU - Não conseguiu selecionar cor da paleta
Você: "Opa! Eu quebrei algo aqui. Deixa eu corrigir..."
*Corrige*
Teste: ✅ PASSOU
Você: *Deploy com 100% de confiança*
```

**Economia:** Você encontrou o bug em **2 minutos** em vez de **3 dias**.

---

### 🎯 Benefícios Tangíveis

1. **Confiança para Mudanças**
   - Você pode refatorar código sem medo
   - Se quebrar algo, você descobre na hora

2. **Documentação Viva**
   - O teste mostra COMO o sistema deveria funcionar
   - Novo desenvolvedor pode ler os testes e entender o fluxo

3. **Economia de Tempo**
   - Testar manualmente: 5 minutos por fluxo
   - Testar automaticamente: 30 segundos
   - Se você testa 10 vezes por dia: 50 minutos → 5 minutos

4. **Qualidade Garantida**
   - Cada deploy vai com certeza que funciona
   - Menos bugs em produção
   - Menos clientes insatisfeitos

5. **Regressão Zero**
   - Regressão = bug antigo que volta
   - Com testes, se um bug antigo voltar, o teste pega

---

## 5. Como Funcionam os Testes E2E?

### 🤖 O Ciclo de Vida de um Teste E2E

```
┌─────────────────────────────────────────────────────┐
│  1. SETUP (Preparação)                              │
│     - Abrir navegador                               │
│     - Limpar dados antigos                          │
│     - Configurar ambiente de teste                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  2. EXECUTION (Execução)                            │
│     - Navegar para URL                              │
│     - Clicar em elementos                           │
│     - Preencher formulários                         │
│     - Aguardar carregamentos                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  3. ASSERTIONS (Verificações)                       │
│     - Verificar se elemento está visível           │
│     - Verificar se URL mudou                        │
│     - Verificar se texto apareceu                   │
│     - Verificar se dados foram salvos               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  4. TEARDOWN (Limpeza)                              │
│     - Fechar navegador                              │
│     - Limpar dados de teste                         │
│     - Gerar relatório                               │
└─────────────────────────────────────────────────────┘
```

### 🔍 Como o Teste "Vê" a Página?

O Playwright usa **seletores** para encontrar elementos na página:

#### Tipos de Seletores:

1. **Por Texto Visível:**
```typescript
await page.click('text=Cadastre-se');
// Clica no elemento que contém o texto "Cadastre-se"
```

2. **Por Atributo (name, id, class):**
```typescript
await page.fill('[name="email"]', 'teste@exemplo.com');
// Preenche o input com name="email"
```

3. **Por Role (papel do elemento):**
```typescript
await page.click('role=button[name="Entrar"]');
// Clica no botão com texto "Entrar"
```

4. **Por CSS Selector:**
```typescript
await page.click('.btn-primary');
// Clica no elemento com class="btn-primary"
```

5. **Por XPath (avançado):**
```typescript
await page.click('//button[contains(text(), "Enviar")]');
// Clica no botão que contém "Enviar"
```

---

### 🎬 Exemplo Comentado Linha por Linha

```typescript
import { test, expect } from '@playwright/test';

// Define um teste com nome descritivo
test('usuário pode fazer login com sucesso', async ({ page }) => {
  //    ┌─ Nome do teste (aparece no relatório)
  //    │
  //    │                              ┌─ 'page' é o objeto que representa
  //    │                              │   o navegador/página
  //    ▼                              ▼

  // 1. Ir para a página de login
  await page.goto('http://localhost:5173');
  //    │     └─ Comando para navegar
  //    └─ 'await' = espera a página carregar

  // 2. Clicar no botão "Entrar" (abre modal de login)
  await page.click('text=Entrar');
  //              └─ Busca elemento pelo texto visível

  // 3. Preencher o campo de email
  await page.fill('[name="email"]', 'usuario@teste.com');
  //              │                  └─ Valor a preencher
  //              └─ Busca pelo atributo name="email"

  // 4. Preencher o campo de senha
  await page.fill('[name="password"]', 'Senha123!');

  // 5. Clicar no botão de submit do formulário
  await page.click('button[type="submit"]');

  // 6. VERIFICAR se foi redirecionado para dashboard
  await expect(page).toHaveURL(/dashboard/);
  //    │            └─ Verifica se URL contém "dashboard"
  //    └─ 'expect' = asserção/verificação

  // 7. VERIFICAR se o nome do usuário aparece na tela
  await expect(page.locator('text=Bem-vindo')).toBeVisible();
  //                         └─ Busca texto       └─ Verifica se está visível

  // 8. VERIFICAR se o botão de logout existe
  const logoutButton = page.locator('button:has-text("Sair")');
  await expect(logoutButton).toBeVisible();

  // ✅ Se chegou aqui, teste PASSOU!
  // ❌ Se qualquer step falhar, teste FALHA
});
```

---

## 6. Playwright - A Ferramenta

### O Que é Playwright?

**Playwright** é uma biblioteca da Microsoft que permite **controlar navegadores programaticamente**.

Pense nele como um **"motorista robô"** que pode:
- Abrir navegadores (Chrome, Firefox, Safari, Edge)
- Navegar em páginas
- Clicar em coisas
- Digitar texto
- Tirar screenshots
- Gravar vídeos
- E muito mais!

### Por Que Playwright? (vs. Outras Ferramentas)

| Ferramenta | Prós | Contras |
|------------|------|---------|
| **Playwright** | ✅ Mais moderno<br>✅ Rápido<br>✅ Suporta todos navegadores<br>✅ Auto-wait inteligente | ⚠️ Relativamente novo |
| Selenium | ✅ Mais antigo/maduro<br>✅ Mais tutoriais | ❌ Mais lento<br>❌ Configuração complexa |
| Cypress | ✅ Interface visual boa | ❌ Não funciona bem com iframes<br>❌ Só um navegador por vez |
| Puppeteer | ✅ Da Google | ❌ Só Chrome/Chromium |

**Recomendação:** Playwright é a melhor escolha para projetos novos em 2025.

---

### 🎨 Recursos Úteis do Playwright

#### 1. **Auto-Wait (Espera Inteligente)**

```typescript
// ❌ Selenium (você precisa esperar manualmente)
await driver.wait(until.elementLocated(By.id('button')), 10000);
await driver.findElement(By.id('button')).click();

// ✅ Playwright (espera automaticamente)
await page.click('#button');
// Playwright automaticamente:
// - Espera o elemento aparecer
// - Espera o elemento ser clicável
// - Espera animações terminarem
// - Só depois clica
```

#### 2. **Screenshots e Vídeos**

```typescript
test('teste com evidência', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Tirar screenshot
  await page.screenshot({ path: 'homepage.png' });

  // Gravar vídeo (configurado no playwright.config.ts)
  // Vídeo é gravado automaticamente se o teste falhar!
});
```

Quando um teste falha, você pode **ver o vídeo** do que aconteceu!

#### 3. **Múltiplos Navegadores**

```typescript
// Rodar o mesmo teste em Chrome, Firefox e Safari
test.describe('testes cross-browser', () => {
  test('funciona no Chrome', async ({ page }) => {
    // ...
  });

  test('funciona no Firefox', async ({ page }) => {
    // ...
  });

  test('funciona no Safari', async ({ page }) => {
    // ...
  });
});
```

#### 4. **Modo Debug Interativo**

```bash
# Rodar em modo debug (abre interface visual)
npx playwright test --debug

# Você pode:
# - Ver o teste rodando ao vivo
# - Pausar em qualquer etapa
# - Inspecionar elementos
# - Modificar seletores
```

#### 5. **Teste em Mobile**

```typescript
test('versão mobile', async ({ page }) => {
  // Emular iPhone 13
  await page.setViewportSize({ width: 390, height: 844 });

  // Ou usar preset
  await page.emulate(devices['iPhone 13']);

  // Testar menu hamburguer mobile
  await page.click('.hamburger-menu');
});
```

---

## 7. Implementação Passo a Passo

### Passo 1: Instalar Playwright

**No terminal, dentro da pasta do projeto:**

```bash
npm install -D @playwright/test
```

**O que isso faz:**
- Baixa o Playwright
- Baixa os navegadores (Chrome, Firefox, etc.)
- Adiciona ao `package.json`

**Tempo:** ~2-3 minutos (dependendo da internet)

---

### Passo 2: Inicializar Configuração

```bash
npx playwright install
```

Isso instala os navegadores necessários.

---

### Passo 3: Criar Arquivo de Configuração

**Criar arquivo: `playwright.config.ts` na raiz do projeto:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Pasta onde ficam os testes
  testDir: './e2e',

  // Timeout de cada teste (30 segundos)
  timeout: 30000,

  // Rodar testes em paralelo
  fullyParallel: true,

  // Não permitir .only no CI (evita commit acidental)
  forbidOnly: !!process.env.CI,

  // Retry em caso de falha (útil para testes instáveis)
  retries: process.env.CI ? 2 : 0,

  // Quantos testes rodar ao mesmo tempo
  workers: process.env.CI ? 1 : undefined,

  // Formato do relatório
  reporter: [
    ['html'],           // Relatório HTML visual
    ['list'],           // Lista no terminal
    ['json', { outputFile: 'test-results.json' }]
  ],

  // Configurações padrão para todos os testes
  use: {
    // URL base da aplicação
    baseURL: 'http://localhost:5173',

    // Gravar trace (filmagem) em caso de falha
    trace: 'on-first-retry',

    // Tirar screenshot em caso de falha
    screenshot: 'only-on-failure',

    // Gravar vídeo em caso de falha
    video: 'retain-on-failure',
  },

  // Projetos = configurações diferentes
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Teste mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**O que cada parte faz:**
- `testDir`: Onde ficam os arquivos `.spec.ts`
- `timeout`: Quanto tempo esperar antes de considerar falha
- `fullyParallel`: Rodar testes simultaneamente (mais rápido)
- `use.baseURL`: URL padrão (não precisa repetir em todo teste)
- `projects`: Diferentes navegadores/dispositivos
- `webServer`: Inicia `npm run dev` automaticamente antes dos testes

---

### Passo 4: Criar Pasta de Testes

```bash
mkdir e2e
```

Estrutura ficará:

```
myeasyai-frontend/
├── e2e/                    (NOVA)
│   ├── auth.spec.ts       (testes de autenticação)
│   ├── site-creation.spec.ts
│   └── dashboard.spec.ts
├── src/
├── playwright.config.ts   (NOVO)
├── package.json
└── ...
```

---

### Passo 5: Adicionar Scripts no package.json

**Editar `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**Como usar:**
```bash
# Rodar todos os testes (headless = sem ver o navegador)
npm run test:e2e

# Rodar com interface visual
npm run test:e2e:ui

# Rodar vendo o navegador
npm run test:e2e:headed

# Rodar em modo debug (passo a passo)
npm run test:e2e:debug

# Ver relatório HTML do último teste
npm run test:e2e:report
```

---

## 8. Exemplos Práticos para MyEasyAI

### Exemplo 1: Teste de Signup (Cadastro)

**Arquivo: `e2e/auth.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {

  test('usuário pode se cadastrar com sucesso', async ({ page }) => {
    // 1. Ir para homepage
    await page.goto('/');

    // 2. Clicar em "Cadastre-se"
    await page.click('text=Cadastre-se');

    // 3. Aguardar modal abrir
    await expect(page.locator('text=Chega mais!')).toBeVisible();

    // 4. Preencher formulário
    await page.fill('[name="fullName"]', 'João Silva Santos');
    await page.fill('[name="preferredName"]', 'João');
    await page.fill('[name="email"]', `teste-${Date.now()}@exemplo.com`);
    //                                  ↑ Email único para cada execução
    await page.fill('[name="password"]', 'SenhaSegura123!');
    await page.fill('[name="confirmPassword"]', 'SenhaSegura123!');

    // 5. Submeter formulário
    await page.click('button[type="submit"]');

    // 6. Aguardar mensagem de sucesso (usando toast ou alert)
    // Se estiver usando alert():
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('sucesso');
      await dialog.accept();
    });

    // Ou se estiver usando Sonner (toast):
    await expect(page.locator('.sonner-toast')).toContainText('sucesso');

    // 7. Verificar redirecionamento (pode demorar por causa do email)
    // await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('não permite cadastro com senhas diferentes', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cadastre-se');

    await page.fill('[name="fullName"]', 'João Silva');
    await page.fill('[name="email"]', 'joao@teste.com');
    await page.fill('[name="password"]', 'Senha123!');
    await page.fill('[name="confirmPassword"]', 'SenhaDiferente!');

    // Clicar em submit
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('não coincidem');
      await dialog.accept();
    });
  });

  test('não permite cadastro com nome incompleto', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cadastre-se');

    // Apenas primeiro nome (sem sobrenome)
    await page.fill('[name="fullName"]', 'João');
    await page.fill('[name="email"]', 'joao@teste.com');
    await page.fill('[name="password"]', 'Senha123!');
    await page.fill('[name="confirmPassword"]', 'Senha123!');

    await page.click('button[type="submit"]');

    // Verificar erro
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('nome completo');
      await dialog.accept();
    });
  });
});
```

---

### Exemplo 2: Teste de Login

**Arquivo: `e2e/auth.spec.ts` (continuação)**

```typescript
test.describe('Login', () => {

  // Criar usuário antes dos testes de login
  test.beforeEach(async ({ page }) => {
    // Você pode:
    // Opção A: Criar via UI (signup)
    // Opção B: Criar direto no banco (mais rápido)

    // Exemplo usando UI:
    await page.goto('/');
    await page.click('text=Cadastre-se');
    await page.fill('[name="fullName"]', 'Usuário Teste');
    await page.fill('[name="email"]', 'usuario-login@teste.com');
    await page.fill('[name="password"]', 'Senha123!');
    await page.fill('[name="confirmPassword"]', 'Senha123!');
    await page.click('button[type="submit"]');

    // Aguardar criação
    await page.waitForTimeout(2000);

    // Fazer logout (se foi redirecionado)
    const logoutButton = page.locator('text=Sair');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
  });

  test('login com email e senha funciona', async ({ page }) => {
    await page.goto('/');

    // Clicar em "Entrar"
    await page.click('text=Entrar');

    // Preencher credenciais
    await page.fill('[name="email"]', 'usuario-login@teste.com');
    await page.fill('[name="password"]', 'Senha123!');

    // Submeter
    await page.click('button[type="submit"]');

    // Verificar se foi para dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Verificar se nome aparece
    await expect(page.locator('text=Usuário Teste')).toBeVisible();
  });

  test('login com senha errada falha', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Entrar');

    await page.fill('[name="email"]', 'usuario-login@teste.com');
    await page.fill('[name="password"]', 'SenhaErrada!');

    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(page.locator('text=/erro|inválid/i')).toBeVisible();
  });
});
```

---

### Exemplo 3: Teste Completo de Criação de Site

**Arquivo: `e2e/site-creation.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Criação de Site', () => {

  // Login antes de cada teste
  test.beforeEach(async ({ page }) => {
    // Assumindo que usuário já existe
    await page.goto('/');
    await page.click('text=Entrar');
    await page.fill('[name="email"]', 'usuario@teste.com');
    await page.fill('[name="password"]', 'Senha123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('fluxo completo de criação de site', async ({ page }) => {
    // 1. Clicar em MyEasyWebsite
    await page.click('text=MyEasyWebsite');

    // 2. Aguardar tela de seleção de área aparecer
    await expect(page.locator('text=/qual área do seu negócio/i')).toBeVisible();

    // 3. Selecionar "Tecnologia"
    await page.click('text=Tecnologia');

    // 4. Aguardar próxima pergunta (nome do negócio)
    await expect(page.locator('input[placeholder*="nome"]')).toBeVisible();

    // 5. Digitar nome do negócio
    await page.fill('input[placeholder*="nome"]', 'Tech Solutions');
    await page.keyboard.press('Enter');

    // 6. IA vai fazer perguntas - responder algumas
    // (Isso depende do seu fluxo específico)

    // Pergunta: Qual é o slogan?
    await page.waitForSelector('text=/slogan/i', { timeout: 10000 });
    await page.fill('input[type="text"]', 'Soluções tecnológicas inovadoras');
    await page.keyboard.press('Enter');

    // Pergunta: Escolher cores
    await page.waitForSelector('text=/paleta/i');
    // Clicar na primeira paleta disponível
    await page.click('.color-palette:first-child');

    // Pergunta: Upload de logo (pular)
    const skipButton = page.locator('text=/pular|próximo/i');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }

    // 7. Aguardar geração do site (pode demorar)
    await page.waitForSelector('text=/gerando|processando/i', { timeout: 5000 });

    // 8. Aguardar site ser gerado
    await page.waitForSelector('text=/site gerado|concluído|pronto/i', {
      timeout: 60000 // Até 1 minuto
    });

    // 9. Verificar se preview apareceu
    const preview = page.locator('.site-preview, iframe, [data-testid="site-preview"]');
    await expect(preview).toBeVisible();

    // 10. Verificar se o nome "Tech Solutions" está no preview
    const content = await page.textContent('body');
    expect(content).toContain('Tech Solutions');

    // 11. Verificar se botões de ação estão disponíveis
    await expect(page.locator('text=/editar|publicar|deploy/i')).toBeVisible();
  });

  test('pode voltar e mudar respostas', async ({ page }) => {
    await page.click('text=MyEasyWebsite');
    await page.click('text=Tecnologia');

    await page.fill('input[placeholder*="nome"]', 'Primeira Tentativa');
    await page.keyboard.press('Enter');

    // Clicar em "Voltar"
    await page.click('text=/voltar|anterior/i');

    // Mudar resposta
    await page.fill('input[placeholder*="nome"]', 'Segunda Tentativa');
    await page.keyboard.press('Enter');

    // Verificar que nova resposta foi usada
    // (depende de como você implementa)
  });

  test('salva progresso se usuário sair e voltar', async ({ page }) => {
    await page.click('text=MyEasyWebsite');
    await page.click('text=Tecnologia');

    await page.fill('input[placeholder*="nome"]', 'Meu Negócio');
    await page.keyboard.press('Enter');

    // Responder mais algumas perguntas...
    await page.waitForSelector('text=/slogan/i');
    await page.fill('input[type="text"]', 'Meu slogan incrível');
    await page.keyboard.press('Enter');

    // Sair (ir para dashboard)
    await page.click('text=/voltar ao dashboard|sair/i');

    // Voltar para MyEasyWebsite
    await page.click('text=MyEasyWebsite');

    // Verificar se progresso foi salvo
    await expect(page.locator('text=Meu Negócio')).toBeVisible();
    await expect(page.locator('text=Meu slogan incrível')).toBeVisible();
  });
});
```

---

### Exemplo 4: Teste de Dashboard

**Arquivo: `e2e/dashboard.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.click('text=Entrar');
    await page.fill('[name="email"]', 'usuario@teste.com');
    await page.fill('[name="password"]', 'Senha123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('exibe informações do usuário', async ({ page }) => {
    // Verificar se nome está visível
    await expect(page.locator('text=Usuário')).toBeVisible();

    // Verificar se avatar está visível
    const avatar = page.locator('img[alt*="avatar"], .avatar');
    await expect(avatar).toBeVisible();
  });

  test('exibe estatísticas de uso', async ({ page }) => {
    // Tokens usados
    await expect(page.locator('text=/tokens/i')).toBeVisible();

    // Sites criados
    await expect(page.locator('text=/sites/i')).toBeVisible();
  });

  test('permite editar perfil', async ({ page }) => {
    // Clicar em "Editar perfil" ou similar
    await page.click('text=/editar perfil|configurações/i');

    // Mudar nome preferido
    await page.fill('[name="preferredName"]', 'João');

    // Salvar
    await page.click('text=/salvar|atualizar/i');

    // Verificar mensagem de sucesso
    await expect(page.locator('text=/atualizado|sucesso/i')).toBeVisible();

    // Verificar se novo nome aparece
    await expect(page.locator('text=João')).toBeVisible();
  });
});
```

---

## 9. Erros Comuns e Como Evitar

### Erro 1: "Timeout: Element not found"

**Causa:** Elemento demorou muito para aparecer (mais de 30 segundos).

**Exemplo:**
```typescript
await page.click('text=Botão que demora'); // ❌ Timeout!
```

**Soluções:**

```typescript
// Solução 1: Aumentar timeout específico
await page.click('text=Botão', { timeout: 60000 }); // 60 segundos

// Solução 2: Esperar explicitamente
await page.waitForSelector('text=Botão', { timeout: 60000 });
await page.click('text=Botão');

// Solução 3: Esperar por estado específico
await page.waitForLoadState('networkidle'); // Espera rede ficar idle
await page.click('text=Botão');
```

---

### Erro 2: "Element is not visible"

**Causa:** Elemento existe, mas está oculto (display: none, visibility: hidden).

**Exemplo:**
```typescript
// Elemento está em um modal fechado
await page.click('.modal-button'); // ❌ Não visível!
```

**Soluções:**

```typescript
// Solução 1: Abrir modal primeiro
await page.click('text=Abrir Modal');
await page.waitForSelector('.modal', { state: 'visible' });
await page.click('.modal-button');

// Solução 2: Forçar clique (use com cautela!)
await page.click('.modal-button', { force: true });
```

---

### Erro 3: "Element is covered by another element"

**Causa:** Outro elemento (como um overlay) está na frente.

**Exemplo:**
```typescript
// Há um loading overlay na frente
await page.click('.btn'); // ❌ Coberto!
```

**Soluções:**

```typescript
// Solução 1: Esperar overlay desaparecer
await page.waitForSelector('.loading-overlay', { state: 'hidden' });
await page.click('.btn');

// Solução 2: Esperar elemento ser clicável
await page.waitForSelector('.btn', { state: 'visible' });
await page.waitForTimeout(500); // Pequeno delay
await page.click('.btn');
```

---

### Erro 4: "Navigation timeout"

**Causa:** Página demorou muito para carregar.

**Soluções:**

```typescript
// Aumentar timeout global (playwright.config.ts)
export default defineConfig({
  timeout: 60000, // 60 segundos
});

// Ou específico:
await page.goto('/', { timeout: 60000 });

// Esperar por estado específico
await page.goto('/');
await page.waitForLoadState('domcontentloaded');
// Ou 'load' ou 'networkidle'
```

---

### Erro 5: "Seletor encontra múltiplos elementos"

**Causa:** Seu seletor é muito genérico.

**Exemplo:**
```typescript
// Há 3 botões com texto "Enviar"
await page.click('text=Enviar'); // ❌ Qual deles?
```

**Soluções:**

```typescript
// Solução 1: Seletor mais específico
await page.click('form#login button:has-text("Enviar")');

// Solução 2: Usar .first(), .last(), .nth()
await page.click('button:has-text("Enviar")').first();
await page.click('button:has-text("Enviar")').nth(1); // Segundo

// Solução 3: Usar data-testid (recomendado!)
// No componente:
// <button data-testid="login-submit">Enviar</button>
await page.click('[data-testid="login-submit"]');
```

---

### Erro 6: "Test is flaky" (Instável)

**Causa:** Teste passa às vezes e falha outras vezes.

**Razões comuns:**
- Timing issues (delays variáveis)
- Dados de teste inconsistentes
- Dependências externas (APIs)

**Soluções:**

```typescript
// ❌ Evite timeouts fixos
await page.click('.btn');
await page.waitForTimeout(3000); // BAD!
await page.click('.next-btn');

// ✅ Use esperas dinâmicas
await page.click('.btn');
await page.waitForSelector('.result', { state: 'visible' });
await page.click('.next-btn');

// ✅ Limpe dados antes do teste
test.beforeEach(async ({ page }) => {
  // Limpar localStorage
  await page.evaluate(() => localStorage.clear());

  // Limpar cookies
  await page.context().clearCookies();

  // Resetar banco de dados de teste (se possível)
});

// ✅ Use retries para testes instáveis
test('teste instável', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky', description: 'API externa às vezes falha' });
  // teste...
});

// No config:
retries: 2, // Tenta 2x se falhar
```

---

### Erro 7: "WebServer did not start"

**Causa:** `npm run dev` não iniciou corretamente.

**Soluções:**

```typescript
// playwright.config.ts
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  timeout: 120000, // Aumentar timeout
  reuseExistingServer: true, // Usar servidor já rodando
},

// Ou rodar servidor manualmente antes:
// Terminal 1:
npm run dev

// Terminal 2:
npm run test:e2e
```

---

## 10. Perguntas Frequentes

### Q1: Preciso rodar os testes manualmente toda vez?

**R:** Não! Você pode configurar para rodar automaticamente:

1. **No CI/CD (GitHub Actions):**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

2. **Watch mode (local):**
```bash
# Rerun testes quando arquivos mudarem
npx playwright test --watch
```

---

### Q2: Os testes são muito lentos. Como acelerar?

**R:** Várias estratégias:

```typescript
// 1. Rodar em paralelo
// playwright.config.ts
workers: 4, // 4 testes simultâneos

// 2. Usar apenas Chromium (não testar todos navegadores)
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // Comentar Firefox, Safari, etc.
],

// 3. Usar headed mode apenas quando necessário
npm run test:e2e  // Headless (rápido)
// vs
npm run test:e2e:headed  // Headed (lento)

// 4. Pular testes lentos durante desenvolvimento
test.skip('teste muito lento', async ({ page }) => {
  // ...
});

// 5. Criar fixture para login (não fazer login em todo teste)
// base/fixtures.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'pass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});

// Usar:
test('dashboard', async ({ authenticatedPage }) => {
  // Já está logado!
});
```

---

### Q3: Preciso testar em todos os navegadores?

**R:** Depende:

- **Durante desenvolvimento:** Só Chrome (mais rápido)
- **Antes de produção:** Todos os navegadores principais
- **CI/CD:** Todos os navegadores

```typescript
// Rodar apenas Chrome:
npx playwright test --project=chromium

// Rodar todos:
npx playwright test
```

---

### Q4: Como testar funcionalidades que exigem email verification?

**R:** Várias abordagens:

```typescript
// Abordagem 1: Usar serviço de email teste
// Ex: Mailinator, TempMail
test('signup com email verification', async ({ page }) => {
  const email = `teste-${Date.now()}@mailinator.com`;

  // Fazer signup
  await page.goto('/signup');
  await page.fill('[name="email"]', email);
  // ...

  // Ir para Mailinator e pegar link
  await page.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${email}`);
  await page.click('text=Verify your email');
  // ...
});

// Abordagem 2: Desabilitar verificação em ambiente de teste
// Backend:
if (process.env.NODE_ENV === 'test') {
  // Não enviar email, auto-verificar
}

// Abordagem 3: Usar email de teste com link conhecido
// Backend cria email teste com token fixo
```

---

### Q5: Como testar upload de arquivos?

**R:**

```typescript
test('upload de logo', async ({ page }) => {
  await page.goto('/site-builder');

  // Método 1: setInputFiles
  await page.setInputFiles('input[type="file"]', 'path/to/logo.png');

  // Método 2: Upload múltiplos arquivos
  await page.setInputFiles('input[type="file"]', [
    'logo1.png',
    'logo2.png',
  ]);

  // Método 3: Upload Buffer (arquivo em memória)
  await page.setInputFiles('input[type="file"]', {
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KG...', 'base64'),
  });

  // Verificar upload
  await expect(page.locator('text=/upload.*sucesso/i')).toBeVisible();
});
```

---

### Q6: Como testar notificações/toasts que desaparecem?

**R:**

```typescript
test('toast de sucesso aparece', async ({ page }) => {
  await page.click('.save-button');

  // Método 1: Verificar que apareceu
  await expect(page.locator('.toast')).toBeVisible();
  await expect(page.locator('.toast')).toContainText('Salvo');

  // Método 2: Verificar e aguardar desaparecer
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  await expect(toast).toBeHidden({ timeout: 5000 }); // Max 5s

  // Método 3: Contar notificações
  const toastCount = await page.locator('.toast').count();
  expect(toastCount).toBe(1);
});
```

---

### Q7: Como debugar quando teste falha?

**R:** Várias ferramentas:

```bash
# 1. Rodar em modo debug (abre inspector)
npx playwright test --debug

# 2. Rodar com navegador visível
npx playwright test --headed

# 3. Ver trace (filmagem) do teste que falhou
npx playwright show-report

# 4. Pausar em ponto específico
```

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');

  // Pausar aqui (abre inspector)
  await page.pause();

  await page.click('.button');
});

// 5. Screenshot antes de falhar
await page.screenshot({ path: 'debug.png' });

// 6. Console.log do HTML atual
console.log(await page.content());

// 7. Ver todas as ações
DEBUG=pw:api npx playwright test
```

---

### Q8: Quanto tempo demora para criar todos os testes E2E?

**R:** Para MyEasyAI:

- **Setup inicial:** 1 dia (instalação + config + primeiro teste)
- **Testes críticos (3-5):** 2-3 dias
- **Testes complementares (10-15):** 1 semana
- **Cobertura completa (30+):** 2-3 semanas

**Priorize:** Comece pelos fluxos mais importantes (signup, login, criar site).

---

### Q9: Testes E2E substituem testes manuais?

**R:** **Não completamente.**

**Use E2E para:**
- ✅ Fluxos principais que não podem quebrar
- ✅ Regressão (bugs antigos voltando)
- ✅ CI/CD (validar antes de deploy)

**Use testes manuais para:**
- ✅ UX (design ficou bonito? cores combinam?)
- ✅ Edge cases raros
- ✅ Exploração (encontrar bugs inesperados)
- ✅ Testes em dispositivos reais

**Regra:** 80% automatizado, 20% manual.

---

### Q10: E se eu não tiver tempo para criar testes agora?

**R:** Comece pequeno:

**Semana 1:** 1 teste E2E (signup OU login)
**Semana 2:** 1 teste E2E (criar site - happy path)
**Semana 3:** 2 testes E2E (erro cases)

**Mínimo viável:** 3-5 testes críticos já protegem 80% dos bugs.

**Lembre-se:** O tempo que você "economiza" agora, você vai pagar 10x depois caçando bugs em produção.

---

## 🎓 Conclusão

### O Que Você Aprendeu

1. ✅ **O que são testes E2E:** Robôs que testam sua aplicação como usuários reais
2. ✅ **Por que são importantes:** Evitam bugs, dão confiança, economizam tempo
3. ✅ **Como funcionam:** Playwright controla navegadores programaticamente
4. ✅ **Como implementar:** Passo a passo completo com exemplos
5. ✅ **Exemplos práticos:** Testes reais para MyEasyAI
6. ✅ **Como resolver problemas:** Erros comuns e soluções
7. ✅ **Perguntas frequentes:** Respostas práticas

### Próximos Passos Recomendados

**Hoje:**
1. Instalar Playwright: `npm install -D @playwright/test`
2. Criar `playwright.config.ts`
3. Criar pasta `e2e/`

**Esta Semana:**
1. Criar primeiro teste (signup ou login)
2. Rodar teste: `npm run test:e2e`
3. Ver passar ✅ (ou debugar se falhar ❌)

**Próximas 2 Semanas:**
1. Adicionar 2-3 testes críticos
2. Integrar no workflow de desenvolvimento
3. Rodar antes de cada deploy

### Recursos Adicionais

📖 **Documentação Oficial:**
- [Playwright Docs](https://playwright.dev)
- [Playwright Getting Started](https://playwright.dev/docs/intro)

🎥 **Tutoriais em Vídeo:**
- [Playwright YouTube Channel](https://www.youtube.com/@Playwrightdev)

💬 **Comunidade:**
- [Playwright Discord](https://discord.com/invite/playwright)
- [Stack Overflow - Playwright](https://stackoverflow.com/questions/tagged/playwright)

🧪 **Exemplos:**
- [Playwright Examples](https://github.com/microsoft/playwright/tree/main/examples)

---

**Lembre-se:** Começar é mais importante que fazer perfeito.

Um teste E2E simples é **infinitamente melhor** que nenhum teste.

Boa sorte! 🚀

---

**Documento criado em:** 10 de Novembro de 2025
**Autor:** Claude Code (Anthropic)
**Versão:** 1.0
**Público-alvo:** Desenvolvedores iniciantes em testes automatizados
