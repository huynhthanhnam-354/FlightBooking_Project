import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { buildPriceRows } from '../utils/price';
import AppIcon from '../components/AppIcon';

const BASE_FARE_VND = 1250000;

export default function BookingScreen() {
  const { t, currency } = useLanguage();
  const prices = buildPriceRows(BASE_FARE_VND, currency);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', idCard: '', seat: 'A12' });

  const STEPS = [t('step_details'), t('step_passenger'), t('step_payment')];

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else Alert.alert(t('booking_success'), t('booking_code'));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('book_ticket')}</Text>
        <Text style={styles.headerSub}>HAN → SGN · 25/04</Text>
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
                {i < step ? <Text style={styles.stepCheck}>✓</Text> : <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {step === 0 && (
          <View>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="airplaneTakeoff" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('flight_details')}</Text>
              </View>
              <View style={styles.flightSummary}>
                <View style={styles.flightTime}>
                  <Text style={styles.bigTime}>06:00</Text>
                  <Text style={styles.airport}>HAN</Text>
                </View>
                <View style={styles.flightMid}>
                  <Text style={styles.duration}>2h 10m</Text>
                  <View style={styles.lineRow}>
                    <View style={styles.dot} /><View style={styles.dashes} /><Text style={{ fontSize: 16 }}>✈️</Text><View style={styles.dashes} /><View style={styles.dot} />
                  </View>
                  <Text style={styles.direct}>{t('direct')}</Text>
                </View>
                <View style={[styles.flightTime, { alignItems: 'flex-end' }]}>
                  <Text style={styles.bigTime}>08:10</Text>
                  <Text style={styles.airport}>SGN</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('airline')}</Text><Text style={styles.infoValue}>Vietnam Airlines</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('flight_no')}</Text><Text style={styles.infoValue}>VN201</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('seat_class')}</Text><Text style={styles.infoValue}>{t('economy')}</Text></View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="seat" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('choose_seat')}</Text>
              </View>
              <View style={styles.seatGrid}>
                {['A10','A11','A12','B10','B11','B12','C10','C11','C12'].map(s => (
                  <TouchableOpacity key={s} style={[styles.seat, form.seat === s && styles.seatSelected, s === 'B11' && styles.seatTaken]} onPress={() => s !== 'B11' && setForm({ ...form, seat: s })}>
                    <Text style={[styles.seatText, form.seat === s && styles.seatTextSelected]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="price" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('price_summary')}</Text>
              </View>
              {[
                [t('base_fare'), prices.baseFare],
                [t('tax_fee'),   prices.tax],
                [t('luggage'),   t('free')],
              ].map(([l, v]) => (
                <View key={l} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{l}</Text>
                  <Text style={styles.priceValue}>{v}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>{prices.total}</Text>
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <AppIcon name="passenger" size={18} color="#0064D2" />
              <Text style={styles.cardTitle}> {t('passenger_info')}</Text>
            </View>
            {[
              { key: 'fullName', labelKey: 'full_name' as const,  placeholderKey: 'full_name_placeholder' as const },
              { key: 'email',    labelKey: 'email' as const,      placeholderKey: 'email_placeholder' as const },
              { key: 'phone',    labelKey: 'phone' as const,      placeholderKey: 'phone_placeholder' as const },
              { key: 'idCard',   labelKey: 'id_passport' as const, placeholderKey: 'id_placeholder' as const },
            ].map(field => (
              <View key={field.key} style={styles.formGroup}>
                <Text style={styles.inputLabel}>{t(field.labelKey)}</Text>
                <TextInput style={styles.input} placeholder={t(field.placeholderKey)} value={(form as any)[field.key]} onChangeText={v => setForm({ ...form, [field.key]: v })} placeholderTextColor="#9CA3AF" />
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="payment" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('payment_method')}</Text>
              </View>
              {([
                { iconName: 'creditCard'   as const, label: t('credit_card') },
                { iconName: 'bankTransfer' as const, label: t('bank_transfer') },
                { iconName: 'eWallet'      as const, label: t('e_wallet') },
                { iconName: 'cod'          as const, label: t('cod') },
              ] as const).map((m, i) => (
                <TouchableOpacity key={i} style={styles.payMethod}>
                  <AppIcon name={m.iconName} size={22} color="#0064D2" />
                  <Text style={styles.payLabel}>{m.label}</Text>
                  <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="clipboard" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('booking_confirm')}</Text>
              </View>
              {[
                [t('flight_no'),       'VN201'],
                [t('departure_date'),  '25/04/2025'],
                [t('seat'),            form.seat],
                [t('passenger'),       form.fullName || 'Nguyễn Văn Nam'],
                [t('total'),           prices.total],
              ].map(([label, value]) => (
                <View key={label} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← {t('back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, step === 0 && { flex: 1 }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? t('confirm_book') : `${t('next')} →`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F5F7FA' },
  header:        { backgroundColor: '#0064D2', padding: 20 },
  headerTitle:   { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub:     { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  stepper:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  stepItem:      { alignItems: 'center' },
  stepCircle:    { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#0064D2' },
  stepNum:       { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepCheck:     { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepLabel:     { fontSize: 11, color: '#9CA3AF' },
  stepLabelActive: { color: '#0064D2', fontWeight: '600' },
  stepLine:      { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4, marginBottom: 16 },
  stepLineActive:{ backgroundColor: '#0064D2' },
  content:       { flex: 1, padding: 16 },
  card:          { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  cardTitleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  flightSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  flightTime:    { flex: 1 },
  bigTime:       { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  airport:       { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 2 },
  flightMid:     { flex: 1, alignItems: 'center' },
  duration:      { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  lineRow:       { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0064D2' },
  dashes:        { flex: 1, height: 1.5, backgroundColor: '#D1D5DB' },
  direct:        { fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 6 },
  divider:       { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem:      { alignItems: 'center' },
  infoLabel:     { fontSize: 11, color: '#9CA3AF', marginBottom: 3 },
  infoValue:     { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  seatGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seat:          { width: 60, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
  seatSelected:  { backgroundColor: '#0064D2', borderColor: '#0064D2' },
  seatTaken:     { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  seatText:      { fontSize: 12, fontWeight: '600', color: '#374151' },
  seatTextSelected: { color: '#fff' },
  priceRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel:    { fontSize: 13, color: '#6B7280' },
  priceValue:    { fontSize: 13, color: '#1A1A2E', fontWeight: '500' },
  totalRow:      { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginTop: 4 },
  totalLabel:    { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  totalValue:    { fontSize: 17, fontWeight: '800', color: '#0064D2' },
  formGroup:     { marginBottom: 14 },
  inputLabel:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:         { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A2E', backgroundColor: '#F9FAFB' },
  payMethod:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  payLabel:      { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  bottomBar:     { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', elevation: 10 },
  backBtn:       { flex: 1, borderWidth: 1.5, borderColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backBtnText:   { color: '#0064D2', fontWeight: '700' },
  nextBtn:       { flex: 2, backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});
