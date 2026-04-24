import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import AppIcon from '../components/AppIcon';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <AppIcon name="airplane" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>SkyBook</Text>
          <Text style={styles.tagline}>Đặt vé nhanh - Bay ngay hôm nay</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>{t('login_title')}</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('email')}</Text>
            <View style={styles.inputWrapper}>
              <AppIcon name="mail" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder={t('email_placeholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password')}</Text>
            <View style={styles.inputWrapper}>
              <AppIcon name="lock" size={16} color="#9CA3AF" />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('password_placeholder')}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <AppIcon name={showPass ? 'eye' : 'eyeOff'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>{t('forgot_password')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Main')}>
            <Text style={styles.loginBtnText}>{t('login_btn')}</Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{t('or')}</Text>
            <View style={styles.orLine} />
          </View>

          {/* Social (Google & Apple — dùng text vì là brand icon) */}
          <View style={styles.socialRow}>
            {[{ letter: 'G', label: 'Google' }, { letter: 'A', label: 'Apple' }].map(s => (
              <TouchableOpacity key={s.label} style={styles.socialBtn}>
                <Text style={styles.socialLetter}>{s.letter}</Text>
                <Text style={styles.socialText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>{t('no_account')}</Text>
          <Text style={styles.registerBold}>{t('register_link')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#fff' },
  container:    { paddingHorizontal: 24, paddingBottom: 32 },
  logoArea:     { alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  logoCircle:   { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0064D2', alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 6, shadowColor: '#0064D2', shadowOpacity: 0.3, shadowRadius: 12 },
  appName:      { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  tagline:      { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  form:         { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 20 },
  formTitle:    { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 20 },
  inputGroup:   { marginBottom: 16 },
  inputLabel:   { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 12 },
  input:        { flex: 1, paddingVertical: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn:       { padding: 4 },
  forgotBtn:    { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText:   { color: '#0064D2', fontSize: 13, fontWeight: '600' },
  loginBtn:     { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 15, alignItems: 'center', elevation: 3, shadowColor: '#0064D2', shadowOpacity: 0.3, shadowRadius: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  orRow:        { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  orLine:       { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText:       { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  socialRow:    { flexDirection: 'row', gap: 12 },
  socialBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 12, backgroundColor: '#fff' },
  socialLetter: { fontSize: 16, fontWeight: '800', color: '#374151' },
  socialText:   { fontSize: 14, fontWeight: '600', color: '#374151' },
  registerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 14, color: '#6B7280' },
  registerBold: { fontSize: 14, color: '#0064D2', fontWeight: '700' },
});
