// hooks/useTabNavigation.ts
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TabKey } from '@/components/Footer';

export const useTabNavigation = (initialTab: TabKey = 'home') => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const handleTabPress = (tab: TabKey) => {
    if (tab === activeTab) return;

    if (tab === 'settings') {
      setShowSettings(true);
    } else {
      setActiveTab(tab);
      router.push(`/${tab}`);
    }
  };

  return {
    activeTab,
    handleTabPress,
    showSettings,
    setShowSettings
  };
};