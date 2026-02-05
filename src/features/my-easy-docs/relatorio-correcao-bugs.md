# Relatório de Correção de Bugs - MyEasyDocs

Este documento registra os bugs identificados, soluções aplicadas e testes manuais para verificação.

---

## Bug 1+4: Conteúdo do Preview Não Atualiza / Sidebar Não Abre Arquivos

### Problema Identificado
- Ao abrir um arquivo com double click e depois clicar em outros arquivos, o header muda mas o conteúdo permanece do primeiro arquivo
- No painel esquerdo (sidebar) não é possível clicar em arquivos de diretórios pai ou filho

### Causa Raiz
As funções `handleSelectDocument` e `handleOpenDocument` em `MyEasyDocs.tsx` procuravam o documento apenas no array `documents` (filtrado pela pasta atual), não em `allDocuments`.

### Solução Aplicada
Modificadas as funções para buscar primeiro em `documents`, depois em `allDocuments`:
```typescript
const doc = documents.find((d) => d.id === documentId)
         || allDocuments.find((d) => d.id === documentId);
```

### Status
- [x] Implementado
- [x] Testado - **RESOLVIDO**

### Resultado dos Testes
Todos os testes passaram com sucesso.

---

## Bug 2: Favoritos Não Funcionam

### Problema Identificado
Nenhuma forma de favoritar arquivos funciona e a view de favoritos fica sempre vazia.

### Causa Raiz (Hipótese Inicial)
Após o toggle de favorito, apenas `refreshDocuments()` era chamado, mas a view de favoritos usa `allDocuments`. Faltava chamar `refreshAllDocuments()`.

### Solução Aplicada (v1 - NÃO FUNCIONOU)
Adicionado `refreshAllDocuments()` nos handlers `handleToggleFavorite` e `handleToggleFavoriteItem`.

### Status
- [x] Implementado
- [x] Testado - **NÃO RESOLVIDO**

### Resultado dos Testes
Nenhum teste passou. A solução aplicada não corrigiu o problema. Necessária investigação adicional para identificar a causa raiz real.

### Próximos Passos
- [ ] Verificar se a API `DocumentService.toggleFavorite()` está sendo chamada
- [ ] Verificar se a API retorna o documento atualizado com `is_favorite` correto
- [ ] Verificar se o estado está sendo atualizado corretamente após a chamada
- [ ] Inspecionar o console do navegador para erros

---

## Bug 3a: Filtro de Busca Só Funciona a Partir de 2 Letras

### Problema Identificado
A busca só começa a filtrar a partir de 2 caracteres digitados.

### Causa Raiz
O hook `useDocsSearch` tem `minQueryLength = 2` como padrão e o componente não sobrescrevia esse valor.

### Solução Aplicada
Passado `minQueryLength: 1` nas opções do hook `useDocsSearch`.

### Status
- [x] Implementado
- [x] Testado - **RESOLVIDO**

### Resultado dos Testes
Testes passaram. Busca agora funciona a partir de 1 caractere.

### Correções Adicionais
Nenhuma correção adicional necessária.

---

## Bug 3b: Pasta Aparece Dentro Dela Mesma na Busca

### Problema Identificado
Ao buscar e clicar na pasta onde o arquivo está localizado, a pasta aparece dentro dela mesma porém vazia.

### Causa Raiz
Ao navegar para uma pasta durante uma busca, o query não era limpo, então `isSearchActive` permanecia true e o `displayedFolders` continuava mostrando pastas com matches.

### Solução Aplicada (v1)
Adicionado `setSearchQuery('')` no handler `handleNavigateToFolder` para limpar a busca ao navegar.

### Solução Aplicada (v2 - Atualizada)
Além de limpar a busca ao navegar, também foi alterada a lógica de `displayedFolders` para filtrar apenas pastas filhas que correspondem ao nome da busca:
```typescript
if (isSearchActive) {
  const queryLower = searchQuery.toLowerCase();
  return childFolders.filter((f) => f.name.toLowerCase().includes(queryLower));
}
```

