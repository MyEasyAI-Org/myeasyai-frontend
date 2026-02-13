import { useState } from 'react';
import type { EmployerView } from '../../types';
import { EmployerLayout } from './layout/EmployerLayout';
import { EmployerOverview } from './overview/EmployerOverview';
import { JobsPlaceholder } from './jobs/JobsPlaceholder';
import { CandidatesPlaceholder } from './candidates/CandidatesPlaceholder';
import { ScreeningPlaceholder } from './screening/ScreeningPlaceholder';

interface EmployerDashboardProps {
  onBackToLanding: () => void;
}

export function EmployerDashboard({ onBackToLanding }: EmployerDashboardProps) {
  const [currentView, setCurrentView] = useState<EmployerView>('overview');

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <EmployerOverview />;
      case 'jobs':
        return <JobsPlaceholder />;
      case 'candidates':
        return <CandidatesPlaceholder />;
      case 'screening':
        return <ScreeningPlaceholder />;
    }
  };

  return (
    <EmployerLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onBackToLanding={onBackToLanding}
    >
      {renderView()}
    </EmployerLayout>
  );
}
