/**
 * Chat Messages
 *
 * Predefined messages for the fitness chat assistant.
 */

import type { PersonalInfoStep, FitnessMessage } from '../types';

/**
 * Personal info questions (grouped for natural conversation flow)
 */
export const PERSONAL_INFO_QUESTIONS: Record<PersonalInfoStep, string> = {
  info_basica:
    'Olá! Sou seu assistente de fitness. Vou te ajudar a criar treinos e dietas personalizados.\n\nPara começar, me conte:\n• Sua idade\n• Sexo atribuído no nascimento: masculino, feminino ou prefiro não declarar\n• Gênero: mulher cis, mulher trans, homem cis, homem trans, outro (especifique) ou prefiro não declarar\n\n(Ex: "28 anos, masculino, homem cis" ou "25, feminino, mulher trans")\n\nNota: O sexo biológico é importante para cálculos metabólicos. Seu gênero será respeitado em toda comunicação.',
  info_basica_sem_nome:
    'Para começar, me conte:\n• Sua idade\n• Sexo atribuído no nascimento: masculino, feminino ou prefiro não declarar\n• Gênero: mulher cis, mulher trans, homem cis, homem trans, outro (especifique) ou prefiro não declarar\n\n(Ex: "28 anos, masculino, homem cis")',
  medidas:
    'Ótimo! Agora me diga seu peso e altura.\n\n(Ex: "75kg e 175cm" ou "75kg, 1.75m")',
  objetivo:
    'Ótimo! Qual é o seu principal objetivo?\n\nExemplos: perder gordura, ganhar massa muscular, manter a forma, melhorar condicionamento...',
  atividade:
    'Qual seu nível de atividade física atual?\n\n1. Sedentário (pouco ou nenhum exercício)\n2. Leve (exercício 1-3 dias/semana)\n3. Moderado (exercício 3-5 dias/semana)\n4. Intenso (exercício 6-7 dias/semana)',
  treino_preferencias:
    'Agora vamos personalizar seu treino! Me conte:\n\n• Quantos dias por semana? (1-6)\n• Quanto tempo por sessão? (30min, 45min, 1h, 1h30)\n• Seu nível: iniciante, intermediário ou avançado\n• Onde treina: academia ou casa\n• Tipo de treino preferido? (musculação, funcional, corrida, calistenia)\n\n(Ex: "4 dias, 1h, intermediário, academia, musculação")',
  dieta_preferencias:
    'Excelente! Agora sobre sua alimentação:\n\n• Tem alguma restrição alimentar? (lactose, glúten, vegetariano, vegano, etc)\n• Alguma comida favorita que quer incluir na dieta?\n• Alguma comida que você NÃO gosta ou quer evitar?\n• Quantas refeições prefere fazer por dia? (3-6)\n• Em que horário costuma treinar? (manhã, tarde, noite)\n\n(Ex: "intolerante a lactose, gosto de frango e arroz, não gosto de peixe, 5 refeições, treino à noite")',
  saude:
    'Quase lá! Você tem alguma restrição médica ou lesão que eu deva considerar?\n\n(Ex: "diabetes, lesão no joelho" ou "nenhuma")',
  complete: '',
};

/**
 * Error messages for personal info validation
 */
export const PERSONAL_INFO_ERROR_MESSAGES: Record<PersonalInfoStep, string> = {
  info_basica:
    'Não consegui entender. Por favor, informe:\n• Idade\n• Sexo: masculino, feminino ou prefiro não declarar\n• Gênero: mulher cis, mulher trans, homem cis, homem trans, outro ou prefiro não declarar\n\n(Ex: "25 anos, feminino, mulher cis")',
  info_basica_sem_nome:
    'Não consegui entender. Por favor, informe:\n• Idade\n• Sexo: masculino, feminino ou prefiro não declarar\n• Gênero: mulher cis, mulher trans, homem cis, homem trans, outro ou prefiro não declarar\n\n(Ex: "25 anos, feminino, mulher cis")',
  medidas:
    'Não consegui entender. Por favor, informe seu peso e altura.\n\n(Ex: "70kg e 165cm")',
  objetivo: 'Por favor, me conte qual é seu objetivo principal.',
  atividade:
    'Por favor, escolha uma opção de 1 a 4, ou digite o nível de atividade.',
  treino_preferencias:
    'Por favor, informe: dias por semana, tempo, nível, local (academia/casa) e tipo de treino.\n\n(Ex: "4 dias, 1h, intermediário, academia, musculação")',
  dieta_preferencias:
    'Por favor, me conte sobre suas preferências alimentares.\n\n(Ex: "sem lactose, gosto de frango, não gosto de peixe, 5 refeições, treino à noite")',
  saude:
    'Por favor, liste suas restrições/lesões separadas por vírgula, ou digite "nenhuma".',
  complete: '',
};

/**
 * Initial chat message
 */
export const INITIAL_MESSAGE: FitnessMessage = {
  id: 'initial-message',
  role: 'assistant',
  content: PERSONAL_INFO_QUESTIONS.info_basica,
  timestamp: new Date(),
};
