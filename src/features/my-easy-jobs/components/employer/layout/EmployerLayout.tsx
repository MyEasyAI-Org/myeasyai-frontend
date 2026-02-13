import { useState, type ReactNode } from 'react';
import { EmployerSidebar } from './EmployerSidebar';
import { EmployerHeader } from './EmployerHeader';
import type { EmployerView } from '../../../types';

interface EmployerLayoutProps {
  children: ReactNode;
  currentView: EmployerView;
  onViewChange: (view: EmployerView) => void;
  onBackToLanding: () => void;
}

export function EmployerLayout({
  children,
  currentView,
  onViewChange,
  onBackToLanding,
}: EmployerLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <EmployerSidebar
          currentView={currentView}
          onViewChange={onViewChange}
          onBackToLanding={onBackToLanding}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <EmployerSidebar
          currentView={currentView}
          onViewChange={(view) => {
            onViewChange(view);
            setMobileMenuOpen(false);
          }}
          onBackToLanding={onBackToLanding}
        />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <EmployerHeader
          currentView={currentView}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
