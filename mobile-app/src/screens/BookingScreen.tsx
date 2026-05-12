import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import AppIcon from '../components/AppIcon';
import { useNavigation } from '@react-navigation/native';
import { createBookingApi } from '../services/bookingApi';
import { formatAuthError } from '../services/authApi';

const BASE_SERVICE_FEE_VND = 50000;
const TAX_RATE = 0.1;
const BOOKED_SEATS = new Set(['1B', '3C', '4D', '6E', '8A']);
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

type CabinClass = 'business' | 'economy';
type SeatStatus = 'booked' | 'available';

type SeatItem = {
  id: string;
  row: number;
  letter: string;
  side: 'left' | 'right';
  classType: CabinClass;
  status: SeatStatus;
  extra: boolean;
  addOn: number;
};

function generateSeatMap(): SeatItem[] {
  const seats: SeatItem[] = [];
  for (let row = 1; row <= 12; row++) {
    const isBusiness = row <= 2;
    const classType: CabinClass = isBusiness ? 'business' : 'economy';
    const leftCount = isBusiness ? 2 : 3;
    const rightCount = isBusiness ? 2 : 3;
    const addOn = isBusiness ? 400000 : row === 5 ? 150000 : 0;
    const extra = row === 5;

    for (let i = 0; i < leftCount; i++) {
      const letter = SEAT_LETTERS[i];
      const id = `${row}${letter}`;
      seats.push({
        id,
        row,
        letter,
        side: 'left',
        classType,
        status: BOOKED_SEATS.has(id) ? 'booked' : 'available',
        extra,
        addOn,
      });
    }

    for (let i = 0; i < rightCount; i++) {
      const letter = SEAT_LETTERS[3 + i];
      const id = `${row}${letter}`;
      seats.push({
        id,
        row,
        letter,
        side: 'right',
        classType,
        status: BOOKED_SEATS.has(id) ? 'booked' : 'available',
        extra,
        addOn,
      });
    }
  }
  return seats;
}

