/**
 * Content Rewriting Prompts — MyEasyWebsite
 * Moved from src/services/ContentRewritingService.ts
 */

import type { PromptBuilder } from './index';

export const contentRewritingPrompts: Record<string, PromptBuilder> = {

  'content.rewriteSlogan': (p) =>
`Você é um especialista em gramática e estilo.

TAREFA: Corrija a capitalização do slogan a seguir para o formato "Title Case".

SLOGAN ORIGINAL: "${p.originalSlogan}"

REQUISITOS:
1. NÃO altere as palavras, apenas a capitalização.
2. Todas as palavras importantes devem começar com letra MAIÚSCULA.
3. Artigos e preposições curtas (a, o, de, em, para) devem ficar em minúsculo, a menos que sejam a primeira palavra.

EXEMPLOS:
- "doces sempre já" -> "Doces Sempre Já"
- "transformando sonhos em realidade" -> "Transformando Sonhos em Realidade"
- "a melhor pizza da cidade" -> "A Melhor Pizza da Cidade"

Retorne APENAS o slogan corrigido, sem aspas ou comentários.`,

  'content.rewriteDescription': (p) =>
`Você é um especialista em copywriting conciso e impactante.

TAREFA: Reescreva a descrição da empresa de forma ULTRA CONCISA e IMPACTANTE.

INFORMAÇÕES DA EMPRESA:
- Nome: ${p.name}
- Área: ${p.area}
${p.slogan ? `- Slogan: ${p.slogan}` : ''}
- Descrição atual: ${p.originalDescription}
${p.targetAudience ? `- Público-alvo: ${p.targetAudience}` : ''}
${p.differentials ? `- Diferenciais: ${p.differentials}` : ''}

REQUISITOS CRÍTICOS:
1. MÁXIMO de 50 palavras (1-2 frases curtas e impactantes)
2. Focar APENAS no principal benefício
3. Linguagem DIRETA e EMOCIONAL
4. SEM palavras desnecessárias
5. Corrigir ortografia e gramática

ESTRUTURA:
- 1 frase principal (máximo 30 palavras)
- 1 frase complementar OPCIONAL (máximo 20 palavras)

EXEMPLOS DE TAMANHO IDEAL:
- "Transformamos seus sonhos em realidade com qualidade premium e atendimento personalizado."
- "Oferecemos a melhor experiência em [área] com resultados que superam expectativas."

Retorne APENAS o texto reescrito, SEM aspas ou comentários.`,

  'content.rewriteServices': (p) =>
`Você é um especialista em copywriting para serviços e produtos.

TAREFA: Reescreva a lista de serviços de forma ATRATIVA e PROFISSIONAL.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
- Serviços atuais:
${p.servicesFormatted}

REQUISITOS:
1. Corrigir ortografia e gramática.
2. Capitalizar cada serviço como um título (Title Case), onde cada palavra importante começa com maiúscula.
3. Ser ESPECÍFICO e DESCRITIVO.
4. Adicionar adjetivos que transmitam QUALIDADE.
5. MÁXIMO de 4-6 palavras por serviço.
6. Evitar repetições.

EXEMPLOS DE TRANSFORMAÇÃO:
"corte" → "Corte Profissional Personalizado"
"barba" → "Design de Barba Masculina"
"unhas" → "Manicure e Pedicure Premium"
"cafe" → "Café Gourmet Selecionado"

Retorne APENAS a lista numerada dos serviços reescritos, um por linha, sem comentários adicionais.
Formato:
1. Serviço 1
2. Serviço 2
etc.`,

  'content.generateFAQ': (p) =>
`Você é um especialista em atendimento ao cliente e FAQ.

TAREFA: Crie 5 perguntas frequentes (FAQ) RELEVANTES para esta empresa, com respostas COMPLETAS e ÚTEIS.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
${p.services ? `- Serviços: ${p.services}` : ''}

REQUISITOS:
1. Perguntas devem ser as MAIS COMUNS do setor
2. Respostas devem ser CLARAS, OBJETIVAS e COMPLETAS
3. Incluir informações sobre: agendamento, pagamento, horários, políticas
4. Tom PROFISSIONAL mas ACOLHEDOR
5. Corrigir ortografia e gramática

FORMATO DE RETORNO (exatamente assim):
Q: Pergunta 1?
A: Resposta completa da pergunta 1.

Q: Pergunta 2?
A: Resposta completa da pergunta 2.

(e assim por diante para 5 perguntas)

Retorne APENAS no formato especificado, sem introduções ou comentários adicionais.`,

  'content.generateHeroStats': (p) =>
`Você é um especialista em copywriting e marketing.

TAREFA: Crie 3 estatísticas IMPACTANTES e REALISTAS para a Hero Section do site.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}

REQUISITOS:
1. Estatísticas devem ser RELEVANTES para o setor
2. Valores devem ser REALISTAS (não exagerar)
3. Labels devem ser CURTOS e IMPACTANTES
4. Focar em: clientes, avaliações, experiência, projetos, etc.

FORMATO DE RETORNO (exatamente assim):
STAT1: [valor]|[label]
STAT2: [valor]|[label]
STAT3: [valor]|[label]

EXEMPLOS:
STAT1: 500+|Clientes Satisfeitos
STAT2: 4.9★|Avaliação Média
STAT3: 8 Anos|de Experiência

Retorne APENAS no formato especificado, sem comentários adicionais.`,

  'content.generateFeatures': (p) =>
`Você é um especialista em copywriting e marketing de conversão.

TAREFA: Crie 3 BENEFÍCIOS/FEATURES únicos e persuasivos para esta empresa.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
${p.services ? `- Serviços: ${p.services}` : ''}

REQUISITOS:
1. Focar em BENEFÍCIOS para o cliente, não características técnicas
2. Títulos devem ter MÁXIMO 4 palavras
3. Descrições devem ter MÁXIMO 15 palavras
4. Usar linguagem EMOCIONAL e PERSUASIVA
5. Ser ESPECÍFICO para o setor

FORMATO DE RETORNO (exatamente assim):
FEATURE1: [título]|[descrição]
FEATURE2: [título]|[descrição]
FEATURE3: [título]|[descrição]

EXEMPLO para barbearia:
FEATURE1: Experiência Premium|Muito mais que um corte, uma verdadeira experiência de luxo e conforto
FEATURE2: Mestres da Barbearia|Profissionais altamente treinados com anos de experiência no ofício
FEATURE3: Agendamento Rápido|Agende seu horário em segundos pelo app ou WhatsApp

Retorne APENAS no formato especificado, sem comentários adicionais.`,

  'content.generateAboutContent': (p) =>
`Você é um especialista em copywriting e storytelling empresarial.

TAREFA: Crie conteúdo PERSUASIVO para a seção "Sobre Nós".

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
- Descrição: ${p.description}

REQUISITOS:
1. Título: MÁXIMO 3 palavras, IMPACTANTE
2. Subtítulo: 1 frase que complete o título (10-15 palavras)
3. Checklist: 3 itens que destaquem DIFERENCIAIS (máximo 5 palavras cada)

FORMATO DE RETORNO (exatamente assim):
TITLE: [título]
SUBTITLE: [subtítulo]
CHECK1: [item da checklist]
CHECK2: [item da checklist]
CHECK3: [item da checklist]

EXEMPLO para academia:
TITLE: Transforme Seu Corpo
SUBTITLE: Com equipamentos de última geração e personal trainers dedicados
CHECK1: Personal Trainers Certificados
CHECK2: Equipamentos Modernos
CHECK3: Ambiente Motivador

Retorne APENAS no formato especificado.`,

  'content.generateServiceDescriptions': (p) =>
`Você é um especialista em copywriting de serviços.

TAREFA: Crie descrições PERSUASIVAS para cada serviço.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
- Serviços:
${p.servicesFormatted}

REQUISITOS:
1. Cada descrição deve ter MÁXIMO 12 palavras
2. Focar em BENEFÍCIOS e RESULTADOS
3. Usar linguagem PERSUASIVA
4. Ser ESPECÍFICO para o serviço

FORMATO DE RETORNO (uma linha por serviço):
SERVICE1: [descrição do serviço 1]
SERVICE2: [descrição do serviço 2]
etc.

Retorne APENAS no formato especificado.`,

  'content.generateTestimonials': (p) =>
`Você é um especialista em marketing de conteúdo e social proof.

TAREFA: Crie 3 depoimentos AUTÊNTICOS e PERSUASIVOS de clientes fictícios.

INFORMAÇÕES:
- Empresa: ${p.name}
- Área: ${p.area}
${p.services ? `- Serviços: ${p.services}` : ''}

REQUISITOS:
1. Nomes brasileiros REALISTAS e diversos (incluir gêneros diferentes)
2. Depoimentos devem parecer AUTÊNTICOS (linguagem natural)
3. Mencionar BENEFÍCIOS específicos recebidos
4. MÁXIMO 20 palavras por depoimento
5. Variar o tom (formal, informal, entusiasmado)

FORMATO DE RETORNO:
TESTIMONIAL1: [Nome Completo]|[Cargo/Descrição]|[Depoimento]
TESTIMONIAL2: [Nome Completo]|[Cargo/Descrição]|[Depoimento]
TESTIMONIAL3: [Nome Completo]|[Cargo/Descrição]|[Depoimento]

EXEMPLO para restaurante:
TESTIMONIAL1: Ana Beatriz Santos|Cliente desde 2023|A comida é maravilhosa! Ambiente acolhedor e atendimento impecável. Melhor experiência gastronômica da região!
TESTIMONIAL2: Carlos Eduardo Lima|Cliente frequente|Pratos deliciosos e preço justo. Sempre volto e recomendo para amigos e família!
TESTIMONIAL3: Marina Costa Silva|Cliente VIP|Simplesmente perfeito! Da entrada à sobremesa, tudo preparado com muito carinho e qualidade!

Retorne APENAS no formato especificado.`,

  'content.correctNameCapitalization': (p) =>
`TAREFA: Corrija a capitalização do nome desta empresa. Nomes próprios e palavras importantes devem começar com maiúscula.

NOME ORIGINAL: "${p.name}"

EXEMPLOS:
- "doces já" -> "Doces Já"
- "barbearia do zé" -> "Barbearia do Zé"
- "myeasyai" -> "MyEasyAI"

Retorne APENAS o nome corrigido, sem aspas ou comentários.`,

  'content.generateCustomColorPalettes': (p) =>
`Você é um especialista em design de cores e paletas profissionais.

TAREFA: Crie 6 paletas de cores PROFISSIONAIS baseadas nesta descrição: "${p.colorDescription}"

INSTRUÇÕES:
1. Analise as cores mencionadas na descrição
2. Crie 6 variações diferentes mas harmoniosamente relacionadas
3. Cada paleta deve ter: primary, secondary, accent, dark, light
4. Use códigos HEX válidos (ex: #1E40AF)
5. Paletas devem ser adequadas para websites profissionais
6. Nomes criativos e relacionados à descrição

FORMATO DE RETORNO (exatamente assim):
PALETTE1: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE2: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE3: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE4: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE5: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]
PALETTE6: [Nome]|[primary]|[secondary]|[accent]|[dark]|[light]

EXEMPLO para "azul e laranja":
PALETTE1: Oceano Vibrante|#1E40AF|#F97316|#60A5FA|#1E293B|#F0F9FF
PALETTE2: Crepúsculo Urbano|#2563EB|#EA580C|#3B82F6|#0F172A|#EFF6FF
PALETTE3: Energia Solar|#0EA5E9|#FB923C|#38BDF8|#1E293B|#F0F9FF
PALETTE4: Horizonte Dourado|#0284C7|#D97706|#0EA5E9|#164E63|#ECFEFF
PALETTE5: Fogo e Gelo|#075985|#C2410C|#0369A1|#0C4A6E|#F0F9FF
PALETTE6: Modernidade Tech|#3B82F6|#F59E0B|#60A5FA|#1E3A8A|#DBEAFE

Retorne APENAS no formato especificado, sem comentários adicionais.`,

};
