import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import AppIcon from '../components/AppIcon';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('forgot_password')}</Text>
        <Text style={styles.hint}>{t('forgot_intro')}</Text>
        <View style={styles.inputWrap}>
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
        <TouchableOpacity
          style={[styles.btn, !email.trim() && styles.btnOff]}
          disabled={!email.trim()}
          onPress={() => Alert.alert(t('confirm'), t('reset_link_demo'), [{ text: t('confirm'), onPress: () => navigation.goBack() }])}
        >
          <Text style={styles.btnText}>{t('send_recovery')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  hint: { fontSize: 14, color: '#6B7280', lineHeight: 21, marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1A1A2E' },
  btn: { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  btnOff: { backgroundColor: '#BFDBFE' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
