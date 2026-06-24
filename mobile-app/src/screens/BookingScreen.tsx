import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import AppIcon from '../components/AppIcon';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { createBookingApi, holdSeatApi, listOccupiedSeatsApi, releaseSeatHoldApi } from '../services/bookingApi';
import { formatAuthError } from '../services/authApi';
import {
  isValidEmail,
  isValidFullName,
  isValidOptionalIdCard,
  isValidPhone,
} from '../utils/inputValidation';
import { formatPrice } from '../utils/price';

const BASE_SERVICE_FEE_VND = 50000;
const TAX_RATE = 0.1;
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
const TOTAL_SEAT_ROWS = 12;
const BUSINESS_ROWS = 2;
const BUSINESS_SEAT_FEE_VND = 500000;
const EXTRA_LEGROOM_ROWS = new Set([6, 7]);
const EXTRA_LEGROOM_SEAT_FEE_VND = 150000;
const BAGGAGE_PACKAGES = [
  { kg: 0, price: 0, labelKey: 'bag_carry' },
  { kg: 15, price: 160000, labelKey: 'bag_light' },
  { kg: 20, price: 220000, labelKey: 'bag_popular' },
  { kg: 25, price: 280000, labelKey: 'bag_travel' },
  { kg: 30, price: 350000, labelKey: 'bag_long' },
  { kg: 40, price: 480000, labelKey: 'bag_max' },
] as const;

const SEAT_UNAVAILABLE_MESSAGE = 'Ghế này đã được đặt hoặc đang được giữ. Vui lòng chọn ghế khác.';

function isSeatUnavailableError(message: string) {
  const text = message.toLowerCase();
  return text.includes('seat') || text.includes('ghế') || text.includes('giu') || text.includes('giữ') || text.includes('đặt');
}

