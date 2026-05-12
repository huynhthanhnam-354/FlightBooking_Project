import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { fetchFlightTracking, fetchFlightTrackingExamples, type FlightTrackingDto, type FlightTrackingExample } from '../services/flightTrackingApi';

function regionFromCoords(coords: { latitude: number; longitude: number }[]) {
  if (coords.length === 0) {
    return { latitude: 16.0, longitude: 106.5, latitudeDelta: 12, longitudeDelta: 12 };
  }
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latD = Math.max((maxLat - minLat) * 1.9, 0.9);
  const lngD = Math.max((maxLng - minLng) * 1.9, 0.9);
  return { latitude: midLat, longitude: midLng, latitudeDelta: latD, longitudeDelta: lngD };
}

function pushUnique(
  list: { latitude: number; longitude: number }[],
  lat: number | null | undefined,
  lng: number | null | undefined,
) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return;
  const last = list[list.length - 1];
  if (last && last.latitude === lat && last.longitude === lng) return;
  list.push({ latitude: lat, longitude: lng });
}

function normalizeStatus(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/\s+/g, '-');
}

export default function FlightTrackingScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FlightTrackingDto | null>(null);
  const [examples, setExamples] = useState<FlightTrackingExample[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [suggestHint, setSuggestHint] = useState<string | null>(null);

  const statusLabel = useCallback(
    (status: string | null | undefined) => {
      const k = normalizeStatus(status);
      if (k === 'scheduled') return t('flight_status_scheduled');
      if (k === 'en-route' || k === 'active') return t('flight_status_en_route');
      if (k === 'landed') return t('flight_status_landed');
      return status?.trim() ? status : t('flight_status_unknown');
    },
    [t],
  );

  const loadExamples = useCallback(async () => {
    setLoadingExamples(true);
    setError(null);
    setSuggestHint(null);
    try {
      const list = await fetchFlightTrackingExamples(15);
      setExamples(list);
      if (list.length === 0) {
        setSuggestHint(t('flight_tracking_examples_empty'));
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 503) {
        setError(t('flight_tracking_api_not_configured'));
      } else {
        setError(t('flight_tracking_not_found'));
      }
      setExamples([]);
    } finally {
      setLoadingExamples(false);
    }
  }, [t]);

  const onSearch = useCallback(async () => {
    const code = query.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError(null);
    setSuggestHint(null);
    setData(null);
    try {
      const res = await fetchFlightTracking(code);
      setData(res);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const st = e.response?.status;
        const body = e.response?.data as { code?: string; message?: string } | undefined;
        if (st === 400) setError(body?.message || t('flight_tracking_invalid_code'));
        else if (st === 404) setError(t('flight_tracking_not_found'));
        else if (st === 503) setError(body?.message || t('flight_tracking_api_not_configured'));
        else setError(e.message || t('flight_tracking_not_found'));
      } else {
        setError(t('flight_tracking_not_found'));
      }
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  const lineCoords = useMemo(() => {
    if (!data) return [];
    const pts: { latitude: number; longitude: number }[] = [];
    pushUnique(pts, data.depLat, data.depLng);
    pushUnique(pts, data.lat, data.lng);
    pushUnique(pts, data.arrLat, data.arrLng);
    return pts;
  }, [data]);

  const mapRegion = useMemo(() => {
    if (!data) return regionFromCoords([]);
    const pts: { latitude: number; longitude: number }[] = [];
    pushUnique(pts, data.depLat, data.depLng);
    pushUnique(pts, data.lat, data.lng);
    pushUnique(pts, data.arrLat, data.arrLng);
    if (pts.length === 0 && data.lat != null && data.lng != null) {
      pts.push({ latitude: data.lat, longitude: data.lng });
    }
    return regionFromCoords(pts);
  }, [data]);

  const updatedText = useMemo(() => {
    if (!data?.updatedUnix) return '—';
    return new Date(data.updatedUnix * 1000).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [data]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={64}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('cat_flight_status').replace('\n', ' ')}</Text>
          <Text style={styles.headerSub}>{t('flight_tracking_intro_map')}</Text>
        </View>

        <View style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={false}
          >
            <Text style={styles.label}>{t('flight_tracking_iata_label')}</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder={t('flight_tracking_iata_placeholder')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity style={[styles.lookupBtn, loading && styles.lookupBtnDisabled]} onPress={onSearch} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.lookupBtnText}>{t('flight_tracking_lookup_btn')}</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.suggestBtn, loadingExamples && styles.lookupBtnDisabled]}
              onPress={loadExamples}
              disabled={loadingExamples}
            >
              {loadingExamples ? (
                <ActivityIndicator color="#0064D2" />
              ) : (
                <Text style={styles.suggestBtnText}>{t('flight_tracking_suggest_btn')}</Text>
              )}
            </TouchableOpacity>
            {examples.length > 0 ? <Text style={styles.examplesHint}>{t('flight_tracking_examples_hint')}</Text> : null}
            {suggestHint && examples.length === 0 ? <Text style={styles.suggestHint}>{suggestHint}</Text> : null}
            {examples.length > 0 ? (
              <View style={styles.chipsWrap}>
                {examples.map((ex) => (
                  <TouchableOpacity
                    key={ex.flightIata}
                    style={styles.chip}
                    onPress={() => {
                      setQuery(ex.flightIata);
                      setError(null);
                    }}
                  >
                    <Text style={styles.chipMain}>{ex.flightIata}</Text>
                    <Text style={styles.chipSub} numberOfLines={1}>
                      {(ex.depIata || '—') + '→' + (ex.arrIata || '—')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {data ? (
              <View style={styles.card}>
                <Text style={styles.flightTitle}>{data.flightIata}</Text>
                <Text style={styles.statusBadge}>{statusLabel(data.status)}</Text>
                <Text style={styles.routeText}>
                  {(data.depIata || '—') + ' → ' + (data.arrIata || '—')}
                </Text>
                {data.altM != null ? (
                  <Text style={styles.meta}>
                    {t('flight_tracking_alt')}: {data.altM} m · {t('flight_tracking_speed')}:{' '}
                    {data.speedKmh ?? '—'} km/h · {t('flight_tracking_heading')}: {data.headingDeg != null ? `${Math.round(data.headingDeg)}°` : '—'}
                  </Text>
                ) : (
                  <Text style={styles.metaMuted}>{t('flight_tracking_unavailable')}</Text>
                )}
                <Text style={styles.updated}>
                  {t('flight_tracking_updated')}: {updatedText}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {data ? (
            <View style={styles.mapSection} collapsable={false}>
              <View style={styles.mapOuter}>
                <MapView
                  key={data.flightIata}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  style={styles.map}
                  mapType="standard"
                  initialRegion={mapRegion}
                  showsBuildings
                  showsTraffic={false}
                >
                {data.depLat != null && data.depLng != null ? (
                  <Marker
                    key="dep"
                    identifier="dep"
                    coordinate={{ latitude: data.depLat, longitude: data.depLng }}
                    title={data.depIata || 'DEP'}
                    pinColor="#2563EB"
                  />
                ) : null}
                {data.arrLat != null && data.arrLng != null ? (
                  <Marker
                    key="arr"
                    identifier="arr"
                    coordinate={{ latitude: data.arrLat, longitude: data.arrLng }}
                    title={data.arrIata || 'ARR'}
                    pinColor="#059669"
                  />
                ) : null}
                {data.lat != null && data.lng != null ? (
                  <Marker
                    key="ac"
                    identifier="ac"
                    coordinate={{ latitude: data.lat, longitude: data.lng }}
                    title={data.flightIata}
                    description={statusLabel(data.status)}
                    pinColor="#DC2626"
                  />
                ) : null}
                {lineCoords.length >= 2 ? <Polyline coordinates={lineCoords} strokeColor="#0064D2" strokeWidth={3} /> : null}
                </MapView>
              </View>
              <Text style={styles.mapNote}>{t('flight_tracking_map_note')}</Text>
              <Text style={styles.hint}>{t('flight_tracking_hint_flights')}</Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  flex: { flex: 1 },
  body: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12, flexGrow: 1 },
  header: { backgroundColor: '#0064D2', padding: 16, paddingBottom: 14 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  backBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 6, lineHeight: 17 },
  mapSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F5F7FA',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  lookupBtn: {
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupBtnDisabled: { opacity: 0.7 },
  lookupBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { color: '#DC2626', fontSize: 14, marginTop: 12, lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flightTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  statusBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '700',
  },
  routeText: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 10 },
  meta: { fontSize: 13, color: '#4B5563', marginTop: 8, lineHeight: 19 },
  metaMuted: { fontSize: 13, color: '#9CA3AF', marginTop: 8, lineHeight: 19 },
  updated: { fontSize: 12, color: '#9CA3AF', marginTop: 10 },
  mapOuter: {
    height: 260,
    marginTop: 10,
    width: '100%',
    backgroundColor: '#E8EAED',
    ...Platform.select({
      ios: { borderRadius: 14, overflow: 'hidden' as const },
      default: {},
    }),
  },
  map: { width: '100%', height: '100%', flex: 1 },
  mapNote: { fontSize: 11, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 10, lineHeight: 17 },
  suggestBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0064D2',
    backgroundColor: '#EFF6FF',
  },
  suggestBtnText: { color: '#0064D2', fontSize: 14, fontWeight: '700' },
  examplesHint: { fontSize: 12, color: '#6B7280', marginTop: 10 },
  suggestHint: { fontSize: 13, color: '#6B7280', marginTop: 10, lineHeight: 18 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  chipMain: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  chipSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});
