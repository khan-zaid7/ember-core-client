import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isResolving: boolean;
  isUniqueConstraint: boolean;
  isDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onConfirm,
  isResolving,
  isUniqueConstraint,
  isDisabled,
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.confirmButton, isDisabled && styles.disabledButton]}
        onPress={onConfirm}
        disabled={isDisabled}
      >
        <Text style={styles.confirmButtonText}>
          {isResolving ? 'Resolving...' : (isUniqueConstraint ? 'Send' : 'Confirm')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
