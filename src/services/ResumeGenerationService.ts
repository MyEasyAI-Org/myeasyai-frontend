import { geminiProxyClient } from '../lib/api-clients/gemini-proxy-client';
import type {
  ResumeGenerationRequest,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  ResumeProfile,
} from '../features/my-easy-resume/types';

export class ResumeGenerationService {
  /**
   * Generate a professional summary based on career info
   */
  async generateProfessionalSummary(params: {
    profile: ResumeProfile;
    personalInfo: PersonalInfo;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
  }): Promise<string> {
    const { profile, personalInfo, experiences, education, skills } = params;

    const experienceSummary = experiences
      .map((exp) => `${exp.position} na ${exp.company}`)
      .slice(0, 3)
      .join(', ');

    const topSkills = skills.slice(0, 8).map((s) => s.name).join(', ');

    const educationSummary = education.length > 0
      ? `${education[0].degree} em ${education[0].field}`
      : 'Formação acadêmica sólida';

    const response = await geminiProxyClient.call(
      'resume.generateProfessionalSummary',
      {
        fullName: personalInfo.fullName,
        targetRole: profile.target_role,
        industry: profile.industry,
        careerLevel: profile.career_level,
        experienceSummary,
        educationSummary,
        topSkills,
        preferredLanguage: profile.preferred_language || 'pt-BR',
      },
      0.8,
    );
    return response.trim();
  }

  /**
   * Generate optimized description for a work experience
   */
  async generateExperienceDescription(params: {
    profile: ResumeProfile;
    experience: Partial<Experience>;
  }): Promise<{ description: string; achievements: string[] }> {
    const { profile, experience } = params;

    const response = await geminiProxyClient.call(
      'resume.generateExperienceDescription',
      {
        position: experience.position || '',
        company: experience.company || '',
        industry: profile.industry,
        careerLevel: profile.career_level,
        targetRole: profile.target_role,
        currentDescription: experience.description || '',
        preferredLanguage: profile.preferred_language || 'pt-BR',
      },
      0.85,
    );

    // Parse response
    const lines = response.trim().split('\n');
    let description = '';
    const achievements: string[] = [];
    let isInAchievements = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DESCRIÇÃO:')) {
        continue;
      } else if (trimmed.startsWith('CONQUISTAS:')) {
        isInAchievements = true;
        continue;
      }

      if (!isInAchievements && trimmed) {
        description += trimmed + ' ';
      } else if (isInAchievements && trimmed.startsWith('-')) {
        achievements.push(trimmed.substring(1).trim());
      }
    }

    return {
      description: description.trim() || 'Responsável por atividades relacionadas ao cargo.',
      achievements: achievements.length > 0 ? achievements : ['Contribuiu para o sucesso da equipe e da empresa'],
    };
  }

  /**
   * Suggest relevant skills based on role and industry
   */
  async suggestSkills(params: {
    profile: ResumeProfile;
    currentSkills: Skill[];
  }): Promise<{ technical: string[]; soft: string[] }> {
    const { profile, currentSkills } = params;

    const currentSkillNames = currentSkills.map((s) => s.name).join(', ');

    const response = await geminiProxyClient.call(
      'resume.suggestSkills',
      {
        targetRole: profile.target_role,
        industry: profile.industry,
        careerLevel: profile.career_level,
        currentSkills: currentSkillNames || '',
        preferredLanguage: profile.preferred_language || 'pt-BR',
      },
      0.7,
    );

    // Parse response
    const lines = response.trim().split('\n');
    const technical: string[] = [];
    const soft: string[] = [];
    let currentSection: 'technical' | 'soft' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('TÉCNICAS:') || trimmed.includes('TECHNICAL:') || trimmed.includes('TÉCNICAS')) {
        currentSection = 'technical';
        continue;
      } else if (trimmed.includes('COMPORTAMENTAIS:') || trimmed.includes('SOFT:') || trimmed.includes('COMPORTAMENTAIS')) {
        currentSection = 'soft';
        continue;
      }

      if (trimmed.startsWith('-') && currentSection) {
        const skill = trimmed.substring(1).trim();
        if (currentSection === 'technical') {
          technical.push(skill);
        } else {
          soft.push(skill);
        }
      }
    }

    return {
      technical: technical.slice(0, 12),
      soft: soft.slice(0, 8),
    };
  }

  /**
   * Transform a simple achievement into a quantified, impactful one
   */
  async quantifyAchievement(params: {
    profile: ResumeProfile;
    achievement: string;
  }): Promise<string> {
    const { profile, achievement } = params;

    const response = await geminiProxyClient.call(
      'resume.quantifyAchievement',
      {
        achievement,
        targetRole: profile.target_role,
        industry: profile.industry,
        preferredLanguage: profile.preferred_language || 'pt-BR',
      },
      0.75,
    );
    return response.trim();
  }

  /**
   * Generate complete resume with all sections
   */
  async generateFullResume(request: ResumeGenerationRequest): Promise<string> {
    const { profile, personalInfo, experiences, education, skills } = request;

    // Generate professional summary if not exists
    const professionalSummary = await this.generateProfessionalSummary({
      profile,
      personalInfo,
      experiences,
      education,
      skills,
    });

    return professionalSummary;
  }
}

export const resumeGenerationService = new ResumeGenerationService();
