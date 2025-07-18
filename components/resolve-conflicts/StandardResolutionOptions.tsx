import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';

interface StandardResolutionOptionsProps {
  selectedResolution: 'local' | 'server' | null;
  onSelectResolution: (resolution: 'local' | 'server') => void;
  allowedStrategies?: string[];
}

export const StandardResolutionOptions: React.FC<StandardResolutionOptionsProps> = ({
  selectedResolution,
  onSelectResolution,
  allowedStrategies = ['client_wins', 'server_wins'],
}) => {
  // Check if strategies are allowed
  const isClientWinsAllowed = allowedStrategies.includes('client_wins');
  const isServerWinsAllowed = allowedStrategies.includes('server_wins');

  return (
    <View>
      {isClientWinsAllowed && (
        <TouchableOpacity
          style={[styles.resolutionOption, selectedResolution === 'local' && styles.selectedOption]}
          onPress={() => onSelectResolution('local')}
        >
          <MaterialIcons 
            name="arrow-forward" 
            size={24} 
            color={selectedResolution === 'local' ? '#f97316' : '#6b7280'} 
          />
          <Text style={[styles.optionTitle, selectedResolution === 'local' && styles.selectedOptionTitle]}>
            Use My Data
          </Text>
        </TouchableOpacity>
      )}

      {isServerWinsAllowed && (
        <TouchableOpacity
          style={[styles.resolutionOption, selectedResolution === 'server' && styles.selectedOption]}
          onPress={() => onSelectResolution('server')}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={selectedResolution === 'server' ? '#f97316' : '#6b7280'} 
          />
          <Text style={[styles.optionTitle, selectedResolution === 'server' && styles.selectedOptionTitle]}>
            Use Server Data
          </Text>
        </TouchableOpacity>
      )}
      
      {!isClientWinsAllowed && !isServerWinsAllowed && (
        <View style={styles.noOptionsContainer}>
          <MaterialIcons name="info" size={24} color="#6b7280" />
          <Text style={styles.noOptionsText}>
            No standard resolution options are available for this conflict.
          </Text>
        </View>
      )}
    </View>
  );
};