export default function BookingScreen() {
  const { t } = useLanguage();
  const search = useSearch();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [seatMap] = useState(generateSeatMap());
  const [selectedSeat, setSelectedSeat] = useState('3A');
  const [selectedPayment, setSelectedPayment] = useState<'credit_card' | 'bank_transfer' | 'e_wallet' | 'cod'>('credit_card');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', idCard: '' });
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const flight = search.selectedFlight;

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.fullName,
      email: f.email || user.email,
      phone: f.phone || (user.phone ?? ''),
    }));
  }, [user]);

  const STEPS = [t('step_details'), t('step_passenger'), t('step_payment')];

  if (!flight) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('book_ticket')}</Text>
          <Text style={styles.headerSub}>{t('select_flight_on_search_tab')}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <TouchableOpacity
            style={styles.goSearchBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Flights' })}
          >
            <Text style={styles.goSearchText}>{t('tab_flights')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const outboundVnd = flight.priceVND;
  const returnLegVnd = search.tripType === 'roundTrip' ? search.roundTripReturnMinVnd ?? 0 : 0;
  const baseFareVnd = outboundVnd + returnLegVnd;
  const selectedSeatMeta = seatMap.find((seat) => seat.id === selectedSeat);
  const seatAddOn = selectedSeatMeta?.addOn || 0;
  const tax = Math.round(baseFareVnd * TAX_RATE);
  const totalVnd = baseFareVnd + tax + BASE_SERVICE_FEE_VND + seatAddOn;
  const cabinLabel = flight.premium ? t('business_class') : t('economy');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

  const validatePassengerForm = () => {
    const nextErrors: { fullName?: string; email?: string; phone?: string } = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(form.phone.trim())) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = validatePassengerForm();
      if (!isValid) return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    if (!user) {
      Alert.alert(t('login_title'), t('booking_need_login'));
      return;
    }

    const flightId = parseInt(flight.id, 10);
    if (Number.isNaN(flightId)) {
      Alert.alert(t('register_failed_title'), 'Invalid flight.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBookingApi({
        flightId,
        seatNumber: selectedSeat.trim().toUpperCase(),
        passengerName: form.fullName.trim(),
        passengerEmail: form.email.trim(),
        passengerPhone: form.phone.trim() || undefined,
        totalPriceVnd: totalVnd,
      });
      search.setSelectedFlight(null);
      setStep(0);
      Alert.alert(t('booking_success'), `${t('booking_code')}\nPNR: ${res.pnr}`);
    } catch (e) {
      Alert.alert(t('register_failed_title'), formatAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('book_ticket')}</Text>
        <Text style={styles.headerSub}>
          {search.fromCode} → {search.toCode} · {search.departureDate}
          {search.tripType === 'roundTrip' ? ` · ${t('return_date')}: ${search.returnDate}` : ''}
        </Text>
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
                  <Text style={styles.bigTime}>{flight.dep}</Text>
                  <Text style={styles.airport}>{search.fromCode}</Text>
                </View>
                <View style={styles.flightMid}>
                  <Text style={styles.duration}>{flight.duration}</Text>
                  <View style={styles.lineRow}>
                    <View style={styles.dot} /><View style={styles.dashes} /><Text style={{ fontSize: 16 }}>✈️</Text><View style={styles.dashes} /><View style={styles.dot} />
                  </View>
                  <Text style={styles.direct}>{t('direct')}</Text>
                </View>
                <View style={[styles.flightTime, { alignItems: 'flex-end' }]}>
                  <Text style={styles.bigTime}>{flight.arr}</Text>
                  <Text style={styles.airport}>{search.toCode}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('airline')}</Text><Text style={styles.infoValue}>{flight.airline}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('flight_no')}</Text><Text style={styles.infoValue}>{flight.code}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>{t('seat_class')}</Text><Text style={styles.infoValue}>{cabinLabel}</Text></View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="seat" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('choose_seat')}</Text>
              </View>
              <View style={styles.legendWrap}>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendAvailable]} /><Text style={styles.legendText}>Ghế trống</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendBooked]} /><Text style={styles.legendText}>Đã đặt</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendSelected]} /><Text style={styles.legendText}>Đang chọn</Text></View>
              </View>

              <Text style={styles.cabinTitle}>Hạng thương gia</Text>
              {[1, 2].map((rowNumber) => (
                <View key={`biz-${rowNumber}`} style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowNumber}</Text>
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'left')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => seat.status !== 'booked' && setSelectedSeat(seat.id)}
                          disabled={seat.status === 'booked'}
                          style={[
                            styles.seat,
                            styles.businessSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeat === seat.id && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeat === seat.id && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                  <View style={styles.aisle} />
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'right')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => seat.status !== 'booked' && setSelectedSeat(seat.id)}
                          disabled={seat.status === 'booked'}
                          style={[
                            styles.seat,
                            styles.businessSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeat === seat.id && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeat === seat.id && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ))}

              <Text style={styles.cabinTitle}>Phổ thông</Text>
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((rowNumber) => (
                <View key={`eco-${rowNumber}`} style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowNumber}</Text>
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'left')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => seat.status !== 'booked' && setSelectedSeat(seat.id)}
                          disabled={seat.status === 'booked'}
                          style={[
                            styles.seat,
                            seat.extra && styles.extraLegroomSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeat === seat.id && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeat === seat.id && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                  <View style={styles.aisle} />
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'right')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => seat.status !== 'booked' && setSelectedSeat(seat.id)}
                          disabled={seat.status === 'booked'}
                          style={[
                            styles.seat,
                            seat.extra && styles.extraLegroomSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeat === seat.id && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeat === seat.id && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ))}

              <View style={styles.selectedSeatInfo}>
                <Text style={styles.selectedSeatText}>Đang chọn: {selectedSeat}</Text>
                <Text style={styles.selectedSeatText}>Phụ phí ghế: +{seatAddOn.toLocaleString()}₫</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="price" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('price_summary')}</Text>
              </View>
              {[
                [t('fare_outbound'), `${outboundVnd.toLocaleString()}₫`],
                ...(search.tripType === 'roundTrip' && returnLegVnd > 0
                  ? [[t('fare_return_estimate'), `${returnLegVnd.toLocaleString()}₫`] as [string, string]]
                  : []),
                [t('tax_fee'), `${tax.toLocaleString()}₫`],
                ['Phí dịch vụ', `${BASE_SERVICE_FEE_VND.toLocaleString()}₫`],
                ['Phụ phí ghế', `+${seatAddOn.toLocaleString()}₫`],
                [t('luggage'), t('free')],
              ].map(([l, v]) => (
                <View key={l} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{l}</Text>
                  <Text style={styles.priceValue}>{v}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>{totalVnd.toLocaleString()}₫</Text>
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
                <TextInput
                  style={[styles.input, errors[field.key as keyof typeof errors] ? styles.inputError : undefined]}
                  placeholder={t(field.placeholderKey)}
                  value={(form as any)[field.key]}
                  onChangeText={v => {
                    setForm({ ...form, [field.key]: v });
                    if (field.key === 'fullName' || field.key === 'email' || field.key === 'phone') {
                      setErrors((prev) => ({ ...prev, [field.key]: undefined }));
                    }
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {errors[field.key as keyof typeof errors] ? (
                  <Text style={styles.errorText}>{errors[field.key as keyof typeof errors]}</Text>
                ) : null}
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
                { key: 'credit_card' as const, iconName: 'creditCard'   as const, label: t('credit_card') },
                { key: 'bank_transfer' as const, iconName: 'bankTransfer' as const, label: t('bank_transfer') },
                { key: 'e_wallet' as const, iconName: 'eWallet'      as const, label: t('e_wallet') },
                { key: 'cod' as const, iconName: 'cod'          as const, label: t('cod') },
              ] as const).map((m, i) => (
                <TouchableOpacity key={i} style={[styles.payMethod, selectedPayment === m.key && styles.payMethodSelected]} onPress={() => setSelectedPayment(m.key)}>
                  <AppIcon name={m.iconName} size={22} color="#0064D2" />
                  <Text style={styles.payLabel}>{m.label}</Text>
                  <Text style={styles.payTick}>{selectedPayment === m.key ? '✓' : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="clipboard" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('booking_confirm')}</Text>
              </View>
              {[
                [t('flight_no'),       flight.code],
                [t('departure_date'),  search.departureDate],
                [t('seat'),            selectedSeat],
                [t('passenger'),       form.fullName || '—'],
                [t('total'),           `${totalVnd.toLocaleString()}₫`],
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
        <TouchableOpacity
          style={[styles.nextBtn, step === 0 && { flex: 1 }, submitting && { opacity: 0.85 }]}
          onPress={() => void handleNext()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? t('confirm_book') : `${t('next')} →`}</Text>
          )}
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
  legendWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:     { width: 10, height: 10, borderRadius: 5 },
  legendAvailable: { backgroundColor: '#F3F4F6' },
  legendBooked:  { backgroundColor: '#FEE2E2' },
  legendSelected:{ backgroundColor: '#0064D2' },
  legendText:    { fontSize: 11, color: '#6B7280' },
  cabinTitle:    { fontSize: 12, color: '#6B7280', fontWeight: '700', marginTop: 10, marginBottom: 6 },
  seatRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowLabel:      { width: 24, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  rowBlock:      { flexDirection: 'row', gap: 6 },
  aisle:         { width: 16 },
  businessSeat:  { borderColor: '#A78BFA', backgroundColor: '#F5F3FF' },
  extraLegroomSeat: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  selectedSeatInfo: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  selectedSeatText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  priceRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel:    { fontSize: 13, color: '#6B7280' },
  priceValue:    { fontSize: 13, color: '#1A1A2E', fontWeight: '500' },
  totalRow:      { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginTop: 4 },
  totalLabel:    { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  totalValue:    { fontSize: 17, fontWeight: '800', color: '#0064D2' },
  formGroup:     { marginBottom: 14 },
  inputLabel:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:         { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A1A2E', backgroundColor: '#F9FAFB' },
  inputError:    { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText:     { marginTop: 4, fontSize: 12, color: '#DC2626' },
  payMethod:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  payMethodSelected: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8 },
  payLabel:      { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  payTick:       { color: '#0064D2', fontSize: 16, fontWeight: '700' },
  bottomBar:     { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', elevation: 10 },
  backBtn:       { flex: 1, borderWidth: 1.5, borderColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backBtnText:   { color: '#0064D2', fontWeight: '700' },
  nextBtn:       { flex: 2, backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyWrap:     { flex: 1, padding: 24, justifyContent: 'center' },
  goSearchBtn:   { backgroundColor: '#0064D2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  goSearchText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
