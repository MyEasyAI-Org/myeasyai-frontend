import type { Candidate, CandidateFormData, CandidateFilters } from '../types';

const STORAGE_KEY = 'myeasyjobs_candidates';

function generateId(): string {
  return crypto.randomUUID();
}

function readAll(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(candidates: Candidate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

function applyFilters(candidates: Candidate[], filters: CandidateFilters): Candidate[] {
  let result = candidates;

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.tags.some((t) => t.toLowerCase().includes(term)),
    );
  }

  if (filters.job_id) {
    result = result.filter((c) => c.job_id === filters.job_id);
  }

  if (filters.status) {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.min_score !== undefined) {
    result = result.filter((c) => (c.screening_score ?? 0) >= filters.min_score!);
  }

  if (filters.max_score !== undefined) {
    result = result.filter((c) => (c.screening_score ?? 0) <= filters.max_score!);
  }

  return result;
}

export const CandidateService = {
  async getAll(filters?: CandidateFilters): Promise<Candidate[]> {
    const all = readAll();
    const sorted = all.sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime(),
    );
    return filters ? applyFilters(sorted, filters) : sorted;
  },

  async getById(id: string): Promise<Candidate | null> {
    const all = readAll();
    return all.find((c) => c.id === id) ?? null;
  },

  async create(data: CandidateFormData): Promise<Candidate> {
    const now = new Date().toISOString();
    const candidate: Candidate = {
      id: generateId(),
      user_id: 'local',
      job_id: data.job_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      resume_data: data.resume_data,
      cover_letter: data.cover_letter,
      status: data.status ?? 'new',
      tags: data.tags ?? [],
      recruiter_notes: data.recruiter_notes,
      applied_at: now,
      updated_at: now,
    };
    const all = readAll();
    all.push(candidate);
    writeAll(all);
    return candidate;
  },

  async update(id: string, data: Partial<CandidateFormData>): Promise<Candidate> {
    const all = readAll();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Candidato não encontrado');

    const updated: Candidate = {
      ...all[index],
      ...data,
      tags: data.tags ?? all[index].tags,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    writeAll(all);
    return updated;
  },

  async updateScreening(
    id: string,
    score: number,
    grade: Candidate['screening_grade'],
    aiNotes: string,
  ): Promise<Candidate> {
    const all = readAll();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Candidato não encontrado');

    all[index] = {
      ...all[index],
      screening_score: score,
      screening_grade: grade,
      ai_notes: aiNotes,
      status: 'screening',
      updated_at: new Date().toISOString(),
    };
    writeAll(all);
    return all[index];
  },

  async delete(id: string): Promise<void> {
    const all = readAll();
    writeAll(all.filter((c) => c.id !== id));
  },

  async countByJob(jobId: string): Promise<number> {
    const all = readAll();
    return all.filter((c) => c.job_id === jobId).length;
  },

  async getMetrics(): Promise<{
    total: number;
    newThisWeek: number;
    avgScore: number;
    byStatus: Record<string, number>;
  }> {
    const all = readAll();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const scored = all.filter((c) => c.screening_score !== undefined);
    const avgScore = scored.length > 0
      ? scored.reduce((sum, c) => sum + (c.screening_score ?? 0), 0) / scored.length
      : 0;

    const byStatus: Record<string, number> = {};
    for (const c of all) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    }

    return {
      total: all.length,
      newThisWeek: all.filter((c) => new Date(c.applied_at) >= oneWeekAgo).length,
      avgScore: Math.round(avgScore),
      byStatus,
    };
  },
};
