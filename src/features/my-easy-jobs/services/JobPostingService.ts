import type { JobPosting, JobPostingFormData, JobPostingFilters } from '../types';

const STORAGE_KEY = 'myeasyjobs_postings';

function generateId(): string {
  return crypto.randomUUID();
}

function readAll(): JobPosting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(jobs: JobPosting[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function applyFilters(jobs: JobPosting[], filters: JobPostingFilters): JobPosting[] {
  let result = jobs;

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term) ||
        j.location?.toLowerCase().includes(term) ||
        j.skills_required.some((s) => s.toLowerCase().includes(term)),
    );
  }

  if (filters.status) {
    result = result.filter((j) => j.status === filters.status);
  }

  if (filters.job_type) {
    result = result.filter((j) => j.job_type === filters.job_type);
  }

  if (filters.experience_level) {
    result = result.filter((j) => j.experience_level === filters.experience_level);
  }

  return result;
}

export const JobPostingService = {
  async getAll(filters?: JobPostingFilters): Promise<JobPosting[]> {
    const all = readAll();
    const sorted = all.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return filters ? applyFilters(sorted, filters) : sorted;
  },

  async getById(id: string): Promise<JobPosting | null> {
    const all = readAll();
    return all.find((j) => j.id === id) ?? null;
  },

  async create(data: JobPostingFormData): Promise<JobPosting> {
    const now = new Date().toISOString();
    const job: JobPosting = {
      id: generateId(),
      user_id: 'local',
      title: data.title,
      description: data.description,
      requirements: data.requirements ?? [],
      responsibilities: data.responsibilities ?? [],
      department: data.department,
      location: data.location,
      work_mode: data.work_mode ?? 'on_site',
      job_type: data.job_type ?? 'full_time',
      experience_level: data.experience_level ?? 'mid',
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      salary_currency: 'BRL',
      skills_required: data.skills_required ?? [],
      skills_preferred: data.skills_preferred ?? [],
      benefits: data.benefits ?? [],
      status: data.status ?? 'draft',
      applications_count: 0,
      created_at: now,
      updated_at: now,
      closes_at: data.closes_at,
    };
    const all = readAll();
    all.push(job);
    writeAll(all);
    return job;
  },

  async update(id: string, data: Partial<JobPostingFormData>): Promise<JobPosting> {
    const all = readAll();
    const index = all.findIndex((j) => j.id === id);
    if (index === -1) throw new Error('Vaga não encontrada');

    const updated: JobPosting = {
      ...all[index],
      ...data,
      requirements: data.requirements ?? all[index].requirements,
      responsibilities: data.responsibilities ?? all[index].responsibilities,
      skills_required: data.skills_required ?? all[index].skills_required,
      skills_preferred: data.skills_preferred ?? all[index].skills_preferred,
      benefits: data.benefits ?? all[index].benefits,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    writeAll(all);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const all = readAll();
    writeAll(all.filter((j) => j.id !== id));
  },

  async getMetrics(): Promise<{
    total: number;
    open: number;
    closed: number;
    filled: number;
  }> {
    const all = readAll();
    return {
      total: all.length,
      open: all.filter((j) => j.status === 'open').length,
      closed: all.filter((j) => j.status === 'closed').length,
      filled: all.filter((j) => j.status === 'filled').length,
    };
  },
};
