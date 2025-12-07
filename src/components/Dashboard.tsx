import { useEffect, useState } from 'react';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';
import { useNotifications } from '../hooks/useNotifications';
import { useUserData } from '../hooks/useUserData';
import { authService } from '../services/AuthService';
import type { Notification } from '../types/notification';
import { Footer } from './Footer';
import NotificationDetailModal from './NotificationDetailModal';
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
  onLoadingComplete?: () => void;
};

export function Dashboard({
  onGoHome,
  onGoToMyEasyWebsite,
  onGoToBusinessGuru,
  onGoToMyEasyPricing,
  onLoadingComplete,
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
  const { activeTab, setActiveTab, navigateToProduct } =
    useDashboardNavigation({
      onGoHome,
      onGoToMyEasyWebsite,
      onGoToBusinessGuru,
      onGoToMyEasyPricing,
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
      const { error } = await authService.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
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

  // Show loading screen while data is being loaded
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
          <OverviewTab profile={profile} subscription={subscription} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab subscription={subscription} />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            userProducts={userProducts}
            isLoading={isLoading}
            onAccessProduct={navigateToProduct}
          />
        )}

        {activeTab === 'usage' && <UsageTab subscription={subscription} />}

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
      <Footer />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
