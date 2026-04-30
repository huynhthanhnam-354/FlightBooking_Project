import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { FlightTrackingData, getMockFlightTracking } from '../services/flightTracking';
import { useLanguage } from '../context/LanguageContext';

function formatTime(iso: string | null): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function FlightTrackingScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [data, setData] = useState<FlightTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const response = await getMockFlightTracking();
    setData(response);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const coords = useMemo(
    () =>
      (data?.route.points || []).map((p) => ({
        latitude: p.lat,
        longitude: p.lng,
      })),
    [data],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0064D2" />
          <Text style={styles.loadingText}>Dang tai du lieu theo doi chuyen bay...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text>Khong co du lieu theo doi.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo doi chuyen bay</Text>
        <Text style={styles.headerSub}>
          {data.flight.airline} - {data.flight.iata} ({data.flight.departure.iata} -> {data.flight.arrival.iata})
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trang thai hien tai</Text>
          <Text style={styles.statusBadge}>{data.status.labelVi}</Text>
          <Text style={styles.updatedText}>Cap nhat: {formatTime(data.status.updatedAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline qua trinh bay</Text>
          {data.timeline.map((item, idx) => (
            <View key={item.key} style={styles.timelineRow}>
              <View style={styles.dotCol}>
                <View style={[styles.dot, item.done && styles.dotDone]} />
                {idx < data.timeline.length - 1 && <View style={[styles.vertLine, item.done && styles.vertLineDone]} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, item.done && styles.timelineLabelDone]}>{item.label}</Text>
                <Text style={styles.timelineTime}>{formatTime(item.at)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lo trinh don gian (Google Maps)</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 16.4,
              longitude: 106.2,
              latitudeDelta: 13,
              longitudeDelta: 13,
            }}
          >
            <Marker
              coordinate={{ latitude: data.flight.departure.lat, longitude: data.flight.departure.lng }}
              title={`Khoi hanh ${data.flight.departure.iata}`}
            />
            <Marker
              coordinate={{ latitude: data.flight.arrival.lat, longitude: data.flight.arrival.lng }}
              title={`Ha canh ${data.flight.arrival.iata}`}
            />
            {data.route.points
              .filter((p) => p.type === 'current')
              .map((p, i) => (
                <Marker key={`${p.lat}-${p.lng}-${i}`} coordinate={{ latitude: p.lat, longitude: p.lng }} title="Vi tri hien tai" />
              ))}
            <Polyline coordinates={coords} strokeColor="#0064D2" strokeWidth={3} />
          </MapView>
          <Text style={styles.mapNote}>
            Ban frontend nay dang dung mock data theo schema AirLabs. Khi co backend, thay service bang API that.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0064D2', padding: 16 },
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
  headerSub: { color: 'rgba(255,255,255,0.88)', marginTop: 2, fontSize: 12 },
  content: { flex: 1, padding: 14 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#4B5563', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  updatedText: { marginTop: 8, color: '#6B7280', fontSize: 12 },
  timelineRow: { flexDirection: 'row' },
  dotCol: { width: 20, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D1D5DB', marginTop: 4 },
  dotDone: { backgroundColor: '#0064D2' },
  vertLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4, marginBottom: 2 },
  vertLineDone: { backgroundColor: '#93C5FD' },
  timelineContent: { paddingLeft: 8, paddingBottom: 12 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  timelineLabelDone: { color: '#111827' },
  timelineTime: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  map: { width: '100%', height: 220, borderRadius: 10 },
  mapNote: { marginTop: 8, color: '#6B7280', fontSize: 12 },
});

