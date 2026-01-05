/**
 * useAnamneseFlow Hook
 *
 * Manages the anamnese conversation flow and message handling.
 * Follows Single Responsibility Principle - only handles conversation logic.
 */

import { useCallback, useState } from 'react';
import type {
  AnamneseStep,
  Dieta,
  FitnessMessage,
  Treino,
  UserAnamnese,
} from '../types';
import {
  ANAMNESE_ERROR_MESSAGES,
  ANAMNESE_QUESTIONS,
  getActivityLevelName,
  INITIAL_MESSAGE,
} from '../constants';
import {
  getNextAnamneseStep,
  isAnamneseComplete,
  parseAnamneseResponse,
} from '../utils/anamneseParser';
import {
  calculateBMI,
  generateUserContext,
} from '../utils/fitnessCalculations';
import {
  generateChestTricepsWorkout,
  generateWorkoutResponseMessage,
  isWorkoutRequest,
} from '../utils/workoutGenerator';
import {
  generateDiet,
  generateDietResponseMessage,
  isDietRequest,
  isStatusRequest,
} from '../utils/dietGenerator';

interface UseAnamneseFlowProps {
  anamnese: UserAnamnese;
  treinos: Treino[];
  dieta: Dieta | null;
  onUpdateAnamnese: (updates: Partial<UserAnamnese>) => void;
  onAddTreino: (treino: Treino) => void;
  onUpdateDieta: (dieta: Dieta) => void;
}

/**
 * Hook for managing anamnese conversation flow
 */
