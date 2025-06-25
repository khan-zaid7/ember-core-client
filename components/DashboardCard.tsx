import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import tw from 'twrnc';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  status?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, subtitle, status, style, onPress }) => {
  const CardContent = (
    <View style={[tw`bg-white rounded-xl p-4 shadow flex-row items-center mb-4`, style]}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={tw`text-gray-500 text-sm`}>{title}</Text>
        <Text style={tw`text-xl font-bold text-orange-500`}>{value}</Text>
        {subtitle && <Text style={tw`text-xs text-gray-400 mt-1`}>{subtitle}</Text>}
      </View>
      {status && <View style={{ marginLeft: 8 }}>{status}</View>}
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ width: '100%' }}>
      {CardContent}
    </TouchableOpacity>
  ) : (
    CardContent
  );
};

export default DashboardCard; 