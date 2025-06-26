import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DashboardFooterProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'records', label: 'Records', icon: 'insert-drive-file' },
  { key: 'map', label: 'Map', icon: 'map' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

const DashboardFooter: React.FC<DashboardFooterProps> = ({ activeTab, onTabPress }) => (
  <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#f4f2f1', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, justifyContent: 'space-between', borderTopLeftRadius: 18, borderTopRightRadius: 18, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 8 }}>
    {tabs.map(tab => (
      <TouchableOpacity key={tab.key} style={{ flex: 1, alignItems: 'center' }} onPress={() => onTabPress(tab.key)}>
        <MaterialIcons name={tab.icon as any} size={28} color={activeTab === tab.key ? '#f97316' : '#81736a'} />
        <Text style={{ color: activeTab === tab.key ? '#f97316' : '#81736a', fontSize: 12, fontWeight: activeTab === tab.key ? '700' : '500', marginTop: 2 }}>{tab.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default DashboardFooter; 