const BOOKING_TEXT = {
  vi: {
    available: 'Ghế trống',
    booked: 'Đã đặt',
    selected: 'Đang chọn',
    businessCabin: 'Hạng thương gia',
    economyCabin: 'Phổ thông',
    selectedSeat: 'Đang chọn',
    seatFee: 'Phụ phí ghế',
    serviceFee: 'Phí dịch vụ',
    baggageTitle: 'Chọn hành lý ký gửi',
    baggageHint: 'Chọn gói hành lý cho booking này. Mục Hành lý trên trang chủ dùng để mua thêm hoặc cập nhật cho booking chưa thanh toán.',
    bag_carry: 'Chỉ xách tay',
    bag_light: 'Gọn nhẹ',
    bag_popular: 'Phổ biến',
    bag_travel: 'Du lịch',
    bag_long: 'Dài ngày',
    bag_max: 'Tối đa',
    emailRequired: 'Vui lòng nhập email.',
    phoneRequired: 'Vui lòng nhập số điện thoại.',
    invalidEmail: 'Email không hợp lệ. Vui lòng dùng địa chỉ @gmail.com.',
    invalidFullName: 'Họ tên không hợp lệ.',
    invalidPhone: 'Số điện thoại không hợp lệ.',
    invalidIdCard: 'CCCD hoặc hộ chiếu không hợp lệ.',
  },
  en: {
    available: 'Available',
    booked: 'Booked',
    selected: 'Selected',
    businessCabin: 'Business class',
    economyCabin: 'Economy',
    selectedSeat: 'Selected',
    seatFee: 'Seat surcharge',
    serviceFee: 'Service fee',
    baggageTitle: 'Choose checked baggage',
    baggageHint: 'Choose baggage for this booking. Use Baggage on the home screen to add or update baggage for unpaid bookings.',
    bag_carry: 'Carry-on only',
    bag_light: 'Light',
    bag_popular: 'Popular',
    bag_travel: 'Travel',
    bag_long: 'Long trip',
    bag_max: 'Maximum',
    emailRequired: 'Please enter your email.',
    phoneRequired: 'Please enter your phone number.',
    invalidEmail: 'Invalid email. Please use a @gmail.com address.',
    invalidFullName: 'Invalid full name.',
    invalidPhone: 'Invalid phone number.',
    invalidIdCard: 'Invalid ID card or passport.',
  },
  ko: {
    available: '빈 좌석',
    booked: '예약됨',
    selected: '선택됨',
    businessCabin: '비즈니스석',
    economyCabin: '일반석',
    selectedSeat: '선택 좌석',
    seatFee: '좌석 추가요금',
    serviceFee: '서비스 수수료',
    baggageTitle: '위탁 수하물 선택',
    baggageHint: '이 예약에 적용할 수하물 패키지를 선택하세요. 홈의 수하물 메뉴는 결제 전 예약의 수하물을 추가 또는 변경할 때 사용합니다.',
    bag_carry: '기내 수하물만',
    bag_light: '라이트',
    bag_popular: '인기',
    bag_travel: '여행',
    bag_long: '장기 여행',
    bag_max: '최대',
    emailRequired: '이메일을 입력하세요.',
    phoneRequired: '전화번호를 입력하세요.',
    invalidEmail: '올바른 이메일이 아닙니다. @gmail.com 주소를 사용하세요.',
    invalidFullName: '올바른 이름이 아닙니다.',
    invalidPhone: '올바른 전화번호가 아닙니다.',
    invalidIdCard: '신분증 또는 여권 번호가 올바르지 않습니다.',
  },
  ja: {
    available: '空席',
    booked: '予約済み',
    selected: '選択中',
    businessCabin: 'ビジネスクラス',
    economyCabin: 'エコノミー',
    selectedSeat: '選択中',
    seatFee: '座席追加料金',
    serviceFee: 'サービス料',
    baggageTitle: '受託手荷物を選択',
    baggageHint: 'この予約の手荷物パッケージを選択します。ホームの手荷物メニューは、未払い予約の手荷物を追加または更新するために使います。',
    bag_carry: '機内持込のみ',
    bag_light: 'ライト',
    bag_popular: '人気',
    bag_travel: '旅行',
    bag_long: '長期旅行',
    bag_max: '最大',
    emailRequired: 'メールアドレスを入力してください。',
    phoneRequired: '電話番号を入力してください。',
    invalidEmail: 'メールアドレスが無効です。@gmail.com のアドレスを使用してください。',
    invalidFullName: '氏名が無効です。',
    invalidPhone: '電話番号が無効です。',
    invalidIdCard: '身分証またはパスポート番号が無効です。',
  },
  zh: {
    available: '可选座位',
    booked: '已预订',
    selected: '已选择',
    businessCabin: '商务舱',
    economyCabin: '经济舱',
    selectedSeat: '已选择',
    seatFee: '座位附加费',
    serviceFee: '服务费',
    baggageTitle: '选择托运行李',
    baggageHint: '为本次预订选择行李套餐。首页的行李功能用于为未付款预订添加或更新行李。',
    bag_carry: '仅随身行李',
    bag_light: '轻量',
    bag_popular: '热门',
    bag_travel: '旅行',
    bag_long: '长途',
    bag_max: '最大',
    emailRequired: '请输入电子邮件。',
    phoneRequired: '请输入手机号码。',
    invalidEmail: '电子邮件无效。请使用 @gmail.com 地址。',
    invalidFullName: '姓名无效。',
    invalidPhone: '手机号码无效。',
    invalidIdCard: '身份证或护照号码无效。',
  },
  th: {
    available: 'ที่นั่งว่าง',
    booked: 'จองแล้ว',
    selected: 'เลือกอยู่',
    businessCabin: 'ชั้นธุรกิจ',
    economyCabin: 'ชั้นประหยัด',
    selectedSeat: 'เลือกอยู่',
    seatFee: 'ค่าที่นั่งเพิ่มเติม',
    serviceFee: 'ค่าบริการ',
    baggageTitle: 'เลือกสัมภาระโหลดใต้ท้องเครื่อง',
    baggageHint: 'เลือกแพ็กเกจสัมภาระสำหรับการจองนี้ เมนูสัมภาระในหน้าหลักใช้เพิ่มหรือแก้ไขสัมภาระสำหรับการจองที่ยังไม่ชำระเงิน',
    bag_carry: 'ถือขึ้นเครื่องเท่านั้น',
    bag_light: 'เบา',
    bag_popular: 'ยอดนิยม',
    bag_travel: 'เดินทาง',
    bag_long: 'ทริปยาว',
    bag_max: 'สูงสุด',
    emailRequired: 'กรุณากรอกอีเมล',
    phoneRequired: 'กรุณากรอกเบอร์โทรศัพท์',
    invalidEmail: 'อีเมลไม่ถูกต้อง กรุณาใช้ที่อยู่ @gmail.com',
    invalidFullName: 'ชื่อ-นามสกุลไม่ถูกต้อง',
    invalidPhone: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
    invalidIdCard: 'เลขบัตรหรือพาสปอร์ตไม่ถูกต้อง',
  },
  es: {
    available: 'Disponible',
    booked: 'Reservado',
    selected: 'Seleccionado',
    businessCabin: 'Clase ejecutiva',
    economyCabin: 'Económica',
    selectedSeat: 'Seleccionado',
    seatFee: 'Recargo de asiento',
    serviceFee: 'Cargo de servicio',
    baggageTitle: 'Elegir equipaje facturado',
    baggageHint: 'Elige equipaje para esta reserva. Usa Equipaje en la pantalla principal para agregar o actualizar equipaje en reservas pendientes de pago.',
    bag_carry: 'Solo cabina',
    bag_light: 'Ligero',
    bag_popular: 'Popular',
    bag_travel: 'Viaje',
    bag_long: 'Viaje largo',
    bag_max: 'Máximo',
    emailRequired: 'Ingresa tu correo electrónico.',
    phoneRequired: 'Ingresa tu número de teléfono.',
    invalidEmail: 'Correo inválido. Usa una dirección @gmail.com.',
    invalidFullName: 'Nombre completo inválido.',
    invalidPhone: 'Número de teléfono inválido.',
    invalidIdCard: 'DNI o pasaporte inválido.',
  },
} as const;

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

