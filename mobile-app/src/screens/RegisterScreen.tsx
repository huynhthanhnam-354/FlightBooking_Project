import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import AppIcon from '../components/AppIcon';
import { AppIconName } from '../theme/icons';

type Field = {
  key: string;
  labelKey: 'full_name' | 'email' | 'phone' | 'password' | 'confirm_password';
  placeholderKey: 'full_name_placeholder' | 'email_placeholder' | 'phone_placeholder' | 'password_placeholder' | 'confirm_password_placeholder';
  iconName: AppIconName;
  secure: boolean;
  keyboardType: 'default' | 'email-address' | 'phone-pad';
};

const FIELDS: Field[] = [
  { key: 'fullName', labelKey: 'full_name',         placeholderKey: 'full_name_placeholder',          iconName: 'passenger', secure: false, keyboardType: 'default'       },
  { key: 'email',    labelKey: 'email',              placeholderKey: 'email_placeholder',              iconName: 'mail',      secure: false, keyboardType: 'email-address' },
  { key: 'phone',    labelKey: 'phone',              placeholderKey: 'phone_placeholder',              iconName: 'phone',     secure: false, keyboardType: 'phone-pad'     },
  { key: 'password', labelKey: 'password',           placeholderKey: 'password_placeholder',           iconName: 'lock',      secure: true,  keyboardType: 'default'       },
  { key: 'confirm',  labelKey: 'confirm_password',   placeholderKey: 'confirm_password_placeholder',   iconName: 'lock',      secure: true,  keyboardType: 'default'       },
];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed]    = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t('register_title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subTitle}>{t('register_subtitle')}</Text>

        <View style={styles.form}>
          {FIELDS.map(f => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t(f.labelKey)}</Text>
              <View style={styles.inputWrapper}>
                <AppIcon name={f.iconName} size={16} color="#9CA3AF" />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t(f.placeholderKey)}
                  secureTextEntry={f.secure && !showPass}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm({ ...form, [f.key]: v })}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={f.keyboardType}
                  autoCapitalize="none"
                />
                {f.secure && f.key === 'password' && (
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <AppIcon name={showPass ? 'eye' : 'eyeOff'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Terms */}
          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <AppIcon name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              {t('agree_terms')}
              <Text style={styles.termsLink}>{t('terms_service')}</Text>
              {t('and')}
              <Text style={styles.termsLink}>{t('privacy_policy')}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerBtn, !agreed && styles.registerBtnDisabled]}
            onPress={() => agreed && navigation.navigate('Main')}
            disabled={!agreed}
          >
            <AppIcon name="register" size={18} color="#fff" />
            <Text style={styles.registerBtnText}>  {t('register_btn')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>{t('have_account')}</Text>
          <Text style={styles.loginBold}>{t('login_link')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: '#fff' },
  container:           { paddingHorizontal: 24, paddingBottom: 32 },
  topRow:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, marginBottom: 8 },
  backBtn:             { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  pageTitle:           { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  subTitle:            { fontSize: 13, color: '#9CA3AF', marginBottom: 24, textAlign: 'center' },
  form:                { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 20 },
  inputGroup:          { marginBottom: 14 },
  inputLabel:          { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper:        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 12 },
  input:               { paddingVertical: 13, fontSize: 14, color: '#1A1A2E' },
  eyeBtn:              { padding: 4 },
  termsRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20, marginTop: 6 },
  checkbox:            { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive:      { backgroundColor: '#0064D2', borderColor: '#0064D2' },
  termsText:           { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  termsLink:           { color: '#0064D2', fontWeight: '600' },
  registerBtn:         { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  registerBtnDisabled: { backgroundColor: '#BFDBFE' },
  registerBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink:           { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText:           { fontSize: 14, color: '#6B7280' },
  loginBold:           { fontSize: 14, color: '#0064D2', fontWeight: '700' },
});
