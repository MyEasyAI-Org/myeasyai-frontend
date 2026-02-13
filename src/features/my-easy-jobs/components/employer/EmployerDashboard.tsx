import { useState, useCallback, useEffect } from 'react';
import type { EmployerView, JobPosting, Candidate, CandidateFormData, JobPostingFormData } from '../../types';
import { useJobPostings } from '../../hooks/useJobPostings';
import { useCandidates } from '../../hooks/useCandidates';
import { CandidateService } from '../../services/CandidateService';
import { EmployerLayout } from './layout/EmployerLayout';
import { EmployerOverview } from './overview/EmployerOverview';
import { JobList } from './jobs/JobList';
import { JobForm } from './jobs/JobForm';
import { CandidateList } from './candidates/CandidateList';
import { CandidateForm } from './candidates/CandidateForm';
import { ScreeningView } from './screening/ScreeningView';

interface EmployerDashboardProps {
  onBackToLanding: () => void;
}

export function EmployerDashboard({ onBackToLanding }: EmployerDashboardProps) {
  const [currentView, setCurrentView] = useState<EmployerView>('overview');

  // Job state
  const {
    jobs, isLoading: jobsLoading, error: jobsError, totalCount: jobsCount,
    filters: jobFilters, setFilters: setJobFilters,
    createJob, updateJob, deleteJob, refresh: refreshJobs,
  } = useJobPostings();

  // Candidate state
  const {
    candidates, isLoading: candidatesLoading, error: candidatesError,
    totalCount: candidatesCount, filters: candidateFilters,
    setFilters: setCandidateFilters, createCandidate, updateCandidate,
    deleteCandidate, updateScreening, refresh: refreshCandidates,
  } = useCandidates();

  // Candidate counts per job
  const [candidateCounts, setCandidateCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const c of candidates) {
      counts[c.job_id] = (counts[c.job_id] ?? 0) + 1;
    }
    setCandidateCounts(counts);
  }, [candidates]);

  // Job form
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobSubmitting, setJobSubmitting] = useState(false);

  // Candidate form
  const [candidateFormOpen, setCandidateFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candidateJobId, setCandidateJobId] = useState('');
  const [candidateJobTitle, setCandidateJobTitle] = useState('');
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'job' | 'candidate'; item: JobPosting | Candidate } | null>(null);

  // Job handlers
  const handleCreateJob = useCallback(() => {
    setEditingJob(null);
    setJobFormOpen(true);
  }, []);

  const handleEditJob = useCallback((job: JobPosting) => {
    setEditingJob(job);
    setJobFormOpen(true);
  }, []);

  const handleJobSubmit = useCallback(async (data: JobPostingFormData) => {
    setJobSubmitting(true);
    try {
      if (editingJob) {
        await updateJob(editingJob.id, data);
      } else {
        await createJob(data);
      }
      setJobFormOpen(false);
      setEditingJob(null);
    } finally {
      setJobSubmitting(false);
    }
  }, [editingJob, createJob, updateJob]);

  const handleDeleteJob = useCallback(async (job: JobPosting) => {
    if (window.confirm(`Excluir a vaga "${job.title}"? Esta ação não pode ser desfeita.`)) {
      await deleteJob(job.id);
    }
  }, [deleteJob]);

  const handleViewJob = useCallback((job: JobPosting) => {
    setCandidateFilters({ ...candidateFilters, job_id: job.id });
    setCandidateJobId(job.id);
    setCandidateJobTitle(job.title);
    setCurrentView('candidates');
  }, [candidateFilters, setCandidateFilters]);

  // Candidate handlers
  const handleCreateCandidate = useCallback(() => {
    setEditingCandidate(null);
    if (!candidateJobId && jobs.length > 0) {
      setCandidateJobId(jobs[0].id);
      setCandidateJobTitle(jobs[0].title);
    }
    setCandidateFormOpen(true);
  }, [candidateJobId, jobs]);

  const handleEditCandidate = useCallback((candidate: Candidate) => {
    setEditingCandidate(candidate);
    const job = jobs.find((j) => j.id === candidate.job_id);
    if (job) {
      setCandidateJobId(job.id);
      setCandidateJobTitle(job.title);
    }
    setCandidateFormOpen(true);
  }, [jobs]);

  const handleCandidateSubmit = useCallback(async (data: CandidateFormData) => {
    setCandidateSubmitting(true);
    try {
      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, data);
      } else {
        await createCandidate({ ...data, job_id: candidateJobId || data.job_id });
      }
      setCandidateFormOpen(false);
      setEditingCandidate(null);
    } finally {
      setCandidateSubmitting(false);
    }
  }, [editingCandidate, candidateJobId, createCandidate, updateCandidate]);

  const handleDeleteCandidate = useCallback(async (candidate: Candidate) => {
    if (window.confirm(`Excluir o candidato "${candidate.name}"? Esta ação não pode ser desfeita.`)) {
      await deleteCandidate(candidate.id);
    }
  }, [deleteCandidate]);

  const handleViewCandidate = useCallback((_candidate: Candidate) => {
    // Future: open candidate detail view
  }, []);

  // Overview navigation
  const handleNavigateFromOverview = useCallback((view: EmployerView) => {
    setCurrentView(view);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <EmployerOverview
            jobsCount={jobsCount}
            candidatesCount={candidatesCount}
            jobs={jobs}
            candidates={candidates}
            onNavigate={handleNavigateFromOverview}
            onCreateJob={handleCreateJob}
          />
        );
      case 'jobs':
        return (
          <JobList
            jobs={jobs}
            isLoading={jobsLoading}
            error={jobsError}
            totalCount={jobsCount}
            filters={jobFilters}
            onFiltersChange={setJobFilters}
            onCreateJob={handleCreateJob}
            onViewJob={handleViewJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            candidateCounts={candidateCounts}
          />
        );
      case 'candidates':
        return (
          <CandidateList
            candidates={candidates}
            isLoading={candidatesLoading}
            error={candidatesError}
            totalCount={candidatesCount}
            filters={candidateFilters}
            onFiltersChange={setCandidateFilters}
            onCreateCandidate={handleCreateCandidate}
            onViewCandidate={handleViewCandidate}
            onEditCandidate={handleEditCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
          />
        );
      case 'screening':
        return (
          <ScreeningView
            jobs={jobs}
            candidates={candidates}
            onUpdateScreening={updateScreening}
          />
        );
    }
  };

  return (
    <EmployerLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onBackToLanding={onBackToLanding}
    >
      {renderView()}

      <JobForm
        job={editingJob}
        isOpen={jobFormOpen}
        onClose={() => { setJobFormOpen(false); setEditingJob(null); }}
        onSubmit={handleJobSubmit}
        isSubmitting={jobSubmitting}
      />

      <CandidateForm
        candidate={editingCandidate}
        jobId={candidateJobId}
        jobTitle={candidateJobTitle}
        isOpen={candidateFormOpen}
        onClose={() => { setCandidateFormOpen(false); setEditingCandidate(null); }}
        onSubmit={handleCandidateSubmit}
        isSubmitting={candidateSubmitting}
      />
    </EmployerLayout>
  );
}