function generateSeatMap(occupiedSeats: Set<string>, selectedSeats: Set<string>): SeatItem[] {
  const seats: SeatItem[] = [];
  for (let row = 1; row <= TOTAL_SEAT_ROWS; row++) {
    const isBusiness = row <= BUSINESS_ROWS;
    const classType: CabinClass = isBusiness ? 'business' : 'economy';
    const addOn = isBusiness
      ? BUSINESS_SEAT_FEE_VND
      : EXTRA_LEGROOM_ROWS.has(row)
        ? EXTRA_LEGROOM_SEAT_FEE_VND
        : 0;
    const extra = EXTRA_LEGROOM_ROWS.has(row);

    for (let i = 0; i < 3; i++) {
      const letter = SEAT_LETTERS[i];
      const id = `${row}${letter}`;
      seats.push({
        id,
        row,
        letter,
        side: 'left',
        classType,
        status: occupiedSeats.has(id) && !selectedSeats.has(id) ? 'booked' : 'available',
        extra,
        addOn,
      });
    }

    for (let i = 3; i < SEAT_LETTERS.length; i++) {
      const letter = SEAT_LETTERS[i];
      const id = `${row}${letter}`;
      seats.push({
        id,
        row,
        letter,
        side: 'right',
        classType,
        status: occupiedSeats.has(id) && !selectedSeats.has(id) ? 'booked' : 'available',
        extra,
        addOn,
      });
    }
  }
  return seats;
}

