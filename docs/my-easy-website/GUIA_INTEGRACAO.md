# Guia de Integração dos Hooks no MyEasyWebsite.tsx

**Data:** 17/11/2025
**Status:** 🔄 Em Progresso

---

## ⚠️ Importante

A integração completa requer **muito cuidado** devido ao tamanho do arquivo (~4000 linhas). Este guia fornece um **plano passo-a-passo** para fazer a migração de forma segura.

---

## ✅ Passo 1: Imports Atualizados

**Status:** ✅ **COMPLETO**

Os imports já foram atualizados em [MyEasyWebsite.tsx:24-39](../../src/features/my-easy-website/MyEasyWebsite.tsx#L24-L39):

```typescript
import { useAddressManagement } from './hooks/useAddressManagement';
import { useColorPalettes } from './hooks/useColorPalettes';
import { useConversationFlow, type Message } from './hooks/useConversationFlow';
import { useSiteData, type SiteData, type BusinessArea, type SectionKey } from './hooks/useSiteData';
```

Os tipos `Message`, `SiteData`, `BusinessArea` e `SectionKey` agora são importados dos hooks ao invés de definidos localmente.

---

## 📋 Passo 2: Instanciar Hooks no Componente

### Localização

Após a linha 44 em `MyEasyWebsite.tsx`, adicionar os hooks:

```typescript
export function MyEasyWebsite({ onBackToDashboard }: MyEasyWebsiteProps = {}) {
  // 🆕 HOOKS CUSTOMIZADOS

  // Gerenciamento de cores
  const colorPalettes = useColorPalettes();

  // Gerenciamento de endereços
  const addressManagement = useAddressManagement();

  // Gerenciamento de conversa
  const conversation = useConversationFlow<SiteData>({
    initialStep: 0,
    autoScroll: true,
    initialMessages: [
      {
        role: 'assistant',
        content: 'Olá! 👋 Bem-vindo ao MyEasyWebsite!',
        options: [/* ... */],
      },
    ],
  });

  // Gerenciamento de dados do site
  const site = useSiteData({
    // Initial data (copiar do useState atual)
    area: '',
    name: '',
    slogan: '',
    // ...
  });

  // Estados que PERMANECEM (UI local, não relacionados aos hooks)
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sitePreviewUrl, setSitePreviewUrl] = useState('https://seu-site.netlify.app');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showNetlifyModal, setShowNetlifyModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [summaryMessageIndex, setSummaryMessageIndex] = useState<number | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputModalConfig, setInputModalConfig] = useState<{...} | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ...resto do código
}
```

---

## 🔄 Passo 3: Mapeamento de Estados para Hooks

### Estados a REMOVER (agora nos hooks)

| Estado Antigo | Hook Novo | Propriedade |
|---------------|-----------|-------------|
| `messages` | `conversation` | `conversation.messages` |
| `setMessages` | `conversation` | `conversation.addMessage()` / `conversation.addMessages()` |
| `currentStep` | `conversation` | `conversation.currentStep` |
| `setCurrentStep` | `conversation` | `conversation.goToStep()` |
| `conversationHistory` | `conversation` | `conversation.conversationHistory` |
| `messagesEndRef` | `conversation` | `conversation.messagesEndRef` |
| | | |
| `siteData` | `site` | `site.siteData` |
| `setSiteData` | `site` | `site.updateName()`, `site.updateSlogan()`, etc. |
| | | |
| `selectedColorCategory` | `colorPalettes` | `colorPalettes.selectedCategory` |
| `setSelectedColorCategory` | `colorPalettes` | `colorPalettes.selectCategory()` |
| `generatedPalettes` | `colorPalettes` | `colorPalettes.generatedPalettes` |
| | | |
| `selectedCountry` | `addressManagement` | `addressManagement.selectedCountry` |
| `setSelectedCountry` | `addressManagement` | `addressManagement.selectCountry()` |
| `addressConfirmation` | `addressManagement` | `addressManagement.addressConfirmation` |

---

## 🔧 Passo 4: Atualizar Funções

### 4.1. Função `saveSnapshot()` (Linhas 203-212)

**Antes:**
```typescript
const saveSnapshot = () => {
  setConversationHistory((prev) => [
    ...prev,
    {
      step: currentStep,
      siteData: { ...siteData },
      messages: [...messages],
    },
  ]);
};
```

**Depois:**
```typescript
const saveSnapshot = () => {
  conversation.saveSnapshot(site.siteData);
};
```

---

### 4.2. Função `goBack()` (Linhas 215-223)

**Antes:**
```typescript
const goBack = () => {
  if (conversationHistory.length === 0) return;

  const lastSnapshot = conversationHistory[conversationHistory.length - 1];
  setCurrentStep(lastSnapshot.step);
  setSiteData(lastSnapshot.siteData);
  setMessages(lastSnapshot.messages);
  setConversationHistory((prev) => prev.slice(0, -1));
};
```

**Depois:**
```typescript
const goBack = () => {
  if (!conversation.canGoBack) return;

  // Salvar siteData antes de voltar
  const lastSnapshot = conversation.conversationHistory[conversation.conversationHistory.length - 1];

  conversation.goBack();
  site.setAllSiteData(lastSnapshot.data);
};
```

---

### 4.3. Função `confirmAddress()` (Linhas 226-228)

**Antes:**
```typescript
const confirmAddress = () => {
  if (!addressConfirmation) return;
  setSiteData({ ...siteData, address: addressConfirmation.address });
```

**Depois:**
```typescript
const confirmAddress = () => {
  if (!addressManagement.addressConfirmation) return;
  site.updateAddress(addressManagement.addressConfirmation.formatted);
```

---

## 📝 Passo 5: Atualizar Referências no Código

### 5.1. Atualizar `messages` → `conversation.messages`

**Buscar e substituir:**
- `messages.length` → `conversation.messagesCount`
- `messages[` → `conversation.messages[`
- `setMessages([...messages,` → `conversation.addMessage(`
- `setMessages((prev) =>` → `conversation.addMessage(` ou `conversation.addMessages([`

### 5.2. Atualizar `currentStep` → `conversation.currentStep`

**Buscar e substituir:**
- `currentStep` → `conversation.currentStep`
- `setCurrentStep(2)` → `conversation.goToStep(2)`
- `setCurrentStep((prev) => prev + 1)` → `conversation.goToNextStep()`

### 5.3. Atualizar `siteData` → `site.siteData`

**Buscar e substituir:**
- `siteData.name` → `site.siteData.name`
- `setSiteData({ ...siteData, name: X })` → `site.updateName(X)`
- `setSiteData({ ...siteData, slogan: X })` → `site.updateSlogan(X)`
- `setSiteData({ ...siteData, description: X })` → `site.updateDescription(X)`
- `setSiteData({ ...siteData, area: X })` → `site.updateArea(X)`
- `setSiteData({ ...siteData, vibe: X })` → `site.updateVibe(X)`
- `setSiteData({ ...siteData, colors: X })` → `site.updateColors(X)`
- `setSiteData({ ...siteData, services: X })` → `site.setServices(X)`
- `setSiteData({ ...siteData, gallery: [...siteData.gallery, ...X] })` → `site.addGalleryImages(X)`
- `siteData.sections.includes(X)` → `site.hasSection(X)`

### 5.4. Atualizar cores

**Buscar e substituir:**
- `colorPalettes` (constante) → `colorPalettes.getAllPalettes()`
- `colorPalettes.filter(p => p.category === selectedColorCategory)` → `colorPalettes.getFilteredPalettes()`
- `selectedColorCategory` → `colorPalettes.selectedCategory`
- `setSelectedColorCategory(X)` → `colorPalettes.selectCategory(X)`

### 5.5. Atualizar endereços

**Buscar e substituir:**
- `selectedCountry` → `addressManagement.selectedCountry`
- `setSelectedCountry(X)` → `addressManagement.selectCountry(X)`
- `COUNTRIES` → `addressManagement.getAllCountries()`
- Chamada HTTP OpenStreetMap → `addressManagement.validateAddress(address)`

---

## ⚠️ Pontos de Atenção

### 1. Validação de Endereço (Linha ~361)

**Antes:**
```typescript
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
  { headers: { 'User-Agent': 'MyEasyWebsite/1.0' } }
);
```

**Depois:**
```typescript
const isValid = await addressManagement.validateAddress(address);
if (isValid && addressManagement.addressConfirmation) {
  // Endereço válido
}
```

---

### 2. Geração de Paletas Customizadas (Linha ~930)

**Antes:**
```typescript
const palettes = await contentRewritingService.generateCustomColorPalettes(description);
setGeneratedPalettes(palettes);
```

**Depois:**
```typescript
await colorPalettes.generateCustomPalettes(description);
// generatedPalettes agora em colorPalettes.generatedPalettes
```

---

### 3. Scroll Automático (Linhas 310-315)

**Antes:**
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Depois:**
```typescript
// JÁ IMPLEMENTADO NO HOOK useConversationFlow!
// Pode REMOVER este useEffect
```

---

## 🧪 Passo 6: Testar Gradualmente

### 6.1. Testar Fluxo de Conversa

1. Iniciar conversa
2. Selecionar área de negócio
3. Digitar nome, slogan, descrição
4. Voltar (botão de voltar)
5. Avançar novamente

### 6.2. Testar Cores

1. Selecionar categoria de cor
2. Escolher paleta
3. Gerar paletas customizadas

### 6.3. Testar Endereços

1. Selecionar país
2. Validar endereço
3. Confirmar endereço

### 6.4. Testar Dados do Site

1. Adicionar serviços
2. Upload de imagens
3. Preencher dados de contato
4. Verificar summary

---

## 📊 Progresso Atual

| Passo | Status |
|-------|--------|
| 1. Atualizar imports | ✅ Completo |
| 2. Instanciar hooks | ✅ Completo |
| 3. Mapear estados | ✅ Completo (hooks instanciados, estados antigos marcados) |
| 4. Atualizar funções | ✅ Completo (saveSnapshot, goBack, confirmAddress, correctAddress) |
| 5. Atualizar referências | 🔄 Parcial (colorPalettes: ✅, 28 setSiteData, 19 setMessages, 23 setCurrentStep pendentes) |
| 6. Testar build | ✅ Completo (build passou sem erros!) |
| 7. Testar funcionalidade | ⏳ Pendente (necessário testar na aplicação) |

**Nota:** Build passou com sucesso! Os hooks foram instanciados corretamente. Estados antigos ainda presentes mas não causam erros de compilação. Próximo passo: substituir gradualmente as chamadas `setSiteData`, `setMessages`, `setCurrentStep` pelos métodos dos hooks.

---

## 🚨 Recomendação

Devido à complexidade (~4000 linhas), **recomendo fazer a integração em etapas:**

### Opção A: Integração Completa (Arriscado)
- Fazer todas as mudanças de uma vez
- Alto risco de bugs
- Difícil de debugar

### Opção B: Integração Incremental (Recomendado)
1. **Etapa 1:** Apenas hooks de conversa
2. **Etapa 2:** Hooks de dados do site
3. **Etapa 3:** Hooks de cores
4. **Etapa 4:** Hooks de endereços

Cada etapa é testada antes de prosseguir.

---

**Próximo passo recomendado:**
1. Fazer backup do arquivo atual
2. Começar com Etapa 1 (hooks de conversa)
3. Testar build
4. Testar funcionalidade
5. Commit
6. Prosseguir para próxima etapa

---

**Última atualização:** 17/11/2025
**Autor:** Claude Code
