/**
 * Training Modality Configuration
 *
 * Configuration for different training modalities with descriptions and benefits.
 */

import type { TrainingModality } from '../types';

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
