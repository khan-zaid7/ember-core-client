import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, useFooterNavigation } from '@/components/Footer';
import { FormInput } from '../../components/FormInput';
import Header from '../../components/Header';
import SettingsComponent from '../../components/SettingsComponent';

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
const assignToOptions = ['Field Worker', 'Volunteer'];

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
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const router = useRouter();

  const handleChange = (key: keyof TaskForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.status.trim() &&
    form.priority.trim() &&
    form.assignTo.trim() &&
    form.createdBy.trim() &&
    form.dueDate.trim();

  const validateForm = () => {
    const tempErrors: FormErrors = {};
    if (!form.title.trim()) tempErrors.title = 'Required';
    if (!form.description.trim()) tempErrors.description = 'Required';
    if (!form.status.trim()) tempErrors.status = 'Required';
    if (!form.priority.trim()) tempErrors.priority = 'Required';
    if (!form.assignTo.trim()) tempErrors.assignTo = 'Required';
    if (!form.createdBy.trim()) tempErrors.createdBy = 'Required';
    if (!form.dueDate.trim()) tempErrors.dueDate = 'Required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleGetToday = () => {
    setForm(prev => ({ ...prev, dueDate: getCurrentDate() }));
  };

  const handleSave = () => {
    if (!validateForm()) return;
    // Here you would save the task to your backend or local DB
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setForm(initialForm);
    // Optionally, navigate back or show a message
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
                  <Text style={{ color: form.assignTo ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {form.assignTo || 'Assign to'}
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
                      {assignToOptions.map(option => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            handleChange('assignTo', option);
                            setAssignToModalVisible(false);
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
                    {errors.assignTo || ' '}
                  </Text>
                </View>
              </View>
              {/* Created By */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.createdBy}
                  onChangeText={text => handleChange('createdBy', text)}
                  placeholder="Created By"
                  theme="light"
                  fontSize={16}
                />
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>
                    {errors.createdBy || ' '}
                  </Text>
                </View>
              </View>
              {/* Due Date */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Due Date</Text>
              <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, height: 54 }}>
                <View style={{ flex: 1, height: 54, justifyContent: 'center' }}>
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
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 14 }}>
                      {errors.dueDate || ' '}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleGetToday}
                  style={{ backgroundColor: '#f97316', paddingHorizontal: 18, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Today</Text>
                </TouchableOpacity>
              </View>
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
