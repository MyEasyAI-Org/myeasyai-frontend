/**
 * Resume Generation Prompts — MyEasyResume
 * Moved from src/services/ResumeGenerationService.ts
 */

import type { PromptBuilder } from './index';

function langLabel(lang: string): string {
  if (lang === 'en-US') return 'inglês americano';
  if (lang === 'es') return 'espanhol';
  return 'português brasileiro';
}

export const resumePrompts: Record<string, PromptBuilder> = {

  'resume.generateProfessionalSummary': (p) =>
`Você é um especialista em recrutamento e currículos profissionais.

CONTEXTO DO PROFISSIONAL:
- Nome: ${p.fullName}
- Cargo Desejado: ${p.targetRole}
- Indústria: ${p.industry}
- Nível de Carreira: ${p.careerLevel}
- Experiências Principais: ${p.experienceSummary}
- Educação: ${p.educationSummary}
- Principais Habilidades: ${p.topSkills}

INSTRUÇÕES:
Crie um resumo profissional impactante e conciso (3-4 linhas) que:
1. Destaque a experiência e expertise do profissional
2. Mencione as principais competências e conquistas
3. Indique o objetivo de carreira alinhado ao cargo desejado
4. Use verbos de ação e linguagem profissional
5. Seja otimizado para ATS (Applicant Tracking Systems)
6. Seja específico e quantificável quando possível

IMPORTANTE:
- NÃO use frases genéricas como "profissional dedicado" ou "buscando oportunidades"
- FOQUE em resultados concretos e competências específicas
- Use um tom ${p.careerLevel === 'executive' ? 'executivo e estratégico' : 'profissional e objetivo'}
- Escreva em ${langLabel(p.preferredLanguage)}

Retorne APENAS o texto do resumo profissional, sem título ou formatação adicional.`,

  'resume.generateExperienceDescription': (p) =>
`Você é um especialista em recrutamento e currículos profissionais.

CONTEXTO:
- Cargo: ${p.position}
- Empresa: ${p.company}
- Indústria: ${p.industry}
- Nível de Carreira: ${p.careerLevel}
- Cargo Desejado: ${p.targetRole}
${p.description ? `- Descrição Atual: ${p.description}` : ''}

INSTRUÇÕES:
Crie uma descrição otimizada para esta experiência profissional que inclua:

1. DESCRIÇÃO GERAL (1-2 linhas):
   - Resumo das responsabilidades principais
   - Contexto do trabalho realizado

2. CONQUISTAS (3-5 bullet points):
   - Use o formato: AÇÃO + RESULTADO + IMPACTO
   - Comece com verbos de ação fortes
   - Seja específico e quantificável (use números, percentuais, etc.)
   - Foque em resultados mensuráveis e impacto no negócio
   - Destaque competências relevantes para ${p.targetRole}

EXEMPLOS DE BOM FORMATO:
✓ "Desenvolveu sistema de automação que reduziu tempo de processamento em 40%, economizando 20h/semana da equipe"
✓ "Liderou equipe de 8 pessoas na implementação de novo CRM, aumentando taxa de conversão em 25%"
✓ "Otimizou processo de deploy, reduzindo tempo de release de 2h para 15min"

IMPORTANTE:
- Use verbos de ação no passado (desenvolveu, implementou, liderou, etc.)
- Seja específico com números e resultados
- Evite descrições genéricas de responsabilidades
- Foque no IMPACTO gerado, não apenas nas tarefas
- Escreva em ${langLabel(p.preferredLanguage)}

FORMATO DA RESPOSTA:
DESCRIÇÃO:
[descrição geral aqui]

CONQUISTAS:
- [conquista 1]
- [conquista 2]
- [conquista 3]
- [conquista 4]`,

  'resume.suggestSkills': (p) =>
`Você é um especialista em recrutamento e mercado de trabalho.

CONTEXTO:
- Cargo Desejado: ${p.targetRole}
- Indústria: ${p.industry}
- Nível de Carreira: ${p.careerLevel}
- Habilidades Atuais: ${p.currentSkills || 'Nenhuma informada'}

INSTRUÇÕES:
Sugira as habilidades mais relevantes e demandadas para este perfil profissional.

Retorne 2 categorias:

1. HABILIDADES TÉCNICAS (8-12 itens):
   - Tecnologias, ferramentas, frameworks específicos
   - Metodologias e práticas relevantes
   - Certificações importantes
   - Conhecimentos técnicos específicos da área

2. HABILIDADES COMPORTAMENTAIS (6-8 itens):
   - Soft skills essenciais para o cargo
   - Competências de liderança (se nível sênior/executivo)
   - Habilidades interpessoais importantes

IMPORTANTE:
- Priorize habilidades em alta demanda no mercado atual
- Seja específico (ex: "React.js" ao invés de "frontend")
- ${p.currentSkills ? 'NÃO repita habilidades que o profissional já possui' : 'Foque nas mais essenciais'}
- Considere o nível de carreira (${p.careerLevel})
- Liste em ${langLabel(p.preferredLanguage)}

FORMATO DA RESPOSTA:
TÉCNICAS:
- [skill 1]
- [skill 2]
...

COMPORTAMENTAIS:
- [skill 1]
- [skill 2]
...`,

  'resume.quantifyAchievement': (p) =>
`Você é um especialista em currículos profissionais.

CONTEXTO:
- Conquista atual: "${p.achievement}"
- Cargo: ${p.targetRole}
- Indústria: ${p.industry}

INSTRUÇÕES:
Transforme esta conquista em uma descrição mais impactante e quantificada:

1. Use verbos de ação fortes no passado
2. Adicione números, percentuais ou métricas (seja realista)
3. Inclua o IMPACTO/RESULTADO concreto
4. Mantenha conciso (1 linha)
5. Seja específico e profissional

EXEMPLOS DE TRANSFORMAÇÃO:
Antes: "Ajudei a melhorar o processo de vendas"
Depois: "Otimizou processo de vendas, aumentando conversão em 30% e gerando R$ 500k em receita adicional"

Antes: "Trabalhei com equipe de desenvolvimento"
Depois: "Colaborou com equipe de 10 desenvolvedores na entrega de 15+ features, reduzindo bugs em 40%"

IMPORTANTE:
- Se o texto original já tiver números, mantenha-os
- Escreva em ${langLabel(p.preferredLanguage)}
- Retorne APENAS a conquista otimizada, sem explicações

Conquista otimizada:`,

};
