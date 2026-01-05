/**
 * MyEasyFitness Constants
 *
 * Configuration and constant values for the fitness assistant module.
 */

import type {
  ActivityLevel,
  ActivityLevelConfig,
  AnamneseStep,
  BiologicalSex,
  Dieta,
  FitnessMessage,
  UserAnamnese,
} from '../types';

/**
 * Default empty anamnese data
 */
export const DEFAULT_ANAMNESE: UserAnamnese = {
  nome: '',
  idade: 0,
  sexo: '',
  peso: 0,
  altura: 0,
  objetivo: '',
  nivelAtividade: '',
  restricoesMedicas: [],
  lesoes: [],
};

/**
 * Activity level configurations with Harris-Benedict factors
 */
export const ACTIVITY_LEVELS: ActivityLevelConfig[] = [
  {
    id: 'sedentario',
    name: 'Sedentario',
    description: 'Pouco ou nenhum exercicio',
    factor: 1.2,
  },
  {
    id: 'leve',
    name: 'Levemente ativo',
    description: 'Exercicio leve 1-3 dias/semana',
    factor: 1.375,
  },
  {
    id: 'moderado',
    name: 'Moderadamente ativo',
    description: 'Exercicio moderado 3-5 dias/semana',
    factor: 1.55,
  },
  {
    id: 'intenso',
    name: 'Muito ativo',
    description: 'Exercicio intenso 6-7 dias/semana',
    factor: 1.725,
  },
];

/**
 * Get activity level factor by ID
 */
export const getActivityFactor = (level: ActivityLevel): number => {
  const config = ACTIVITY_LEVELS.find((l) => l.id === level);
  return config?.factor ?? 1.4;
};

/**
 * Get activity level display name
 */
export const getActivityLevelName = (level: ActivityLevel): string => {
  const config = ACTIVITY_LEVELS.find((l) => l.id === level);
  return config?.name ?? level;
};

/**
 * Anamnese questions (grouped for natural conversation flow)
 */
export const ANAMNESE_QUESTIONS: Record<AnamneseStep, string> = {
  info_basica:
    'Ola! Sou seu assistente de fitness. Vou te ajudar a criar treinos e dietas personalizados.\n\nPara comecar, me conte: qual seu nome, sexo biologico e idade?\n\n(Ex: "Joao, masculino, 28 anos")',
  medidas:
    'Prazer, {nome}! Agora me diga seu peso e altura.\n\n(Ex: "75kg e 175cm" ou "75kg, 1.75m")',
  objetivo:
    'Otimo! Qual e o seu principal objetivo?\n\nExemplos: perder gordura, ganhar massa muscular, manter a forma, melhorar condicionamento...',
  atividade:
    'Qual seu nivel de atividade fisica atual?\n\n1. Sedentario (pouco ou nenhum exercicio)\n2. Leve (exercicio 1-3 dias/semana)\n3. Moderado (exercicio 3-5 dias/semana)\n4. Intenso (exercicio 6-7 dias/semana)',
  saude:
    'Por ultimo: voce tem alguma restricao medica ou lesao que eu deva considerar?\n\n(Ex: "diabetes, lesao no joelho" ou "nenhuma")',
  complete: '',
};

/**
 * Error messages for anamnese validation
 */
export const ANAMNESE_ERROR_MESSAGES: Record<AnamneseStep, string> = {
  info_basica:
    'Nao consegui entender. Por favor, informe seu nome, sexo e idade.\n\n(Ex: "Maria, feminino, 25 anos")',
  medidas:
    'Nao consegui entender. Por favor, informe seu peso e altura.\n\n(Ex: "70kg e 165cm")',
  objetivo: 'Por favor, me conte qual e seu objetivo principal.',
  atividade:
    'Por favor, escolha uma opcao de 1 a 4, ou digite o nivel de atividade.',
  saude:
    'Por favor, liste suas restricoes/lesoes separadas por virgula, ou digite "nenhuma".',
  complete: '',
};

/**
 * Initial chat message
 */
export const INITIAL_MESSAGE: FitnessMessage = {
  role: 'assistant',
  content: ANAMNESE_QUESTIONS.info_basica,
  timestamp: new Date(),
};

