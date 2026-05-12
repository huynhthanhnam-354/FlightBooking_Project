import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, userInitial } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { airportName } from '../data/airports';
import { formatPrice } from '../utils/price';
import AppIcon from '../components/AppIcon';
import { searchFlightsApi } from '../services/flightApi';

import { AppIconName } from '../theme/icons';

const PROMOS: { id: string; color: string; titleKey: 'todays_deals' | 'popular_flights' | 'cat_flight_status'; iconName: AppIconName }[] = [
  { id: '1', color: '#0064D2', titleKey: 'todays_deals',     iconName: 'ticket' },
  { id: '2', color: '#7C3AED', titleKey: 'popular_flights',  iconName: 'airplane' },
  { id: '3', color: '#0891B2', titleKey: 'cat_flight_status', iconName: 'flightStatus' },
];

type PopularRow = {
  id: string;
  from: string;
  to: string;
  airline: string;
  priceVND: number;
  time: string;
  hasResult: boolean;
};

const POPULAR_ROUTES = [
  { id: '1', from: 'HAN', to: 'SGN' },
  { id: '2', from: 'SGN', to: 'DAD' },
  { id: '3', from: 'HAN', to: 'DAD' },
  { id: '4', from: 'SGN', to: 'SIN' },
  { id: '5', from: 'HAN', to: 'ICN' },
  { id: '6', from: 'SGN', to: 'BKK' },
];