export function useAnamneseFlow({
  anamnese,
  treinos,
  dieta,
  onUpdateAnamnese,
  onAddTreino,
  onUpdateDieta,
}: UseAnamneseFlowProps) {
  const [messages, setMessages] = useState<FitnessMessage[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [anamneseStep, setAnamneseStep] = useState<AnamneseStep>('info_basica');

  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((message: FitnessMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Add assistant response
   */
  const addAssistantMessage = useCallback((content: string) => {
    addMessage({
      role: 'assistant',
      content,
      timestamp: new Date(),
    });
  }, [addMessage]);

  /**
   * Generate anamnese complete summary
   */
  const generateAnamneseSummary = useCallback(
    (data: UserAnamnese): string => {
      const bmi = calculateBMI(data.peso, data.altura);

      let resposta = `✅ Perfeito, ${data.nome}! Anamnese completa!\n\n`;
      resposta += `📋 **Resumo dos seus dados:**\n`;
      resposta += `• Idade: ${data.idade} anos\n`;
      resposta += `• Sexo: ${data.sexo === 'masculino' ? 'Masculino' : 'Feminino'}\n`;
      resposta += `• Peso: ${data.peso} kg\n`;
      resposta += `• Altura: ${data.altura} cm\n`;

      if (bmi) {
        resposta += `• IMC: ${bmi.toFixed(1)}\n`;
      }

      resposta += `• Objetivo: ${data.objetivo}\n`;
      resposta += `• Nivel de atividade: ${getActivityLevelName(data.nivelAtividade)}\n`;

      if (data.restricoesMedicas.length > 0) {
        resposta += `• Restricoes: ${data.restricoesMedicas.join(', ')}\n`;
      }

      if (data.lesoes.length > 0) {
        resposta += `• Lesoes: ${data.lesoes.join(', ')}\n`;
      }

      resposta += `\nVoce pode ver e editar todos esses dados na aba "Anamnese".\n\n`;
      resposta += `Agora posso criar treinos e dietas personalizados para voce! O que gostaria de fazer?\n\n`;
      resposta += `• Diga "treino" para criar uma planilha de treino\n`;
      resposta += `• Diga "dieta" para criar um plano alimentar`;

      return resposta;
    },
    []
  );

  /**
   * Handle anamnese step response
   */
  const handleAnamneseStep = useCallback(
    (input: string) => {
      const result = parseAnamneseResponse(anamneseStep, input);

      if (result === null) {
        // Invalid response - show error
        addAssistantMessage(ANAMNESE_ERROR_MESSAGES[anamneseStep]);
        return;
      }

      // Update anamnese with parsed data
      const newAnamnese = { ...anamnese, ...result };
      onUpdateAnamnese(result);

      // Move to next step
      const nextStep = getNextAnamneseStep(anamneseStep);
      setAnamneseStep(nextStep);

      if (isAnamneseComplete(nextStep)) {
        // Anamnese complete - show summary
        addAssistantMessage(generateAnamneseSummary(newAnamnese));
      } else {
        // Send next question with placeholder replacement
        let nextQuestion = ANAMNESE_QUESTIONS[nextStep];
        nextQuestion = nextQuestion.replace('{nome}', newAnamnese.nome);
        addAssistantMessage(nextQuestion);
      }
    },
    [
      anamneseStep,
      anamnese,
      onUpdateAnamnese,
      addAssistantMessage,
      generateAnamneseSummary,
    ]
  );

  /**
   * Handle post-anamnese conversation
   */
  const handlePostAnamneseMessage = useCallback(
    (input: string) => {
      const userContext = generateUserContext(
        anamnese,
        treinos.length,
        dieta !== null
      );
      console.log('Contexto do usuario:', userContext);

      // Check for workout request
      if (isWorkoutRequest(input)) {
        const treino = generateChestTricepsWorkout(anamnese);
        onAddTreino(treino);
        addAssistantMessage(generateWorkoutResponseMessage(anamnese, treino));
        return;
      }

      // Check for diet request
      if (isDietRequest(input)) {
        const newDieta = generateDiet(anamnese);
        onUpdateDieta(newDieta);
        addAssistantMessage(generateDietResponseMessage(anamnese, newDieta));
        return;
      }

      // Check for status request
      if (isStatusRequest(input)) {
        let resposta = '📋 **Seus dados atuais:**\n\n';
        if (userContext) {
          resposta += userContext.split(' | ').join('\n• ');
        } else {
          resposta += 'Nenhum dado preenchido ainda.';
        }
        addAssistantMessage(resposta);
        return;
      }

      // Default help response
      let resposta = `${anamnese.nome}, posso te ajudar com:\n\n`;
      resposta += '• Criar planilhas de treino (diga "quero um treino")\n';
      resposta += '• Montar plano alimentar (diga "monte minha dieta")\n';
      resposta += '• Ver seus dados atuais (diga "meus dados")\n';
      resposta += '• Tirar duvidas sobre exercicios e nutricao\n\n';
      resposta += 'O que gostaria de fazer?';

      addAssistantMessage(resposta);
    },
    [anamnese, treinos, dieta, onAddTreino, onUpdateDieta, addAssistantMessage]
  );

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || isGenerating) return;

    // Add user message
    const userMessage: FitnessMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    const currentInput = inputMessage;
    setInputMessage('');
    setIsGenerating(true);

    // Simulate async response
    setTimeout(() => {
      if (!isAnamneseComplete(anamneseStep)) {
        handleAnamneseStep(currentInput);
      } else {
        handlePostAnamneseMessage(currentInput);
      }
      setIsGenerating(false);
    }, 800);
  }, [
    inputMessage,
    isGenerating,
    anamneseStep,
    addMessage,
    handleAnamneseStep,
    handlePostAnamneseMessage,
  ]);

  /**
   * Reset conversation
   */
  const resetConversation = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setAnamneseStep('info_basica');
    setInputMessage('');
  }, []);

  return {
    // State
    messages,
    inputMessage,
    isGenerating,
    anamneseStep,

    // Actions
    setInputMessage,
    handleSendMessage,
    resetConversation,

    // Helpers
    isAnamneseComplete: isAnamneseComplete(anamneseStep),
  };
}
