import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DashboardHeaderProps {
  title: string;
  onSettingsPress?: () => void;
  showSettings?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, onSettingsPress, showSettings = true }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingBottom: 8, justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#f4f2f1' }}>
    <Text style={{ color: '#161412', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center', letterSpacing: -0.5, paddingLeft: 32 }}>{title}</Text>
    {showSettings && (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#fff7ed',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#f97316',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
        activeOpacity={0.7}
        onPress={onSettingsPress}
      >
        <MaterialIcons name="settings" size={26} color="#f97316" />
      </TouchableOpacity>
    )}
  </View>
);

export default DashboardHeader; 