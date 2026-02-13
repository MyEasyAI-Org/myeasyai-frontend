/**
 * Learning Prompts — MyEasyLearning
 * Moved from:
 *   src/features/my-easy-learning/services/StudyPlanGenerationService.ts
 *   src/features/my-easy-learning/services/LessonContentGenerationService.ts
 *   src/features/my-easy-learning/services/FinalExamGenerationService.ts
 */

import type { PromptBuilder } from './index';

export const learningPrompts: Record<string, PromptBuilder> = {

  // =========================================================================
  // Study Plan Generation
  // =========================================================================

  'learning.generateStudyPlan': (p) =>
`Você é um especialista em educação e planejamento de estudos. Sua missão é criar um plano de estudos personalizado, estruturado e realista.

PERFIL DO ALUNO:
- Habilidade a Aprender: ${p.skillName}
- Categoria: ${p.category}
- Nível Atual: ${p.currentLevel}
- Nível Desejado: ${p.targetLevel}
- Tempo Disponível: ${p.weeklyHours} horas por semana
- Prazo: ${p.deadlineWeeks} semanas
- Motivação: ${p.motivation}

INSTRUÇÕES PARA CRIAR O PLANO:

1. ESTRUTURA DO PLANO:
   - Crie um plano com EXATAMENTE ${p.deadlineWeeks} semanas
   - Cada semana deve ter aproximadamente ${p.weeklyHours} horas de estudo
   - Progrida do nível ${p.currentLevel} até ${p.targetLevel}

2. FORMATO DE CADA SEMANA:
   Para cada semana, forneça:

   SEMANA [número]:
   TÍTULO: [título da semana, ex: "Fundamentos de Python"]
   FOCO: [breve descrição do foco da semana]
   HORAS: ${p.weeklyHours}

   TAREFAS:
   - TAREFA 1:
     * Descrição: [descrição clara da tarefa]
     * Tipo: [video/article/practice/project/book/course]
     * Recurso: [nome do recurso recomendado - curso específico, canal do YouTube, site, etc.]
     * URL: [URL real do recurso, se possível. Use URLs de recursos gratuitos conhecidos quando disponível]
     * Duração: [tempo estimado em minutos]

   - TAREFA 2:
     [mesmo formato...]

   [Continue com 3-5 tarefas por semana]

3. MILESTONES (MARCOS):
   Defina 2-3 milestones importantes ao longo do plano:

   MILESTONE [número]:
   SEMANA: [número da semana]
   TÍTULO: [título do milestone]
   DESCRIÇÃO: [descrição do que deve ser alcançado]
   ENTREGÁVEL: [projeto ou resultado concreto esperado]

4. TÓPICOS PRINCIPAIS:
   Liste 5-8 tópicos principais que serão cobertos no plano.

DIRETRIZES IMPORTANTES:
- Seja ESPECÍFICO com recursos reais (cursos do YouTube, Udemy, Coursera, freeCodeCamp, etc.)
- Para vídeos, recomende canais/cursos conhecidos e de qualidade
- Para artigos, sugira sites respeitáveis (Medium, Dev.to, documentação oficial, etc.)
- Para prática, sugira plataformas como LeetCode, HackerRank, exercism.io, etc.
- Distribua os tipos de recursos: 40% vídeos, 30% prática, 20% leitura, 10% projetos
- Considere a motivação "${p.motivation}" ao escolher projetos e exemplos
- Seja realista com o tempo: não sobrecarregue o aluno
- Progrida gradualmente: conceitos básicos → intermediários → avançados

FORMATO DA RESPOSTA:
Use EXATAMENTE o formato especificado acima para facilitar o parsing.
Separe cada semana claramente com "SEMANA [número]:" e cada milestone com "MILESTONE [número]:".

IMPORTANTE:
- Retorne APENAS o plano estruturado, sem introduções ou conclusões
- Use URLs reais sempre que possível (YouTube, Coursera, freeCodeCamp, etc.)
- Seja prático e objetivo`,

  'learning.generateEnhancedStudyPlan': (p) =>
`Voce e um especialista em educacao. Crie um plano de estudos com LICOES que voce vai ENSINAR diretamente ao aluno.

PERFIL DO ALUNO:
- Habilidade: ${p.skillName}
- Categoria: ${p.category}
- Nivel atual: ${p.currentLevel}
- Nivel desejado: ${p.targetLevel}
- Tempo semanal: ${p.weeklyHours} horas
- Prazo: ${p.deadlineWeeks} semanas
- Motivacao: ${p.motivation}

ESTRATEGIA DE CONTEUDO:
${p.contentStrategy}

INSTRUCOES:
1. Crie EXATAMENTE ${p.deadlineWeeks} semanas
2. Cada semana deve ter 2-4 LICOES (topicos que voce vai ensinar)
3. Para cada licao, defina objetivos de aprendizagem claros
4. Progrida do nivel ${p.currentLevel} ate ${p.targetLevel}

FORMATO (use exatamente este formato):

SEMANA 1:
TITULO: [titulo da semana]
FOCO: [foco principal]
OBJETIVOS: [objetivo 1], [objetivo 2], [objetivo 3]
MODO: native
LICAO 1:
- TITULO: [titulo da licao]
- DESCRICAO: [breve descricao]
- OBJETIVOS: [objetivo de aprendizagem 1], [objetivo 2]
LICAO 2:
- TITULO: [titulo da licao]
- DESCRICAO: [breve descricao]
- OBJETIVOS: [objetivo 1], [objetivo 2]

SEMANA 2:
[mesmo formato...]

TOPICOS_PRINCIPAIS: [topico1], [topico2], [topico3], [topico4], [topico5]

Gere o plano agora:`,

  // =========================================================================
  // Lesson Content Generation
  // =========================================================================

  'learning.generateTheory': (p) =>
`Voce e um professor especialista e vai criar uma licao completa sobre o topico solicitado.

PERFIL DO ALUNO:
- Habilidade: ${p.skillName}
- Nivel atual: ${p.currentLevel}
- Nivel objetivo: ${p.targetLevel}

TOPICO DA LICAO:
- Titulo: ${p.lessonTitle}
- Objetivos: ${p.objectives}

INSTRUCOES:
1. Crie uma licao clara e didatica em portugues brasileiro
2. Use analogias do dia-a-dia para explicar conceitos abstratos
3. Seja amigavel e encorajador, como um mentor
4. Inclua exemplos praticos sempre que possivel
5. Destaque erros comuns e como evita-los
6. Se for sobre programacao, inclua codigo comentado

FORMATO DA RESPOSTA (use exatamente este formato):

===SECAO_TEORIA===
[Explicacao do conceito principal em Markdown. Seja claro e use paragrafos curtos.]

===SECAO_EXEMPLO===
[Se aplicavel, codigo de exemplo com comentarios explicativos]
LINGUAGEM: [linguagem do codigo, ex: python, javascript]
EXPLICACAO: [explicacao do que o codigo faz]

===SECAO_DICA===
[Dica importante ou boa pratica relacionada ao topico]

===SECAO_ALERTA===
[Erro comum que iniciantes cometem e como evitar]

===SECAO_RESUMO===
PONTO1: [primeiro ponto chave]
PONTO2: [segundo ponto chave]
PONTO3: [terceiro ponto chave]

Gere o conteudo agora:`,

  'learning.generateQuiz': (p) =>
`Com base no conteudo da licao sobre "${p.lessonTitle}", crie ${p.questionCount} perguntas de quiz para testar o entendimento do aluno.

CONTEUDO DA LICAO:
${p.lessonContent}

NIVEL DO ALUNO: ${p.level}

INSTRUCOES:
1. Crie perguntas que testem compreensao, nao memorizacao
2. Varie os tipos: multipla escolha, verdadeiro/falso
3. Dificuldade: 40% facil, 40% medio, 20% dificil
4. Inclua explicacoes detalhadas para cada resposta
5. Se for sobre codigo, inclua snippets nas perguntas

FORMATO DA RESPOSTA (JSON):
{
  "questions": [
    {
      "question": "texto da pergunta",
      "type": "multiple_choice" ou "true_false",
      "difficulty": "easy" ou "medium" ou "hard",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": "resposta correta (exatamente como nas opcoes)",
      "explanation": "explicacao de por que esta e a resposta correta",
      "codeContext": "codigo relacionado, se aplicavel"
    }
  ]
}

Gere o JSON agora:`,

  'learning.generateExercises': (p) =>
`Crie ${p.exerciseCount} exercicios praticos para o aluno aplicar o que aprendeu sobre "${p.lessonTitle}".

CONTEUDO DA LICAO:
${p.lessonContent}

NIVEL DO ALUNO: ${p.level}
CATEGORIA: ${p.category}

INSTRUCOES:
1. Crie exercicios praticos que reforcem o aprendizado
2. Comece com exercicios simples e aumente a dificuldade
3. Inclua codigo inicial (starter code) quando aplicavel
4. Forneca dicas uteis para ajudar o aluno
5. Inclua a solucao esperada

FORMATO DA RESPOSTA (JSON):
{
  "exercises": [
    {
      "title": "titulo do exercicio",
      "description": "descricao detalhada do que fazer (Markdown)",
      "difficulty": "easy" ou "medium" ou "hard",
      "starterCode": "codigo inicial, se aplicavel",
      "solution": "solucao esperada",
      "hints": ["dica 1", "dica 2"],
      "estimatedMinutes": numero
    }
  ]
}

Gere o JSON agora:`,

  'learning.generateExternalResources': (p) =>
`Recomende ${p.resourceCount} recursos externos de alta qualidade para o aluno aprofundar seus conhecimentos sobre "${p.lessonTitle}".

CONTEXTO:
- Habilidade: ${p.skillName}
- Nivel: ${p.level}
- Categoria: ${p.category}

INSTRUCOES:
1. Recomende recursos reais e de qualidade (YouTube, Udemy, Coursera, documentacao oficial, etc)
2. Prefira recursos em portugues, mas inclua em ingles se forem essenciais
3. Inclua mix de gratuitos e pagos
4. Explique por que cada recurso e recomendado

FORMATO DA RESPOSTA (JSON):
{
  "resources": [
    {
      "type": "video" ou "article" ou "course" ou "documentation" ou "tutorial",
      "title": "titulo do recurso",
      "url": "URL do recurso",
      "source": "nome da plataforma (YouTube, Udemy, etc)",
      "description": "breve descricao do conteudo",
      "whyRecommended": "por que este recurso e util para o aluno",
      "estimatedMinutes": numero,
      "isFree": true ou false,
      "language": "pt" ou "en"
    }
  ]
}

Gere o JSON agora:`,

  // =========================================================================
  // Final Exam Generation
  // =========================================================================

  'learning.generateFinalExam': (p) =>
`Voce e um avaliador educacional rigoroso. Crie ${p.questionCount} perguntas para uma PROVA FINAL abrangente sobre "${p.skillName}".

PERFIL DO ALUNO:
- Habilidade: ${p.skillName}
- Nivel: ${p.level}
- Categoria: ${p.category}

TOPICOS DO CURSO QUE DEVEM SER COBERTOS:
${p.topicsList}

INSTRUCOES RIGOROSAS:
1. As perguntas devem cobrir TODOS os topicos listados acima de forma equilibrada
2. As perguntas devem testar COMPREENSAO PROFUNDA, nao memorizacao
3. Distribuicao de dificuldade: ${p.easyPct}% facil, ${p.mediumPct}% medio, ${p.hardPct}% dificil
4. Use TODOS os tipos de pergunta de forma variada:
   - "multiple_choice": 4 opcoes, apenas 1 correta
   - "true_false": afirmacao para avaliar verdadeiro/falso (opcoes: ["Verdadeiro", "Falso"])
   - "fill_blank": preencher lacuna (correctAnswer e a palavra/frase que completa)
   - "code_output": qual a saida deste codigo? (inclua codeContext)
   - "multiple_select": selecionar TODAS as opcoes corretas (use correctAnswers como array)
5. Para "fill_blank": a pergunta deve conter "___" indicando onde vai a resposta
6. Para "multiple_select": marque 2-3 opcoes corretas em correctAnswers
7. Inclua explicacoes detalhadas para TODAS as respostas
8. Cada pergunta deve indicar qual topico do curso ela cobre (campo "topic")
9. As perguntas devem ser desafiadoras o suficiente para validar conhecimento real

FORMATO DA RESPOSTA (JSON):
{
  "questions": [
    {
      "question": "texto da pergunta",
      "type": "multiple_choice",
      "difficulty": "easy",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": "resposta correta exata",
      "correctAnswers": null,
      "explanation": "explicacao detalhada",
      "codeContext": null,
      "topic": "nome do topico coberto"
    },
    {
      "question": "Verdadeiro ou Falso: afirmacao aqui",
      "type": "true_false",
      "difficulty": "medium",
      "options": ["Verdadeiro", "Falso"],
      "correctAnswer": "Verdadeiro",
      "correctAnswers": null,
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    },
    {
      "question": "Complete: O ___ e responsavel por...",
      "type": "fill_blank",
      "difficulty": "hard",
      "options": null,
      "correctAnswer": "palavra correta",
      "correctAnswers": null,
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    },
    {
      "question": "Selecione TODAS as opcoes corretas sobre X:",
      "type": "multiple_select",
      "difficulty": "hard",
      "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
      "correctAnswer": null,
      "correctAnswers": ["opcao1", "opcao3"],
      "explanation": "explicacao",
      "codeContext": null,
      "topic": "topico"
    }
  ]
}

Gere o JSON agora:`,

};
