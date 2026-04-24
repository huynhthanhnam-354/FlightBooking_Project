import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_LABELS } from '../i18n/translations';
import { CURRENCIES } from '../i18n/currencies';

const LANGUAGES = Object.keys(LANGUAGE_LABELS);

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { t, language, setLanguage, currency, setCurrencyByCode } = useLanguage();
  const [langLabel, setLangLabel]       = useState('');
  const [showCurrency, setShowCurrency] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const handleSelectLanguage = (label: string) => {
    setLangLabel(label);
    setLanguage(LANGUAGE_LABELS[label]);
    setShowLanguage(false);
    // currency tự động gợi ý qua context, không cần reset thêm
  };

  const canContinue = currency.code !== '' && langLabel !== '';

  const selectedCurrencyLabel = `${currency.flag} ${currency.names[language]}`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />

      {/* Header sóng */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>✈</Text>
        </View>
        <View style={styles.waveBg} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('welcome_title')}</Text>
        <Text style={styles.subtitle}>{t('welcome_subtitle')}</Text>

        {/* ---- Ngôn ngữ ---- */}
        <Text style={styles.label}>{t('preferred_language')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => { setShowLanguage(!showLanguage); setShowCurrency(false); }}
        >
          <Text style={langLabel ? styles.pickerValue : styles.pickerPlaceholder}>
            {langLabel || t('choose_language')}
          </Text>
          <Text style={styles.arrow}>{showLanguage ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showLanguage && (
          <View style={styles.dropdown}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l}
                style={styles.dropItem}
                onPress={() => handleSelectLanguage(l)}
              >
                <Text style={[styles.dropText, langLabel === l && styles.dropTextActive]}>{l}</Text>
                {langLabel === l && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ---- Tiền tệ ---- */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t('preferred_currency')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => { setShowCurrency(!showCurrency); setShowLanguage(false); }}
        >
          <Text style={styles.pickerValue}>{selectedCurrencyLabel}</Text>
          <Text style={styles.arrow}>{showCurrency ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCurrency && (
          <View style={styles.dropdown}>
            {CURRENCIES.map(c => (
              <TouchableOpacity
                key={c.code}
                style={styles.dropItem}
                onPress={() => { setCurrencyByCode(c.code); setShowCurrency(false); }}
              >
                <View style={styles.dropRow}>
                  <Text style={styles.dropFlag}>{c.flag}</Text>
                  <View>
                    <Text style={[styles.dropText, currency.code === c.code && styles.dropTextActive]}>
                      {c.names[language]}
                    </Text>
                    <Text style={styles.dropCode}>{c.code}</Text>
                  </View>
                </View>
                {currency.code === c.code && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, !canContinue && styles.btnDisabled]}
          onPress={() => canContinue && navigation.navigate('Login')}
          disabled={!canContinue}
        >
          <Text style={styles.btnText}>{t('continue_btn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skip}>{t('skip_now')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#fff' },
  header:            { backgroundColor: '#0064D2', alignItems: 'center', paddingTop: 40, paddingBottom: 60 },
  logoCircle:        { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  logoIcon:          { fontSize: 40 },
  waveBg:            { position: 'absolute', bottom: -1, left: 0, right: 0, height: 40, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  body:              { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  title:             { fontSize: 24, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 },
  subtitle:          { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  label:             { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  picker:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#F9FAFB' },
  pickerPlaceholder: { color: '#9CA3AF', fontSize: 14 },
  pickerValue:       { color: '#1A1A2E', fontSize: 14, fontWeight: '500', flex: 1 },
  arrow:             { color: '#9CA3AF', fontSize: 12, marginLeft: 8 },
  dropdown:          { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 4, backgroundColor: '#fff', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  dropItem:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropFlag:          { fontSize: 22 },
  dropText:          { fontSize: 14, color: '#374151' },
  dropTextActive:    { color: '#0064D2', fontWeight: '600' },
  dropCode:          { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  checkmark:         { color: '#0064D2', fontWeight: '700', fontSize: 16 },
  btn:               { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 32 },
  btnDisabled:       { backgroundColor: '#BFDBFE' },
  btnText:           { color: '#fff', fontSize: 16, fontWeight: '700' },
  skip:              { textAlign: 'center', color: '#6B7280', marginTop: 16, fontSize: 14 },
});
