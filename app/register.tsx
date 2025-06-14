import { useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import AuthFooter from '../components/AuthFooter';
import { FormInput } from '../components/FormInput';
import {
  screenSize,
  moderateScale,
  verticalScale,
} from '../src/utils/reponsive';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone_number: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const [roleItems, setRoleItems] = useState([
    { label: 'admin', value: 'admin' },
    { label: 'fieldworker', value: 'fieldworker' },
    { label: 'volunteer', value: 'volunteer' },
    { label: 'coordinator', value: 'coordinator' },
  ]);

  const isTablet = screenSize.isTablet;

  useEffect(() => {
    setForm((prev) => ({ ...prev, role }));
  }, [role]);

  const handleRegister = async () => {
    // TODO: replace with actual API call
  };

  return (
    <ScrollView
      style={tw`bg-white`}
      contentContainerStyle={[
        tw`bg-[#f1f5f9]`,
        {
          paddingHorizontal: moderateScale(16),
          paddingBottom: verticalScale(32),
          minHeight: '100%',
          justifyContent: 'center', // ✅ vertical centering
        },
      ]}
    >
      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <EmberLogo />
          <Text style={tw`text-2xl font-bold text-orange-500 mt-2`}>
            Register
          </Text>
        </View>

        <View style={{ marginTop: 8 }}>
          {/* Name */}
          <View style={{ marginBottom: 12 }}>
            <FormInput
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              placeholder="Name"
              theme="light"
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 12 }}>
            <FormInput
              value={form.email}
              onChangeText={(val) => setForm({ ...form, email: val })}
              placeholder="Email"
              keyboardType="email-address"
              theme="light"
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: 12 }}>
            <FormInput
              value={form.password}
              onChangeText={(val) => setForm({ ...form, password: val })}
              placeholder="Password"
              secureTextEntry
              showToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              theme="light"
            />
          </View>

          {/* Role Dropdown */}
          <View style={{ marginBottom: 12, zIndex: 1000 }}>
            <DropDownPicker
              open={open}
              value={role}
              items={roleItems}
              setOpen={setOpen}
              setValue={setRole}
              setItems={setRoleItems}
              placeholder="Select Role"
              placeholderStyle={{ color: '#555' }}
              style={{
                backgroundColor: '#f3f4f6',
                borderColor: '#f97316',
                borderRadius: 10,
                height: 48,
              }}
              textStyle={{ color: '#111827', fontSize: 14 }}
              dropDownContainerStyle={{
                backgroundColor: '#f3f4f6',
                borderColor: '#f97316',
              }}
              ArrowUpIconComponent={() => (
                <Text style={tw`text-black`}>▲</Text>
              )}
              ArrowDownIconComponent={() => (
                <Text style={tw`text-black`}>▼</Text>
              )}
              showArrowIcon
            />
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#f97316',
                backgroundColor: '#f3f4f6',
                color: '#111827',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 14,
                fontSize: 14,
              }}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={form.phone_number}
              onChangeText={(val) =>
                setForm({ ...form, phone_number: val })
              }
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleRegister}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 10,
              paddingVertical: 14,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <AuthFooter label="Already have an account?" link="/login" />
      </View>
    </ScrollView>
  );
}
