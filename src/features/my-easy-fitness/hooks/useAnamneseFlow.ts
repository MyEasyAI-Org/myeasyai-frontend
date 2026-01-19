/**
 * usePersonalInfoFlow Hook
 *
 * Manages the personal info conversation flow and message handling.
 * Follows Single Responsibility Principle - only handles conversation logic.
 */

import React, { useCallback, useState, useEffect } from 'react';
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
  generatePersonalizedWorkoutPlan,
  generatePersonalizedWorkoutResponseMessage,
  isWorkoutRequest,
} from '../utils/workoutGenerator';
import {
  generateDiet,
  generateDietResponseMessage,
  isDietRequest,
  isStatusRequest,
} from '../utils/dietGenerator';

/**
 * Check if basic personal data is complete (enough to generate workouts/diets)
 */
function hasBasicDataComplete(info: UserPersonalInfo): boolean {
  return !!(
    info.idade && info.idade > 0 &&
    info.sexo &&
    info.peso && info.peso > 0 &&
    info.altura && info.altura > 0 &&
    info.objetivo &&
    info.nivelAtividade
  );
}

/**
 * Determine the appropriate step based on existing data
 */
function getStepBasedOnData(info: UserPersonalInfo, hasName: boolean): PersonalInfoStep {
  if (hasBasicDataComplete(info)) return 'complete';
  if (!info.idade || !info.sexo) return hasName ? 'info_basica_sem_nome' : 'info_basica';
  if (!info.peso || !info.altura) return 'medidas';
  if (!info.objetivo) return 'objetivo';
  if (!info.nivelAtividade) return 'atividade';
  return 'complete';
}

interface UsePersonalInfoFlowProps {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  onUpdatePersonalInfo: (updates: Partial<UserPersonalInfo>) => void;
  onAddTreino: (treino: Treino) => void;
  onSetTreinos: (treinos: Treino[]) => void;
  onUpdateDieta: (dieta: Dieta) => void;
  authenticatedUserName?: string;
}

/**
 * Get initial message based on whether user name is known
 */
