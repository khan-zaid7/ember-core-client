import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
  title: string;
  onSettingsPress?: () => void;
  showSettings?: boolean;
  onBackPress?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onSettingsPress,
  showSettings = true,
  onBackPress,
}) => {
  const router = useRouter();

  // fallback in case onBackPress isn't passed, but don't override the prop
  const handleBackPress = onBackPress ?? (() => router.replace('/home'));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        paddingBottom: 8,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#f4f2f1',
      }}
    >
      {onBackPress ? (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chevron-left" size={28} color="#f97316" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40, height: 40, marginRight: 8 }} />
      )}

      <Text
        style={{
          color: '#161412',
          fontSize: 20,
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
          letterSpacing: -0.5,
        }}
      >
        {title}
      </Text>

      {showSettings ? (
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
      ) : (
        <View style={{ width: 40, height: 40 }} />
      )}
    </View>
  );
};

export default DashboardHeader;
