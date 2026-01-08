/**
 * FitnessService
 *
 * Service for managing fitness data persistence using D1 database.
 * Follows the same patterns as CRM services.
 */

import {
  d1Client,
  type D1FitnessProfile,
  type D1FitnessTreino,
  type D1FitnessDieta,
} from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { UserPersonalInfo, Treino, Dieta, Exercise, Refeicao } from '../types';

/**
 * Gets the current authenticated user's UUID
 */
async function getCurrentUserUuid(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('User not authenticated');
}

/**
 * Maps D1 profile to frontend UserPersonalInfo type
 */
function mapD1ToPersonalInfo(profile: D1FitnessProfile): UserPersonalInfo {
  return {
    nome: profile.nome,
    idade: profile.idade,
    sexo: profile.sexo as UserPersonalInfo['sexo'],
    genero: ((profile as any).genero ?? '') as UserPersonalInfo['genero'],
    generoOutro: (profile as any).genero_outro ?? '',
    peso: profile.peso,
    altura: profile.altura,
    objetivo: profile.objetivo,
    nivelAtividade: profile.nivel_atividade as UserPersonalInfo['nivelAtividade'],
    restricoesMedicas: profile.restricoes_medicas
      ? JSON.parse(profile.restricoes_medicas)
      : [],
    lesoes: profile.lesoes ? JSON.parse(profile.lesoes) : [],
    // Training preferences (with defaults for backwards compatibility)
    diasTreinoSemana: (profile as any).dias_treino_semana ?? 0,
    tempoTreinoMinutos: (profile as any).tempo_treino_minutos ?? 0,
    preferenciaTreino: (profile as any).preferencia_treino ?? '',
    experienciaTreino: ((profile as any).experiencia_treino ?? '') as UserPersonalInfo['experienciaTreino'],
    // Diet preferences (with defaults for backwards compatibility)
    restricoesAlimentares: (profile as any).restricoes_alimentares
      ? JSON.parse((profile as any).restricoes_alimentares)
      : [],
    comidasFavoritas: (profile as any).comidas_favoritas
      ? JSON.parse((profile as any).comidas_favoritas)
      : [],
    comidasEvitar: (profile as any).comidas_evitar
      ? JSON.parse((profile as any).comidas_evitar)
      : [],
    numeroRefeicoes: (profile as any).numero_refeicoes ?? 0,
    horarioTreino: ((profile as any).horario_treino ?? '') as UserPersonalInfo['horarioTreino'],
  };
}

/**
 * Maps D1 treino to frontend Treino type
 */
function mapD1ToTreino(treino: D1FitnessTreino): Treino {
  return {
    id: treino.id,
    nome: treino.nome,
    diaSemana: treino.dia_semana,
    exercicios: treino.exercicios ? JSON.parse(treino.exercicios) : [],
  };
}

/**
 * Maps D1 dieta to frontend Dieta type
 */
function mapD1ToDieta(dieta: D1FitnessDieta): Dieta {
  return {
    calorias: dieta.calorias,
    proteinas: dieta.proteinas,
    carboidratos: dieta.carboidratos,
    gorduras: dieta.gorduras,
    refeicoes: dieta.refeicoes ? JSON.parse(dieta.refeicoes) : [],
  };
}

/**
 * Fitness data service for D1 persistence
 */
