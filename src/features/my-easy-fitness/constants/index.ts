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
  localTreino: '',
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
    'Agora vamos personalizar seu treino! Me conte:\n\n• Quantos dias por semana? (1-6)\n• Quanto tempo por sessao? (30min, 45min, 1h, 1h30)\n• Seu nivel: iniciante, intermediario ou avancado\n• Onde treina: academia ou casa\n• Tipo de treino preferido? (musculacao, funcional, corrida, calistenia)\n\n(Ex: "4 dias, 1h, intermediario, academia, musculacao")',
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
    'Por favor, informe: dias por semana, tempo, nivel, local (academia/casa) e tipo de treino.\n\n(Ex: "4 dias, 1h, intermediario, academia, musculacao")',
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
      { nome: 'Crucifixo com Halteres', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Tríceps Pulley (Corda)',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
      },
      {
        nome: 'Tríceps Francês',
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
        nome: 'Remada Curvada com Barra',
        series: 3,
        repeticoes: '10-12',
        descanso: '90s',
      },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '12-15', descanso: '60s' },
      {
        nome: 'Rosca Direta com Barra',
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
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
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
        nome: 'Elevação de Panturrilha em Pé',
        series: 4,
        repeticoes: '15-20',
        descanso: '45s',
      },
    ],
  },
  // Push/Pull/Legs Split
  push_day: {
    nome: 'Push - Peito/Ombros/Triceps',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Tríceps Pulley (Corda)', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Tríceps Francês', series: 3, repeticoes: '10-12', descanso: '60s' },
    ],
  },
  pull_day: {
    nome: 'Pull - Costas/Biceps',
    diaSemana: 'Terca e Sexta',
    exercicios: [
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Remada Curvada com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Face Pull', series: 3, repeticoes: '15-20', descanso: '60s' },
      { nome: 'Rosca Direta com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Rosca Martelo', series: 3, repeticoes: '10-12', descanso: '60s' },
    ],
  },
  legs_day: {
    nome: 'Legs - Pernas Completo',
    diaSemana: 'Quarta e Sabado',
    exercicios: [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Cadeira Extensora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Cadeira Flexora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
    ],
  },
  // Upper/Lower Split
  upper_body: {
    nome: 'Upper Body - Superior',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Supino Reto', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Puxada Frontal', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Baixa no Cabo', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Rosca Direta com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Tríceps Pulley (Corda)', series: 3, repeticoes: '12-15', descanso: '60s' },
    ],
  },
  lower_body: {
    nome: 'Lower Body - Inferior',
    diaSemana: 'Terca e Sexta',
    exercicios: [
      { nome: 'Agachamento Livre', series: 4, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Cadeira Extensora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Cadeira Flexora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação Pélvica', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
    ],
  },
  // Full Body Split
  full_body_a: {
    nome: 'Full Body A',
    diaSemana: 'Segunda e Quinta',
    exercicios: [
      { nome: 'Agachamento Livre', series: 3, repeticoes: '8-12', descanso: '120s' },
      { nome: 'Supino Reto', series: 3, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Puxada Frontal', series: 3, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Desenvolvimento com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Rosca Direta com Barra', series: 2, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Triceps Pulley', series: 2, repeticoes: '12-15', descanso: '60s' },
    ],
  },
  full_body_b: {
    nome: 'Full Body B',
    diaSemana: 'Terca e Sexta',
    exercicios: [
      { nome: 'Stiff (Levantamento Terra Romeno)', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Supino Inclinado', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Remada Curvada com Barra', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação Lateral', series: 3, repeticoes: '12-15', descanso: '60s' },
      { nome: 'Leg Press 45°', series: 3, repeticoes: '10-12', descanso: '90s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 3, repeticoes: '15-20', descanso: '45s' },
    ],
  },
};

/**
 * Training modality configurations with benefits
 */
export const TRAINING_MODALITY_CONFIG: Record<TrainingModality, { name: string; description: string; beneficios: string }> = {
  musculacao: {
    name: 'Musculação',
    description: 'Treino com pesos focado em hipertrofia e força',
    beneficios: 'A musculação é uma das formas mais eficientes de transformar o corpo. Além de aumentar a massa muscular e força, ela acelera o metabolismo basal, o que significa que você queima mais calorias mesmo em repouso. O treino com pesos também fortalece os ossos, ajudando a prevenir osteoporose, melhora a postura e reduz significativamente o risco de lesões no dia a dia. É uma modalidade versátil, ideal tanto para quem quer ganhar massa muscular quanto para quem busca definição corporal, perda de gordura ou simplesmente mais qualidade de vida e longevidade.'
  },
  corrida: {
    name: 'Corrida',
    description: 'Treino cardiovascular de corrida',
    beneficios: 'A corrida é um dos exercícios mais completos e acessíveis que existem. Ela fortalece o sistema cardiovascular, aumenta a capacidade pulmonar e melhora a circulação sanguínea. Correr regularmente libera endorfinas, os famosos hormônios da felicidade, ajudando a combater o estresse, a ansiedade e a depressão. Além disso, é excelente para queima de calorias e perda de peso. Com o tempo, você desenvolve mais resistência física e mental, ganha energia para as atividades do dia a dia e ainda melhora a qualidade do sono.'
  },
  crossfit: {
    name: 'CrossFit',
    description: 'Treino funcional de alta intensidade',
    beneficios: 'O CrossFit combina elementos de levantamento de peso, ginástica e exercícios aeróbicos em treinos intensos e variados. Essa combinação desenvolve todas as capacidades físicas: força, resistência, velocidade, flexibilidade, coordenação e equilíbrio. Os treinos são desafiadores e nunca monótonos, o que mantém a motivação alta. O ambiente de box promove um forte senso de comunidade, onde todos se apoiam para superar seus limites. É uma modalidade que transforma não apenas o corpo, mas também a mentalidade, ensinando disciplina e resiliência.'
  },
  caminhada: {
    name: 'Caminhada',
    description: 'Treino cardiovascular leve a moderado',
    beneficios: 'A caminhada é a porta de entrada perfeita para uma vida mais ativa. Por ser de baixo impacto, é acessível para pessoas de todas as idades e níveis de condicionamento físico. Caminhar regularmente melhora a saúde do coração, ajuda a controlar a pressão arterial e os níveis de açúcar no sangue, além de fortalecer músculos e articulações de forma gradual e segura. É também um momento excelente para clarear a mente, reduzir o estresse e até mesmo socializar. Pode ser praticada em qualquer lugar, sem necessidade de equipamentos especiais.'
  },
  funcional: {
    name: 'Funcional',
    description: 'Treino com movimentos naturais do corpo',
    beneficios: 'O treino funcional trabalha movimentos que usamos no dia a dia: agachar, empurrar, puxar, girar e estabilizar. Ao treinar esses padrões de movimento, você melhora sua capacidade de realizar tarefas cotidianas com mais facilidade e menos risco de lesões. Os exercícios engajam múltiplos grupos musculares simultaneamente, desenvolvendo força, equilíbrio, coordenação e consciência corporal. É uma modalidade muito adaptável, podendo ser ajustada para iniciantes ou atletas avançados, e pode ser praticada com pouco ou nenhum equipamento.'
  },
  calistenia: {
    name: 'Calistenia',
    description: 'Treino com peso corporal',
    beneficios: 'A calistenia utiliza o peso do próprio corpo como resistência, desenvolvendo força, flexibilidade e controle corporal de forma integrada. É uma modalidade que conecta você profundamente com seu corpo, ensinando a dominá-lo em movimentos cada vez mais complexos e impressionantes. Não requer equipamentos caros ou academia, podendo ser praticada em parques, em casa ou em qualquer lugar. Além dos benefícios físicos, como músculos definidos e funcionais, a calistenia desenvolve paciência, disciplina e a satisfação de conquistar habilidades que pareciam impossíveis.'
  },
  '': { name: '', description: '', beneficios: '' },
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
      { nome: 'Burpee', series: 15, repeticoes: '5', descanso: 'resto do min', observacao: 'Every Minute On the Minute' },
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
      { nome: 'Mountain Climber', series: 4, repeticoes: '20', descanso: '30s' },
      { nome: 'Burpee', series: 3, repeticoes: '8-10', descanso: '45s' },
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
      { nome: 'Jumping Jack', series: 4, repeticoes: '30s', descanso: '20s' },
      { nome: 'Abdominal Bicicleta', series: 3, repeticoes: '20', descanso: '30s' },
      { nome: 'Skater Jump', series: 4, repeticoes: '12 cada', descanso: '30s' },
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
      { nome: 'Elevação Pélvica', series: 4, repeticoes: '15', descanso: '30s' },
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
      { nome: 'Barra Fixa (Pull-up)', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Pike Push-up', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Dips nas Paralelas', series: 4, repeticoes: '8-12', descanso: '90s' },
      { nome: 'Flexão Diamante', series: 3, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Chin-up (Barra Supinada)', series: 3, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  lower: {
    nome: 'Calistenia - Membros Inferiores',
    diaSemana: 'Terça e Sexta',
    exercicios: [
      { nome: 'Aquecimento - Agachamento livre', series: 1, repeticoes: '2 min', descanso: '0s' },
      { nome: 'Pistol Squat', series: 4, repeticoes: '6-8 cada', descanso: '90s' },
      { nome: 'Agachamento Búlgaro', series: 4, repeticoes: '10 cada', descanso: '60s' },
      { nome: 'Agachamento com Salto', series: 4, repeticoes: '10-12', descanso: '60s' },
      { nome: 'Nordic Curl', series: 3, repeticoes: '5-8', descanso: '90s' },
      { nome: 'Elevação de Panturrilha em Pé', series: 4, repeticoes: '15-20', descanso: '45s' },
      { nome: 'Glute Bridge Unilateral', series: 3, repeticoes: '12 cada', descanso: '45s' },
      { nome: 'Alongamento', series: 1, repeticoes: '5 min', descanso: '0s' },
    ],
  },
  full: {
    nome: 'Calistenia - Full Body',
    diaSemana: 'Quarta e Sábado',
    exercicios: [
      { nome: 'Aquecimento Dinâmico', series: 1, repeticoes: '5 min', descanso: '0s' },
      { nome: 'Burpee', series: 4, repeticoes: '8-10', descanso: '60s' },
      { nome: 'Barra Fixa (Pull-up)', series: 4, repeticoes: '6-10', descanso: '90s' },
      { nome: 'Pistol Squat', series: 3, repeticoes: '6 cada', descanso: '90s' },
      { nome: 'Flexão Archer', series: 3, repeticoes: '6 cada', descanso: '60s' },
      { nome: 'L-Sit', series: 4, repeticoes: '10-20s', descanso: '60s' },
      { nome: 'Muscle Up', series: 3, repeticoes: '3-5', descanso: '120s' },
      { nome: 'Parada de Mãos', series: 3, repeticoes: '20-30s', descanso: '60s' },
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
 * Each injury type has exercises to avoid and suggested alternatives
 */
export const INJURY_EXERCISE_ALTERNATIVES: Record<string, { avoid: string[]; alternatives: string[] }> = {
  // Ombro - lesoes no manguito rotador, bursite, tendinite
  ombro: {
    avoid: ['supino', 'desenvolvimento', 'elevacao lateral', 'mergulho', 'dips', 'crucifixo'],
    alternatives: ['Peck Deck', 'Crossover Baixo', 'Flexao com apoio', 'Face Pull', 'Elevacao Frontal leve'],
  },
  // Joelho - lesoes no ligamento, menisco, condromalacia
  joelho: {
    avoid: ['agachamento', 'leg press', 'extensora', 'afundo', 'salto', 'pistol', 'hack'],
    alternatives: ['Cadeira Flexora', 'Stiff', 'Elevacao Pelvica', 'Gluteo no cabo'],
  },
  // Costas - hernia, protrusao discal
  costas: {
    avoid: ['remada', 'levantamento', 'terra', 'good morning'],
    alternatives: ['Puxada no Pulley', 'Pulldown', 'Remada apoiada no banco'],
  },
  // Lombar - dor lombar, hernia lombar
  lombar: {
    avoid: ['agachamento', 'stiff', 'remada curvada', 'terra', 'good morning', 'abdominal'],
    alternatives: ['Leg Press 45', 'Hack Machine', 'Prancha', 'Gluteo no cabo'],
  },
  // Punho/Mao - tendinite, tunel do carpo
  punho: {
    avoid: ['rosca', 'supino', 'flexao', 'triceps frances', 'desenvolvimento'],
    alternatives: ['Maquinas com pegada neutra', 'Extensora', 'Flexora', 'Leg Press'],
  },
  // Cotovelo - epicondilite (cotovelo de tenista)
  cotovelo: {
    avoid: ['rosca', 'triceps', 'supino', 'remada', 'puxada'],
    alternatives: ['Exercicios de pernas', 'Maquinas com pegada neutra', 'Abdominais'],
  },
  // Quadril - bursite, impacto femoroacetabular
  quadril: {
    avoid: ['agachamento profundo', 'afundo', 'stiff', 'abdutora', 'adutora'],
    alternatives: ['Leg Press amplitude parcial', 'Extensora', 'Flexora', 'Panturrilha'],
  },
  // Cervical - hernia cervical, dor no pescoco
  cervical: {
    avoid: ['desenvolvimento', 'encolhimento', 'remada alta', 'abdominal com flexao'],
    alternatives: ['Elevacao Lateral', 'Peck Deck', 'Exercicios sentado com apoio'],
  },
  // Tornozelo - entorse, instabilidade
  tornozelo: {
    avoid: ['agachamento', 'afundo', 'salto', 'panturrilha em pe', 'corrida'],
    alternatives: ['Leg Press', 'Extensora', 'Flexora', 'Exercicios sentado'],
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

/**
 * Demo profiles for development testing
 * Contains only personal data - workouts/diets are auto-generated on load
 */
/**
 * Demo profiles for development testing
 * Note: diasTreinoSemana, tempoTreinoMinutos, and numeroRefeicoes are set to 0
 * to prevent auto-generation of workouts/diets - allowing AI chat generation testing
 */
export const DEMO_PROFILES: UserPersonalInfo[] = [
  {
    nome: 'João Silva',
    idade: 35,
    sexo: 'masculino',
    genero: 'homem-cis',
    generoOutro: '',
    peso: 95,
    altura: 178,
    objetivo: 'perder gordura e melhorar condicionamento',
    nivelAtividade: 'sedentario',
    restricoesMedicas: ['hipertensao leve'],
    lesoes: [],
    diasTreinoSemana: 0,
    tempoTreinoMinutos: 0,
    preferenciaTreino: '',
    experienciaTreino: '',
    localTreino: '',
    restricoesAlimentares: [],
    comidasFavoritas: ['frango', 'arroz', 'feijao'],
    comidasEvitar: ['frituras'],
    numeroRefeicoes: 0,
    horarioTreino: '',
  },
  {
    nome: 'Maria Santos',
    idade: 28,
    sexo: 'masculino',
    genero: 'mulher-trans',
    generoOutro: '',
    peso: 62,
    altura: 165,
    objetivo: 'ganhar massa muscular e definicao',
    nivelAtividade: 'moderado',
    restricoesMedicas: [],
    lesoes: ['dor lombar leve'],
    diasTreinoSemana: 0,
    tempoTreinoMinutos: 0,
    preferenciaTreino: '',
    experienciaTreino: '',
    localTreino: '',
    restricoesAlimentares: ['lactose'],
    comidasFavoritas: ['ovos', 'batata doce', 'banana'],
    comidasEvitar: ['laticinios', 'peixe'],
    numeroRefeicoes: 0,
    horarioTreino: '',
  },
  {
    nome: 'Carlos Oliveira',
    idade: 32,
    sexo: 'feminino',
    genero: 'homem-trans',
    generoOutro: '',
    peso: 82,
    altura: 180,
    objetivo: 'melhorar performance e resistencia',
    nivelAtividade: 'intenso',
    restricoesMedicas: [],
    lesoes: ['tendinite no ombro direito'],
    diasTreinoSemana: 0,
    tempoTreinoMinutos: 0,
    preferenciaTreino: '',
    experienciaTreino: '',
    localTreino: '',
    restricoesAlimentares: [],
    comidasFavoritas: ['carne vermelha', 'arroz integral', 'abacate'],
    comidasEvitar: ['acucar refinado', 'refrigerante'],
    numeroRefeicoes: 0,
    horarioTreino: '',
  },
  {
    nome: 'Ana Costa',
    idade: 42,
    sexo: 'feminino',
    genero: 'mulher-cis',
    generoOutro: '',
    peso: 68,
    altura: 160,
    objetivo: 'manter a forma e saude geral',
    nivelAtividade: 'leve',
    restricoesMedicas: ['diabetes tipo 2'],
    lesoes: ['problema no joelho esquerdo'],
    diasTreinoSemana: 0,
    tempoTreinoMinutos: 0,
    preferenciaTreino: '',
    experienciaTreino: '',
    localTreino: '',
    restricoesAlimentares: ['gluten', 'acucar'],
    comidasFavoritas: ['saladas', 'legumes', 'frango'],
    comidasEvitar: ['massas', 'paes', 'doces'],
    numeroRefeicoes: 0,
    horarioTreino: '',
  },
  {
    nome: 'Fernanda Lima',
    idade: 25,
    sexo: 'feminino',
    genero: 'prefiro-nao-declarar',
    generoOutro: '',
    peso: 58,
    altura: 168,
    objetivo: 'ganhar condicionamento fisico e flexibilidade',
    nivelAtividade: 'moderado',
    restricoesMedicas: [],
    lesoes: [],
    diasTreinoSemana: 0,
    tempoTreinoMinutos: 0,
    preferenciaTreino: '',
    experienciaTreino: '',
    localTreino: '',
    restricoesAlimentares: ['vegetariano'],
    comidasFavoritas: ['tofu', 'quinoa', 'legumes'],
    comidasEvitar: ['carne', 'frango', 'peixe'],
    numeroRefeicoes: 0,
    horarioTreino: '',
  },
];
