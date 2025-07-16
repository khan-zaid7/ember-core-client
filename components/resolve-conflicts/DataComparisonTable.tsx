import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import { formatFieldName } from '../../utils/validationUtils';

interface DataComparisonTableProps {
  allFields: string[];
  clientData: Record<string, any>;
  serverData: Record<string, any>;
  conflictFields: string[];
}

export const DataComparisonTable: React.FC<DataComparisonTableProps> = ({
  allFields,
  clientData,
  serverData,
  conflictFields,
}) => {
  return (
    <View style={styles.comparisonContainer}>
      <Text style={styles.sectionTitle}>Conflicting Fields</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Field</Text>
        <Text style={styles.tableHeaderText}>Your Data{'\n'}(Local)</Text>
        <Text style={styles.tableHeaderText}>Server Data</Text>
      </View>
      {allFields.map(field => {
        const localValue = clientData?.[field];
        const serverValue = serverData?.[field];
        const isConflictingField = conflictFields.includes(field);
        
        return (
          <View key={field} style={[styles.tableRow, isConflictingField && styles.conflictRow]}>
            <Text style={[styles.fieldCell, isConflictingField && styles.conflictText]}>
              {formatFieldName(field)}
            </Text>
            <Text style={[styles.dataCell, isConflictingField && styles.conflictText]}>
              {localValue !== undefined && localValue !== null ? 
                String(localValue) : 
                <Text style={{ color: "#b91c1c" }}>Only on server</Text>
              }
            </Text>
            <Text style={[styles.dataCell, isConflictingField && styles.conflictText]}>
              {serverValue !== undefined && serverValue !== null ? 
                String(serverValue) : 
                <Text style={{ color: "#0284c7" }}>Only on local</Text>
              }
            </Text>
          </View>
        );
      })}
    </View>
  );
};
