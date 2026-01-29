/**
 * Parsing Keywords
 *
 * Keywords used for parsing user input in the chat.
 */

import type { BiologicalSex, GenderIdentity } from '../types';

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
