import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { formatPrice } from '../utils/price';
import AppIcon from '../components/AppIcon';
import { AIRLINE_COLORS, filterAndSortFlights, flightCodePrefix } from '../data/flightCatalog';
import type { CatalogFlight } from '../data/flightCatalog';
import { searchFlightsApi } from '../services/flightApi';
import { formatAuthError } from '../services/authApi';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { t, currency } = useLanguage();
  const search = useSearch();
  const [activeFilter, setActiveFilter] = useState<'all' | 'cheap' | 'early' | 'fast' | 'biz'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [flights, setFlights] = useState<CatalogFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFlights = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const out = await searchFlightsApi(search.fromCode, search.toCode);
      setFlights(out);

      if (search.tripType === 'roundTrip') {
        const ret = await searchFlightsApi(search.toCode, search.fromCode);
        let retMin = ret.length ? Math.min(...ret.map((x) => x.priceVND)) : null;
        if (retMin == null && out.length) {
          retMin = Math.round(Math.min(...out.map((x) => x.priceVND)) * 0.88);
        }
        search.setRoundTripReturnMinVnd(retMin);
      } else {
        search.setRoundTripReturnMinVnd(null);
      }
    } catch (e) {
      setFlights([]);
      search.setRoundTripReturnMinVnd(null);
      setLoadError(formatAuthError(e));
    } finally {
      setLoading(false);
    }
  }, [search.fromCode, search.toCode, search.tripType, search.setRoundTripReturnMinVnd]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  const returnAddon = search.tripType === 'roundTrip' ? search.roundTripReturnMinVnd ?? 0 : 0;

  const filteredFlights = useMemo(
    () => filterAndSortFlights(flights, activeFilter, returnAddon),
    [flights, activeFilter, returnAddon],
  );

  useEffect(() => {
    setSelected(null);
    search.setSelectedFlight(null);
  }, [
    activeFilter,
    search.fromCode,
    search.toCode,
    search.departureDate,
    search.returnDate,
    search.adults,
    search.tripType,
    search.setSelectedFlight,
  ]);

  const FILTER_CHIPS = [
    { key: 'all' as const, label: t('filter_all') },
    { key: 'cheap' as const, label: t('filter_cheapest') },
    { key: 'early' as const, label: t('filter_earliest') },
    { key: 'fast' as const, label: t('filter_fastest') },
    { key: 'biz' as const, label: t('filter_business') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRoute}>
          <Text style={styles.headerCity}>{search.fromCode}</Text>
          <View style={styles.headerArrowWrap}>
            <View style={styles.arrowLine} />
            <AppIcon name="airplane" size={18} color="rgba(255,255,255,0.9)" />
            <View style={styles.arrowLine} />
          </View>
          <Text style={styles.headerCity}>{search.toCode}</Text>
        </View>
        <Text style={styles.headerSub}>
          {search.tripType === 'roundTrip' ? t('round_trip') : t('one_way')} · {search.departureDate}
          {search.tripType === 'roundTrip' ? ` → ${search.returnDate}` : ''} · {search.adults}{' '}
          {search.adults > 1 ? t('passenger').toLowerCase() : t('adult').toLowerCase()}
        </Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditSearch')}>
          <AppIcon name="edit" size={13} color="#fff" />
          <Text style={styles.editText}>  {t('edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {FILTER_CHIPS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]} onPress={() => setActiveFilter(f.key)}>
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loadError ? (
        <Text style={styles.errorBanner}>{loadError}</Text>
      ) : null}

      <Text style={styles.resultCount}>
        {loading ? '…' : filteredFlights.length} {t('flights')}
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0064D2" />
        </View>
      ) : filteredFlights.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('no_flights_for_route')}</Text>
        </View>
      ) : (
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredFlights.map((f) => {
          const prefix = flightCodePrefix(f.code);
          const badgeColor = AIRLINE_COLORS[prefix] ?? '#9CA3AF';
          const totalDisplayVnd = f.priceVND + returnAddon;
          return (
            <TouchableOpacity key={f.id} style={[styles.card, selected === f.id && styles.cardSelected]} onPress={() => setSelected(f.id)}>
              <View style={styles.airlineRow}>
                {/* Badge màu hãng + chữ tắt */}
                <View style={[styles.airlineBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.airlineBadgeText}>{prefix}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.airlineName}>{f.airline}</Text>
                  <Text style={styles.flightCode}>
                    {f.code} · {f.premium ? t('business_class') : t('economy')}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.price}>{formatPrice(totalDisplayVnd, currency)}</Text>
                  <Text style={styles.perPax}>{t('per_person')}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                  <Text style={styles.time}>{f.dep}</Text>
                  <Text style={styles.airport}>{search.fromCode}</Text>
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
                  <Text style={styles.airport}>{search.toCode}</Text>
                </View>
              </View>

              {selected === f.id && (
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => {
                    search.setSelectedFlight(f);
                    navigation.navigate('Bookings');
                  }}
                >
                  <AppIcon name="check" size={15} color="#fff" />
                  <Text style={styles.selectBtnText}>  {t('select_flight')}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
      )}
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
  errorBanner:      { marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: 13 },
  loadingBox:       { paddingVertical: 48, alignItems: 'center' },
  emptyBox:         { paddingHorizontal: 24, paddingVertical: 40 },
  emptyText:        { fontSize: 15, color: '#6B7280', textAlign: 'center' },
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
