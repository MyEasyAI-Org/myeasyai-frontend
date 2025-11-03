# 🎨 Sistema de Editor Visual Avançado - MyEasyWebsite

Documentação completa do sistema de edição visual implementado para o MyEasyWebsite.

## 📦 Componentes Implementados

### 1. EditingContext.tsx
**Descrição:** Context API para gerenciar o estado global de edição.

**Funcionalidades:**
- Controle de elemento selecionado
- Sistema de hover para indicar elementos editáveis
- Histórico de ações (Undo/Redo)
- Gerenciamento de estado centralizado

**Uso:**
```tsx
import { EditingProvider, useEditing } from './EditingContext';

<EditingProvider onUpdate={(updates) => console.log(updates)}>
  {/* Seu conteúdo aqui */}
</EditingProvider>
```

### 2. EditingPanel.tsx
**Descrição:** Painel lateral que aparece quando um elemento é selecionado.

**Funcionalidades:**
- Navegação contextual baseada no tipo de elemento
- Botões de Undo/Redo
- Breadcrumb de navegação
- Animação suave de entrada/saída
- Responsive design

**Tipos de elemento suportados:**
- `color` - Editor de cores
- `icon` - Seletor de ícones
- `image` - Upload de imagens
- `gallery` - Estilos de galeria
- `text` - Editor de texto

### 3. ColorPicker.tsx
**Descrição:** Seletor de cores profissional com múltiplos formatos.

**Funcionalidades:**
- ✅ Input HEX com validação
- ✅ Inputs RGB individuais
- ✅ Inputs HSL individuais
- ✅ Paleta de cores recentes (até 6 cores)
- ✅ Presets de cores (Laranja, Azul, Roxo, Verde)
- ✅ Preview da cor em tempo real
- ✅ Conversão automática entre formatos

**Uso:**
```tsx
<ColorPicker
  initialColor="#ea580c"
  onColorChange={(color) => console.log('Nova cor:', color)}
/>
```

### 4. IconSelector.tsx
**Descrição:** Biblioteca com 80+ ícones do Lucide React.

**Funcionalidades:**
- ✅ Busca por nome de ícone
- ✅ Grid visual com preview dos ícones
- ✅ Ajuste de tamanho (sm, md, lg, xl)
- ✅ Customização de cor
- ✅ Preview em tempo real
- ✅ Scroll infinito otimizado

**Ícones incluídos:**
- Heart, Star, Sparkles, Check, X
- Home, Settings, User, Mail, Phone
- Search, Camera, Image, Video, Music
- Calendar, Clock, MapPin, Globe, Navigation
- ShoppingCart, CreditCard, DollarSign
- E muitos mais...

**Uso:**
```tsx
<IconSelector
  onIconSelect={(icon, size, color) => {
    console.log('Ícone:', icon.name);
    console.log('Tamanho:', size);
    console.log('Cor:', color);
  }}
/>
```

### 5. ImageUploader.tsx
**Descrição:** Sistema completo de upload de imagens.

**Funcionalidades:**
- ✅ Upload local via input file
- ✅ Upload via URL externa
- ✅ Drag & Drop (planejado para futura implementação)
- ✅ Preview antes de aplicar
- ✅ Validação de formatos (JPG, PNG, WebP, SVG)
- ✅ Informações sobre formatos suportados
- ✅ Feedback visual de loading

**Uso:**
```tsx
<ImageUploader
  currentImage="/path/to/current.jpg"
  onImageSelect={(imageUrl) => {
    console.log('Nova imagem:', imageUrl);
  }}
/>
```

### 6. GalleryStyleSelector.tsx
**Descrição:** Seletor de estilos de galeria com configurações avançadas.

**Estilos disponíveis:**

1. **Grade Clássica (grid)** 🔲
   - Layout em grid uniforme
   - Ideal para portfolios e catálogos
   - Colunas ajustáveis (2-5)

2. **Masonry (masonry)** 🧱
   - Estilo Pinterest
   - Alturas variadas
   - Visual dinâmico e moderno

