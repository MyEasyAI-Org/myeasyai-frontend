/**
 * usePersonalInfoFlow Hook
 *
 * Manages the personal info conversation flow and message handling.
 * Follows Single Responsibility Principle - only handles conversation logic.
 */

import { useCallback, useState } from 'react';
import type {
  PersonalInfoStep,
  Dieta,
  FitnessMessage,
  Treino,
  UserPersonalInfo,
} from '../types';
import {
  PERSONAL_INFO_ERROR_MESSAGES,
  PERSONAL_INFO_QUESTIONS,
  getActivityLevelName,
  INITIAL_MESSAGE,
} from '../constants';
import {
  getNextPersonalInfoStep,
  isPersonalInfoComplete,
  parsePersonalInfoResponse,
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

interface UsePersonalInfoFlowProps {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  onUpdatePersonalInfo: (updates: Partial<UserPersonalInfo>) => void;
  onAddTreino: (treino: Treino) => void;
  onUpdateDieta: (dieta: Dieta) => void;
}

/**
 * Hook for managing personal info conversation flow
 */
export function usePersonalInfoFlow({
  personalInfo,
  treinos,
  dieta,
  onUpdatePersonalInfo,
  onAddTreino,
  onUpdateDieta,
}: UsePersonalInfoFlowProps) {
  const [messages, setMessages] = useState<FitnessMessage[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personalInfoStep, setPersonalInfoStep] = useState<PersonalInfoStep>('info_basica');

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
   * Generate personal info complete summary
   */
  const generatePersonalInfoSummary = useCallback(
    (data: UserPersonalInfo): string => {
      const bmi = calculateBMI(data.peso, data.altura);

      let resposta = `✅ Perfeito, ${data.nome}! Informações pessoais completas!\n\n`;
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

      resposta += `\nVoce pode ver e editar todos esses dados na aba "Informações Pessoais".\n\n`;
      resposta += `Agora posso criar treinos e dietas personalizados para voce! O que gostaria de fazer?\n\n`;
      resposta += `• Diga "treino" para criar uma planilha de treino\n`;
      resposta += `• Diga "dieta" para criar um plano alimentar`;

      return resposta;
    },
    []
  );

  /**
   * Handle personal info step response
   */
  const handlePersonalInfoStep = useCallback(
    (input: string) => {
      const result = parsePersonalInfoResponse(personalInfoStep, input);

      if (result === null) {
        // Invalid response - show error
        addAssistantMessage(PERSONAL_INFO_ERROR_MESSAGES[personalInfoStep]);
        return;
      }

      // Update personal info with parsed data
      const newPersonalInfo = { ...personalInfo, ...result };
      onUpdatePersonalInfo(result);

      // Move to next step
      const nextStep = getNextPersonalInfoStep(personalInfoStep);
      setPersonalInfoStep(nextStep);

      if (isPersonalInfoComplete(nextStep)) {
        // Personal info complete - show summary
        addAssistantMessage(generatePersonalInfoSummary(newPersonalInfo));
      } else {
        // Send next question with placeholder replacement
        let nextQuestion = PERSONAL_INFO_QUESTIONS[nextStep];
        nextQuestion = nextQuestion.replace('{nome}', newPersonalInfo.nome);
        addAssistantMessage(nextQuestion);
      }
    },
    [
      personalInfoStep,
      personalInfo,
      onUpdatePersonalInfo,
      addAssistantMessage,
      generatePersonalInfoSummary,
    ]
  );

  /**
   * Handle post-personal-info conversation
   */
  const handlePostPersonalInfoMessage = useCallback(
    (input: string) => {
      const userContext = generateUserContext(
        personalInfo,
        treinos.length,
        dieta !== null
      );
      console.log('Contexto do usuario:', userContext);

      // Check for workout request
      if (isWorkoutRequest(input)) {
        const treino = generateChestTricepsWorkout(personalInfo);
        onAddTreino(treino);
        addAssistantMessage(generateWorkoutResponseMessage(personalInfo, treino));
        return;
      }

      // Check for diet request
      if (isDietRequest(input)) {
        const newDieta = generateDiet(personalInfo);
        onUpdateDieta(newDieta);
        addAssistantMessage(generateDietResponseMessage(personalInfo, newDieta));
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
      let resposta = `${personalInfo.nome}, posso te ajudar com:\n\n`;
      resposta += '• Criar planilhas de treino (diga "quero um treino")\n';
      resposta += '• Montar plano alimentar (diga "monte minha dieta")\n';
      resposta += '• Ver seus dados atuais (diga "meus dados")\n';
      resposta += '• Tirar duvidas sobre exercicios e nutricao\n\n';
      resposta += 'O que gostaria de fazer?';

      addAssistantMessage(resposta);
    },
    [personalInfo, treinos, dieta, onAddTreino, onUpdateDieta, addAssistantMessage]
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
      if (!isPersonalInfoComplete(personalInfoStep)) {
        handlePersonalInfoStep(currentInput);
      } else {
        handlePostPersonalInfoMessage(currentInput);
      }
      setIsGenerating(false);
    }, 800);
  }, [
    inputMessage,
    isGenerating,
    personalInfoStep,
    addMessage,
    handlePersonalInfoStep,
    handlePostPersonalInfoMessage,
  ]);

  /**
   * Reset conversation
   */
  const resetConversation = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setPersonalInfoStep('info_basica');
    setInputMessage('');
  }, []);

  return {
    // State
    messages,
    inputMessage,
    isGenerating,
    personalInfoStep,

    // Actions
    setInputMessage,
    handleSendMessage,
    resetConversation,

    // Helpers
    isPersonalInfoComplete: isPersonalInfoComplete(personalInfoStep),
  };
}
