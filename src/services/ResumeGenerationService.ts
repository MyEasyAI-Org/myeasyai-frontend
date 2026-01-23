import { geminiClient } from '../lib/api-clients/gemini-client';
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

    const prompt = `
Você é um especialista em recrutamento e currículos profissionais.

CONTEXTO DO PROFISSIONAL:
- Nome: ${personalInfo.fullName}
- Cargo Desejado: ${profile.target_role}
- Indústria: ${profile.industry}
- Nível de Carreira: ${profile.career_level}
- Experiências Principais: ${experienceSummary}
- Educação: ${educationSummary}
- Principais Habilidades: ${topSkills}

INSTRUÇÕES:
Crie um resumo profissional impactante e conciso (3-4 linhas) que:
1. Destaque a experiência e expertise do profissional
2. Mencione as principais competências e conquistas
3. Indique o objetivo de carreira alinhado ao cargo desejado
4. Use verbos de ação e linguagem profissional
5. Seja otimizado para ATS (Applicant Tracking Systems)
6. Seja específico e quantificável quando possível

IMPORTANTE:
- NÃO use frases genéricas como "profissional dedicado" ou "buscando oportunidades"
- FOQUE em resultados concretos e competências específicas
- Use um tom ${profile.career_level === 'executive' ? 'executivo e estratégico' : 'profissional e objetivo'}
- Escreva em ${profile.preferred_language === 'pt-BR' ? 'português brasileiro' : profile.preferred_language === 'en-US' ? 'inglês americano' : 'espanhol'}

Retorne APENAS o texto do resumo profissional, sem título ou formatação adicional.
`;

    const response = await geminiClient.call(prompt, 0.8);
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

    const prompt = `
Você é um especialista em recrutamento e currículos profissionais.

CONTEXTO:
- Cargo: ${experience.position}
- Empresa: ${experience.company}
- Indústria: ${profile.industry}
- Nível de Carreira: ${profile.career_level}
- Cargo Desejado: ${profile.target_role}
${experience.description ? `- Descrição Atual: ${experience.description}` : ''}

INSTRUÇÕES:
Crie uma descrição otimizada para esta experiência profissional que inclua:

1. DESCRIÇÃO GERAL (1-2 linhas):
   - Resumo das responsabilidades principais
   - Contexto do trabalho realizado

2. CONQUISTAS (3-5 bullet points):
   - Use o formato: AÇÃO + RESULTADO + IMPACTO
   - Comece com verbos de ação fortes
   - Seja específico e quantificável (use números, percentuais, etc.)
   - Foque em resultados mensuráveis e impacto no negócio
   - Destaque competências relevantes para ${profile.target_role}

EXEMPLOS DE BOM FORMATO:
✓ "Desenvolveu sistema de automação que reduziu tempo de processamento em 40%, economizando 20h/semana da equipe"
✓ "Liderou equipe de 8 pessoas na implementação de novo CRM, aumentando taxa de conversão em 25%"
✓ "Otimizou processo de deploy, reduzindo tempo de release de 2h para 15min"

IMPORTANTE:
- Use verbos de ação no passado (desenvolveu, implementou, liderou, etc.)
- Seja específico com números e resultados
- Evite descrições genéricas de responsabilidades
- Foque no IMPACTO gerado, não apenas nas tarefas
- Escreva em ${profile.preferred_language === 'pt-BR' ? 'português brasileiro' : profile.preferred_language === 'en-US' ? 'inglês americano' : 'espanhol'}

FORMATO DA RESPOSTA:
DESCRIÇÃO:
[descrição geral aqui]

CONQUISTAS:
- [conquista 1]
- [conquista 2]
- [conquista 3]
- [conquista 4]
`;

    const response = await geminiClient.call(prompt, 0.85);

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

    const prompt = `
Você é um especialista em recrutamento e mercado de trabalho.

CONTEXTO:
- Cargo Desejado: ${profile.target_role}
- Indústria: ${profile.industry}
- Nível de Carreira: ${profile.career_level}
- Habilidades Atuais: ${currentSkillNames || 'Nenhuma informada'}

INSTRUÇÕES:
Sugira as habilidades mais relevantes e demandadas para este perfil profissional.

Retorne 2 categorias:

1. HABILIDADES TÉCNICAS (8-12 itens):
   - Tecnologias, ferramentas, frameworks específicos
   - Metodologias e práticas relevantes
   - Certificações importantes
   - Conhecimentos técnicos específicos da área

2. HABILIDADES COMPORTAMENTAIS (6-8 itens):
   - Soft skills essenciais para o cargo
   - Competências de liderança (se nível sênior/executivo)
   - Habilidades interpessoais importantes

IMPORTANTE:
- Priorize habilidades em alta demanda no mercado atual
- Seja específico (ex: "React.js" ao invés de "frontend")
- ${currentSkillNames ? 'NÃO repita habilidades que o profissional já possui' : 'Foque nas mais essenciais'}
- Considere o nível de carreira (${profile.career_level})
- Liste em ${profile.preferred_language === 'pt-BR' ? 'português' : profile.preferred_language === 'en-US' ? 'inglês' : 'espanhol'}

FORMATO DA RESPOSTA:
TÉCNICAS:
- [skill 1]
- [skill 2]
...

COMPORTAMENTAIS:
- [skill 1]
- [skill 2]
...
`;

    const response = await geminiClient.call(prompt, 0.7);

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

    const prompt = `
Você é um especialista em currículos profissionais.

CONTEXTO:
- Conquista atual: "${achievement}"
- Cargo: ${profile.target_role}
- Indústria: ${profile.industry}

INSTRUÇÕES:
Transforme esta conquista em uma descrição mais impactante e quantificada:

1. Use verbos de ação fortes no passado
2. Adicione números, percentuais ou métricas (seja realista)
3. Inclua o IMPACTO/RESULTADO concreto
4. Mantenha conciso (1 linha)
5. Seja específico e profissional

EXEMPLOS DE TRANSFORMAÇÃO:
Antes: "Ajudei a melhorar o processo de vendas"
Depois: "Otimizou processo de vendas, aumentando conversão em 30% e gerando R$ 500k em receita adicional"

Antes: "Trabalhei com equipe de desenvolvimento"
Depois: "Colaborou com equipe de 10 desenvolvedores na entrega de 15+ features, reduzindo bugs em 40%"

IMPORTANTE:
- Se o texto original já tiver números, mantenha-os
- Escreva em ${profile.preferred_language === 'pt-BR' ? 'português brasileiro' : profile.preferred_language === 'en-US' ? 'inglês americano' : 'espanhol'}
- Retorne APENAS a conquista otimizada, sem explicações

Conquista otimizada:
`;

    const response = await geminiClient.call(prompt, 0.75);
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
