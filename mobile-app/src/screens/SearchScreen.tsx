import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/price';
import AppIcon from '../components/AppIcon';

// Màu đặc trưng của từng hãng bay
const AIRLINE_COLORS: Record<string, string> = {
  'VN': '#0064D2',
  'VJ': '#E4002B',
  'QH': '#00A651',
  'BL': '#F5A623',
};

const FLIGHTS = [
  { id: '1', airline: 'Vietnam Airlines', code: 'VN201', dep: '06:00', arr: '08:10', duration: '2h 10m', priceVND: 1250000 },
  { id: '2', airline: 'VietJet Air',       code: 'VJ101', dep: '08:30', arr: '10:40', duration: '2h 10m', priceVND: 899000  },
  { id: '3', airline: 'Bamboo Airways',    code: 'QH201', dep: '11:00', arr: '13:15', duration: '2h 15m', priceVND: 1050000 },
  { id: '4', airline: 'Pacific Airlines',  code: 'BL301', dep: '14:00', arr: '16:10', duration: '2h 10m', priceVND: 750000  },
  { id: '5', airline: 'Vietnam Airlines',  code: 'VN205', dep: '18:30', arr: '20:40', duration: '2h 10m', priceVND: 1450000 },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { t, currency } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);

  const FILTERS = [
    { key: 'all',   label: t('filter_all') },
    { key: 'cheap', label: t('filter_cheapest') },
    { key: 'early', label: t('filter_earliest') },
    { key: 'fast',  label: t('filter_fastest') },
    { key: 'biz',   label: t('filter_business') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRoute}>
          <Text style={styles.headerCity}>HAN</Text>
          <View style={styles.headerArrowWrap}>
            <View style={styles.arrowLine} />
            <AppIcon name="airplane" size={18} color="rgba(255,255,255,0.9)" />
            <View style={styles.arrowLine} />
          </View>
          <Text style={styles.headerCity}>SGN</Text>
        </View>
        <Text style={styles.headerSub}>25/04/2025 · 1 {t('passenger').toLowerCase()}</Text>
        <TouchableOpacity style={styles.editBtn}>
          <AppIcon name="edit" size={13} color="#fff" />
          <Text style={styles.editText}>  {t('edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]} onPress={() => setActiveFilter(f.key)}>
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{FLIGHTS.length} {t('flights')}</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {FLIGHTS.map(f => {
          const prefix = f.code.slice(0, 2);
          const badgeColor = AIRLINE_COLORS[prefix] ?? '#9CA3AF';
          return (
            <TouchableOpacity key={f.id} style={[styles.card, selected === f.id && styles.cardSelected]} onPress={() => setSelected(f.id)}>
              <View style={styles.airlineRow}>
                {/* Badge màu hãng + chữ tắt */}
                <View style={[styles.airlineBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.airlineBadgeText}>{prefix}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.airlineName}>{f.airline}</Text>
                  <Text style={styles.flightCode}>{f.code} · {t('economy')}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.price}>{formatPrice(f.priceVND, currency)}</Text>
                  <Text style={styles.perPax}>{t('per_person')}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                  <Text style={styles.time}>{f.dep}</Text>
                  <Text style={styles.airport}>HAN</Text>
                </View>
                <View style={styles.durationBox}>
                  <Text style={styles.duration}>{f.duration}</Text>
                  <View style={styles.line}>
                    <View style={styles.dot} />
                    <View style={styles.dash} />
                    <AppIcon name="airplaneTakeoff" size={14} color="#0064D2" />
                    <View style={styles.dash} />
                    <View style={styles.dot} />
                  </View>
                  <Text style={styles.stops}>{t('direct')}</Text>
                </View>
                <View style={[styles.timeBox, { alignItems: 'flex-end' }]}>
                  <Text style={styles.time}>{f.arr}</Text>
                  <Text style={styles.airport}>SGN</Text>
                </View>
              </View>

              {selected === f.id && (
                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Bookings')}>
                  <AppIcon name="check" size={15} color="#fff" />
                  <Text style={styles.selectBtnText}>  {t('select_flight')}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F5F7FA' },
  header:           { backgroundColor: '#0064D2', padding: 20, paddingBottom: 24 },
  headerRoute:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerCity:       { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerArrowWrap:  { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 8 },
  arrowLine:        { flex: 1, height: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  headerSub:        { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  editBtn:          { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editText:         { color: '#fff', fontSize: 13, fontWeight: '600' },
  filterBar:        { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterChip:       { marginRight: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#F3F4F6' },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#0064D2' },
  filterText:       { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#0064D2', fontWeight: '700' },
  resultCount:      { fontSize: 13, color: '#6B7280', paddingHorizontal: 16, paddingVertical: 10 },
  list:             { flex: 1 },
  card:             { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, borderWidth: 2, borderColor: 'transparent' },
  cardSelected:     { borderColor: '#0064D2' },
  airlineRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  airlineBadge:     { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  airlineBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  airlineName:      { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  flightCode:       { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  priceBox:         { alignItems: 'flex-end' },
  price:            { fontSize: 16, fontWeight: '800', color: '#0064D2' },
  perPax:           { fontSize: 10, color: '#9CA3AF' },
  timeRow:          { flexDirection: 'row', alignItems: 'center' },
  timeBox:          { flex: 1 },
  time:             { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  airport:          { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  durationBox:      { flex: 2, alignItems: 'center' },
  duration:         { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  line:             { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0064D2' },
  dash:             { flex: 1, height: 1.5, backgroundColor: '#D1D5DB', marginHorizontal: 2 },
  stops:            { fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 4 },
  selectBtn:        { marginTop: 14, backgroundColor: '#0064D2', borderRadius: 10, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  selectBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
});
