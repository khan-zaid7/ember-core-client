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

  const { width } = useWindowDimensions();
  const isTablet = screenSize.isTablet;

  useEffect(() => {
    setForm((prev) => ({ ...prev, role }));
  }, [role]);

  const handleRegister = async () => {
    // TODO: replace with actual API call
  };

  return (
    <ScrollView
      contentContainerStyle={[
        tw`flex-grow bg-black`,
        {
          paddingHorizontal: moderateScale(16),
          paddingTop: verticalScale(isTablet ? 40 : 64),
          paddingBottom: verticalScale(isTablet ? 24 : 48),
        },
      ]}
    >
      <View style={{ maxWidth: 480, alignSelf: 'center', width: '100%' }}>
        <EmberLogo title="Register" />

        <View style={{ marginTop: verticalScale(isTablet ? 24 : 32) }}>
          {/* Name */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <FormInput
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
              placeholder="Name"
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <FormInput
              value={form.email}
              onChangeText={(val) => setForm({ ...form, email: val })}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <FormInput
              value={form.password}
              onChangeText={(val) => setForm({ ...form, password: val })}
              placeholder="Password"
              secureTextEntry
              showToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </View>

          {/* Role Dropdown */}
          <View style={{ marginBottom: verticalScale(16), zIndex: 1000 }}>
            <DropDownPicker
              open={open}
              value={role}
              items={roleItems}
              setOpen={setOpen}
              setValue={setRole}
              setItems={setRoleItems}
              placeholder="Select Role"
              placeholderStyle={{ color: '#aaa' }}
              style={{
                backgroundColor: '#111827',
                borderColor: '#f97316',
                borderRadius: 10,
                height: 48,
              }}
              textStyle={{ color: '#fff', fontSize: 14 }}
              dropDownContainerStyle={{
                backgroundColor: '#111827',
                borderColor: '#f97316',
              }}
              ArrowUpIconComponent={() => (
                <Text style={tw`text-white`}>▲</Text>
              )}
              ArrowDownIconComponent={() => (
                <Text style={tw`text-white`}>▼</Text>
              )}
              showArrowIcon
            />
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#f97316',
                backgroundColor: '#111827',
                color: '#fff',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 14,
                fontSize: 14,
              }}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#aaa"
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
              marginBottom: verticalScale(isTablet ? 24 : 32),
              shadowColor: '#000',
              shadowOpacity: 0.2,
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
