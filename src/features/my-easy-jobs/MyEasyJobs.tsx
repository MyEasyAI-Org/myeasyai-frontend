import { useState } from 'react';
import type { JobsView } from './types';
import { RoleSelectionLanding } from './components/landing/RoleSelectionLanding';
import { EmployeeResume } from './components/employee/EmployeeResume';
import { EmployerDashboard } from './components/employer/EmployerDashboard';

interface MyEasyJobsProps {
  onBackToDashboard?: () => void;
}

export function MyEasyJobs({ onBackToDashboard }: MyEasyJobsProps) {
  const [currentView, setCurrentView] = useState<JobsView>('landing');

  const handleSelectRole = (role: 'employee' | 'employer') => {
    setCurrentView(role);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  switch (currentView) {
    case 'landing':
      return (
        <RoleSelectionLanding
          onSelectRole={handleSelectRole}
          onBackToDashboard={onBackToDashboard}
        />
      );
    case 'employee':
      return <EmployeeResume onBackToLanding={handleBackToLanding} />;
    case 'employer':
      return <EmployerDashboard onBackToLanding={handleBackToLanding} />;
  }
}