export const FitnessService = {
  // ==================== PROFILE / PERSONAL INFO ====================

  /**
   * Gets the user's fitness profile (personal info)
   */
  async getProfile(): Promise<UserPersonalInfo | null> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.getFitnessProfile(userUuid);

      if (result.error) {
        console.error('Error fetching fitness profile:', result.error);
        return null;
      }

      if (!result.data) {
        return null;
      }

      return mapD1ToPersonalInfo(result.data);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },

  /**
   * Saves the user's fitness profile (personal info)
   */
  async saveProfile(personalInfo: UserPersonalInfo): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.upsertFitnessProfile({
        user_uuid: userUuid,
        nome: personalInfo.nome,
        idade: personalInfo.idade,
        sexo: personalInfo.sexo,
        peso: personalInfo.peso,
        altura: personalInfo.altura,
        objetivo: personalInfo.objetivo,
        nivel_atividade: personalInfo.nivelAtividade,
        restricoes_medicas: personalInfo.restricoesMedicas,
        lesoes: personalInfo.lesoes,
      });

      if (result.error) {
        console.error('Error saving fitness profile:', result.error);
        return false;
      }

      console.log('Fitness profile saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveProfile:', error);
      return false;
    }
  },

  // ==================== TREINOS ====================

  /**
   * Gets all user's workouts
   */
  async getTreinos(): Promise<Treino[]> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.getFitnessTreinos(userUuid);

      if (result.error) {
        console.error('Error fetching treinos:', result.error);
        return [];
      }

      return (result.data || []).map(mapD1ToTreino);
    } catch (error) {
      console.error('Error in getTreinos:', error);
      return [];
    }
  },

  /**
   * Adds a new workout
   */
  async addTreino(treino: Omit<Treino, 'id'>): Promise<Treino | null> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.createFitnessTreino({
        user_uuid: userUuid,
        nome: treino.nome,
        dia_semana: treino.diaSemana,
        exercicios: treino.exercicios,
      });

      if (result.error || !result.data) {
        console.error('Error adding treino:', result.error);
        return null;
      }

      console.log('Treino added successfully');
      return mapD1ToTreino(result.data);
    } catch (error) {
      console.error('Error in addTreino:', error);
      return null;
    }
  },

  /**
   * Updates an existing workout
   */
  async updateTreino(
    id: string,
    updates: Partial<Omit<Treino, 'id'>>
  ): Promise<boolean> {
    try {
      const result = await d1Client.updateFitnessTreino(id, {
        nome: updates.nome,
        dia_semana: updates.diaSemana,
        exercicios: updates.exercicios,
      });

      if (result.error) {
        console.error('Error updating treino:', result.error);
        return false;
      }

      console.log('Treino updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateTreino:', error);
      return false;
    }
  },

  /**
   * Deletes a workout
   */
  async deleteTreino(id: string): Promise<boolean> {
    try {
      const result = await d1Client.deleteFitnessTreino(id);

      if (result.error) {
        console.error('Error deleting treino:', result.error);
        return false;
      }

      console.log('Treino deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteTreino:', error);
      return false;
    }
  },

  /**
   * Replaces all workouts (used when editing multiple treinos)
   */
  async replaceTreinos(treinos: Treino[]): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.replaceFitnessTreinos(
        userUuid,
        treinos.map((t) => ({
          id: t.id,
          nome: t.nome,
          dia_semana: t.diaSemana,
          exercicios: t.exercicios,
        }))
      );

      if (result.error) {
        console.error('Error replacing treinos:', result.error);
        return false;
      }

      console.log('Treinos replaced successfully');
      return true;
    } catch (error) {
      console.error('Error in replaceTreinos:', error);
      return false;
    }
  },

  // ==================== DIETA ====================

  /**
   * Gets the user's diet plan
   */
  async getDieta(): Promise<Dieta | null> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.getFitnessDieta(userUuid);

      if (result.error) {
        console.error('Error fetching dieta:', result.error);
        return null;
      }

      if (!result.data) {
        return null;
      }

      return mapD1ToDieta(result.data);
    } catch (error) {
      console.error('Error in getDieta:', error);
      return null;
    }
  },

  /**
   * Saves the user's diet plan
   */
  async saveDieta(dieta: Dieta): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();

      const result = await d1Client.upsertFitnessDieta({
        user_uuid: userUuid,
        calorias: dieta.calorias,
        proteinas: dieta.proteinas,
        carboidratos: dieta.carboidratos,
        gorduras: dieta.gorduras,
        refeicoes: dieta.refeicoes,
      });

      if (result.error) {
        console.error('Error saving dieta:', result.error);
        return false;
      }

      console.log('Dieta saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveDieta:', error);
      return false;
    }
  },

  /**
   * Deletes the user's diet plan
   */
  async deleteDieta(): Promise<boolean> {
    try {
      const userUuid = await getCurrentUserUuid();
      const result = await d1Client.deleteFitnessDieta(userUuid);

      if (result.error) {
        console.error('Error deleting dieta:', result.error);
        return false;
      }

      console.log('Dieta deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteDieta:', error);
      return false;
    }
  },

  // ==================== FULL DATA ====================

  /**
   * Loads all fitness data for the current user
   */
  async loadAllData(): Promise<{
    personalInfo: UserPersonalInfo | null;
    treinos: Treino[];
    dieta: Dieta | null;
  }> {
    try {
      const [personalInfo, treinos, dieta] = await Promise.all([
        this.getProfile(),
        this.getTreinos(),
        this.getDieta(),
      ]);

      return { personalInfo, treinos, dieta };
    } catch (error) {
      console.error('Error loading all fitness data:', error);
      return { personalInfo: null, treinos: [], dieta: null };
    }
  },

  /**
   * Saves all fitness data
   */
  async saveAllData(data: {
    personalInfo: UserPersonalInfo;
    treinos: Treino[];
    dieta: Dieta | null;
  }): Promise<boolean> {
    try {
      const results = await Promise.all([
        this.saveProfile(data.personalInfo),
        this.replaceTreinos(data.treinos),
        data.dieta ? this.saveDieta(data.dieta) : Promise.resolve(true),
      ]);

      return results.every((r) => r);
    } catch (error) {
      console.error('Error saving all fitness data:', error);
      return false;
    }
  },

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUserUuid();
      return true;
    } catch {
      return false;
    }
  },
};

export default FitnessService;