function getInitialMessage(userName?: string): FitnessMessage {
  if (userName) {
    return {
      id: `initial-${Date.now()}`,
      role: 'assistant',
      content: `Olá, ${userName}! Sou seu assistente de fitness. Vou te ajudar a criar treinos e dietas personalizados.\n\nPara começar, me conte: qual seu sexo biológico e idade?\n\n(Ex: "masculino, 28 anos")`,
      timestamp: new Date(),
    };
  }
  return INITIAL_MESSAGE;
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
  onSetTreinos,
  onUpdateDieta,
  authenticatedUserName,
}: UsePersonalInfoFlowProps) {
  // Determine initial step based on existing data and whether we have the user name
  const hasName = !!(authenticatedUserName || personalInfo.nome);
  const initialStep: PersonalInfoStep = getStepBasedOnData(personalInfo, hasName);

  // Track the previous profile name to detect profile changes
  const [previousProfileName, setPreviousProfileName] = useState<string>(personalInfo.nome);

  const [messages, setMessages] = useState<FitnessMessage[]>([getInitialMessage(authenticatedUserName)]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personalInfoStep, setPersonalInfoStep] = useState<PersonalInfoStep>(initialStep);
  const [hasSetInitialName, setHasSetInitialName] = useState(false);

  // Track if we're collecting preferences for workout or diet generation
  const [pendingAction, setPendingAction] = useState<'treino' | 'dieta' | null>(null);

  // Set authenticated user name on mount (only once)
  useEffect(() => {
    if (authenticatedUserName && !hasSetInitialName && !personalInfo.nome) {
      onUpdatePersonalInfo({ nome: authenticatedUserName });
      setHasSetInitialName(true);
    }
  }, [authenticatedUserName, hasSetInitialName, personalInfo.nome, onUpdatePersonalInfo]);

  // Detect profile changes (e.g., when demo profile is loaded)
  useEffect(() => {
    // Check if the profile name changed (new profile loaded)
    if (personalInfo.nome && personalInfo.nome !== previousProfileName) {
      setPreviousProfileName(personalInfo.nome);

      // Recalculate step based on new data
      const newStep = getStepBasedOnData(personalInfo, true);
      setPersonalInfoStep(newStep);

      // If basic data is complete, show a message confirming the profile was loaded
      if (newStep === 'complete') {
        const profileLoadedMessage: FitnessMessage = {
          id: `profile-loaded-${Date.now()}`,
          role: 'assistant',
          content: `Perfil de ${personalInfo.nome} carregado! Seus dados estão completos.\n\nVocê pode:\n• Dizer "treino" para criar uma planilha de treino\n• Dizer "dieta" para criar um plano alimentar\n• Editar seus dados na aba "Informações Pessoais"`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, profileLoadedMessage]);
      }
    }
  }, [personalInfo, previousProfileName]);

  /**
   * Check if workout preferences are filled
   */
  const hasWorkoutPreferences = useCallback(() => {
    return personalInfo.diasTreinoSemana > 0;
  }, [personalInfo.diasTreinoSemana]);

  /**
   * Check if diet preferences are filled
   */
  const hasDietPreferences = useCallback(() => {
    return personalInfo.numeroRefeicoes > 0 ||
           (personalInfo.restricoesAlimentares && personalInfo.restricoesAlimentares.length > 0) ||
           personalInfo.horarioTreino !== '';
  }, [personalInfo.numeroRefeicoes, personalInfo.restricoesAlimentares, personalInfo.horarioTreino]);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((message: FitnessMessage) => {
    const messageWithId = {
      ...message,
      id: message.id || generateMessageId(),
    };
    setMessages((prev) => [...prev, messageWithId]);
  }, [generateMessageId]);

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

      let resposta = `✅ Perfeito, ${data.nome}! Informações básicas coletadas!\n\n`;
      resposta += `📋 **Resumo dos seus dados:**\n`;
      resposta += `• Idade: ${data.idade} anos\n`;
      resposta += `• Sexo: ${data.sexo === 'masculino' ? 'Masculino' : 'Feminino'}\n`;
      resposta += `• Peso: ${data.peso} kg\n`;
      resposta += `• Altura: ${data.altura} cm\n`;
      if (bmi) {
        resposta += `• IMC: ${bmi.toFixed(1)}\n`;
      }
      resposta += `• Objetivo: ${data.objetivo}\n`;
      resposta += `• Nível de atividade: ${getActivityLevelName(data.nivelAtividade)}\n`;

      // Health info
      if (data.restricoesMedicas.length > 0 || data.lesoes.length > 0) {
        if (data.restricoesMedicas.length > 0) {
          resposta += `• Restrições médicas: ${data.restricoesMedicas.join(', ')}\n`;
        }
        if (data.lesoes.length > 0) {
          resposta += `• Lesões: ${data.lesoes.join(', ')}\n`;
        }
      }

      resposta += `\nVocê pode ver e editar esses dados na aba "Informações Pessoais".\n\n`;
      resposta += `Agora posso criar treinos e dietas PERSONALIZADOS para você!\n`;
      resposta += `Quando pedir, vou fazer algumas perguntas específicas para personalizar ao máximo.\n\n`;
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
   * Handle workout preferences response and generate workout
   */
  const handleWorkoutPreferencesResponse = useCallback(
    (input: string) => {
      const result = parsePersonalInfoResponse('treino_preferencias', input);

      if (result === null) {
        addAssistantMessage(PERSONAL_INFO_ERROR_MESSAGES.treino_preferencias);
        return;
      }

      // Update personal info with preferences
      const updatedInfo = { ...personalInfo, ...result };
      onUpdatePersonalInfo(result);

      // Now generate the workout
      const novosTreinos = generatePersonalizedWorkoutPlan(updatedInfo);
      onSetTreinos(novosTreinos);
      addAssistantMessage(generatePersonalizedWorkoutResponseMessage(updatedInfo, novosTreinos));

      // Clear pending action
      setPendingAction(null);
    },
    [personalInfo, onUpdatePersonalInfo, onSetTreinos, addAssistantMessage]
  );

  /**
   * Handle diet preferences response and generate diet
   */
  const handleDietPreferencesResponse = useCallback(
    (input: string) => {
      const result = parsePersonalInfoResponse('dieta_preferencias', input);

      if (result === null) {
        addAssistantMessage(PERSONAL_INFO_ERROR_MESSAGES.dieta_preferencias);
        return;
      }

      // Update personal info with preferences
      const updatedInfo = { ...personalInfo, ...result };
      onUpdatePersonalInfo(result);

      // Now generate the diet
      const newDieta = generateDiet(updatedInfo);
      onUpdateDieta(newDieta);
      addAssistantMessage(generateDietResponseMessage(updatedInfo, newDieta));

      // Clear pending action
      setPendingAction(null);
    },
    [personalInfo, onUpdatePersonalInfo, onUpdateDieta, addAssistantMessage]
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
      console.log('Contexto do usuário:', userContext);

      // Check for workout request
      if (isWorkoutRequest(input)) {
        // Check if we need to collect preferences first
        if (!hasWorkoutPreferences()) {
          setPendingAction('treino');
          addAssistantMessage(PERSONAL_INFO_QUESTIONS.treino_preferencias);
          return;
        }

        // Generate a complete personalized workout plan
        const novosTreinos = generatePersonalizedWorkoutPlan(personalInfo);
        onSetTreinos(novosTreinos);
        addAssistantMessage(generatePersonalizedWorkoutResponseMessage(personalInfo, novosTreinos));
        return;
      }

      // Check for diet request
      if (isDietRequest(input)) {
        // Check if we need to collect preferences first
        if (!hasDietPreferences()) {
          setPendingAction('dieta');
          addAssistantMessage(PERSONAL_INFO_QUESTIONS.dieta_preferencias);
          return;
        }

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
      resposta += '• Tirar dúvidas sobre exercícios e nutrição\n\n';
      resposta += 'O que gostaria de fazer?';

      addAssistantMessage(resposta);
    },
    [personalInfo, treinos, dieta, onSetTreinos, onUpdateDieta, addAssistantMessage, hasWorkoutPreferences, hasDietPreferences]
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
      // Check if we're waiting for preferences response
      if (pendingAction === 'treino') {
        handleWorkoutPreferencesResponse(currentInput);
      } else if (pendingAction === 'dieta') {
        handleDietPreferencesResponse(currentInput);
      } else if (!isPersonalInfoComplete(personalInfoStep)) {
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
    pendingAction,
    addMessage,
    handlePersonalInfoStep,
    handlePostPersonalInfoMessage,
    handleWorkoutPreferencesResponse,
    handleDietPreferencesResponse,
  ]);

  /**
   * Reset conversation
   */
  const resetConversation = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setPersonalInfoStep('info_basica');
    setInputMessage('');
    setPendingAction(null);
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
