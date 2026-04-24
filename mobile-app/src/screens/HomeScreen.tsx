import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/price';
import AppIcon from '../components/AppIcon';

import { AppIconName } from '../theme/icons';

const PROMOS: { id: string; color: string; titleKey: 'todays_deals' | 'popular_flights' | 'cat_flight_status'; iconName: AppIconName }[] = [
  { id: '1', color: '#0064D2', titleKey: 'todays_deals',     iconName: 'ticket' },
  { id: '2', color: '#7C3AED', titleKey: 'popular_flights',  iconName: 'airplane' },
  { id: '3', color: '#0891B2', titleKey: 'cat_flight_status', iconName: 'flightStatus' },
];

const POPULAR = [
  { id: '1', from: 'HAN', to: 'SGN', airline: 'Vietnam Airlines', priceVND: 899000,  time: '2h 10m' },
  { id: '2', from: 'SGN', to: 'DAD', airline: 'VietJet Air',      priceVND: 650000,  time: '1h 20m' },
  { id: '3', from: 'HAN', to: 'DAD', airline: 'Bamboo Airways',   priceVND: 750000,  time: '1h 30m' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t, currency } = useLanguage();
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');

  const CATEGORIES = [
    { iconName: 'airplane'     as const, label: t('cat_book_flight') },
    { iconName: 'flightStatus' as const, label: t('cat_flight_status') },
    { iconName: 'ticket'       as const, label: t('cat_my_tickets') },
    { iconName: 'luggage'      as const, label: t('cat_baggage') },
    { iconName: 'checkin'      as const, label: t('cat_checkin') },
    { iconName: 'support'      as const, label: t('cat_support') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{t('greeting')}</Text>
              <AppIcon name="wave" size={16} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.headerTitle}>{t('home_title')}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Text style={styles.avatarText}>N</Text>
          </TouchableOpacity>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.tripToggle}>
            {(['oneWay', 'roundTrip'] as const).map(tp => (
              <TouchableOpacity key={tp} style={[styles.toggleBtn, tripType === tp && styles.toggleActive]} onPress={() => setTripType(tp)}>
                <Text style={[styles.toggleText, tripType === tp && styles.toggleTextActive]}>
                  {tp === 'oneWay' ? t('one_way') : t('round_trip')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.routeRow}>
            <View style={styles.routeBox}>
              <Text style={styles.routeLabel}>{t('from')}</Text>
              <Text style={styles.routeCode}>HAN</Text>
              <Text style={styles.routeCity}>Hà Nội</Text>
            </View>
            <TouchableOpacity style={styles.swapBtn}>
              <AppIcon name="airplane" size={18} color="#0064D2" />
            </TouchableOpacity>
            <View style={[styles.routeBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.routeLabel}>{t('to')}</Text>
              <Text style={styles.routeCode}>SGN</Text>
              <Text style={styles.routeCity}>TP. Hồ Chí Minh</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <View style={styles.detailLabelRow}>
                <AppIcon name="calendar" size={13} color="#9CA3AF" />
                <Text style={styles.detailLabel}> {t('departure_date')}</Text>
              </View>
              <Text style={styles.detailValue}>25/04/2025</Text>
            </View>
            <View style={[styles.detailBox, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 16 }]}>
              <View style={styles.detailLabelRow}>
                <AppIcon name="passengers" size={13} color="#9CA3AF" />
                <Text style={styles.detailLabel}> {t('passengers')}</Text>
              </View>
              <Text style={styles.detailValue}>1 {t('adult')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Flights')}>
            <AppIcon name="search" size={16} color="#fff" />
            <Text style={styles.searchBtnText}>  {t('search_flight')}</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quick_access')}</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c.label} style={styles.catItem}>
                <View style={styles.catIcon}>
                  <AppIcon name={c.iconName} size={26} color="#0064D2" />
                </View>
                <Text style={styles.catLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('todays_deals')}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t('see_all')}</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
            {PROMOS.map(p => (
              <TouchableOpacity key={p.id} style={[styles.promoCard, { backgroundColor: p.color }]}>
                <View style={styles.promoIconWrap}>
                  <AppIcon name={p.iconName} size={32} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.promoTitle}>{t(p.titleKey)}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ width: 16 }} />
          </ScrollView>
        </View>

        {/* Popular Flights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('popular_flights')}</Text>
            <TouchableOpacity><Text style={styles.seeAll}>{t('see_all')}</Text></TouchableOpacity>
          </View>
          {POPULAR.map(f => (
            <TouchableOpacity key={f.id} style={styles.flightCard} onPress={() => navigation.navigate('Flights')}>
              <View style={styles.flightLeft}>
                <Text style={styles.flightCode}>{f.from} → {f.to}</Text>
                <Text style={styles.flightAirline}>{f.airline}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <AppIcon name="clock" size={12} color="#9CA3AF" />
                  <Text style={styles.flightTime}> {f.time}</Text>
                </View>
              </View>
              <View style={styles.flightRight}>
                <Text style={styles.flightFrom}>{t('from').toLowerCase()}</Text>
                <Text style={styles.flightPrice}>{formatPrice(f.priceVND, currency)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#F5F7FA' },
  header:          { backgroundColor: '#0064D2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  greetingRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting:        { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  headerTitle:     { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 },
  avatarBtn:       { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText:      { color: '#fff', fontSize: 18, fontWeight: '700' },
  searchCard:      { marginHorizontal: 16, marginTop: -20, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  tripToggle:      { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 3, marginBottom: 16 },
  toggleBtn:       { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 6 },
  toggleActive:    { backgroundColor: '#fff', elevation: 2 },
  toggleText:      { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  toggleTextActive:{ color: '#0064D2', fontWeight: '700' },
  routeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  routeBox:        { flex: 1 },
  routeLabel:      { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  routeCode:       { fontSize: 26, fontWeight: '800', color: '#1A1A2E' },
  routeCity:       { fontSize: 12, color: '#6B7280' },
  swapBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#0064D2', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  divider:         { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  detailRow:       { flexDirection: 'row', marginBottom: 16 },
  detailBox:       { flex: 1 },
  detailLabelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  detailLabel:     { fontSize: 11, color: '#9CA3AF' },
  detailValue:     { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  searchBtn:       { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  searchBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  section:         { marginTop: 24 },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#1A1A2E', paddingHorizontal: 16, marginBottom: 12 },
  seeAll:          { color: '#0064D2', fontSize: 13, fontWeight: '600' },
  catGrid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  catItem:         { width: '33.33%', alignItems: 'center', marginBottom: 20 },
  catIcon:         { width: 60, height: 60, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catLabel:        { fontSize: 11, color: '#374151', fontWeight: '500', textAlign: 'center' },
  promoCard:       { width: 180, borderRadius: 14, padding: 16, marginRight: 12, minHeight: 100 },
  promoIconWrap:   { marginBottom: 8 },
  promoTitle:      { color: '#fff', fontSize: 17, fontWeight: '800' },
  flightCard:      { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  flightLeft:      { flex: 1 },
  flightCode:      { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  flightAirline:   { fontSize: 12, color: '#6B7280', marginTop: 3 },
  flightTime:      { fontSize: 12, color: '#9CA3AF' },
  flightRight:     { alignItems: 'flex-end', justifyContent: 'center' },
  flightFrom:      { fontSize: 11, color: '#9CA3AF' },
  flightPrice:     { fontSize: 16, fontWeight: '800', color: '#0064D2' },
});
