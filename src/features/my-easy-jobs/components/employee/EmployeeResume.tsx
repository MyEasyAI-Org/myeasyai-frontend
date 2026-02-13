import { MyEasyResume } from '../../../my-easy-resume/MyEasyResume';

interface EmployeeResumeProps {
  onBackToLanding: () => void;
}

export function EmployeeResume({ onBackToLanding }: EmployeeResumeProps) {
  return <MyEasyResume onBackToDashboard={onBackToLanding} />;
}
