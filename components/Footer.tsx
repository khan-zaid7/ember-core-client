import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

// Define valid tab keys
export type TabKey = 'home' | 'records' | 'map' | 'settings';

// Restrict to specific icons
type AppIconName = 'home' | 'map' | 'settings' | 'insert-drive-file';

interface TabType {
  key: TabKey;
  label: string;
  icon: AppIconName;
}

interface FooterProps {
  activeTab: TabKey | null;
  onTabPress: (tab: TabKey) => void;
}

// Define the tabs
const tabs: TabType[] = [
  { key: 'home', label: 'Dashboard', icon: 'home' },
  { key: 'records', label: 'Records', icon: 'insert-drive-file' },
  { key: 'map', label: 'Map', icon: 'map' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

// Footer Component
export const Footer: React.FC<FooterProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={{
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: '#f4f2f1',
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 8,
      justifyContent: 'space-between',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center' }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={tab.key === activeTab ? 1 : 0.7}
        >
          <MaterialIcons
            name={tab.icon}
            size={28}
            color={activeTab === tab.key ? '#f97316' : '#81736a'}
          />
          <Text style={{
            color: activeTab === tab.key ? '#f97316' : '#81736a',
            fontSize: 12,
            fontWeight: activeTab === tab.key ? '700' : '500',
            marginTop: 2
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Hook for navigation + tab state
export const useFooterNavigation = (
  initialTab: TabKey = 'home',
  onSettingsOpen?: () => void
) => {
  const [activeTab, setActiveTab] = React.useState<TabKey | null>(initialTab);
  const router = useRouter();
  const pathname = usePathname();

  // Sync active tab with current path
  React.useEffect(() => {
    if (pathname.startsWith('/home')) setActiveTab('home');
    else if (pathname.startsWith('/records')) setActiveTab('records');
    else if (pathname.startsWith('/map')) setActiveTab('map');
    else if (pathname.startsWith('/settings')) setActiveTab('settings');
    else setActiveTab(null); // Clear tab on unrelated pages
  }, [pathname]);

  const handleTabPress = (tab: TabKey) => {
    if (tab !== activeTab) {
      setActiveTab(tab);

      switch (tab) {
        case 'home':
          router.push('/home');
          break;
        case 'records':
          router.push('/records');
          break;
        case 'map':
          router.push('/map');
          break;
        case 'settings':
          onSettingsOpen?.();
          break;
      }
    } else if (tab === 'settings') {
      onSettingsOpen?.(); // Always open modal
    }
  };

  return { activeTab, handleTabPress };
};
