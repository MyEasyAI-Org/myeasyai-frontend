# Plano de Divisão do MyEasyWebsite.tsx

**Arquivo Original:** 3696 linhas
**Limite por Arquivo:** 310 linhas
**Número Mínimo de Arquivos:** ~12 arquivos

---

## 📁 Estrutura de Pastas Proposta

```
my-easy-website/
├── MyEasyWebsite.tsx                    (~250 linhas) - Componente principal
├── constants/
│   ├── initialData.ts                   (~100 linhas) - Dados iniciais
│   └── labels.ts                        (~50 linhas) - Labels e textos
├── utils/
│   ├── formatters.ts                    (~80 linhas) - Formatação de dados
│   ├── geocoding.ts                     (~60 linhas) - Geocoding/API
│   └── colorProcessing.ts               (~100 linhas) - Processamento de cores
├── handlers/
│   ├── useMyEasyWebsiteHandlers.ts      (~300 linhas) - Custom hook com todos handlers
│   └── types.ts                         (~50 linhas) - Tipos compartilhados
├── components/
│   ├── ChatSection/
│   │   ├── index.tsx                    (~200 linhas) - Seção de chat
│   │   ├── MessageList.tsx              (~150 linhas) - Lista de mensagens
│   │   ├── MessageItem.tsx              (~200 linhas) - Item de mensagem
│   │   ├── OptionsButtons.tsx           (~100 linhas) - Botões de opções
│   │   ├── ColorPaletteGrid.tsx         (~150 linhas) - Grid de paletas
│   │   ├── SectionSelector.tsx          (~150 linhas) - Seletor de seções
│   │   ├── AddressConfirmation.tsx      (~100 linhas) - Confirmação endereço
│   │   └── InputArea.tsx                (~150 linhas) - Área de input
│   ├── PreviewSection/
│   │   ├── index.tsx                    (~150 linhas) - Seção de preview
│   │   ├── BrowserBar.tsx               (~80 linhas) - Barra do navegador
│   │   └── PreviewContent.tsx           (~100 linhas) - Conteúdo preview
│   ├── SummarySection/
│   │   ├── index.tsx                    (~300 linhas) - Seção de resumo
│   │   ├── SummaryField.tsx             (~100 linhas) - Campo editável
│   │   ├── ColorPaletteDisplay.tsx      (~80 linhas) - Display de paleta
│   │   └── SectionsList.tsx             (~100 linhas) - Lista de seções
│   ├── Modals/
│   │   ├── InputModal.tsx               (~150 linhas) - Modal de input
│   │   ├── EditModal.tsx                (~150 linhas) - Modal de edição
│   │   └── NetlifyModal.tsx             (~100 linhas) - Modal Netlify
│   └── shared/
│       ├── FlagIcon.tsx                 (~30 linhas) - Ícone de bandeira
│       └── CountryDropdown.tsx          (~150 linhas) - Dropdown de países
└── hooks/
    └── (já existem os 4 hooks customizados)
```

---

## 📝 Detalhamento dos Arquivos

### 1. MyEasyWebsite.tsx (~250 linhas)
**Responsabilidade:** Componente principal, orquestra todos os sub-componentes

```typescript
export function MyEasyWebsite({ onBackToDashboard }: MyEasyWebsiteProps = {}) {
  // Hooks customizados
  const colorPalettes = useColorPalettes();
  const addressManagement = useAddressManagement();
  const conversation = useConversationFlow({...});
  const site = useSiteData(INITIAL_SITE_DATA);

  // Handlers
  const handlers = useMyEasyWebsiteHandlers({
    conversation,
    site,
    colorPalettes,
    addressManagement,
  });

  // Estados UI-only
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // ... outros estados UI

  return (
    <div>
      <ChatSection
        conversation={conversation}
        site={site}
        handlers={handlers}
        // ... props
      />
      <PreviewSection
        generatedSite={generatedSite}
        siteData={site.siteData}
        // ... props
      />
    </div>
  );
}
```

### 2. constants/initialData.ts (~100 linhas)
**Responsabilidade:** Dados iniciais e configurações

```typescript
export const INITIAL_MESSAGES: Message[] = [...]
export const INITIAL_SITE_DATA: Partial<SiteData> = {...}
```

### 3. constants/labels.ts (~50 linhas)
**Responsabilidade:** Labels, textos, mapeamentos

