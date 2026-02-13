import type { Candidate, JobPosting, ScreeningResult, ScreeningScore } from '../types';

function calculateSkillsMatch(
  candidate: Candidate,
  job: JobPosting,
): { skill: string; matched: boolean; notes: string }[] {
  const resumeText = (candidate.resume_data ?? '').toLowerCase();
  const coverText = (candidate.cover_letter ?? '').toLowerCase();
  const combined = `${resumeText} ${coverText}`;

  return job.skills_required.map((skill) => {
    const skillLower = skill.toLowerCase();
    const found = combined.includes(skillLower);
    return {
      skill,
      matched: found,
      notes: found
        ? `Habilidade "${skill}" identificada no perfil do candidato.`
        : `Habilidade "${skill}" não encontrada no perfil.`,
    };
  });
}

function calculateExperienceMatch(
  candidate: Candidate,
  job: JobPosting,
): { score: number; notes: string } {
  const text = (candidate.resume_data ?? '').toLowerCase();

  const experienceKeywords: Record<string, string[]> = {
    junior: ['estágio', 'estagiário', 'junior', 'júnior', '1 ano', 'aprendiz'],
    mid: ['pleno', '2 anos', '3 anos', '4 anos', 'experiência'],
    senior: ['sênior', 'senior', '5 anos', '6 anos', '7 anos', '8 anos', 'especialista'],
    lead: ['líder', 'lead', 'coordenador', 'gestor', 'gerente de equipe', 'tech lead'],
    executive: ['diretor', 'c-level', 'vp', 'cto', 'ceo', 'executivo'],
  };

  const keywords = experienceKeywords[job.experience_level] ?? [];
  const matchCount = keywords.filter((kw) => text.includes(kw)).length;
  const score = keywords.length > 0
    ? Math.min(100, Math.round((matchCount / keywords.length) * 100))
    : 50;

  return {
    score,
    notes: score >= 70
      ? `Nível de experiência compatível com o requisito de ${job.experience_level}.`
      : score >= 40
        ? `Experiência parcialmente compatível com o nível ${job.experience_level}.`
        : `Pouca evidência de experiência no nível ${job.experience_level}.`,
  };
}

function calculateEducationMatch(
  candidate: Candidate,
): { score: number; notes: string } {
  const text = (candidate.resume_data ?? '').toLowerCase();

  const educationKeywords = [
    'graduação', 'bacharelado', 'licenciatura', 'mestrado', 'doutorado',
    'pós-graduação', 'mba', 'tecnólogo', 'universidade', 'faculdade',
    'bachelor', 'master', 'phd', 'degree',
  ];

  const matchCount = educationKeywords.filter((kw) => text.includes(kw)).length;
  const score = Math.min(100, matchCount * 20);

  return {
    score,
    notes: score >= 60
      ? 'Formação acadêmica relevante identificada.'
      : score > 0
        ? 'Alguma formação identificada, mas informações limitadas.'
        : 'Não foi possível identificar formação acadêmica no currículo.',
  };
}

function determineGrade(score: number): ScreeningScore {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  if (score >= 30) return 'below_average';
  return 'poor';
}

function identifyStrengths(
  skillsMatch: { skill: string; matched: boolean }[],
  experienceScore: number,
  educationScore: number,
): string[] {
  const strengths: string[] = [];
  const matchedSkills = skillsMatch.filter((s) => s.matched);

  if (matchedSkills.length > 0) {
    strengths.push(`Possui ${matchedSkills.length} de ${skillsMatch.length} habilidades requeridas`);
  }
  if (matchedSkills.length === skillsMatch.length && skillsMatch.length > 0) {
    strengths.push('Atende a todos os requisitos técnicos');
  }
  if (experienceScore >= 70) {
    strengths.push('Nível de experiência adequado para a posição');
  }
  if (educationScore >= 60) {
    strengths.push('Formação acadêmica relevante');
  }
  if (strengths.length === 0) {
    strengths.push('Candidato demonstra interesse na posição');
  }
  return strengths;
}

function identifyWeaknesses(
  skillsMatch: { skill: string; matched: boolean }[],
  experienceScore: number,
  educationScore: number,
): string[] {
  const weaknesses: string[] = [];
  const missingSkills = skillsMatch.filter((s) => !s.matched);

  if (missingSkills.length > 0) {
    const missing = missingSkills.slice(0, 3).map((s) => s.skill).join(', ');
    weaknesses.push(`Habilidades não identificadas: ${missing}`);
  }
  if (experienceScore < 40) {
    weaknesses.push('Experiência pode não ser suficiente para o nível exigido');
  }
  if (educationScore < 20) {
    weaknesses.push('Formação acadêmica não identificada');
  }
  return weaknesses;
}

function generateRecommendation(score: number, grade: ScreeningScore): string {
  switch (grade) {
    case 'excellent':
      return 'Candidato altamente recomendado. Perfil muito alinhado com os requisitos da vaga. Sugerimos priorizar para entrevista.';
    case 'good':
      return 'Bom candidato com perfil alinhado. Recomendamos agendar entrevista para avaliar pontos específicos.';
    case 'average':
      return 'Candidato com perfil médio. Possui alguns requisitos, mas pode precisar de desenvolvimento. Avaliar conforme demanda.';
    case 'below_average':
      return 'Candidato com perfil parcialmente compatível. Considerar apenas se houver pouca concorrência para a vaga.';
    case 'poor':
      return 'Perfil pouco compatível com os requisitos da vaga. Recomendamos priorizar outros candidatos.';
  }
}

export const ScreeningService = {
  async screenCandidate(candidate: Candidate, job: JobPosting): Promise<ScreeningResult> {
    // Simulate processing delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const skillsMatch = calculateSkillsMatch(candidate, job);
    const experienceMatch = calculateExperienceMatch(candidate, job);
    const educationMatch = calculateEducationMatch(candidate);

    const skillsScore = skillsMatch.length > 0
      ? (skillsMatch.filter((s) => s.matched).length / skillsMatch.length) * 100
      : 50;

    const overallScore = Math.round(
      skillsScore * 0.50 +
      experienceMatch.score * 0.30 +
      educationMatch.score * 0.20,
    );

    const grade = determineGrade(overallScore);
    const strengths = identifyStrengths(skillsMatch, experienceMatch.score, educationMatch.score);
    const weaknesses = identifyWeaknesses(skillsMatch, experienceMatch.score, educationMatch.score);
    const recommendation = generateRecommendation(overallScore, grade);

    return {
      candidate_id: candidate.id,
      job_id: job.id,
      overall_score: overallScore,
      grade,
      skills_match: skillsMatch,
      experience_match: experienceMatch,
      education_match: educationMatch,
      strengths,
      weaknesses,
      recommendation,
      generated_at: new Date().toISOString(),
    };
  },

  async screenMultiple(
    candidates: Candidate[],
    job: JobPosting,
    onProgress?: (completed: number, total: number) => void,
  ): Promise<ScreeningResult[]> {
    const results: ScreeningResult[] = [];

    for (let i = 0; i < candidates.length; i++) {
      const result = await this.screenCandidate(candidates[i], job);
      results.push(result);
      onProgress?.(i + 1, candidates.length);
    }

    return results.sort((a, b) => b.overall_score - a.overall_score);
  },
};
