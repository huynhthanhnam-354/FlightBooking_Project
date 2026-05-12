import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { AIRPORT_LIST } from '../data/airports';
import AppIcon from '../components/AppIcon';

function filterAirports(query: string) {
  const s = query.trim().toLowerCase();
  if (!s) return AIRPORT_LIST;
  return AIRPORT_LIST.filter((a) => {
    const blob = [a.code, a.name.vi, a.name.en, a.name.ko, a.name.ja, a.name.zh, a.name.th, a.name.es]
      .join(' ')
      .toLowerCase();
    return blob.includes(s);
  });
}

export default function EditSearchScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useLanguage();
  const search = useSearch();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  useEffect(() => {
    if (!fromOpen) setFromFilter('');
  }, [fromOpen]);
  useEffect(() => {
    if (!toOpen) setToFilter('');
  }, [toOpen]);

  const fromList = useMemo(() => filterAirports(fromFilter), [fromFilter]);
  const toList = useMemo(() => filterAirports(toFilter), [toFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('screen_edit_search')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Text style={styles.label}>{t('one_way')} / {t('round_trip')}</Text>
        <View style={styles.tripToggle}>
          {(['oneWay', 'roundTrip'] as const).map((tp) => (
            <TouchableOpacity
              key={tp}
              style={[styles.toggleBtn, search.tripType === tp && styles.toggleActive]}
              onPress={() => search.setTripType(tp)}
            >
              <Text style={[styles.toggleText, search.tripType === tp && styles.toggleTextActive]}>
                {tp === 'oneWay' ? t('one_way') : t('round_trip')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('from')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => {
            setFromOpen(!fromOpen);
            setToOpen(false);
          }}
        >
          <Text style={styles.pickerVal}>
            {search.fromCode} — {AIRPORT_LIST.find((a) => a.code === search.fromCode)?.name[language]}
          </Text>
          <AppIcon name={fromOpen ? 'chevronUp' : 'chevronDown'} size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {fromOpen && (
          <View style={styles.dropdown}>
            <TextInput
              style={styles.filterInput}
              value={fromFilter}
              onChangeText={setFromFilter}
              placeholder={t('search')}
              placeholderTextColor="#9CA3AF"
            />
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
              {fromList.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={[styles.dropRow, search.fromCode === a.code && styles.dropActive]}
                  onPress={() => {
                    if (a.code === search.toCode) search.setToCode(search.fromCode);
                    search.setFromCode(a.code);
                    setFromOpen(false);
                  }}
                >
                  <Text style={styles.dropText}>
                    {a.code} — {a.name[language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('to')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => {
            setToOpen(!toOpen);
            setFromOpen(false);
          }}
        >
          <Text style={styles.pickerVal}>
            {search.toCode} — {AIRPORT_LIST.find((a) => a.code === search.toCode)?.name[language]}
          </Text>
          <AppIcon name={toOpen ? 'chevronUp' : 'chevronDown'} size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {toOpen && (
          <View style={styles.dropdown}>
            <TextInput
              style={styles.filterInput}
              value={toFilter}
              onChangeText={setToFilter}
              placeholder={t('search')}
              placeholderTextColor="#9CA3AF"
            />
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
              {toList.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={[styles.dropRow, search.toCode === a.code && styles.dropActive]}
                  onPress={() => {
                    if (a.code === search.fromCode) search.setFromCode(search.toCode);
                    search.setToCode(a.code);
                    setToOpen(false);
                  }}
                >
                  <Text style={styles.dropText}>
                    {a.code} — {a.name[language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('departure_date')}</Text>
        <Text style={styles.hint}>{t('date_format_hint')}</Text>
        <TextInput
          style={styles.input}
          value={search.departureDate}
          onChangeText={search.setDepartureDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />

        {search.tripType === 'roundTrip' ? (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>{t('return_date')}</Text>
            <Text style={styles.hint}>{t('date_format_hint')}</Text>
            <TextInput
              style={styles.input}
              value={search.returnDate}
              onChangeText={search.setReturnDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
            />
          </>
        ) : null}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('passengers')}</Text>
        <View style={styles.stepRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => search.setAdults(Math.max(1, search.adults - 1))}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepVal}>
            {search.adults} {t('adult')}
          </Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => search.setAdults(Math.min(9, search.adults + 1))}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.apply} onPress={() => navigation.goBack()}>
          <Text style={styles.applyText}>{t('save_changes')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  tripToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  toggleActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  toggleText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  toggleTextActive: { color: '#0064D2', fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 6, marginTop: -4 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerVal: { flex: 1, fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
  dropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  filterInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
  },
  dropdownScroll: { maxHeight: 280 },
  dropRow: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropActive: { backgroundColor: '#EFF6FF' },
  dropText: { fontSize: 14, color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1A1A2E',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0064D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 22, color: '#0064D2', fontWeight: '700' },
  stepVal: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', minWidth: 120, textAlign: 'center' },
  apply: {
    marginTop: 28,
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
