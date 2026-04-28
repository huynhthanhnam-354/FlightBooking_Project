import React from 'react'
import { SafeAreaView, View, StyleSheet } from 'react-native'
import Eticket from '../components/Eticket'

export default function EticketScreen() {
  const sample = {
    pnr: 'PNR1234',
    passenger: 'Nguyễn Văn A',
    seat: '12A',
    gate: 'B12',
    boardingTime: '07:40',
    from: 'SGN',
    to: 'HAN',
    depart: '2026-05-10 08:30',
    arrive: '2026-05-10 10:15',
    flightNumber: 'VJ123',
    airline: 'VietAir',
    qrValue: 'PNR1234|VJ123|SGN-HAN'
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Eticket ticket={sample} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