/**
 * Keywords for identifying injuries vs medical restrictions
 */
export const INJURY_KEYWORDS = [
  'lesao',
  'lesão',
  'dor',
  'joelho',
  'ombro',
  'costas',
  'coluna',
  'hernia',
  'hérnia',
  'tendin',
  'lombar',
  'cervical',
  'tornozelo',
  'punho',
  'cotovelo',
  'quadril',
];

/**
 * Keywords indicating "no" responses
 */
export const NEGATIVE_RESPONSES = ['nenhuma', 'nao', 'não', 'n', 'nada'];

/**
 * Sex parsing keywords
 */
export const SEX_KEYWORDS: Record<BiologicalSex, string[]> = {
  masculino: ['masculino', 'homem', 'masc'],
  feminino: ['feminino', 'mulher', 'fem'],
  '': [],
};

/**
 * Default diet template
 */
export const DEFAULT_DIET_TEMPLATE: Omit<Dieta, 'calorias' | 'proteinas' | 'carboidratos' | 'gorduras'> = {
  refeicoes: [
    {
      nome: 'Cafe da Manha',
      horario: '07:00',
      alimentos: ['Ovos mexidos (3)', 'Pao integral', 'Banana', 'Cafe'],
    },
    {
      nome: 'Lanche da Manha',
      horario: '10:00',
      alimentos: ['Iogurte natural', 'Granola', 'Frutas vermelhas'],
    },
    {
      nome: 'Almoco',
      horario: '12:30',
      alimentos: [
        'Frango grelhado',
        'Arroz integral',
        'Feijao',
        'Salada verde',
        'Azeite',
      ],
    },
    {
      nome: 'Lanche da Tarde',
      horario: '16:00',
      alimentos: ['Whey Protein', 'Banana', 'Amendoim'],
    },
    {
      nome: 'Jantar',
      horario: '19:30',
      alimentos: ['Peixe assado', 'Batata doce', 'Legumes', 'Salada'],
    },
  ],
};

/**
 * Default workout templates by muscle group
 */
export const WORKOUT_TEMPLATES = {
  peito_triceps: {
    nome: 'Treino A - Peito/Triceps',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      {
        nome: 'Supino Inclinado',
        series: 3,
        repeticoes: '10-12',
        descanso: '90s',
      },
      { nome: 'Crucifixo', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Triceps Pulley',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Triceps Frances',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
    ],
  },
  costas_biceps: {
    nome: 'Treino B - Costas/Biceps',
    diaSemana: 'Terca e Sexta',
    exercicios: [
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      {
        nome: 'Remada Curvada',
        series: 3,
        repeticoes: '10-12',
        descanso: '90s',
      },
      { nome: 'Remada Baixa', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Rosca Direta',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
      {
        nome: 'Rosca Martelo',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
      },
    ],
  },
  pernas: {
    nome: 'Treino C - Pernas',
    diaSemana: 'Quarta e Sabado',
    exercicios: [
      { nome: 'Agachamento', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Leg Press', series: 3, repeticoes: '10-12', descanso: '90s' },
      {
        nome: 'Cadeira Extensora',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Cadeira Flexora',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Panturrilha',
        series: 4,
        repeticoes: '15-20',
        descanso: '45s',
      },
    ],
  },
};

/**
 * Alternative exercises for injuries
 */
export const INJURY_EXERCISE_ALTERNATIVES: Record<string, { avoid: string[]; alternatives: string[] }> = {
  ombro: {
    avoid: ['supino', 'desenvolvimento'],
    alternatives: ['Peck Deck', 'Crossover'],
  },
  joelho: {
    avoid: ['agachamento', 'leg press', 'extensora'],
    alternatives: ['Cadeira Flexora', 'Stiff'],
  },
  costas: {
    avoid: ['remada', 'levantamento'],
    alternatives: ['Puxada no Pulley', 'Pulldown'],
  },
  lombar: {
    avoid: ['agachamento', 'stiff', 'remada curvada'],
    alternatives: ['Leg Press 45', 'Hack Machine'],
  },
};
