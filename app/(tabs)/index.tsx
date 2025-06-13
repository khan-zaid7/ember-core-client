import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';

export default function HomeScreen() {
  return (
    <RegisterScreen
      navigation={{ navigate: () => {}, goBack: () => {}, dispatch: () => {}, reset: () => {}, setParams: () => {}, isFocused: () => false, getParent: () => undefined }}
      route={{ key: '', name: 'Register', params: undefined }}
    />
  );
}