3. **Carrossel (carousel)** 🎠
   - Slider horizontal
   - Navegação por setas
   - Perfeito para destaque de imagens

4. **Empilhado (stacked)** 📚
   - Cards em cascata
   - Efeito de profundidade
   - Visual elegante

5. **Grid Irregular (irregular)** 🎨
   - Tamanhos variados
   - Layout assimétrico
   - Visual criativo

**Configurações:**
- Número de colunas (2-5)
- Espaçamento ajustável (0-48px)
- Toggle para legendas
- Toggle para lightbox

**Uso:**
```tsx
<GalleryStyleSelector
  currentStyle="grid"
  onStyleChange={(style, config) => {
    console.log('Estilo:', style);
    console.log('Configurações:', config);
  }}
/>
```

## 🎯 Dependências Instaladas

```json
{
  "dependencies": {
    "react-colorful": "^5.6.1"
  }
}
```

## 📁 Estrutura de Arquivos

```
src/features/myeasywebsite/
├── EditableSiteTemplate.tsx (original mantido)
├── MyEasyWebsite.tsx
├── SiteTemplate.tsx
└── editor-components/ ✨ NOVO
    ├── README.md (este arquivo)
    ├── EditingContext.tsx
    ├── EditingPanel.tsx
    ├── ColorPicker.tsx
    ├── IconSelector.tsx
    ├── ImageUploader.tsx
    └── GalleryStyleSelector.tsx
```

## 🚀 Como Integrar no EditableSiteTemplate

### Passo 1: Importar Componentes

```tsx
import { EditingProvider } from './editor-components/EditingContext';
import { EditingPanel } from './editor-components/EditingPanel';
```

### Passo 2: Envolver com EditingProvider

```tsx
export function EditableSiteTemplate({ siteData, onUpdate, viewportMode }) {
  const handleEditorUpdate = (updates) => {
    // Processar atualizações do editor
    console.log('Editor update:', updates);
    
    // Exemplo de como atualizar cores
    if (updates.type === 'color' && updates.elementId === 'primary-color') {
      onUpdate({
        ...siteData,
        colors: JSON.stringify({
          ...JSON.parse(siteData.colors || '{}'),
          primary: updates.value
        })
      });
    }
  };

  return (
    <EditingProvider onUpdate={handleEditorUpdate}>
      <div className="bg-white min-h-full relative">
        {/* Painel de edição */}
        <EditingPanel onClose={() => {}} />
        
        {/* Conteúdo existente */}
        {/* ... */}
      </div>
    </EditingProvider>
  );
}
```

### Passo 3: Adicionar Data Attributes

Marque elementos editáveis com atributos especiais:

```tsx
// Exemplo: Cor editável
<div
  data-editable="true"
  data-element-type="color"
  data-element-id="primary-color"
  style={{ backgroundColor: primaryColor }}
  onClick={() => {
    const { setSelectedElement } = useEditing();
    setSelectedElement({
      id: 'primary-color',
      type: 'color',
      value: primaryColor
    });
  }}
>
  Conteúdo aqui
</div>

// Exemplo: Ícone editável
<div
  data-editable="true"
  data-element-type="icon"
  data-element-id="feature-icon-1"
  onClick={() => {
    const { setSelectedElement } = useEditing();
    setSelectedElement({
      id: 'feature-icon-1',
      type: 'icon',
      value: { name: 'Heart', size: 'md', color: '#ea580c' }
    });
  }}
>
  <Heart size={24} color="#ea580c" />
</div>

// Exemplo: Imagem editável
<img
  data-editable="true"
  data-element-type="image"
  data-element-id="hero-image"
  src={heroImage}
  onClick={() => {
    const { setSelectedElement } = useEditing();
    setSelectedElement({
      id: 'hero-image',
      type: 'image',
      value: heroImage
    });
  }}
/>
```

## 💡 Exemplos de Uso Completo

### Editar Cor do Header

```tsx
const handleHeaderColorClick = () => {
  const { setSelectedElement } = useEditing();
  
  setSelectedElement({
    id: 'header-background',
    type: 'color',
    value: primaryColor,
    label: 'Cor de Fundo do Header'
  });
};
```

