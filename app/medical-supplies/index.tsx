import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DashboardHeader from '@/components/Header';
import { Footer, useFooterNavigation } from '@/components/Footer';
import { getAllSupplies } from '@/services/models/SuppliesModel';
import SettingsComponent from '@/components/SettingsComponent';

type SupplyItem = {
  id: string;
  itemName: string;
  quantity: number;
  expiryDate: string;
  locationId: string;
  timestamp: string;
  status: string;
  synced: number;
};

export default function MedicalSuppliesList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);

  useEffect(() => {
    const loadSupplies = () => {
      try {
        const data = getAllSupplies().map((item) => ({
          id: item.supply_id,
          itemName: item.item_name,
          quantity: item.quantity,
          expiryDate: item.expiry_date,
          locationId: item.location_id,
          timestamp: item.timestamp,
          status: item.status,
          synced: item.synced,
        }));
        setSupplies(data);
      } catch (err) {
        console.error('Failed to load supplies:', err);
      }
    };
    loadSupplies();
  }, []);

  const filteredSupplies = supplies.filter(supply =>
    supply.itemName.toLowerCase().includes(search.toLowerCase()) ||
    supply.locationId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <DashboardHeader
        title="Medical Supplies"
        showSettings={true}
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 24,
          height: 48,
          borderColor: '#D1D5DB',
          borderWidth: 1
        }}>
          <MaterialIcons name="search" size={24} color="#6b7280" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search by item or location"
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: '#6b7280', fontSize: 16, paddingHorizontal: 8 }}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      {/* Supplies List */}
      <FlatList
        data={filteredSupplies}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1c180d', marginBottom: 4 }}>{item.itemName}</Text>
              <Text style={{ fontSize: 14, color: '#9c8749', marginBottom: 2 }}>Qty: {item.quantity} | Exp: {item.expiryDate}</Text>
              <Text style={{ fontSize: 14, color: '#9c8749', marginBottom: 2 }}>Location: {item.locationId}</Text>
              <Text style={{ fontSize: 14, color: '#9c8749', marginBottom: 2 }}>{item.timestamp}</Text>
              <Text style={{ fontSize: 14, color: item.synced === 1 ? '#1c180d' : '#f97316', marginBottom: 2 }}>{item.status || (item.synced === 1 ? 'Synced' : 'Unsynced')}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              marginTop: 32,
              color: '#9e6b47',
              fontSize: 16,
            }}
          >
            No supplies found.
          </Text>
        }
      />
      {/* Floating Plus Button */}
      <View style={{ position: 'absolute', right: 24, bottom: 110 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#f97316', borderRadius: 999, height: 56, paddingHorizontal: 20, shadowColor: '#f97316', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 6,
          }}
          activeOpacity={0.8}
          onPress={() => router.push('/medical-supplies/create' as any)}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>Add</Text>
        </TouchableOpacity>
      </View>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f4ece6',
  },
  userName: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userId: {
    color: '#9e6b47',
    fontSize: 13,
    fontWeight: '400',
  },
  userStatus: {
    fontSize: 15,
    fontWeight: '500',
  },
}); 