```typescript
export const VIBE_LABELS: Record<string, string> = {...}
export const CATEGORY_LABELS: Record<string, string> = {...}
export const AREA_LABELS: Record<string, string> = {...}
```

### 4. utils/formatters.ts (~80 linhas)
**Responsabilidade:** Funções de formatação

```typescript
export const formatPhoneNumber = (phone: string, country: CountryAddressConfig): string => {...}
export const formatAddress = (address: string): string => {...}
```

### 5. utils/geocoding.ts (~60 linhas)
**Responsabilidade:** Integração com API de geocoding

```typescript
export const geocodeAddress = async (address: string): Promise<{...} | null> => {...}
```

### 6. utils/colorProcessing.ts (~100 linhas)
**Responsabilidade:** Processamento de cores (se houver função grande de cores)

```typescript
export const processColors = (description: string): {...} => {...}
```

### 7. handlers/useMyEasyWebsiteHandlers.ts (~300 linhas)
**Responsabilidade:** Custom hook com todos os handlers

```typescript
export function useMyEasyWebsiteHandlers({
  conversation,
  site,
  colorPalettes,
  addressManagement,
}: {
  conversation: ReturnType<typeof useConversationFlow>;
  site: ReturnType<typeof useSiteData>;
  colorPalettes: ReturnType<typeof useColorPalettes>;
  addressManagement: ReturnType<typeof useAddressManagement>;
}) {
  // Modal utilities
  const openInputModal = (...) => {...};
  const closeInputModal = () => {...};
  const handleConfirmInput = () => {...};

  // Snapshot
  const saveSnapshot = () => {...};
  const goBack = () => {...};

  // Address
  const confirmAddress = () => {...};
  const correctAddress = () => {...};

  // Handlers
  const handleAreaSelect = (area: BusinessArea) => {...};
  const handleVibeSelect = (vibe: string) => {...};
  const handleSendMessage = async () => {...};
  const handleSectionSelect = (section: string) => {...};
  const handleConfirmSections = () => {...};
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {...};
  const handleColorCategorySelect = (category: string) => {...};
  const handlePaletteSelect = (palette: ColorPalette) => {...};
  const handleCustomColors = async (description: string) => {...};
  const handleGenerateSite = async () => {...};
  const handlePublishToNetlify = () => {...};
  const handleDeploySuccess = (site: any) => {...};

  return {
    // Modal
    openInputModal,
    closeInputModal,
    handleConfirmInput,
    // Snapshot
    saveSnapshot,
    goBack,
    // Address
    confirmAddress,
    correctAddress,
    // Handlers
    handleAreaSelect,
    handleVibeSelect,
    handleSendMessage,
    handleSectionSelect,
    handleConfirmSections,
    handleImageUpload,
    handleColorCategorySelect,
    handlePaletteSelect,
    handleCustomColors,
    handleGenerateSite,
    handlePublishToNetlify,
    handleDeploySuccess,
  };
}
```

### 8. components/ChatSection/index.tsx (~200 linhas)
**Responsabilidade:** Container da seção de chat

```typescript
export function ChatSection({
  conversation,
  site,
  handlers,
  // ... props
}: ChatSectionProps) {
  return (
    <div className="w-[30%] flex flex-col bg-slate-900">
      <MessageList
        messages={conversation.messages}
        site={site}
        handlers={handlers}
      />
      <InputArea
        currentStep={conversation.currentStep}
        onSendMessage={handlers.handleSendMessage}
      />
    </div>
  );
}
```

### 9. components/ChatSection/MessageList.tsx (~150 linhas)
**Responsabilidade:** Lista de mensagens com scroll