### Trocar Ícone de Feature

```tsx
const handleFeatureIconClick = (featureIndex) => {
  const { setSelectedElement } = useEditing();
  
  setSelectedElement({
    id: `feature-icon-${featureIndex}`,
    type: 'icon',
    value: {
      name: currentIcon,
      size: 'lg',
      color: primaryColor
    },
    label: `Ícone da Feature ${featureIndex + 1}`
  });
};
```

### Upload de Imagem da Galeria

```tsx
const handleGalleryImageClick = (imageIndex) => {
  const { setSelectedElement } = useEditing();
  
  setSelectedElement({
    id: `gallery-image-${imageIndex}`,
    type: 'image',
    value: siteData.gallery[imageIndex],
    label: `Imagem da Galeria ${imageIndex + 1}`
  });
};
```

### Alterar Estilo da Galeria

```tsx
const handleGalleryStyleClick = () => {
  const { setSelectedElement } = useEditing();
  
  setSelectedElement({
    id: 'gallery-style',
    type: 'gallery',
    value: {
      style: currentGalleryStyle,
      columns: 3,
      gap: 24,
      showCaptions: true,
      lightbox: true
    },
    label: 'Estilo da Galeria'
  });
};
```

## 🎨 Estrutura de Dados Estendida

Para suportar todas as funcionalidades do editor, você pode estender o `siteData`:

```typescript
interface EnhancedSiteData extends SiteData {
  // Customizações de cores
  customColors?: {
    [elementId: string]: string; // hex color
  };
  
  // Customizações de ícones
  customIcons?: {
    [elementId: string]: {
      name: string;
      size: 'sm' | 'md' | 'lg' | 'xl';
      color: string;
    };
  };
  
  // Customizações de imagens
  customImages?: {
    [elementId: string]: string; // URL
  };
  
  // Configuração da galeria
  galleryConfig?: {
    style: 'grid' | 'masonry' | 'carousel' | 'stacked' | 'irregular';
    columns: number;
    gap: number;
    showCaptions: boolean;
    lightbox: boolean;
  };
}
```

## 📊 Status do Projeto

- ✅ **Infraestrutura Base** - 100% Completo
- ✅ **Componentes Core** - 100% Completo  
- ✅ **Componentes Avançados** - 100% Completo
- ⏳ **Integração no EditableSiteTemplate** - Pronto para implementação
- ⏳ **Testes** - Pendente

## 🔧 Próximas Features (Sugeridas)

1. **AnimationController** - Controlar animações de elementos
2. **FontSelector** - Integração com Google Fonts
3. **ButtonStyler** - Editor de estilos de botões
4. **BackgroundEditor** - Editor de backgrounds (gradientes, imagens, padrões)
5. **SpacingControls** - Controle de padding/margin
6. **SectionLayoutEditor** - Reorganizar seções via drag & drop

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react-colorful'"
**Solução:** Execute `npm install react-colorful`

### Erro: EditingContext não está disponível
**Solução:** Certifique-se de envolver seu componente com `<EditingProvider>`

### Painel não abre ao clicar em elemento
**Solução:** Verifique se o elemento tem os data-attributes corretos e se o handler de clique está chamando `setSelectedElement`

## 📝 Notas Importantes

1. O EditableSiteTemplate.tsx original foi mantido intacto e está funcionando
2. Todos os novos componentes estão na pasta `editor-components/`
3. A integração completa requer testes cuidadosos
4. O sistema é totalmente modular e pode ser expandido facilmente
5. Cada componente é independente e pode ser usado separadamente

## 🤝 Contribuindo

Para adicionar novos editores:

1. Crie um novo arquivo em `editor-components/`
2. Exporte o componente com interface clara
3. Adicione o tipo correspondente no EditingPanel
4. Documente neste README

## 📄 Licença

Este projeto faz parte do MyEasyWebsite e segue a mesma licença do projeto principal.

---

**Desenvolvido com ❤️ para MyEasyWebsite**
