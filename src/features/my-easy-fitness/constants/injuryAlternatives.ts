/**
 * Injury Exercise Alternatives
 *
 * Mappings for exercise alternatives based on injury types.
 */

/**
 * Alternative exercises for injuries
 * Each injury type has exercises to avoid and suggested alternatives
 */
export const INJURY_EXERCISE_ALTERNATIVES: Record<string, { avoid: string[]; alternatives: string[] }> = {
  // Ombro - lesões no manguito rotador, bursite, tendinite
  ombro: {
    avoid: ['supino', 'desenvolvimento', 'elevação lateral', 'mergulho', 'dips', 'crucifixo'],
    alternatives: ['Peck Deck', 'Crossover Baixo', 'Flexão com apoio', 'Face Pull', 'Elevação Frontal leve'],
  },
  // Joelho - lesões no ligamento, menisco, condromalácia
  joelho: {
    avoid: ['agachamento', 'leg press', 'extensora', 'afundo', 'salto', 'pistol', 'hack'],
    alternatives: ['Cadeira Flexora', 'Stiff', 'Elevação Pélvica', 'Glúteo no cabo'],
  },
  // Costas - hérnia, protrusão discal
  costas: {
    avoid: ['remada', 'levantamento', 'terra', 'good morning'],
    alternatives: ['Puxada no Pulley', 'Pulldown', 'Remada apoiada no banco'],
  },
  // Lombar - dor lombar, hérnia lombar
  lombar: {
    avoid: ['agachamento', 'stiff', 'remada curvada', 'terra', 'good morning', 'abdominal'],
    alternatives: ['Leg Press 45', 'Hack Machine', 'Prancha', 'Glúteo no cabo'],
  },
  // Punho/Mão - tendinite, túnel do carpo
  punho: {
    avoid: ['rosca', 'supino', 'flexão', 'tríceps francês', 'desenvolvimento'],
    alternatives: ['Máquinas com pegada neutra', 'Extensora', 'Flexora', 'Leg Press'],
  },
  // Cotovelo - epicondilite (cotovelo de tenista)
  cotovelo: {
    avoid: ['rosca', 'tríceps', 'supino', 'remada', 'puxada'],
    alternatives: ['Exercícios de pernas', 'Máquinas com pegada neutra', 'Abdominais'],
  },
  // Quadril - bursite, impacto femoroacetabular
  quadril: {
    avoid: ['agachamento profundo', 'afundo', 'stiff', 'abdutora', 'adutora'],
    alternatives: ['Leg Press amplitude parcial', 'Extensora', 'Flexora', 'Panturrilha'],
  },
  // Cervical - hérnia cervical, dor no pescoço
  cervical: {
    avoid: ['desenvolvimento', 'encolhimento', 'remada alta', 'abdominal com flexão'],
    alternatives: ['Elevação Lateral', 'Peck Deck', 'Exercícios sentado com apoio'],
  },
  // Tornozelo - entorse, instabilidade
  tornozelo: {
    avoid: ['agachamento', 'afundo', 'salto', 'panturrilha em pé', 'corrida'],
    alternatives: ['Leg Press', 'Extensora', 'Flexora', 'Exercícios sentado'],
  },
};
