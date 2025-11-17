# Style Guide - MyEasyAi

Este documento define os padrões de estilo e boas práticas de desenvolvimento para o projeto **MyEasyAi**.  
O objetivo é garantir consistência, legibilidade e manutenibilidade em todo o código.

---

## 📦 Ferramentas de Estilo
O projeto utiliza **Biome** como ferramenta principal de linting e formatação.

Configuração base (biome.json):
- **Indentação:** 2 espaços
- **Aspas:** simples (`'`)
- **Ponto e vírgula:** sempre obrigatório
- **Organização automática de imports**
- **Lint rules:** recomendadas pelo Biome
- **Suporte a JavaScript e TypeScript**

---

## 📑 Regras Gerais

### Estrutura do Código
- Sempre use **2 espaços** para indentação (sem tabs).
- **Imports organizados automaticamente** (ordem e agrupamento gerenciados pelo Biome).
- **Semicolon obrigatório** ao final de cada instrução.
- Use **aspas simples** para strings, exceto quando for necessário escapar aspas internas.

### Nomenclatura
- Variáveis e funções: `camelCase`
- Classes e componentes React: `PascalCase`
- Constantes globais: `UPPER_CASE`
- Nomes de arquivos:
  - Componentes React: `PascalCase` (ex: `Button.tsx`, `LoginModal.tsx`)
  - Hooks personalizados: `camelCase` com prefixo `use` (ex: `useInactivityTimeout.ts`)
  - Utilitários, configs e outros: `kebab-case` (ex: `vite.config.ts`, `api-client.ts`)

### Boas Práticas
- Prefira **funções puras** e componentização.
- Evite código duplicado — extraia helpers ou hooks quando necessário.
- Comentários apenas quando necessário para clareza.
- **Todos os comentários devem ser escritos em inglês** (padrão internacional de mercado).
- Commits devem ser **pequenos, descritivos e consistentes**.

---

## ✅ Exemplo de Código Correto

```ts
import { useState } from 'react';

type User = {
  id: string;
  name: string;
};

// Function to display user card with toggle functionality
export default function UserCard({ id, name }: User) {
  const [active, setActive] = useState(false);

  // Toggle active state on click
  const toggle = () => setActive(!active);

  return (
    <div onClick={toggle}>
      <span>{name}</span>
      {active && <span>(active)</span>}
    </div>
  );
}
