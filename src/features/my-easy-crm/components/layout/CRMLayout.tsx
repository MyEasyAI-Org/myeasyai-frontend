// =============================================
// MyEasyCRM - Layout Component
// =============================================

import { useState, type ReactNode } from 'react';
import { CRMSidebar } from './CRMSidebar';
import { CRMHeader } from './CRMHeader';
import type { CRMView } from '../../types';

interface CRMLayoutProps {
  children: ReactNode;
  currentView: CRMView;
  onViewChange: (view: CRMView) => void;
  onQuickAction?: (action: 'contact' | 'company' | 'deal' | 'task') => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSettings?: () => void;
  onBackToDashboard?: () => void;
}

export function CRMLayout({
  children,
  currentView,
  onViewChange,
  onQuickAction,
  userName,
  userEmail,
  onLogout,
  onSettings,
  onBackToDashboard,
}: CRMLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <CRMSidebar
          currentView={currentView}
          onViewChange={onViewChange}
          onQuickAction={onQuickAction}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onBackToDashboard={onBackToDashboard}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <CRMSidebar
          currentView={currentView}
          onViewChange={(view) => {
            onViewChange(view);
            setMobileMenuOpen(false);
          }}
          onQuickAction={(action) => {
            onQuickAction?.(action);
            setMobileMenuOpen(false);
          }}
          collapsed={false}
          onBackToDashboard={onBackToDashboard}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CRMHeader
          currentView={currentView}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
          onSettings={onSettings}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
