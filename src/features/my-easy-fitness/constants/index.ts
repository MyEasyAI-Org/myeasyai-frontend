/**
 * MyEasyFitness Constants
 *
 * Configuration and constant values for the fitness assistant module.
 */

import type {
  ActivityLevel,
  ActivityLevelConfig,
  Alimento,
  PersonalInfoStep,
  BiologicalSex,
  GenderIdentity,
  TrainingModality,
  Dieta,
  FitnessMessage,
  UserPersonalInfo,
  Exercise,
} from '../types';

/**
 * Default empty personal info data
 */
export const DEFAULT_PERSONAL_INFO: UserPersonalInfo = {
  nome: '',
  idade: 0,
  sexo: '', // Sexo atribuído no nascimento
  genero: '', // Identidade de gênero
  generoOutro: '', // Texto livre quando genero === 'outro'
  peso: 0,
  altura: 0,
  objetivo: '',
  nivelAtividade: '',
  restricoesMedicas: [],
  lesoes: [],
  // Training preferences
  diasTreinoSemana: 0,
  tempoTreinoMinutos: 0,
  preferenciaTreino: '',
  experienciaTreino: '',
  // Diet preferences
  restricoesAlimentares: [],
  comidasFavoritas: [],
  comidasEvitar: [],
  numeroRefeicoes: 0,
  horarioTreino: '',
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
 * Personal info questions (grouped for natural conversation flow)
 */
export const PERSONAL_INFO_QUESTIONS: Record<PersonalInfoStep, string> = {
  info_basica:
    'Ola! Sou seu assistente de fitness. Vou te ajudar a criar treinos e dietas personalizados.\n\nPara comecar, me conte:\n• Sua idade\n• Sexo atribuido no nascimento: masculino, feminino ou prefiro nao declarar\n• Genero: mulher cis, mulher trans, homem cis, homem trans, outro (especifique) ou prefiro nao declarar\n\n(Ex: "28 anos, masculino, homem cis" ou "25, feminino, mulher trans")\n\nNota: O sexo biologico e importante para calculos metabolicos. Seu genero sera respeitado em toda comunicacao.',
  info_basica_sem_nome:
    'Para comecar, me conte:\n• Sua idade\n• Sexo atribuido no nascimento: masculino, feminino ou prefiro nao declarar\n• Genero: mulher cis, mulher trans, homem cis, homem trans, outro (especifique) ou prefiro nao declarar\n\n(Ex: "28 anos, masculino, homem cis")',
  medidas:
    'Otimo! Agora me diga seu peso e altura.\n\n(Ex: "75kg e 175cm" ou "75kg, 1.75m")',
  objetivo:
    'Otimo! Qual e o seu principal objetivo?\n\nExemplos: perder gordura, ganhar massa muscular, manter a forma, melhorar condicionamento...',
  atividade:
    'Qual seu nivel de atividade fisica atual?\n\n1. Sedentario (pouco ou nenhum exercicio)\n2. Leve (exercicio 1-3 dias/semana)\n3. Moderado (exercicio 3-5 dias/semana)\n4. Intenso (exercicio 6-7 dias/semana)',
  treino_preferencias:
    'Agora vamos personalizar seu treino! Me conte:\n\n• Quantos dias por semana pretende treinar? (1-7)\n• Quanto tempo tem disponivel por treino? (ex: 45min, 1h)\n• Qual sua experiencia com treino? (iniciante, intermediario, avancado)\n• Prefere algum tipo de treino? (musculacao, funcional, cardio, misto)\n\n(Ex: "4 dias, 1 hora, intermediario, musculacao")',
  dieta_preferencias:
    'Excelente! Agora sobre sua alimentacao:\n\n• Tem alguma restricao alimentar? (lactose, gluten, vegetariano, vegano, etc)\n• Alguma comida favorita que quer incluir na dieta?\n• Alguma comida que voce NAO gosta ou quer evitar?\n• Quantas refeicoes prefere fazer por dia? (3-6)\n• Em que horario costuma treinar? (manha, tarde, noite)\n\n(Ex: "intolerante a lactose, gosto de frango e arroz, nao gosto de peixe, 5 refeicoes, treino a noite")',
  saude:
    'Quase la! Voce tem alguma restricao medica ou lesao que eu deva considerar?\n\n(Ex: "diabetes, lesao no joelho" ou "nenhuma")',
  complete: '',
};

/**
 * Error messages for personal info validation
 */
export const PERSONAL_INFO_ERROR_MESSAGES: Record<PersonalInfoStep, string> = {
  info_basica:
    'Nao consegui entender. Por favor, informe:\n• Idade\n• Sexo: masculino, feminino ou prefiro nao declarar\n• Genero: mulher cis, mulher trans, homem cis, homem trans, outro ou prefiro nao declarar\n\n(Ex: "25 anos, feminino, mulher cis")',
  info_basica_sem_nome:
    'Nao consegui entender. Por favor, informe:\n• Idade\n• Sexo: masculino, feminino ou prefiro nao declarar\n• Genero: mulher cis, mulher trans, homem cis, homem trans, outro ou prefiro nao declarar\n\n(Ex: "25 anos, feminino, mulher cis")',
  medidas:
    'Nao consegui entender. Por favor, informe seu peso e altura.\n\n(Ex: "70kg e 165cm")',
  objetivo: 'Por favor, me conte qual e seu objetivo principal.',
  atividade:
    'Por favor, escolha uma opcao de 1 a 4, ou digite o nivel de atividade.',
  treino_preferencias:
    'Por favor, informe quantos dias pretende treinar, tempo disponivel e sua experiencia.\n\n(Ex: "4 dias, 1 hora, intermediario, musculacao")',
  dieta_preferencias:
    'Por favor, me conte sobre suas preferencias alimentares.\n\n(Ex: "sem lactose, gosto de frango, nao gosto de peixe, 5 refeicoes, treino a noite")',
  saude:
    'Por favor, liste suas restricoes/lesoes separadas por virgula, ou digite "nenhuma".',
  complete: '',
};

/**
 * Initial chat message
 */
export const INITIAL_MESSAGE: FitnessMessage = {
  role: 'assistant',
  content: PERSONAL_INFO_QUESTIONS.info_basica,
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
 * Sex assigned at birth parsing keywords
 */
export const SEX_KEYWORDS: Record<BiologicalSex, string[]> = {
  masculino: ['masculino', 'masc', 'sexo masculino', 'nascimento masculino'],
  feminino: ['feminino', 'fem', 'sexo feminino', 'nascimento feminino'],
  'prefiro-nao-declarar': ['prefiro nao declarar', 'prefiro não declarar', 'nao declarar', 'não declarar', 'nao quero declarar'],
  '': [],
};

/**
 * Gender identity parsing keywords
 */
export const GENDER_KEYWORDS: Record<GenderIdentity, string[]> = {
  'mulher-cis': ['mulher cis', 'mulher cisgênero', 'mulher cisgenero', 'cis mulher'],
  'mulher-trans': ['mulher trans', 'mulher transgênero', 'mulher transgenero', 'trans mulher'],
  'homem-cis': ['homem cis', 'homem cisgênero', 'homem cisgenero', 'cis homem'],
  'homem-trans': ['homem trans', 'homem transgênero', 'homem transgenero', 'trans homem'],
  outro: ['outro', 'outra', 'outros'],
  'prefiro-nao-declarar': ['prefiro nao declarar', 'prefiro não declarar', 'nao quero declarar', 'não quero declarar'],
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
      alimentos: [
        { nome: 'ovos mexidos', gramas: 100 },
        { nome: 'pao integral', gramas: 50 },
        { nome: 'banana', gramas: 120 },
        { nome: 'cafe', gramas: 100 },
      ],
    },
    {
      nome: 'Lanche da Manha',
      horario: '10:00',
      alimentos: [
        { nome: 'iogurte natural', gramas: 170 },
        { nome: 'granola', gramas: 40 },
        { nome: 'frutas vermelhas', gramas: 100 },
      ],
    },
    {
      nome: 'Almoco',
      horario: '12:30',
      alimentos: [
        { nome: 'frango grelhado', gramas: 150 },
        { nome: 'arroz integral', gramas: 150 },
        { nome: 'feijao', gramas: 100 },
        { nome: 'salada verde', gramas: 100 },
        { nome: 'azeite', gramas: 10 },
      ],
    },
    {
      nome: 'Lanche da Tarde',
      horario: '16:00',
      alimentos: [
        { nome: 'whey protein', gramas: 30 },
        { nome: 'banana', gramas: 120 },
        { nome: 'amendoim', gramas: 30 },
      ],
    },
    {
      nome: 'Jantar',
      horario: '19:30',
      alimentos: [
        { nome: 'peixe assado', gramas: 150 },
        { nome: 'batata doce', gramas: 200 },
        { nome: 'legumes', gramas: 150 },
        { nome: 'salada', gramas: 100 },
      ],
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
 * Training modality configurations
 */
export const TRAINING_MODALITY_CONFIG: Record<TrainingModality, { name: string; description: string }> = {
  musculacao: { name: 'Musculação', description: 'Treino com pesos focado em hipertrofia e força' },
  corrida: { name: 'Corrida', description: 'Treino cardiovascular de corrida' },
  crossfit: { name: 'CrossFit', description: 'Treino funcional de alta intensidade' },
  caminhada: { name: 'Caminhada', description: 'Treino cardiovascular leve a moderado' },
  funcional: { name: 'Funcional', description: 'Treino com movimentos naturais do corpo' },
  calistenia: { name: 'Calistenia', description: 'Treino com peso corporal' },
  '': { name: '', description: '' },
};

/**
 * Running workout templates
 */
export const CORRIDA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  intervalado: {
    nome: 'Treino Intervalado (HIIT)',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Caminhada', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
      { nome: 'Sprint', series: 8, repeticoes: '30s', descanso: '60s', observacao: 'Velocidade máxima' },
      { nome: 'Desaquecimento - Caminhada', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
    ],
  },
  longo: {
    nome: 'Corrida Longa',
    diaSemana: 'Sábado',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Caminhada ou trote leve' },
      { nome: 'Corrida Contínua', series: 1, repeticoes: '30-45 min', descanso: '0s', observacao: 'Ritmo conversacional' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Caminhada' },
    ],
  },
  recuperacao: {
    nome: 'Corrida de Recuperação',
    diaSemana: 'Terça',
    exercicios: [
      { nome: 'Caminhada', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Trote Leve', series: 1, repeticoes: '20-30 min', descanso: '0s', observacao: 'Zona 2, ritmo fácil' },
      { nome: 'Alongamento', series: 1, repeticoes: '10 min', descanso: '0s' },
    ],
  },
  tempo: {
    nome: 'Corrida Tempo',
    diaSemana: 'Quarta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '10 min', descanso: '0s', observacao: 'Trote leve' },
      { nome: 'Corrida Tempo', series: 1, repeticoes: '20 min', descanso: '0s', observacao: 'Ritmo desconfortavelmente rápido' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * CrossFit workout templates
 */
export const CROSSFIT_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  wod_amrap: {
    nome: 'AMRAP 20min',
    diaSemana: 'Segunda',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Pull-ups', series: 1, repeticoes: '5', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Push-ups', series: 1, repeticoes: '10', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Air Squats', series: 1, repeticoes: '15', descanso: '0s', observacao: 'AMRAP 20min - parte do circuito' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  wod_emom: {
    nome: 'EMOM 15min',
    diaSemana: 'Quarta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Burpees', series: 15, repeticoes: '5', descanso: 'resto do min', observacao: 'Every Minute On the Minute' },
      { nome: 'Kettlebell Swings', series: 15, repeticoes: '10', descanso: 'resto do min', observacao: 'Minutos alternados' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  wod_fortime: {
    nome: 'For Time',
    diaSemana: 'Sexta',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Wall Balls', series: 1, repeticoes: '50', descanso: 'quando precisar', observacao: 'Completar o mais rápido possível' },
      { nome: 'Box Jumps', series: 1, repeticoes: '40', descanso: 'quando precisar' },
      { nome: 'Kettlebell Swings', series: 1, repeticoes: '30', descanso: 'quando precisar' },
      { nome: 'Toes to Bar', series: 1, repeticoes: '20', descanso: 'quando precisar' },
      { nome: 'Thrusters', series: 1, repeticoes: '10', descanso: 'quando precisar' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Walking workout templates
 */
export const CAMINHADA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  leve: {
    nome: 'Caminhada Leve',
    diaSemana: 'Segunda, Quarta e Sexta',
    exercicios: [
      { nome: 'Alongamento Inicial', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada', series: 1, repeticoes: '30 min', descanso: '0s', observacao: 'Ritmo leve, confortável' },
      { nome: 'Alongamento Final', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  moderada: {
    nome: 'Caminhada Moderada',
    diaSemana: 'Terça e Quinta',
    exercicios: [
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada Rápida', series: 1, repeticoes: '40 min', descanso: '0s', observacao: 'Ritmo acelerado, consegue conversar' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s', observacao: 'Ritmo leve' },
    ],
  },
  intensa: {
    nome: 'Caminhada Intensa com Intervalos',
    diaSemana: 'Sábado',
    exercicios: [
      { nome: 'Aquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Caminhada Rápida', series: 5, repeticoes: '3 min', descanso: '1 min', observacao: 'Intervalos de alta intensidade' },
      { nome: 'Caminhada Normal', series: 5, repeticoes: '2 min', descanso: '0s', observacao: 'Recuperação ativa entre intervalos' },
      { nome: 'Desaquecimento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Functional training templates
 */
export const FUNCIONAL_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  circuito_a: {
    nome: 'Circuito Funcional A - Full Body',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Polichinelos', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Agachamento com Salto', series: 4, repeticoes: '12', descanso: '30s' },
      { nome: 'Flexão de Braço', series: 4, repeticoes: '10-15', descanso: '30s' },
      { nome: 'Afundo Alternado', series: 4, repeticoes: '12 cada', descanso: '30s' },
      { nome: 'Prancha', series: 4, repeticoes: '30-45s', descanso: '30s' },
      { nome: 'Mountain Climbers', series: 4, repeticoes: '20', descanso: '30s' },
      { nome: 'Burpees', series: 3, repeticoes: '8-10', descanso: '45s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  circuito_b: {
    nome: 'Circuito Funcional B - Core e Cardio',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Aquecimento - Corrida no lugar', series: 1, repeticoes: '3 min', descanso: '0s' },
      { nome: 'Escalador (Mountain Climber)', series: 4, repeticoes: '30s', descanso: '20s' },
      { nome: 'Prancha Lateral', series: 3, repeticoes: '30s cada lado', descanso: '20s' },
      { nome: 'Jumping Jacks', series: 4, repeticoes: '30s', descanso: '20s' },
      { nome: 'Abdominal Bicicleta', series: 3, repeticoes: '20', descanso: '30s' },
      { nome: 'Skater Jumps', series: 4, repeticoes: '12 cada', descanso: '30s' },
      { nome: 'Prancha com Toque no Ombro', series: 3, repeticoes: '16', descanso: '30s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  circuito_c: {
    nome: 'Circuito Funcional C - Força',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Agachamento Búlgaro', series: 4, repeticoes: '10 cada', descanso: '45s' },
      { nome: 'Flexão Diamante', series: 3, repeticoes: '8-12', descanso: '45s' },
      { nome: 'Stiff com Peso Corporal', series: 4, repeticoes: '12', descanso: '30s' },
      { nome: 'Pike Push-up', series: 3, repeticoes: '8-10', descanso: '45s' },
      { nome: 'Glute Bridge', series: 4, repeticoes: '15', descanso: '30s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * Calisthenics workout templates
 */
export const CALISTENIA_TEMPLATES: Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }> = {
  upper: {
    nome: 'Calistenia - Membros Superiores',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Aquecimento - Rotação de Ombros', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Flexão de Braço', series: 4, repeticoes: '10-15', descanso: '60s' },
      { nome: 'Barra Fixa (ou Australiana)', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Flexão Pike', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Dips (Paralelas ou banco)', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Flexão Diamante', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Chin-up (ou negativo)', series: 3, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  lower: {
    nome: 'Calistenia - Membros Inferiores',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Aquecimento - Agachamento livre', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Pistol Squat (ou progressão)', series: 4, repeticoes: '6-8 cada', descanso: '90s' },
      { nome: 'Afundo Búlgaro', series: 4, repeticoes: '10 cada', descanso: '60s' },
      { nome: 'Agachamento com Salto', series: 4, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Nordic Curl (ou progressão)', series: 3, repeticoes: '5-8', descanso: '90s' },
      { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
      { nome: 'Glute Bridge Unilateral', series: 3, repeticoes: '12 cada', descanso: '45s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  full: {
    nome: 'Calistenia - Full Body',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Burpees', series: 4, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Pull-ups (ou progressão)', series: 4, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Pistol Squat (progressão)', series: 3, repeticoes: '6 cada', descanso: '90s' },
      { nome: 'Flexão Archer', series: 3, repeticoes: '6 cada', descanso: '60s' },
      { nome: 'L-Sit (ou Tuck)', series: 4, repeticoes: '10-20s', descanso: '60s' },
      { nome: 'Muscle-up (ou Progressão)', series: 3, repeticoes: '3-5', descanso: '120s' },
      { nome: 'Handstand (ou progressão)', series: 3, repeticoes: '20-30s', descanso: '60s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
};

/**
 * All modality templates combined for easy access
 */
export const MODALITY_TEMPLATES: Record<TrainingModality, Record<string, { nome: string; diaSemana: string; exercicios: Exercise[] }>> = {
  musculacao: WORKOUT_TEMPLATES,
  corrida: CORRIDA_TEMPLATES,
  crossfit: CROSSFIT_TEMPLATES,
  caminhada: CAMINHADA_TEMPLATES,
  funcional: FUNCIONAL_TEMPLATES,
  calistenia: CALISTENIA_TEMPLATES,
  '': {},
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

/**
 * Nutritional database - macros per 100g
 * Used to calculate proper food quantities based on user's macro targets
 */
export interface NutritionalInfo {
  proteinas: number; // g per 100g
  carboidratos: number;
  gorduras: number;
  calorias: number;
  porcaoTipica: number; // typical serving size in grams
  categoria: 'proteina' | 'carboidrato' | 'gordura' | 'fruta' | 'vegetal' | 'laticinio' | 'outro';
}

export const NUTRITIONAL_DATABASE: Record<string, NutritionalInfo> = {
  // Proteínas
  'frango grelhado': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'frango desfiado': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'peito de frango': { proteinas: 31, carboidratos: 0, gorduras: 3.6, calorias: 165, porcaoTipica: 150, categoria: 'proteina' },
  'carne moida': { proteinas: 26, carboidratos: 0, gorduras: 15, calorias: 250, porcaoTipica: 150, categoria: 'proteina' },
  'carne vermelha': { proteinas: 26, carboidratos: 0, gorduras: 15, calorias: 250, porcaoTipica: 150, categoria: 'proteina' },
  'peixe assado': { proteinas: 26, carboidratos: 0, gorduras: 5, calorias: 150, porcaoTipica: 150, categoria: 'proteina' },
  'peixe': { proteinas: 26, carboidratos: 0, gorduras: 5, calorias: 150, porcaoTipica: 150, categoria: 'proteina' },
  'tilapia': { proteinas: 26, carboidratos: 0, gorduras: 2.7, calorias: 128, porcaoTipica: 150, categoria: 'proteina' },
  'salmao': { proteinas: 25, carboidratos: 0, gorduras: 13, calorias: 208, porcaoTipica: 150, categoria: 'proteina' },
  'atum': { proteinas: 30, carboidratos: 0, gorduras: 1, calorias: 130, porcaoTipica: 100, categoria: 'proteina' },
  'ovo': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 50, categoria: 'proteina' },
  'ovos': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 50, categoria: 'proteina' },
  'ovos mexidos': { proteinas: 13, carboidratos: 1, gorduras: 11, calorias: 155, porcaoTipica: 100, categoria: 'proteina' },
  'clara de ovo': { proteinas: 11, carboidratos: 0.7, gorduras: 0.2, calorias: 52, porcaoTipica: 100, categoria: 'proteina' },
  'tofu': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },
  'tofu grelhado': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },
  'tofu mexido': { proteinas: 8, carboidratos: 2, gorduras: 4, calorias: 76, porcaoTipica: 150, categoria: 'proteina' },

  // Carboidratos
  'arroz': { proteinas: 2.7, carboidratos: 28, gorduras: 0.3, calorias: 130, porcaoTipica: 150, categoria: 'carboidrato' },
  'arroz integral': { proteinas: 2.6, carboidratos: 23, gorduras: 0.9, calorias: 111, porcaoTipica: 150, categoria: 'carboidrato' },
  'arroz branco': { proteinas: 2.7, carboidratos: 28, gorduras: 0.3, calorias: 130, porcaoTipica: 150, categoria: 'carboidrato' },
  'batata doce': { proteinas: 1.6, carboidratos: 20, gorduras: 0.1, calorias: 86, porcaoTipica: 200, categoria: 'carboidrato' },
  'batata': { proteinas: 2, carboidratos: 17, gorduras: 0.1, calorias: 77, porcaoTipica: 200, categoria: 'carboidrato' },
  'macarrao': { proteinas: 5, carboidratos: 25, gorduras: 1, calorias: 131, porcaoTipica: 100, categoria: 'carboidrato' },
  'macarrao de arroz': { proteinas: 3, carboidratos: 24, gorduras: 0.4, calorias: 109, porcaoTipica: 100, categoria: 'carboidrato' },
  'pao integral': { proteinas: 9, carboidratos: 41, gorduras: 3.4, calorias: 247, porcaoTipica: 50, categoria: 'carboidrato' },
  'pao': { proteinas: 9, carboidratos: 49, gorduras: 3.2, calorias: 265, porcaoTipica: 50, categoria: 'carboidrato' },
  'pao sem gluten': { proteinas: 4, carboidratos: 45, gorduras: 5, calorias: 240, porcaoTipica: 50, categoria: 'carboidrato' },
  'aveia': { proteinas: 17, carboidratos: 66, gorduras: 7, calorias: 389, porcaoTipica: 40, categoria: 'carboidrato' },
  'aveia sem gluten': { proteinas: 17, carboidratos: 66, gorduras: 7, calorias: 389, porcaoTipica: 40, categoria: 'carboidrato' },
  'feijao': { proteinas: 9, carboidratos: 24, gorduras: 0.5, calorias: 127, porcaoTipica: 100, categoria: 'carboidrato' },
  'granola': { proteinas: 10, carboidratos: 64, gorduras: 15, calorias: 450, porcaoTipica: 40, categoria: 'carboidrato' },
  'tapioca': { proteinas: 0.5, carboidratos: 22, gorduras: 0, calorias: 90, porcaoTipica: 30, categoria: 'carboidrato' },

  // Gorduras
  'azeite': { proteinas: 0, carboidratos: 0, gorduras: 100, calorias: 884, porcaoTipica: 10, categoria: 'gordura' },
  'amendoim': { proteinas: 26, carboidratos: 16, gorduras: 49, calorias: 567, porcaoTipica: 30, categoria: 'gordura' },
  'castanhas': { proteinas: 14, carboidratos: 30, gorduras: 44, calorias: 553, porcaoTipica: 30, categoria: 'gordura' },
  'pasta de amendoim': { proteinas: 25, carboidratos: 20, gorduras: 50, calorias: 588, porcaoTipica: 20, categoria: 'gordura' },
  'abacate': { proteinas: 2, carboidratos: 9, gorduras: 15, calorias: 160, porcaoTipica: 100, categoria: 'gordura' },

  // Frutas
  'banana': { proteinas: 1.1, carboidratos: 23, gorduras: 0.3, calorias: 89, porcaoTipica: 120, categoria: 'fruta' },
  'maca': { proteinas: 0.3, carboidratos: 14, gorduras: 0.2, calorias: 52, porcaoTipica: 180, categoria: 'fruta' },
  'morango': { proteinas: 0.7, carboidratos: 8, gorduras: 0.3, calorias: 32, porcaoTipica: 150, categoria: 'fruta' },
  'frutas vermelhas': { proteinas: 1, carboidratos: 12, gorduras: 0.5, calorias: 50, porcaoTipica: 100, categoria: 'fruta' },
  'laranja': { proteinas: 0.9, carboidratos: 12, gorduras: 0.1, calorias: 47, porcaoTipica: 180, categoria: 'fruta' },
  'mamao': { proteinas: 0.5, carboidratos: 11, gorduras: 0.3, calorias: 43, porcaoTipica: 150, categoria: 'fruta' },
  'melancia': { proteinas: 0.6, carboidratos: 8, gorduras: 0.2, calorias: 30, porcaoTipica: 200, categoria: 'fruta' },

  // Vegetais
  'salada verde': { proteinas: 1.5, carboidratos: 3, gorduras: 0.2, calorias: 15, porcaoTipica: 100, categoria: 'vegetal' },
  'salada': { proteinas: 1.5, carboidratos: 3, gorduras: 0.2, calorias: 15, porcaoTipica: 100, categoria: 'vegetal' },
  'legumes': { proteinas: 2, carboidratos: 10, gorduras: 0.3, calorias: 40, porcaoTipica: 150, categoria: 'vegetal' },
  'brocolis': { proteinas: 2.8, carboidratos: 7, gorduras: 0.4, calorias: 34, porcaoTipica: 100, categoria: 'vegetal' },
  'espinafre': { proteinas: 2.9, carboidratos: 3.6, gorduras: 0.4, calorias: 23, porcaoTipica: 100, categoria: 'vegetal' },
  'cenoura': { proteinas: 0.9, carboidratos: 10, gorduras: 0.2, calorias: 41, porcaoTipica: 100, categoria: 'vegetal' },

  // Laticínios
  'leite': { proteinas: 3.4, carboidratos: 5, gorduras: 3.3, calorias: 64, porcaoTipica: 200, categoria: 'laticinio' },
  'leite de amendoas': { proteinas: 1, carboidratos: 1.5, gorduras: 2.5, calorias: 30, porcaoTipica: 200, categoria: 'laticinio' },
  'iogurte natural': { proteinas: 10, carboidratos: 3.6, gorduras: 0.7, calorias: 59, porcaoTipica: 170, categoria: 'laticinio' },
  'iogurte grego': { proteinas: 10, carboidratos: 4, gorduras: 5, calorias: 100, porcaoTipica: 170, categoria: 'laticinio' },
  'queijo': { proteinas: 25, carboidratos: 1.3, gorduras: 33, calorias: 402, porcaoTipica: 30, categoria: 'laticinio' },
  'queijo cottage': { proteinas: 11, carboidratos: 3.4, gorduras: 4.3, calorias: 98, porcaoTipica: 100, categoria: 'laticinio' },
  'queijo vegano': { proteinas: 2, carboidratos: 5, gorduras: 7, calorias: 90, porcaoTipica: 30, categoria: 'laticinio' },

  // Suplementos e outros
  'whey protein': { proteinas: 80, carboidratos: 10, gorduras: 3, calorias: 387, porcaoTipica: 30, categoria: 'outro' },
  'whey': { proteinas: 80, carboidratos: 10, gorduras: 3, calorias: 387, porcaoTipica: 30, categoria: 'outro' },
  'proteina vegetal': { proteinas: 75, carboidratos: 8, gorduras: 5, calorias: 380, porcaoTipica: 30, categoria: 'outro' },
  'proteina vegetal (ervilha)': { proteinas: 75, carboidratos: 8, gorduras: 5, calorias: 380, porcaoTipica: 30, categoria: 'outro' },
  'mel': { proteinas: 0.3, carboidratos: 82, gorduras: 0, calorias: 304, porcaoTipica: 15, categoria: 'outro' },
  'cafe': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 2, porcaoTipica: 100, categoria: 'outro' },
  'cha': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 1, porcaoTipica: 200, categoria: 'outro' },
  'cha de camomila': { proteinas: 0, carboidratos: 0, gorduras: 0, calorias: 1, porcaoTipica: 200, categoria: 'outro' },
};

/**
 * Get nutritional info for a food item
 */
export function getNutritionalInfo(foodName: string): NutritionalInfo | null {
  const lowerFood = foodName.toLowerCase().trim();

  // Direct match
  if (NUTRITIONAL_DATABASE[lowerFood]) {
    return NUTRITIONAL_DATABASE[lowerFood];
  }

  // Partial match
  for (const [key, value] of Object.entries(NUTRITIONAL_DATABASE)) {
    if (lowerFood.includes(key) || key.includes(lowerFood)) {
      return value;
    }
  }

  return null;
}
