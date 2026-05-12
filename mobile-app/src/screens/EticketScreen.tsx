import React from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Eticket from '../components/Eticket';
import { useLanguage } from '../context/LanguageContext';

export default function EticketScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const ticketParam = route.params?.ticket as Record<string, string> | undefined;

  if (!ticketParam || typeof ticketParam.pnr !== 'string' || !ticketParam.pnr.trim()) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeRow} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>← {t('back')}</Text>
        </TouchableOpacity>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('eticket_need_ticket')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const raw = ticketParam as Record<string, string>;
  const ticket = {
    pnr: raw.pnr.trim(),
    passenger: raw.passenger,
    seat: raw.seat,
    gate: raw.gate,
    boardingTime: raw.boardingTime,
    from: raw.from,
    to: raw.to,
    depart: raw.depart,
    arrive: raw.arrive,
    flightNumber: raw.flightNumber,
    airline: raw.airline,
    qrValue: raw.qrValue || `${raw.pnr}|${raw.flightNumber}|${raw.from}-${raw.to}`,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeRow} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>← {t('back')}</Text>
      </TouchableOpacity>
      <View style={styles.container}>
        <Eticket ticket={ticket} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  closeRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  closeText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
