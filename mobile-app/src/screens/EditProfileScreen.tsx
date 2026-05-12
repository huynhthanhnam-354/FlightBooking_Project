import React, { useCallback, useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppIcon from '../components/AppIcon';
import { formatAuthError } from '../services/authApi';
import { updateProfileApi } from '../services/userAccountApi';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { user, refreshUser, applyMeProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await refreshUser();
    } catch {
      /* giữ dữ liệu từ context / storage */
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone ?? '');
  }, [user]);

  const save = async () => {
    const name = fullName.trim();
    if (!name) {
      Alert.alert(t('confirm'), t('register_fill_all'));
      return;
    }
    setSaving(true);
    try {
      const me = await updateProfileApi({ fullName: name, phone: phone.trim() });
      await applyMeProfile(me);
      Alert.alert(t('confirm'), t('profile_saved'), [{ text: t('confirm'), onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert(t('register_failed_title'), formatAuthError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_info')}</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0064D2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>{t('full_name')}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('full_name_placeholder')}
            />
            <Text style={[styles.label, { marginTop: 14 }]}>{t('email')}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('email_placeholder')}
            />
            <Text style={styles.hint}>{t('email_readonly_hint')}</Text>
            <Text style={[styles.label, { marginTop: 14 }]}>{t('phone')}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder={t('phone_placeholder')}
            />
          </View>
          <TouchableOpacity style={[styles.save, saving && styles.saveDisabled]} onPress={save} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <AppIcon name="check" size={18} color="#fff" />
                <Text style={styles.saveText}>  {t('save_changes')}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0064D2', padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  body: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A2E',
    backgroundColor: '#F9FAFB',
  },
  inputDisabled: { color: '#6B7280', backgroundColor: '#F3F4F6' },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingVertical: 15,
  },
  saveDisabled: { opacity: 0.85 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
