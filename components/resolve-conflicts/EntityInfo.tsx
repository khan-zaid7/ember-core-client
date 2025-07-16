import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { formatFieldName } from '../../utils/validationUtils';

interface EntityInfoProps {
  entityType: string;
  entityId: string;
  conflictFields: string[];
}

export const EntityInfo: React.FC<EntityInfoProps> = ({ entityType, entityId, conflictFields }) => {
  return (
    <View style={styles.entityInfo}>
      <MaterialIcons name="warning" size={24} color="#f97316" />
      <View style={styles.entityDetails}>
        <Text style={styles.entityType}>
          {formatFieldName(entityType || 'Unknown')} Conflict
        </Text>
        <Text style={styles.entityId}>ID: {entityId || 'Unknown'}</Text>
        <Text style={styles.conflictField}>
          Field: {conflictFields.map(formatFieldName).join(', ') || 'Unknown'}
        </Text>
      </View>
    </View>
  );
};
