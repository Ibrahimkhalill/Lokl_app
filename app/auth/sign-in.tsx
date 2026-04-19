import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, LogoText, Input, PrimaryButton, OrDivider, SocialButtons } from '../../components/ui';
import { Colors } from '../../constants/colors';

export default function SignIn() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen scrollable>
      <LogoText />

      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Hi welcome back</Text>

      <View >
        <Input
          label="Phone Number"
          placeholder="Enter  number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push('/auth/forgot-password')}
        >
          <Text style={styles.forgotText}>Forget Password?</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Sign In" onPress={() => router.push('/(tabs)')} />

      <OrDivider />
      <SocialButtons />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  // form: { flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 },
  forgotText: {
    color: Colors.text,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
