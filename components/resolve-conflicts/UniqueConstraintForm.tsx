import React, { useRef } from 'react';
import { View, Text, TextInput, ScrollView, Keyboard } from 'react-native';
import { styles } from './styles';
import { formatFieldName } from '../../utils/validationUtils';

interface UniqueConstraintFormProps {
  uniqueConstraintFields: string[];
  editableValues: Record<string, string>;
  onUpdateValue: (field: string, value: string) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export const UniqueConstraintForm: React.FC<UniqueConstraintFormProps> = ({
  uniqueConstraintFields,
  editableValues,
  onUpdateValue,
  scrollViewRef,
}) => {
  return (
    <View>
      <Text style={styles.uniqueConstraintText}>
        {uniqueConstraintFields.length > 1
          ? `These fields have unique constraint violations. Please enter new unique values:`
          : `This field has a unique constraint violation. Please enter a new unique value:`}
      </Text>
      {uniqueConstraintFields.map((field) => (
        <View key={field} style={styles.editableContainer}>
          <Text style={styles.editableLabel}>
            New {formatFieldName(field)}:
          </Text>
          <TextInput
            style={styles.editableInput}
            value={editableValues[field] || ''}
            onChangeText={(text) => onUpdateValue(field, text)}
            placeholder={`Enter new ${formatFieldName(field)}`}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType={field.toLowerCase().includes('email') ? 'email-address' : 'default'}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      ))}
    </View>
  );
};