/** Màn trên root stack (cùng cấp Main tabs), từ tab con cần lên stack cha. */
function navigateRootStack(navigation: { getParent?: () => any }, screen: string) {
  const tabNav = navigation.getParent?.();
  const stackNav = tabNav?.getParent?.();
  if (stackNav?.navigate) stackNav.navigate(screen);
  else if (tabNav?.navigate) tabNav.navigate(screen);
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t, currency, language } = useLanguage();
  const { user } = useAuth();
  const search = useSearch();
  const [popularRows, setPopularRows] = useState<PopularRow[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPopularLoading(true);
      try {
        const rows: PopularRow[] = await Promise.all(
          POPULAR_ROUTES.map(async (r) => {
            const list = await searchFlightsApi(r.from, r.to);
            const cheapest =
              list.length > 0 ? [...list].sort((a, b) => a.priceVND - b.priceVND)[0] : null;
            return {
              id: r.id,
              from: r.from,
              to: r.to,
              airline: cheapest?.airline ?? '—',
              priceVND: cheapest?.priceVND ?? 0,
              time: cheapest?.duration ?? '—',
              hasResult: !!cheapest,
            };
          }),
        );
        if (!cancelled) setPopularRows(rows);
      } catch {
        if (!cancelled) {
          setPopularRows(
            POPULAR_ROUTES.map((r) => ({
              id: r.id,
              from: r.from,
              to: r.to,
              airline: '—',
              priceVND: 0,
              time: '—',
              hasResult: false,
            })),
          );
        }
      } finally {
        if (!cancelled) setPopularLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const CATEGORIES = [
    { key: 'book', iconName: 'airplane'     as const, label: t('cat_book_flight') },
    { key: 'status', iconName: 'flightStatus' as const, label: t('cat_flight_status') },
    { key: 'tickets', iconName: 'ticket'       as const, label: t('cat_my_tickets') },
    { key: 'baggage', iconName: 'luggage'      as const, label: t('cat_baggage') },
    { key: 'checkin', iconName: 'checkin'      as const, label: t('cat_checkin') },
    { key: 'support', iconName: 'support'      as const, label: t('cat_support') },
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
            </View>
            <Text style={styles.headerTitle}>{t('home_title')}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{userInitial(user)}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.tripToggle}>
            {(['oneWay', 'roundTrip'] as const).map(tp => (
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

          <View style={styles.routeRow}>
            <TouchableOpacity
              style={[styles.routeBox, styles.routeTap]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditSearch')}
            >
              <Text style={styles.routeLabel}>{t('from')}</Text>
              <Text style={styles.routeCode}>{search.fromCode}</Text>
              <Text style={styles.routeCity}>{airportName(search.fromCode, language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.swapBtn} onPress={search.swapRoute}>
              <AppIcon name="airplane" size={18} color="#0064D2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.routeBox, { alignItems: 'flex-end' }, styles.routeTap]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditSearch')}
            >
              <Text style={styles.routeLabel}>{t('to')}</Text>
              <Text style={styles.routeCode}>{search.toCode}</Text>
              <Text style={styles.routeCity}>{airportName(search.toCode, language)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.detailRow}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('EditSearch')}
          >
            <View style={styles.detailBox}>
              <View style={styles.detailLabelRow}>
                <AppIcon name="calendar" size={13} color="#9CA3AF" />
                <Text style={styles.detailLabel}> {t('departure_date')}</Text>
              </View>
              <Text style={styles.detailValue}>{search.departureDate}</Text>
            </View>
            {search.tripType === 'roundTrip' ? (
              <View style={[styles.detailBox, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 16 }]}>
                <View style={styles.detailLabelRow}>
                  <AppIcon name="calendar" size={13} color="#9CA3AF" />
                  <Text style={styles.detailLabel}> {t('return_date')}</Text>
                </View>
                <Text style={styles.detailValue}>{search.returnDate}</Text>
              </View>
            ) : (
              <View style={[styles.detailBox, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 16 }]}>
                <View style={styles.detailLabelRow}>
                  <AppIcon name="passengers" size={13} color="#9CA3AF" />
                  <Text style={styles.detailLabel}> {t('passengers')}</Text>
                </View>
                <Text style={styles.detailValue}>
                  {search.adults} {search.adults > 1 ? t('passengers').toLowerCase() : t('adult')}
                </Text>
              </View>
            )}
            <View style={styles.detailEditHint}>
              <AppIcon name="edit" size={14} color="#0064D2" />
            </View>
          </TouchableOpacity>

          {search.tripType === 'roundTrip' ? (
            <TouchableOpacity
              style={[styles.detailRow, { marginTop: -4 }]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('EditSearch')}
            >
              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <AppIcon name="passengers" size={13} color="#9CA3AF" />
                  <Text style={styles.detailLabel}> {t('passengers')}</Text>
                </View>
                <Text style={styles.detailValue}>
                  {search.adults} {search.adults > 1 ? t('passengers').toLowerCase() : t('adult')}
                </Text>
              </View>
              <View style={styles.detailEditHint}>
                <AppIcon name="edit" size={14} color="#0064D2" />
              </View>
            </TouchableOpacity>
          ) : null}

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
              <TouchableOpacity
                key={c.key}
                style={styles.catItem}
                onPress={() => {
                  if (c.key === 'book') navigation.navigate('Flights');
                  if (c.key === 'status') navigateRootStack(navigation, 'FlightTracking');
                  if (c.key === 'tickets') navigation.navigate('Profile', { initialTab: 'bookings' });
                  if (c.key === 'baggage') navigation.navigate('HelpTopic', { topic: 'baggage' });
                  if (c.key === 'checkin') navigation.navigate('HelpTopic', { topic: 'checkin' });
                  if (c.key === 'support') navigation.navigate('HelpTopic', { topic: 'support' });
                }}
              >
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
            <TouchableOpacity onPress={() => navigation.navigate('Flights')}>
              <Text style={styles.seeAll}>{t('see_all')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
            {PROMOS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.promoCard, { backgroundColor: p.color }]}
                onPress={() => navigation.navigate('Flights')}
              >
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
            <TouchableOpacity onPress={() => navigation.navigate('Flights')}>
              <Text style={styles.seeAll}>{t('see_all')}</Text>
            </TouchableOpacity>
          </View>
          {popularLoading ? (
            <View style={styles.popularLoading}>
              <ActivityIndicator color="#0064D2" />
              <Text style={styles.popularLoadingText}>{t('popular_loading')}</Text>
            </View>
          ) : (
            popularRows.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.flightCard}
                onPress={() => {
                  search.setFromCode(f.from);
                  search.setToCode(f.to);
                  navigation.navigate('Flights');
                }}
              >
                <View style={styles.flightLeft}>
                  <Text style={styles.flightCode}>
                    {f.from} → {f.to}
                  </Text>
                  <Text style={styles.flightAirline}>{f.airline}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <AppIcon name="clock" size={12} color="#9CA3AF" />
                    <Text style={styles.flightTime}> {f.time}</Text>
                  </View>
                </View>
                <View style={styles.flightRight}>
                  <Text style={styles.flightFrom}>{t('from').toLowerCase()}</Text>
                  <Text style={styles.flightPrice}>
                    {f.hasResult ? formatPrice(f.priceVND, currency) : '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  routeTap:        { paddingVertical: 4, paddingHorizontal: 2, borderRadius: 10 },
  routeLabel:      { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  routeCode:       { fontSize: 26, fontWeight: '800', color: '#1A1A2E' },
  routeCity:       { fontSize: 12, color: '#6B7280' },
  swapBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#0064D2', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  divider:         { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  detailRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailBox:       { flex: 1 },
  detailEditHint:  { paddingLeft: 4, justifyContent: 'center' },
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
  popularLoading:  { marginHorizontal: 16, paddingVertical: 20, alignItems: 'center', gap: 8 },
  popularLoadingText: { fontSize: 13, color: '#6B7280' },
});
