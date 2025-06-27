import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface SettingsComponentProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#161412', marginBottom: 18 }}>Settings</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { onClose(); router.push('/profile' as any); }}>
            <MaterialIcons name="person" size={22} color="#f97316" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: '#161412' }}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { onClose(); router.push('/preferences' as any); }}>
            <MaterialIcons name="tune" size={22} color="#f97316" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: '#161412' }}>Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => {
              logout();       
              onClose();      
            }}
          >
            <MaterialIcons name="logout" size={22} color="#f97316" style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 16, color: '#f97316', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 18 }} onPress={onClose}>
            <Text style={{ color: '#f97316', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsComponent; 