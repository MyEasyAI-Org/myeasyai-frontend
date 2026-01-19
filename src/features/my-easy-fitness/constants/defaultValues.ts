/**
 * Default Values
 *
 * Default and template values for fitness data.
 */

import type { UserPersonalInfo, Dieta } from '../types';

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
  modalidade: '',
  // Diet preferences
  restricoesAlimentares: [],
  comidasFavoritas: [],
  comidasEvitar: [],
  numeroRefeicoes: 0,
  horarioTreino: '',
};

/**
 * Default diet template
 */
export const DEFAULT_DIET_TEMPLATE: Omit<Dieta, 'calorias' | 'proteinas' | 'carboidratos' | 'gorduras'> = {
  refeicoes: [
    {
      nome: 'Café da Manhã',
      horario: '07:00',
      alimentos: [
        { nome: 'ovos mexidos', gramas: 100 },
        { nome: 'pão integral', gramas: 50 },
        { nome: 'banana', gramas: 120 },
        { nome: 'café', gramas: 100 },
      ],
    },
    {
      nome: 'Lanche da Manhã',
      horario: '10:00',
      alimentos: [
        { nome: 'iogurte natural', gramas: 170 },
        { nome: 'granola', gramas: 40 },
        { nome: 'frutas vermelhas', gramas: 100 },
      ],
    },
    {
      nome: 'Almoço',
      horario: '12:30',
      alimentos: [
        { nome: 'frango grelhado', gramas: 150 },
        { nome: 'arroz integral', gramas: 150 },
        { nome: 'feijão', gramas: 100 },
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
