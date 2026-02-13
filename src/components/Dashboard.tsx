import { useEffect, useState } from 'react';
import { AssistantChatWidget } from '../features/assistant-chat';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';
import { useNotifications } from '../hooks/useNotifications';
import { useUserData } from '../hooks/useUserData';
import { authService } from '../services/AuthServiceV2';
import type { Notification } from '../types/Notification';
import { Footer } from './Footer';
import NotificationDetailModal from './NotificationDetailModal';
import { DashboardAvatarWidget } from './dashboard/DashboardAvatarWidget';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { LoadingScreen } from './dashboard/LoadingScreen';
import { NavigationTabs } from './dashboard/NavigationTabs';
import { OverviewTab } from './dashboard/OverviewTab';
import { ProductsTab } from './dashboard/ProductsTab';
import { ProfileTab } from './dashboard/ProfileTab';
import { SettingsTab } from './dashboard/SettingsTab';
import { SubscriptionTab } from './dashboard/SubscriptionTab';
import { UsageTab } from './dashboard/UsageTab';

type DashboardProps = {
  onGoHome?: () => void;
  onGoToMyEasyWebsite?: () => void;
  onGoToBusinessGuru?: () => void;
  onGoToMyEasyPricing?: () => void;
  onGoToMyEasyCRM?: () => void;
  onGoToMyEasyContent?: () => void;
  onGoToMyEasyAvatar?: () => void;
  onGoToMyEasyCode?: () => void;
  onGoToMyEasyJobs?: () => void;
  onGoToMyEasyLearning?: () => void;
  onGoToMyEasyDocs?: () => void;
  onGoToSupport?: () => void;
  onGoToMyEasyFitness?: () => void;
  onLoadingComplete?: () => void;
  initialTab?: 'overview' | 'subscription' | 'products' | 'usage' | 'settings' | 'profile';
};

export function Dashboard({
  onGoHome,
  onGoToMyEasyWebsite,
  onGoToBusinessGuru,
  onGoToMyEasyPricing,
  onGoToMyEasyCRM,
  onGoToMyEasyContent,
  onGoToMyEasyAvatar,
  onGoToMyEasyCode,
  onGoToMyEasyJobs,
  onGoToMyEasyLearning,
  onGoToMyEasyDocs,
  onGoToSupport,
  onGoToMyEasyFitness,
  onLoadingComplete,
  initialTab,
}: DashboardProps = {}) {
  // User data hook (manages profile, subscription, products, cadastral info, etc.)
  const {
    profile,
    subscription,
    userProducts,
    cadastralInfo,
    userUuid,
    isLoading,
    loadingProgress,
    loadingStep,
    error,
    updateProfile,
    refreshSubscription,
    refreshProducts,
    refreshAll,
  } = useUserData();

  // Dashboard navigation hook (manages tabs and feature navigation)
  const { activeTab, setActiveTab, navigateToProduct, goToCRM, goToContent, goToAvatar, goToCode, goToJobs, goToLearning, goToFitness, goToDocs } =
    useDashboardNavigation({
      onGoHome,
      onGoToMyEasyWebsite,
      onGoToBusinessGuru,
      onGoToMyEasyPricing,
      onGoToMyEasyCRM,
      onGoToMyEasyContent,
      onGoToMyEasyAvatar,
      onGoToMyEasyCode,
      onGoToMyEasyJobs,
      onGoToMyEasyLearning,
      onGoToMyEasyDocs,
      onGoToMyEasyFitness,
      initialTab,
    });

  // Local UI state
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Notifications hook
  const { getUnreadCount, getLatest, markAsRead, markAllAsRead } =
    useNotifications();

  // Call onLoadingComplete when loading finishes
  useEffect(() => {
    if (!isLoading) {
      onLoadingComplete?.();
    }
  }, [isLoading, onLoadingComplete]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      window.location.href = '/';
    }
  };

  // Notification handlers
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAllNotifications = () => {
    console.log('Ver todas as notificações');
  };

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <LoadingScreen
        loadingStep={loadingStep}
        loadingProgress={loadingProgress}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <DashboardHeader
        profile={profile}
        onGoHome={onGoHome}
        unreadCount={getUnreadCount()}
        latestNotifications={getLatest(10)}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewAllNotifications={handleViewAllNotifications}
        onNavigateToProfile={() => setActiveTab('profile')}
        onNavigateToSettings={() => setActiveTab('settings')}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="mx-auto max-w-7xl flex-1 px-4 py-8 pb-32 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <OverviewTab profile={profile} subscription={subscription} cadastralInfo={cadastralInfo} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab
            subscription={subscription}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            userProducts={userProducts}
            isLoading={isLoading}
            onAccessProduct={navigateToProduct}
            onGoToCRM={goToCRM}
            onGoToMyEasyContent={goToContent}
            onGoToMyEasyFitness={goToFitness}
            onGoToMyEasyAvatar={goToAvatar}
            onGoToMyEasyCode={goToCode}
            onGoToMyEasyJobs={goToJobs}
            onGoToMyEasyLearning={goToLearning}
            onGoToMyEasyDocs={goToDocs}
            onGoToSupport={onGoToSupport}
            accountCreatedAt={cadastralInfo.created_at}
          />
        )}

        {activeTab === 'usage' && <UsageTab subscription={subscription} cadastralInfo={cadastralInfo} />}

        {activeTab === 'settings' && <SettingsTab />}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            cadastralInfo={cadastralInfo}
            userUuid={userUuid}
            onUpdateProfile={updateProfile}
          />
        )}
      </div>

      {/* Footer */}
      <Footer onNavigateToSupport={onGoToSupport} />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {/* Dashboard Avatar Widget */}
      <DashboardAvatarWidget />

      {/* Assistant Chat Widget */}
      <AssistantChatWidget />
    </div>
  );
}
