import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Footer, useFooterNavigation } from '@/components/Footer';
import { FormInput } from '../../components/FormInput';
import Header from '../../components/Header';
import SettingsComponent from '../../components/SettingsComponent';
import { useAuth } from '@/context/AuthContext';
import { getAllFieldworkers } from '@/services/models/UserModel';
import { insertTaskOffline } from '@/services/models/TaskModel';
import { useEffect } from 'react';


// Types for form and errors
interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignTo: string;
  createdBy: string;
  dueDate: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignTo?: string;
  createdBy?: string;
  dueDate?: string;
  general?: string;
}

const initialForm: TaskForm = {
  title: '',
  description: '',
  status: '',
  priority: '',
  assignTo: '',
  createdBy: '',
  dueDate: '',
};

const statusOptions = ['Pending', 'In Progress', 'Completed'];
const priorityOptions = ['Low', 'Medium', 'High'];


// Helper to get formatted current date
function getCurrentDate() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function CreateTask() {
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [assignToModalVisible, setAssignToModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const router = useRouter();
  const { user } = useAuth();
  const [assignToOptions, setAssignToOptions] = useState<{ name: string; user_id: string }[]>([]);
  const [selectedFieldworkers, setSelectedFieldworkers] = useState<{ name: string; user_id: string }[]>([]);


  useEffect(() => {
    const fetchFieldworkers = () => {
      try {
        const workers = getAllFieldworkers(); // From local SQLite
        setAssignToOptions(workers); // Array of { user_id, name }
      } catch (err) {
        console.error('Failed to fetch fieldworkers:', err);
      }
    };

    fetchFieldworkers();
  }, []);

  useEffect(() => {
    const userIds = selectedFieldworkers.map(user => user.user_id).join(',');
    handleChange('assignTo', userIds);
  }, [selectedFieldworkers]);


  const handleChange = (key: keyof TaskForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid =
    !!form.title.trim() &&
    !!form.description.trim() &&
    !!form.status.trim() &&
    !!form.priority.trim() &&
    !!form.assignTo.trim() &&
    !!form.dueDate.trim();

  const validateForm = () => {
    const tempErrors: FormErrors = {};
    if (!form.title.trim()) tempErrors.title = 'Required';
    if (!form.description.trim()) tempErrors.description = 'Required';
    if (!form.status.trim()) tempErrors.status = 'Required';
    if (!form.priority.trim()) tempErrors.priority = 'Required';
    if (!form.assignTo.trim()) tempErrors.assignTo = 'Required';
    if (!form.dueDate.trim()) tempErrors.dueDate = 'Required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      setForm(prev => ({ ...prev, dueDate: formatted }));
    }
  };

  const handleGetToday = () => {
    setForm(prev => ({ ...prev, dueDate: getCurrentDate() }));
  };

  const handleSave = () => {
    if (!validateForm()) return;
    try {
      insertTaskOffline({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignTo: selectedFieldworkers.map(w => w.user_id), // Pass as array
        createdBy: user?.user_id ?? '',
        dueDate: form.dueDate,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setForm(initialForm);
      setSelectedFieldworkers([]);
    } catch (err: any) {
      setErrors({ ...errors, general: err.message || 'Failed to save task' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header
        title="Create Task"
        showSettings={true}
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 40, minHeight: 600 }}>
          <View style={{ width: '100%', maxWidth: 480, alignItems: 'center', paddingHorizontal: 0, margin: 0 }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 0,
              shadowColor: 'transparent',
              paddingHorizontal: 32,
              paddingVertical: 24,
              width: '100%',
              minWidth: 0,
              minHeight: 600,
            }}>
              {showSuccess && (
                <Animatable.View
                  animation="bounceIn"
                  duration={600}
                  style={{ backgroundColor: '#bbf7d0', borderColor: '#86efac', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 }}
                >
                  <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '600' }}>✅ Task created successfully!</Text>
                </Animatable.View>
              )}
              {/* Task Info Section */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16, marginTop: 15 }}>Task Info</Text>
              {/* Title */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.title}
                  onChangeText={text => handleChange('title', text)}
                  placeholder="Title"
                  theme="light"
                  fontSize={16}
                />
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.title || ' '}
                  </Text>
                </View>
              </View>
              {/* Description */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.description}
                  onChangeText={text => handleChange('description', text)}
                  placeholder="Description"
                  theme="light"
                  fontSize={16}
                  multiline={true}
                />
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.description || ' '}
                  </Text>
                </View>
              </View>
              {/* Status Dropdown */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setStatusModalVisible(true)}
                  activeOpacity={0.8}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    height: 47,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: form.status ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {form.status || 'Select Status'}
                  </Text>
                  <Ionicons name="chevron-down" size={24} color="#64748b" />
                </TouchableOpacity>
                <Modal
                  visible={statusModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setStatusModalVisible(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPressOut={() => setStatusModalVisible(false)}
                  >
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260, elevation: 8 }}>
                      {statusOptions.map(option => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            handleChange('status', option);
                            setStatusModalVisible(false);
                          }}
                          style={{ paddingVertical: 16, paddingHorizontal: 18, alignItems: 'flex-start' }}
                        >
                          <Text style={{ fontSize: 16, color: '#1e293b' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.status || ' '}
                  </Text>
                </View>
              </View>
              {/* Priority Dropdown */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setPriorityModalVisible(true)}
                  activeOpacity={0.8}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    height: 47,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: form.priority ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {form.priority || 'Select Priority'}
                  </Text>
                  <Ionicons name="chevron-down" size={24} color="#64748b" />
                </TouchableOpacity>
                <Modal
                  visible={priorityModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setPriorityModalVisible(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPressOut={() => setPriorityModalVisible(false)}
                  >
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260, elevation: 8 }}>
                      {priorityOptions.map(option => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            handleChange('priority', option);
                            setPriorityModalVisible(false);
                          }}
                          style={{ paddingVertical: 16, paddingHorizontal: 18, alignItems: 'flex-start' }}
                        >
                          <Text style={{ fontSize: 16, color: '#1e293b' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.priority || ' '}
                  </Text>
                </View>
              </View>
              {/* Assign To Dropdown */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setAssignToModalVisible(true)}
                  activeOpacity={0.8}
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    height: 47,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: selectedFieldworkers.length ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {selectedFieldworkers.length > 0
                      ? selectedFieldworkers.map(w => w.name).join(', ')
                      : 'Assign to'}
                  </Text>

                  <Ionicons name="chevron-down" size={24} color="#64748b" />
                </TouchableOpacity>
                <Modal
                  visible={assignToModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setAssignToModalVisible(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPressOut={() => setAssignToModalVisible(false)}
                  >
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260, elevation: 8 }}>
                      {assignToOptions.length === 0 ? (
                        <Text style={{ padding: 16, color: '#64748b' }}>No fieldworkers found</Text>
                      ) : (
                        <View>
                          {assignToOptions.length === 0 ? (
                            <Text>No fieldworkers found</Text>
                          ) : (
                            assignToOptions.map((worker: { name: string; user_id: string }) => {
                              const isSelected = selectedFieldworkers.some(w => w.user_id === worker.user_id);
                              return (
                                <TouchableOpacity
                                  key={worker.user_id}
                                  onPress={() => {
                                    setSelectedFieldworkers(prev =>
                                      isSelected
                                        ? prev.filter(w => w.user_id !== worker.user_id)
                                        : [...prev, worker]
                                    );
                                  }}
                                  style={{
                                    paddingVertical: 14,
                                    paddingHorizontal: 18,
                                    backgroundColor: isSelected ? '#fed7aa' : 'transparent',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}

                                >
                                  <Text style={{ fontSize: 16, color: '#1e293b' }}>{worker.name}</Text>
                                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#ef4444" />}
                                </TouchableOpacity>
                              );
                            })
                          )}
                        </View>



                      )}
                    </View>
                  </TouchableOpacity>
                </Modal>

                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.assignTo || ' '}
                  </Text>
                </View>
              </View>
              {/* Due Date */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Due Date</Text>
              <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, height: 54 }}>
                <View style={{ flex: 1, height: 54, justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <FormInput
                      value={form.dueDate}
                      onChangeText={() => { }}
                      placeholder="Due Date (YYYY-MM-DD)"
                      theme="light"
                      keyboardType="default"
                      secureTextEntry={false}
                      editable={false}
                      fontSize={16}
                    />
                  </TouchableOpacity>
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 14 }}>
                      {errors.dueDate || ' '}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{ backgroundColor: '#f97316', paddingHorizontal: 18, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Pick</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={form.dueDate ? new Date(form.dueDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: isFormValid ? '#f97316' : '#fbbf24',
                  height: 54,
                  borderRadius: 12,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                  marginBottom: 20,
                  opacity: isFormValid ? 1 : 0.7,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                disabled={!isFormValid}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}
