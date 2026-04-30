import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native'

type Ticket = {
  pnr: string
  passenger?: string
  seat?: string
  gate?: string
  boardingTime?: string
  from?: string
  to?: string
  depart?: string
  arrive?: string
  flightNumber?: string
  airline?: string
  qrValue?: string
}

const DEFAULT_TICKET: Ticket = {
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

function hashString(s: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

function genMatrix(seedStr: string, size = 21) {
  const mat: boolean[][] = []
  let seed = hashString(seedStr)
  for (let r = 0; r < size; r++) {
    const row: boolean[] = []
    for (let c = 0; c < size; c++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      row.push((seed & 1) === 1)
    }
    mat.push(row)
  }
  return mat
}

export default function Eticket({ ticket = DEFAULT_TICKET }: { ticket?: Ticket }) {
  const mat = genMatrix(ticket.qrValue || ticket.pnr || 'ticket')

  async function handleShare() {
    try {
      const text = `E-ticket ${ticket.pnr} - ${ticket.from}→${ticket.to} / ${ticket.flightNumber} / Seat ${ticket.seat}`
      await Share.share({ message: text })
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể chia sẻ vé')
    }
  }

  function handleSaveImage() {
    // Placeholder: for real image save, add `react-native-view-shot` + permissions
    Alert.alert('Lưu vé', 'Đã lưu (chế độ mô phỏng). Để lưu ảnh thực tế, cài `react-native-view-shot`.')
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.ticket}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.airline}>{ticket.airline}</Text>
            <Text style={styles.route}>{ticket.from} → {ticket.to}</Text>
          </View>
          <View style={styles.pnrBlock}>
            <Text style={styles.pnrLabel}>PNR</Text>
            <Text style={styles.pnr}>{ticket.pnr}</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.infoCol}>
            <View style={styles.bigRow}>
              <View>
                <Text style={styles.label}>Boarding</Text>
                <Text style={styles.bigValue}>{ticket.boardingTime}</Text>
              </View>
              <View>
                <Text style={styles.label}>Gate</Text>
                <Text style={styles.bigValue}>{ticket.gate}</Text>
              </View>
            </View>

            <View style={styles.subRow}>
              <View>
                <Text style={styles.smallLabel}>Seat</Text>
                <Text style={styles.smallValue}>{ticket.seat}</Text>
              </View>
              <View>
                <Text style={styles.smallLabel}>Flight</Text>
                <Text style={styles.smallValue}>{ticket.flightNumber}</Text>
              </View>
            </View>
          </View>

          <View style={styles.qrCol} accessible accessibilityLabel={`QR code ticket ${ticket.pnr}`}>
            <View style={styles.qrBox}>
              {mat.map((row, rIdx) => (
                <View key={rIdx} style={styles.qrRow}>
                  {row.map((v, cIdx) => (
                    <View key={cIdx} style={[styles.qrCell, { backgroundColor: v ? '#000' : '#fff' }]} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.tearStrip}>
          <View style={styles.perfRow}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={styles.perfDot} />
            ))}
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveImage}>
              <Text style={styles.saveText}>Lưu vào ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareText}>Chia sẻ vé</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#0F172A' },
  ticket: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: '#111827' },
  airline: { color: '#fff', fontWeight: '800', fontSize: 18 },
  route: { color: '#E5E7EB', fontSize: 13, marginTop: 2 },
  pnrBlock: { alignItems: 'flex-end' },
  pnrLabel: { color: '#9CA3AF', fontSize: 11 },
  pnr: { color: '#fff', fontWeight: '800', fontSize: 16 },
  mainRow: { flexDirection: 'row', padding: 16, backgroundColor: '#fff' },
  infoCol: { flex: 1, paddingRight: 8 },
  bigRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bigValue: { fontSize: 28, color: '#111827', fontWeight: '900' },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  subRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallLabel: { fontSize: 11, color: '#9CA3AF' },
  smallValue: { fontSize: 15, color: '#111827', fontWeight: '700' },
  qrCol: { width: 180, alignItems: 'center', justifyContent: 'center' },
  qrBox: { width: 150, height: 150, backgroundColor: '#fff', padding: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' },
  qrRow: { flexDirection: 'row' },
  qrCell: { width: 6, height: 6 },
  tearStrip: { backgroundColor: '#F8FAFC', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#E6EEF8' },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  perfDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E6EEF8' },
  actionsRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' as any },
  saveBtn: { flex: 1, backgroundColor: '#111827', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
  shareBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#111827', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  shareText: { color: '#111827', fontWeight: '700' },
})
