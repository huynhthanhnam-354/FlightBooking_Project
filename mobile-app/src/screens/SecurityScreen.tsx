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
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppIcon from '../components/AppIcon';
import { formatAuthError } from '../services/authApi';
import { changePasswordApi, updatePrivacyApi } from '../services/userAccountApi';

export default function SecurityScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { user, refreshUser, applyMeProfile } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPw, setSavingPw] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await refreshUser();
    } catch {
      /* dùng cache local */
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    setShareAnalytics(user.shareAnalytics);
    setMarketingOptIn(user.marketingOptIn);
  }, [user]);

  const submitPassword = async () => {
    if (!current.trim()) {
      Alert.alert(t('confirm'), t('password_current_required'));
      return;
    }
    if (!next.trim() || next.length < 6) {
      Alert.alert(t('confirm'), t('password_too_short'));
      return;
    }
    if (next !== confirm) {
      Alert.alert(t('confirm'), t('password_mismatch'));
      return;
    }
    setSavingPw(true);
    try {
      await changePasswordApi({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      Alert.alert(t('confirm'), t('security_password_updated'));
    } catch (e) {
      Alert.alert(t('register_failed_title'), formatAuthError(e));
    } finally {
      setSavingPw(false);
    }
  };

  const submitPrivacy = async () => {
    setSavingPrivacy(true);
    try {
      const me = await updatePrivacyApi({ shareAnalytics, marketingOptIn });
      await applyMeProfile(me);
      Alert.alert(t('confirm'), t('privacy_saved'));
    } catch (e) {
      Alert.alert(t('register_failed_title'), formatAuthError(e));
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('security')}</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0064D2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>{t('password_section_title')}</Text>
          <View style={styles.card}>
            <Text style={styles.label}>{t('password_current')}</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                secureTextEntry={!show1}
                value={current}
                onChangeText={setCurrent}
                placeholder="••••••"
              />
              <TouchableOpacity onPress={() => setShow1(!show1)} style={styles.eye}>
                <AppIcon name={show1 ? 'eye' : 'eyeOff'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { marginTop: 14 }]}>{t('new_password_field')}</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                secureTextEntry={!show2}
                value={next}
                onChangeText={setNext}
                placeholder="••••••"
              />
              <TouchableOpacity onPress={() => setShow2(!show2)} style={styles.eye}>
                <AppIcon name={show2 ? 'eye' : 'eyeOff'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { marginTop: 14 }]}>{t('confirm_password')}</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                secureTextEntry={!show3}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••"
              />
              <TouchableOpacity onPress={() => setShow3(!show3)} style={styles.eye}>
                <AppIcon name={show3 ? 'eye' : 'eyeOff'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.save, savingPw && styles.saveDisabled]}
            onPress={submitPassword}
            disabled={savingPw}
          >
            {savingPw ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{t('save_changes')}</Text>}
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>{t('privacy_section_title')}</Text>
          <View style={styles.card}>
            <View style={styles.toggleBlock}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.toggleTitle}>{t('privacy_analytics')}</Text>
                <Text style={styles.toggleDesc}>{t('privacy_analytics_desc')}</Text>
              </View>
              <Switch
                value={shareAnalytics}
                onValueChange={setShareAnalytics}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={shareAnalytics ? '#0064D2' : '#9CA3AF'}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.toggleBlock}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.toggleTitle}>{t('privacy_marketing')}</Text>
                <Text style={styles.toggleDesc}>{t('privacy_marketing_desc')}</Text>
              </View>
              <Switch
                value={marketingOptIn}
                onValueChange={setMarketingOptIn}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={marketingOptIn ? '#0064D2' : '#9CA3AF'}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.save, savingPrivacy && styles.saveDisabled]}
            onPress={submitPrivacy}
            disabled={savingPrivacy}
          >
            {savingPrivacy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>{t('privacy_save_btn')}</Text>
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
  body: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, backgroundColor: '#F9FAFB' },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A2E' },
  eye: { padding: 12 },
  save: {
    marginTop: 16,
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.85 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleBlock: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  toggleDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
});