export default function BookingScreen() {
  const { t, language, currency } = useLanguage();
  const search = useSearch();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const selectedSeatSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const seatMap = useMemo(() => generateSeatMap(occupiedSeats, selectedSeatSet), [occupiedSeats, selectedSeatSet]);
  const [holdingSeatId, setHoldingSeatId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'credit_card' | 'bank_transfer' | 'e_wallet' | 'cod'>('credit_card');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', idCard: '' });
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const selectedSeatsRef = useRef<string[]>([]);
  const flightIdRef = useRef<number | null>(null);
  const bt = (key: keyof typeof BOOKING_TEXT.en) => BOOKING_TEXT[language]?.[key] ?? BOOKING_TEXT.en[key];
  const money = (valueVnd: number) => formatPrice(valueVnd, currency);

  const flight = search.selectedFlight;

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    const nextFlightId = flight ? parseInt(flight.id, 10) : NaN;
    flightIdRef.current = Number.isNaN(nextFlightId) ? null : nextFlightId;
  }, [flight?.id]);

  const refreshOccupiedSeats = useCallback(async () => {
    const flightId = flight ? parseInt(flight.id, 10) : NaN;
    if (!flight || Number.isNaN(flightId)) {
      setOccupiedSeats(new Set());
      setSelectedSeats([]);
      return;
    }
    try {
      const seats = await listOccupiedSeatsApi(flightId);
      setOccupiedSeats(new Set(seats));
    } catch {
      setOccupiedSeats(new Set());
    }
  }, [flight?.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await refreshOccupiedSeats();
    };
    void load();
    const pollId = setInterval(() => {
      void load();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [refreshOccupiedSeats]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [flight?.id]);

  const releaseHeldSeats = useCallback(() => {
    const flightId = flightIdRef.current;
    const seats = selectedSeatsRef.current;
    if (!flightId || seats.length === 0) return;

    selectedSeatsRef.current = [];
    setSelectedSeats([]);
    seats.forEach((seatNumber) => {
      void releaseSeatHoldApi({ flightId, seatNumber }).catch(() => {});
    });
    void refreshOccupiedSeats();
  }, [refreshOccupiedSeats]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        releaseHeldSeats();
      };
    }, [releaseHeldSeats]),
  );

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.fullName,
      email: f.email || user.email,
      phone: f.phone || (user.phone ?? ''),
    }));
  }, [user]);

  useEffect(() => {
    setSelectedSeats((prev) => prev.slice(0, search.adults));
  }, [search.adults]);

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

  const passengerCount = search.adults;
  const outboundVnd = flight.priceVND;
  const returnLegVnd = search.tripType === 'roundTrip' ? search.roundTripReturnMinVnd ?? 0 : 0;
  const baseFarePerPassengerVnd = outboundVnd + returnLegVnd;
  const baseFareVnd = baseFarePerPassengerVnd * passengerCount;
  const selectedSeatMetas = selectedSeats
    .map((seatId) => seatMap.find((seat) => seat.id === seatId))
    .filter((seat): seat is SeatItem => !!seat);
  const seatAddOn = selectedSeatMetas.reduce((sum, seat) => sum + seat.addOn, 0);
  const baggageAddOn = search.baggageFeeVnd;
  const tax = Math.round(baseFareVnd * TAX_RATE);
  const serviceFeeVnd = BASE_SERVICE_FEE_VND * passengerCount;
  const totalVnd = baseFareVnd + tax + serviceFeeVnd + seatAddOn + baggageAddOn;
  const selectedCabinTypes = new Set(selectedSeatMetas.map((seat) => seat.classType));
  const cabinLabel = selectedCabinTypes.size === 1
    ? selectedCabinTypes.has('business')
      ? t('business_class')
      : t('economy')
    : selectedCabinTypes.size > 1
      ? `${t('business_class')} / ${t('economy')}`
      : flight.premium
        ? t('business_class')
        : t('economy');

  const validatePassengerForm = () => {
    const nextErrors: { fullName?: string; email?: string; phone?: string } = {};

    if (!isValidFullName(form.fullName)) {
      nextErrors.fullName = bt('invalidFullName');
    }

    if (!form.email.trim()) {
      nextErrors.email = bt('emailRequired');
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = bt('invalidEmail');
    }

    if (!form.phone.trim()) {
      nextErrors.phone = bt('phoneRequired');
    } else if (!isValidPhone(form.phone)) {
      nextErrors.phone = bt('invalidPhone');
    }

    if (!isValidOptionalIdCard(form.idCard)) {
      Alert.alert(t('confirm'), bt('invalidIdCard'));
      return false;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const toggleSeat = async (seat: SeatItem) => {
    const wasSelected = selectedSeats.includes(seat.id);
    if (seat.status === 'booked' && !wasSelected) {
      Alert.alert(t('confirm'), SEAT_UNAVAILABLE_MESSAGE);
      return;
    }
    if (!user) {
      Alert.alert(t('login_title'), t('booking_need_login'));
      return;
    }
    const flightId = parseInt(flight.id, 10);
    if (Number.isNaN(flightId)) return;

    setHoldingSeatId(seat.id);
    try {
      if (wasSelected) {
        await releaseSeatHoldApi({ flightId, seatNumber: seat.id });
        setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
        await refreshOccupiedSeats();
        return;
      }

      if (selectedSeats.length >= passengerCount) {
        if (passengerCount === 1) {
          const previousSeat = selectedSeats[0];
          await holdSeatApi({ flightId, seatNumber: seat.id });
          if (previousSeat) {
            await releaseSeatHoldApi({ flightId, seatNumber: previousSeat });
          }
          setSelectedSeats([seat.id]);
          await refreshOccupiedSeats();
          return;
        }
        Alert.alert(t('confirm'), `${t('choose_seat')}: ${passengerCount}`);
        return;
      }

      await holdSeatApi({ flightId, seatNumber: seat.id });
      setSelectedSeats((prev) => {
        if (prev.includes(seat.id)) return prev;
        return [...prev, seat.id];
      });
      await refreshOccupiedSeats();
    } catch (e) {
      const message = formatAuthError(e);
      Alert.alert(t('confirm'), isSeatUnavailableError(message) ? SEAT_UNAVAILABLE_MESSAGE : message);
      try {
        const seats = await listOccupiedSeatsApi(flightId);
        setOccupiedSeats(new Set(seats));
      } catch {}
    } finally {
      setHoldingSeatId(null);
    }
  };

  const selectBaggage = (kg: number, fee: number) => {
    search.setBaggageKg(kg);
    search.setBaggageFeeVnd(fee);
  };

  const handleNext = async () => {
    if (step === 0 && selectedSeats.length !== passengerCount) {
      Alert.alert(t('confirm'), `${t('choose_seat')}: ${passengerCount}`);
      return;
    }

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
        seatNumber: selectedSeats.join(','),
        passengerName: form.fullName.trim(),
        passengerEmail: form.email.trim(),
        passengerPhone: form.phone.trim() || undefined,
        passengerIdCard: form.idCard.trim() || undefined,
        passengerCount,
        tripType: search.tripType,
        paymentMethod: selectedPayment,
        baggageKg: search.baggageKg,
        baggageFeeVnd: baggageAddOn,
        totalPriceVnd: totalVnd,
      });
      search.setSelectedFlight(null);
      search.setBaggageKg(0);
      search.setBaggageFeeVnd(0);
      selectedSeatsRef.current = [];
      setSelectedSeats([]);
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
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendAvailable]} /><Text style={styles.legendText}>{bt('available')}</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendBooked]} /><Text style={styles.legendText}>{bt('booked')}</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, styles.legendSelected]} /><Text style={styles.legendText}>{bt('selected')}</Text></View>
              </View>

              <Text style={styles.cabinTitle}>{bt('businessCabin')}</Text>
              {Array.from({ length: BUSINESS_ROWS }, (_, index) => index + 1).map((rowNumber) => (
                <View key={`biz-${rowNumber}`} style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowNumber}</Text>
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'left')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => toggleSeat(seat)}
                          disabled={seat.status === 'booked' || holdingSeatId !== null}
                          style={[
                            styles.seat,
                            styles.businessSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeats.includes(seat.id) && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeats.includes(seat.id) && styles.seatTextSelected]}>{seat.id}</Text>
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
                          onPress={() => toggleSeat(seat)}
                          disabled={seat.status === 'booked' || holdingSeatId !== null}
                          style={[
                            styles.seat,
                            styles.businessSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeats.includes(seat.id) && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeats.includes(seat.id) && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ))}

              <Text style={styles.cabinTitle}>{bt('economyCabin')}</Text>
              {Array.from({ length: TOTAL_SEAT_ROWS - BUSINESS_ROWS }, (_, index) => index + BUSINESS_ROWS + 1).map((rowNumber) => (
                <View key={`eco-${rowNumber}`} style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowNumber}</Text>
                  <View style={styles.rowBlock}>
                    {seatMap
                      .filter((seat) => seat.row === rowNumber && seat.side === 'left')
                      .map((seat) => (
                        <TouchableOpacity
                          key={seat.id}
                          onPress={() => toggleSeat(seat)}
                          disabled={seat.status === 'booked' || holdingSeatId !== null}
                          style={[
                            styles.seat,
                            seat.extra && styles.extraLegroomSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeats.includes(seat.id) && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeats.includes(seat.id) && styles.seatTextSelected]}>{seat.id}</Text>
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
                          onPress={() => toggleSeat(seat)}
                          disabled={seat.status === 'booked' || holdingSeatId !== null}
                          style={[
                            styles.seat,
                            seat.extra && styles.extraLegroomSeat,
                            seat.status === 'booked' && styles.seatTaken,
                            selectedSeats.includes(seat.id) && styles.seatSelected,
                          ]}
                        >
                          <Text style={[styles.seatText, selectedSeats.includes(seat.id) && styles.seatTextSelected]}>{seat.id}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ))}

              <View style={styles.selectedSeatInfo}>
                <Text style={styles.selectedSeatText}>{bt('selectedSeat')}: {selectedSeats.join(', ') || '—'}</Text>
                <Text style={styles.selectedSeatText}>{bt('seatFee')}: +{money(seatAddOn)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="luggage" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {bt('baggageTitle')}</Text>
              </View>
              <Text style={styles.baggageHint}>{bt('baggageHint')}</Text>
              <View style={styles.baggageGrid}>
                {BAGGAGE_PACKAGES.map((item) => {
                  const active = search.baggageKg === item.kg;
                  return (
                    <TouchableOpacity
                      key={item.kg}
                      style={[styles.baggageOption, active && styles.baggageOptionActive]}
                      onPress={() => selectBaggage(item.kg, item.price)}
                    >
                      <Text style={[styles.baggageKg, active && styles.baggageTextActive]}>
                        {item.kg === 0 ? '0 kg' : `${item.kg} kg`}
                      </Text>
                      <Text style={[styles.baggageLabel, active && styles.baggageTextActive]}>{bt(item.labelKey)}</Text>
                      <Text style={[styles.baggagePrice, active && styles.baggageTextActive]}>
                        {item.price > 0 ? money(item.price) : t('free')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <AppIcon name="price" size={18} color="#0064D2" />
                <Text style={styles.cardTitle}> {t('price_summary')}</Text>
              </View>
              {[
                [t('fare_outbound'), money(outboundVnd * passengerCount)],
                ...(search.tripType === 'roundTrip' && returnLegVnd > 0
                  ? [[t('fare_return_estimate'), money(returnLegVnd * passengerCount)] as [string, string]]
                  : []),
                [t('tax_fee'), money(tax)],
                [bt('serviceFee'), money(serviceFeeVnd)],
                [bt('seatFee'), `+${money(seatAddOn)}`],
                [t('luggage'), search.baggageKg > 0 ? `${search.baggageKg} kg - ${money(baggageAddOn)}` : t('free')],
              ].map(([l, v]) => (
                <View key={l} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{l}</Text>
                  <Text style={styles.priceValue}>{v}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>{money(totalVnd)}</Text>
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
                [t('seat'),            selectedSeats.join(', ') || '—'],
                [t('passenger'),       form.fullName || '—'],
                [t('total'),           money(totalVnd)],
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
  baggageHint:   { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 10 },
  baggageGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baggageOption: { width: '31.5%', minHeight: 92, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', padding: 10, justifyContent: 'space-between' },
  baggageOptionActive: { backgroundColor: '#0064D2', borderColor: '#0064D2' },
  baggageKg:     { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  baggageLabel:  { fontSize: 11, color: '#6B7280', marginTop: 4 },
  baggagePrice:  { fontSize: 11, fontWeight: '700', color: '#0064D2', marginTop: 6 },
  baggageTextActive: { color: '#fff' },
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