```typescript
export function MessageList({ messages, site, handlers }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageItem
          key={index}
          message={message}
          index={index}
          site={site}
          handlers={handlers}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

### 10. components/ChatSection/MessageItem.tsx (~200 linhas)
**Responsabilidade:** Renderização de uma mensagem individual

```typescript
export function MessageItem({
  message,
  index,
  site,
  handlers,
}: MessageItemProps) {
  return (
    <div className={`message ${message.role}`}>
      <div className="content">{message.content}</div>

      {message.options && (
        <OptionsButtons
          options={message.options}
          onSelect={handlers.handleOptionSelect}
        />
      )}

      {message.showColorPalettes && (
        <ColorPaletteGrid
          palettes={colorPalettes}
          onSelect={handlers.handlePaletteSelect}
        />
      )}

      {/* ... outras condições */}
    </div>
  );
}
```

### 11. components/ChatSection/OptionsButtons.tsx (~100 linhas)
**Responsabilidade:** Grid de botões de opções

```typescript
export function OptionsButtons({ options, onSelect }: OptionsButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.icon && <option.icon />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### 12. components/ChatSection/ColorPaletteGrid.tsx (~150 linhas)
**Responsabilidade:** Grid de paletas de cores

```typescript
export function ColorPaletteGrid({ palettes, onSelect, selectedId }: ColorPaletteGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => onSelect(palette)}
          className={selectedId === palette.id ? 'selected' : ''}
        >
          <div className="flex gap-1">
            <div style={{ backgroundColor: palette.primary }} />
            <div style={{ backgroundColor: palette.secondary }} />
            {/* ... */}
          </div>
          <span>{palette.name}</span>
        </button>
      ))}
    </div>
  );
}
```

### 13. components/ChatSection/SectionSelector.tsx (~150 linhas)
**Responsabilidade:** Seletor de seções do site

```typescript
export function SectionSelector({
  sections,
  selectedSections,
  onToggle,
  onConfirm,
}: SectionSelectorProps) {
  return (
    <div>
      {sections.map((section) => (
        <button
          key={section.value}
          onClick={() => onToggle(section.value)}
          className={selectedSections.includes(section.value) ? 'active' : ''}
        >
          {section.icon}
          {section.label}
        </button>
      ))}
      <button onClick={onConfirm}>
        Continuar ({selectedSections.length} seções)
      </button>
    </div>
  );
}
```

### 14. components/ChatSection/AddressConfirmation.tsx (~100 linhas)
**Responsabilidade:** Confirmação de endereço com mapa

```typescript
export function AddressConfirmation({
  addressConfirmation,
  onConfirm,
  onCorrect,
}: AddressConfirmationProps) {
  if (!addressConfirmation) return null;

  return (
    <div>
      <iframe
        src={`https://maps.google.com/maps?q=${addressConfirmation.lat},${addressConfirmation.lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      />
      <p>📍 {addressConfirmation.formatted}</p>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCorrect}>Corrigir</button>
    </div>
  );
}
```

### 15. components/ChatSection/InputArea.tsx (~150 linhas)
**Responsabilidade:** Área de input com country selector

```typescript
export function InputArea({
  currentStep,
  inputMessage,
  onChangeInput,
  onSendMessage,
  selectedCountry,
  onSelectCountry,
}: InputAreaProps) {
  return (
    <div className="p-4 border-t">
      {currentStep === 8 ? (
        <div className="flex gap-2">
          <CountryDropdown
            selectedCountry={selectedCountry}
            onSelect={onSelectCountry}
          />
          <input
            type="tel"
            value={inputMessage}
            onChange={onChangeInput}
          />
          <button onClick={onSendMessage}>
            <Send />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={onChangeInput}
          />
          <button onClick={onSendMessage}>
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}
```

### 16. components/PreviewSection/index.tsx (~150 linhas)
**Responsabilidade:** Container da seção de preview

```typescript
export function PreviewSection({
  generatedSite,
  siteData,
  sitePreviewUrl,
  isGenerating,
  onShowEditor,
}: PreviewSectionProps) {
  return (
    <div className="w-[70%] flex flex-col">
      <BrowserBar
        sitePreviewUrl={sitePreviewUrl}
        generatedSite={generatedSite}
        onShowEditor={onShowEditor}
      />
      <PreviewContent
        generatedSite={generatedSite}
        siteData={siteData}
        isGenerating={isGenerating}
      />
    </div>
  );
}
```

### 17. components/PreviewSection/BrowserBar.tsx (~80 linhas)
**Responsabilidade:** Barra do navegador com botões

```typescript
export function BrowserBar({ sitePreviewUrl, generatedSite, onShowEditor }: BrowserBarProps) {
  return (
    <div className="border-b bg-slate-900/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">{sitePreviewUrl}</span>
          </div>
        </div>
        {generatedSite && (
          <button onClick={onShowEditor}>
            <Save className="h-4 w-4" />
            Editar Site
          </button>
        )}
      </div>
    </div>
  );
}
```

### 18. components/PreviewSection/PreviewContent.tsx (~100 linhas)
**Responsabilidade:** Conteúdo do preview

```typescript
export function PreviewContent({ generatedSite, siteData, isGenerating }: PreviewContentProps) {
  if (isGenerating) {
    return <LoadingScreen />;
  }

  if (generatedSite) {
    return <SiteTemplate siteData={siteData} />;
  }

  return <PlaceholderView />;
}
```

### 19. components/SummarySection/index.tsx (~300 linhas)
**Responsabilidade:** Seção de resumo/edição

```typescript
export function SummarySection({
  site,
  colorPalettes,
  onOpenInputModal,
}: SummarySectionProps) {
  return (
    <div className="p-6 bg-slate-900 border-t">
      <h3>Resumo do Site</h3>

      <SummaryField
        label="Nome"
        value={site.siteData.name}
        onEdit={() => onOpenInputModal({...})}
      />

      <SummaryField
        label="Slogan"
        value={site.siteData.slogan}
        onEdit={() => onOpenInputModal({...})}
      />

      {/* ... mais campos */}

      <ColorPaletteDisplay
        colors={site.siteData.colors}
        palettes={colorPalettes}
      />

      <SectionsList
        sections={site.siteData.sections}
        onToggle={site.toggleSection}
      />
    </div>
  );
}
```

### 20. components/SummarySection/SummaryField.tsx (~100 linhas)
**Responsabilidade:** Campo editável no resumo

```typescript
export function SummaryField({ label, value, onEdit }: SummaryFieldProps) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg">
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
      <button onClick={onEdit}>Editar</button>
    </div>
  );
}
```

### 21. components/Modals/InputModal.tsx (~150 linhas)
**Responsabilidade:** Modal genérico de input

```typescript
export function InputModal({
  isOpen,
  config,
  value,
  onChange,
  onConfirm,
  onClose,
}: InputModalProps) {
  if (!isOpen || !config) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>{config.title}</h3>
      {config.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
        />
      )}
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </Modal>
  );
}
```

### 22. components/shared/FlagIcon.tsx (~30 linhas)
**Responsabilidade:** Componente de bandeira

```typescript
export function FlagIcon({ countryCode, className = 'w-6 h-4' }: FlagIconProps) {
  const Flag = flags[countryCode as keyof typeof flags];
  if (!Flag) return null;
  return <Flag className={className} />;
}
```

### 23. components/shared/CountryDropdown.tsx (~150 linhas)
**Responsabilidade:** Dropdown de países

```typescript
export function CountryDropdown({
  selectedCountry,
  countries,
  onSelect,
  isOpen,
  onToggle,
}: CountryDropdownProps) {
  return (
    <div className="relative">
      <button onClick={onToggle}>
        <FlagIcon countryCode={selectedCountry.code} />
        <span>{selectedCountry.dial}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => onSelect(country)}
              className={selectedCountry.code === country.code ? 'selected' : ''}
            >
              <FlagIcon countryCode={country.code} />
              <div>
                <p>{country.name}</p>
                <p>{country.dial}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Estratégia de Implementação

### Fase 1: Preparação
1. ✅ Criar estrutura de pastas
2. ✅ Criar arquivo de planejamento
3. Extrair constantes e dados iniciais
4. Extrair utils/helpers

### Fase 2: Handlers
5. Criar custom hook `useMyEasyWebsiteHandlers`
6. Mover todos os handlers para o hook
7. Mover funções auxiliares (modal, snapshot, etc.)

### Fase 3: Componentes de Chat
8. Criar `ChatSection` container
9. Criar `MessageList`
10. Criar `MessageItem` (maior complexidade)
11. Criar sub-componentes (OptionsButtons, ColorPaletteGrid, etc.)
12. Criar `InputArea`
13. Criar componentes auxiliares (AddressConfirmation, etc.)

### Fase 4: Componentes de Preview
14. Criar `PreviewSection` container
15. Criar `BrowserBar`
16. Criar `PreviewContent`

### Fase 5: Componentes de Summary e Modais
17. Criar `SummarySection`
18. Criar sub-componentes do summary
19. Criar modais
20. Criar componentes shared

### Fase 6: Integração
21. Atualizar `MyEasyWebsite.tsx` principal
22. Importar todos os componentes
23. Testar build
24. Testar funcionalidade

---

## ✅ Critérios de Sucesso

- ✅ Cada arquivo com **máximo 310 linhas**
- ✅ Build passa sem erros
- ✅ **Zero mudanças no funcionamento**
- ✅ Todos os tipos TypeScript corretos
- ✅ Imports organizados
- ✅ Componentes bem nomeados e com responsabilidade única

---

**Status:** 🔄 Em Planejamento
**Próximo Passo:** Implementar Fase 1 (Preparação)