### Status
- [x] Implementado
- [x] Testado - **DEPENDE DO BUG 3c**

### Resultado dos Testes
A busca é limpa ao navegar. O comportamento final depende da correção do Bug 3c (escopo da busca).

### Testes Manuais Atualizados
1. Digitar "ani" no campo de busca
2. Verificar se a pasta "ANIMAIS" aparece nos resultados
3. Clicar na pasta "ANIMAIS"
4. Verificar se a busca é limpa (campo de busca vazio)
5. Verificar se mostra o conteúdo normal da pasta
6. Verificar que a pasta não aparece dentro dela mesma

---

## Bug 3c: Escopo da Busca Incorreto

### Problema Identificado
A busca estava sendo feita em "Meus Documentos" (todos os documentos), quando deveria buscar apenas na pasta atual e suas subpastas.

### Requisito Correto
- A busca deve incluir documentos da pasta atual
- A busca deve incluir documentos de TODAS as pastas filhas (recursivamente)
- A busca NÃO deve incluir documentos de pastas pai

### Causa Raiz
O hook `useDocsSearch` usava `allDocuments` que incluía documentos de todas as pastas (inclusive pais).

### Solução Aplicada (v1 - INCORRETA)
Alterado para usar apenas `documents` (diretório atual), mas isso excluiu as pastas filhas também.

### Status
- [x] Implementado
- [ ] Testado - **PRECISA CORREÇÃO**

### Correção Necessária
Modificar a lógica para:
1. Incluir documentos do diretório atual (`documents`)
2. Incluir documentos de todos os diretórios filhos (recursivamente)
3. Excluir documentos de diretórios pai

### Testes Manuais
1. Estar em "Meus Documentos" (raiz) e buscar "abe"
   - Deve encontrar "abelha.txt" dentro de "ANIMAIS"
2. Estar dentro de "ANIMAIS" e buscar "casa"
   - NÃO deve encontrar "casas.txt" (está na raiz, que é pai)
3. Se houver subpasta dentro de "ANIMAIS", buscar arquivos dela
   - Deve encontrar arquivos das subpastas

---

## Bug 5: Cards Aumentam de Tamanho ao Abrir Preview

### Problema Identificado
Ao abrir a visualização de um arquivo, o tamanho dos cards de arquivos e pastas aumenta.

### Causa Raiz
O grid usava `minmax(180px, 1fr)` que permitia cards crescerem. Quando o preview abre (480px), o espaço diminui e cada coluna expande para preencher o espaço.

### Solução Aplicada
Alterado o grid para usar `minmax(140px, 170px)` limitando o tamanho máximo dos cards e garantindo 4 cards por linha.

### Status
- [x] Implementado
- [x] Testado - **RESOLVIDO**

### Resultado dos Testes
Cards mantêm tamanho consistente e cabem 4 por linha.

---

## Resumo de Status

| Bug | Status | Observação |
|-----|--------|------------|
| 1+4 | ✅ Resolvido | Todos os testes passaram |
| 2 | ❌ Não Resolvido | Nenhum teste passou, requer investigação |
| 3a | ✅ Resolvido | Testes passaram |
| 3b | ⏳ Depende do 3c | Aguardando correção do escopo da busca |
| 3c | ❌ Incorreto | Lógica precisa ser refeita para busca recursiva em filhos |
| 5 | ✅ Resolvido | Cards com tamanho consistente |

---

## Resumo de Arquivos Modificados

| Arquivo | Bugs Corrigidos |
|---------|-----------------|
| `MyEasyDocs.tsx` | 1, 2*, 3a, 3b, 3c*, 4 |
| `FileGrid.tsx` | 5 |

*Correção não funcionou ou precisa ser refeita

---

## Próximas Ações

1. **Bug 3c**: Implementar busca recursiva em pastas filhas (prioridade)
2. **Bug 3b**: Testar após correção do 3c
3. **Bug 2**: Investigar por que favoritos não funcionam
