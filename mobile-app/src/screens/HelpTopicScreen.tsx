import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { getHelpTopic, type HelpTopicId } from '../content/helpTopics';
import AppIcon from '../components/AppIcon';
import { checkInBookingApi, listMyBookingsApi, updateBookingBaggageApi, type BookingDto } from '../services/bookingApi';
import { formatAuthError } from '../services/authApi';
import { createSupportTicketApi } from '../services/supportTicketApi';

const BAGGAGE_PACKAGES = [
  { kg: 0, price: 0, labelKey: 'bag_pkg_carry' },
  { kg: 15, price: 160000, labelKey: 'bag_pkg_light' },
  { kg: 20, price: 220000, labelKey: 'bag_pkg_popular' },
  { kg: 25, price: 280000, labelKey: 'bag_pkg_trip' },
  { kg: 30, price: 350000, labelKey: 'bag_pkg_long' },
  { kg: 40, price: 480000, labelKey: 'bag_pkg_max' },
];

const BAGGAGE_RULE_KEYS = ['bag_rule_carry', 'bag_rule_liquid', 'bag_rule_battery', 'bag_rule_drop'];

const CHECKIN_STEP_KEYS = ['checkin_step_1', 'checkin_step_2', 'checkin_step_3'];

const SUPPORT_CATEGORIES = [
  { id: 'change', labelKey: 'support_cat_change', hintKey: 'support_cat_change_hint' },
  { id: 'refund', labelKey: 'support_cat_refund', hintKey: 'support_cat_refund_hint' },
  { id: 'payment', labelKey: 'support_cat_payment', hintKey: 'support_cat_payment_hint' },
  { id: 'baggage', labelKey: 'support_cat_baggage', hintKey: 'support_cat_baggage_hint' },
];

const SUPPORT_FAQ = [
  { qKey: 'faq_payment_q', aKey: 'faq_payment_a' },
  { qKey: 'faq_change_q', aKey: 'faq_change_a' },
  { qKey: 'faq_baggage_q', aKey: 'faq_baggage_a' },
];

const HELP_EN = {
  bag_pkg_carry: 'Carry-on only', bag_pkg_light: 'Light', bag_pkg_popular: 'Popular', bag_pkg_trip: 'Travel', bag_pkg_long: 'Long trip', bag_pkg_max: 'Maximum',
  bag_rule_carry: 'Carry-on: up to 7 kg, prioritize personal items and documents.',
  bag_rule_liquid: 'Liquids in carry-on should be in small containers up to 100 ml.',
  bag_rule_battery: 'Power banks and lithium-battery devices should be carried in cabin baggage.',
  bag_rule_drop: 'Checked baggage requires bag drop before the counter closes.',
  baggage_title: 'Manage baggage', baggage_sub: 'Choose checked baggage, estimate fees, and review airport packing rules.',
  free: 'Free', total: 'Total',
  choose_bag_package: 'Choose checked baggage', estimate_fee: 'Estimated fee', baggage_package: 'Baggage package',
  carry_only: 'Carry-on only', checked_bag: 'checked baggage', package_fee: 'Package fee', handling_fee: 'Handling fee',
  apply_current_booking: 'Apply to this booking flow', buy_for_existing: 'Buy for an existing ticket',
  loading_bookings: 'Loading bookings...', currently_has: 'currently has', buy: 'Buy', no_booking_baggage: 'No booking in your account for baggage purchase.',
  book_first: 'Book a flight first', preflight_checklist: 'Pre-flight checklist', find_baggage_flight: 'Find a flight with suitable baggage',
  applied_title: 'Applied to this booking flow', applied_msg: 'The {kg} kg package will be added to the total when you confirm booking.',
  baggage_updated_title: 'Baggage updated', baggage_update_failed: 'Could not update baggage',
  checkin_step_1: 'Enter booking code and passenger name exactly as on the ticket.',
  checkin_step_2: 'Review passenger, flight, and checked baggage details.',
  checkin_step_3: 'Confirm check-in and save the boarding pass on your phone.',
  checkin_title: 'Online check-in', checkin_sub: 'Enter PNR, verify passenger, and create an in-app boarding pass.',
  open_checkin: 'Open check-in', pnr_label: 'Booking code / PNR', pnr_placeholder: 'e.g. SKY123',
  last_name_label: 'Last name', last_name_placeholder: 'e.g. Nguyen', missing_info_title: 'Missing information',
  missing_checkin_msg: 'Please enter booking code and passenger last name.', checkin_failed: 'Check-in failed',
  checkin_now: 'Check in now', checking_in: 'Checking in...', account_bookings: 'Bookings in your account',
  no_booking_checkin: 'No booking available for check-in.', process: 'Process', checked_in: 'CHECKED IN',
  flight: 'Flight', boarding: 'Boarding', seat_label: 'Seat', boarding_note: 'If you have checked baggage, please go to bag drop before the counter closes.',
  support_title: 'Support center', support_sub: 'Attach a booking, select the right issue, and send a request for faster handling.',
  ask_ai: 'Ask AI', hotline: 'Hotline', email: 'Email', choose_issue: 'Choose issue',
  support_cat_change: 'Change flight', support_cat_change_hint: 'Change date, time, or route.',
  support_cat_refund: 'Refund/cancel', support_cat_refund_hint: 'Check refund conditions and fees.',
  support_cat_payment: 'Payment', support_cat_payment_hint: 'Payment errors, receipts, ticket status.',
  support_cat_baggage: 'Baggage', support_cat_baggage_hint: 'Buy more, overweight, special items.',
  attach_booking: 'Attach related booking', selected: 'Selected', select: 'Select',
  no_booking_support: 'You can send a request without PNR, or book a flight and attach it later.',
  issue_desc: 'Issue description', issue_placeholder: 'Describe what you need help with...',
  send_support: 'Send support request', faq: 'Frequently asked questions',
  email_body: 'Describe your issue here.', email_failed_title: 'Could not open email', hotline_title: 'SkyBook hotline',
  open_external: 'Open app', call_now: 'Call now', cancel: 'Cancel',
  sending_support: 'Sending request...', support_failed_title: 'Could not create support request',
  missing_message_title: 'Missing description', missing_message_msg: 'Please briefly describe the issue you need help with.',
  ticket_created_title: 'Support request created', ticket_code: 'Case code', issue_group: 'Group',
  faq_payment_q: 'I paid but my ticket is still pending payment.', faq_payment_a: 'Please check again after a few minutes. If it still fails, send a request with PNR and payment method.',
  faq_change_q: 'Can I change the flight date after booking?', faq_change_a: 'Yes if the airline and fare rules allow it. Fees depend on fare conditions and price difference.',
  faq_baggage_q: 'Where can I buy baggage after booking?', faq_baggage_a: 'Go to Utilities > Baggage, choose a kg package, and apply it to an existing booking.',
};

const HELP_TEXT: Record<string, Partial<typeof HELP_EN>> = {
  en: HELP_EN,
  vi: {
    bag_pkg_carry: 'Chỉ xách tay', bag_pkg_light: 'Gọn nhẹ', bag_pkg_popular: 'Phổ biến', bag_pkg_trip: 'Du lịch', bag_pkg_long: 'Dài ngày', bag_pkg_max: 'Tối đa',
    baggage_title: 'Quản lý hành lý', baggage_sub: 'Chọn gói ký gửi, xem phí tạm tính và kiểm tra quy định trước khi ra sân bay.',
    free: 'Miễn phí', total: 'Tổng cộng',
    choose_bag_package: 'Chọn gói ký gửi', estimate_fee: 'Tạm tính phí', baggage_package: 'Gói hành lý',
    carry_only: 'Chỉ xách tay', checked_bag: 'hành lý ký gửi', package_fee: 'Phí gói', handling_fee: 'Phí xử lý',
    apply_current_booking: 'Áp dụng cho lần đặt vé này', buy_for_existing: 'Mua thêm cho vé đã đặt',
    loading_bookings: 'Đang tải booking...', currently_has: 'hiện có', buy: 'Mua', no_booking_baggage: 'Chưa có booking trong tài khoản để mua thêm hành lý.',
    book_first: 'Đặt chuyến bay trước', preflight_checklist: 'Checklist trước khi bay', find_baggage_flight: 'Tìm chuyến bay có hành lý phù hợp',
    applied_title: 'Đã áp dụng cho lần đặt vé này', applied_msg: 'Gói {kg} kg sẽ được cộng vào tổng tiền khi bạn xác nhận đặt vé.',
    baggage_updated_title: 'Đã cập nhật hành lý', baggage_update_failed: 'Không cập nhật được hành lý',
    bag_rule_carry: 'Xách tay: tối đa 7 kg, ưu tiên vật dụng cá nhân và giấy tờ.',
    bag_rule_liquid: 'Chất lỏng trong hành lý xách tay nên chia chai nhỏ tối đa 100 ml.',
    bag_rule_battery: 'Pin sạc dự phòng và thiết bị có pin lithium nên mang trong hành lý xách tay.',
    bag_rule_drop: 'Hành lý ký gửi cần có mặt tại quầy gửi trước giờ đóng quầy.',
    checkin_title: 'Check-in trực tuyến', checkin_sub: 'Nhập PNR, xác thực hành khách và tạo boarding pass trong app.',
    open_checkin: 'Mở check-in', pnr_label: 'Mã đặt chỗ / PNR', pnr_placeholder: 'VD: SKY123',
    last_name_label: 'Họ / tên cuối', last_name_placeholder: 'VD: Nguyen', missing_info_title: 'Thiếu thông tin',
    missing_checkin_msg: 'Vui lòng nhập mã đặt chỗ và họ/tên cuối hành khách.', checkin_failed: 'Check-in không thành công',
    checkin_now: 'Check-in ngay', checking_in: 'Đang check-in...', account_bookings: 'Booking trong tài khoản',
    no_booking_checkin: 'Chưa có booking để check-in.', process: 'Quy trình', checked_in: 'ĐÃ CHECK-IN',
    checkin_step_1: 'Nhập mã đặt chỗ và họ tên đúng như trên vé.',
    checkin_step_2: 'Kiểm tra hành khách, chuyến bay và hành lý ký gửi.',
    checkin_step_3: 'Xác nhận check-in và lưu boarding pass trên điện thoại.',
    flight: 'Chuyến bay', boarding: 'Lên máy bay', seat_label: 'Ghế', boarding_note: 'Nếu có hành lý ký gửi, vui lòng đến quầy gửi hành lý trước giờ đóng quầy.',
    support_title: 'Trung tâm hỗ trợ', support_sub: 'Gắn booking, chọn đúng vấn đề và gửi yêu cầu để đội hỗ trợ xử lý nhanh hơn.',
    ask_ai: 'Hỏi AI', hotline: 'Hotline', email: 'Email', choose_issue: 'Chọn vấn đề',
    support_cat_change: 'Đổi lịch bay', support_cat_change_hint: 'Đổi ngày, đổi giờ, đổi hành trình.',
    support_cat_refund: 'Hoàn/hủy vé', support_cat_refund_hint: 'Kiểm tra điều kiện hoàn vé và phí.',
    support_cat_payment: 'Thanh toán', support_cat_payment_hint: 'Lỗi thanh toán, biên lai, trạng thái vé.',
    support_cat_baggage: 'Hành lý', support_cat_baggage_hint: 'Mua thêm, quá kg, vật phẩm đặc biệt.',
    attach_booking: 'Gắn booking liên quan', selected: 'Đã chọn', select: 'Chọn',
    no_booking_support: 'Bạn có thể gửi yêu cầu không kèm PNR, hoặc đặt vé trước rồi gắn booking sau.',
    issue_desc: 'Mô tả vấn đề', issue_placeholder: 'Nhập nội dung cần hỗ trợ...',
    send_support: 'Gửi yêu cầu hỗ trợ', faq: 'Câu hỏi thường gặp',
    email_body: 'Mô tả vấn đề của bạn tại đây.', email_failed_title: 'Không mở được email', hotline_title: 'Hotline SkyBook',
    open_external: 'Mở ứng dụng', call_now: 'Gọi ngay', cancel: 'Hủy',
    sending_support: 'Đang gửi yêu cầu...', support_failed_title: 'Không tạo được yêu cầu hỗ trợ',
    missing_message_title: 'Thiếu nội dung', missing_message_msg: 'Vui lòng mô tả ngắn gọn vấn đề cần hỗ trợ.',
    ticket_created_title: 'Đã tạo yêu cầu hỗ trợ', ticket_code: 'Mã yêu cầu', issue_group: 'Nhóm',
    faq_payment_q: 'Tôi đã thanh toán nhưng vé vẫn chờ thanh toán?', faq_payment_a: 'Hãy kiểm tra lại sau vài phút. Nếu vẫn lỗi, gửi yêu cầu kèm PNR và phương thức thanh toán.',
    faq_change_q: 'Có thể đổi ngày bay sau khi đặt không?', faq_change_a: 'Có thể nếu hãng và hạng vé cho phép. Phí đổi phụ thuộc điều kiện vé và chênh lệch giá.',
    faq_baggage_q: 'Mua thêm hành lý sau khi đặt vé ở đâu?', faq_baggage_a: 'Vào Tiện ích > Hành lý, chọn gói kg và áp dụng vào booking đã đặt.',
  },
};

function helpText(language: string, key: keyof typeof HELP_EN) {
  return HELP_TEXT[language]?.[key] ?? HELP_EN[key] ?? key;
}

function money(v: number) {
  return `${v.toLocaleString()}d`;
}

function flightTime(iso?: string) {
  const t = iso?.split('T')[1] ?? '';
  return t.length >= 5 ? t.slice(0, 5) : '--:--';
}

function lastNameOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export default function HelpTopicScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, language } = useLanguage();
  const topic = (route.params?.topic ?? 'support') as HelpTopicId;
  const content = getHelpTopic(language, topic);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={16} color="#fff" />
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{content.title}</Text>
      </View>

      {topic === 'baggage' ? (
        <BaggageFeature navigation={navigation} />
      ) : topic === 'checkin' ? (
        <CheckinFeature navigation={navigation} />
      ) : topic === 'support' ? (
        <SupportFeature navigation={navigation} />
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {content.paragraphs.map((p, i) => (
            <Text key={i} style={styles.p}>
              {p}
            </Text>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function BaggageFeature({ navigation }: { navigation: any }) {
  const search = useSearch();
  const { language } = useLanguage();
  const h = (key: keyof typeof HELP_EN) => helpText(language, key);
  const [selectedKg, setSelectedKg] = useState(20);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const pack = BAGGAGE_PACKAGES.find((x) => x.kg === selectedKg) ?? BAGGAGE_PACKAGES[0];
  const serviceFee = pack.kg > 0 ? 30000 : 0;
  const total = pack.price + serviceFee;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listMyBookingsApi()
      .then((rows) => {
        if (alive) setBookings(rows);
      })
      .catch(() => {
        if (alive) setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const confirmBaggage = () => {
    search.setBaggageKg(pack.kg);
    search.setBaggageFeeVnd(total);
    Alert.alert(h('applied_title'), h('applied_msg').replace('{kg}', String(pack.kg)));
  };

  const updateExistingBooking = async (booking: BookingDto) => {
    setUpdatingId(booking.id);
    try {
      const updated = await updateBookingBaggageApi(booking.id, { baggageKg: pack.kg, baggageFeeVnd: total });
      setBookings((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      Alert.alert(h('baggage_updated_title'), `${updated.pnr}: ${pack.kg} kg - ${money(total)}`);
    } catch (e) {
      Alert.alert(h('baggage_update_failed'), formatAuthError(e));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.featureHero}>
        <View style={styles.heroIcon}>
          <AppIcon name="luggage" size={28} color="#0064D2" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{h('baggage_title')}</Text>
          <Text style={styles.heroSub}>{h('baggage_sub')}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <AppIcon name="price" size={18} color="#0064D2" />
          <Text style={styles.cardTitle}> {h('choose_bag_package')}</Text>
        </View>
        <View style={styles.packageGrid}>
          {BAGGAGE_PACKAGES.map((item) => (
            <TouchableOpacity
              key={item.kg}
              style={[styles.packageBtn, selectedKg === item.kg && styles.packageBtnActive]}
              onPress={() => setSelectedKg(item.kg)}
            >
              <Text style={[styles.packageKg, selectedKg === item.kg && styles.packageTextActive]}>
                {item.kg === 0 ? '0 kg' : `${item.kg} kg`}
              </Text>
              <Text style={[styles.packageLabel, selectedKg === item.kg && styles.packageTextActive]}>{h(item.labelKey as keyof typeof HELP_EN)}</Text>
              <Text style={[styles.packagePrice, selectedKg === item.kg && styles.packageTextActive]}>
                {item.price ? money(item.price) : h('free' as keyof typeof HELP_EN)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('estimate_fee')}</Text>
        <InfoLine label={h('baggage_package')} value={pack.kg === 0 ? h('carry_only') : `${pack.kg} kg ${h('checked_bag')}`} />
        <InfoLine label={h('package_fee')} value={pack.price ? money(pack.price) : '0d'} />
        <InfoLine label={h('handling_fee')} value={money(serviceFee)} />
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>{h('total' as keyof typeof HELP_EN)}</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={confirmBaggage}>
          <AppIcon name="check" size={16} color="#fff" />
          <Text style={styles.primaryText}>{h('apply_current_booking')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('buy_for_existing')}</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0064D2" />
            <Text style={styles.mutedText}>{h('loading_bookings')}</Text>
          </View>
        ) : bookings.length ? (
          bookings.slice(0, 4).map((booking) => (
            <View key={booking.id} style={styles.bookingPick}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingRoute}>
                  {booking.flight.originCode} {'->'} {booking.flight.destinationCode}
                </Text>
                <Text style={styles.bookingMeta}>
                  {booking.pnr} - {h('currently_has')} {booking.baggageKg ?? 0} kg
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.smallActionBtn, updatingId === booking.id && { opacity: 0.7 }]}
                onPress={() => void updateExistingBooking(booking)}
                disabled={updatingId === booking.id}
              >
                <Text style={styles.smallActionText}>{updatingId === booking.id ? '...' : h('buy')}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View>
            <Text style={styles.mutedText}>{h('no_booking_baggage')}</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Flights')}>
              <Text style={styles.secondaryText}>{h('book_first')}</Text>
              <AppIcon name="chevronRight" size={16} color="#0064D2" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('preflight_checklist')}</Text>
        {BAGGAGE_RULE_KEYS.map((ruleKey) => (
          <View key={ruleKey} style={styles.checkRow}>
            <View style={styles.checkDot}>
              <AppIcon name="check" size={12} color="#fff" />
            </View>
            <Text style={styles.checkText}>{h(ruleKey as keyof typeof HELP_EN)}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Flights')}>
          <Text style={styles.secondaryText}>{h('find_baggage_flight')}</Text>
          <AppIcon name="chevronRight" size={16} color="#0064D2" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function CheckinFeature({ navigation }: { navigation: any }) {
  const { language } = useLanguage();
  const h = (key: keyof typeof HELP_EN) => helpText(language, key);
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [checkedIn, setCheckedIn] = useState<BookingDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const upcoming = useMemo(() => bookings.slice(0, 3), [bookings]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listMyBookingsApi()
      .then((rows) => {
        if (alive) setBookings(rows);
      })
      .catch(() => {
        if (alive) setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fillBooking = (booking: BookingDto) => {
    setPnr(booking.pnr);
    setLastName(lastNameOf(booking.passengerName));
    setCheckedIn(null);
  };

  const submit = async () => {
    const normalizedPnr = pnr.trim().toUpperCase();
    const normalizedName = lastName.trim();
    if (!normalizedPnr || !normalizedName) {
      Alert.alert(h('missing_info_title'), h('missing_checkin_msg'));
      return;
    }

    setSubmitting(true);
    try {
      const updated = await checkInBookingApi({ pnr: normalizedPnr, passengerLastName: normalizedName });
      setCheckedIn(updated);
      setBookings((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
    } catch (e) {
      Alert.alert(h('checkin_failed'), formatAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.featureHero}>
        <View style={styles.heroIcon}>
          <AppIcon name="checkin" size={28} color="#0064D2" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{h('checkin_title')}</Text>
          <Text style={styles.heroSub}>{h('checkin_sub')}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('open_checkin')}</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{h('pnr_label')}</Text>
          <TextInput
            style={styles.input}
            value={pnr}
            onChangeText={(v) => setPnr(v.toUpperCase())}
            placeholder={h('pnr_placeholder')}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{h('last_name_label')}</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={h('last_name_placeholder')}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={[styles.primaryBtn, submitting && { opacity: 0.8 }]} onPress={() => void submit()} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <AppIcon name="check" size={16} color="#fff" />}
          <Text style={styles.primaryText}>{submitting ? h('checking_in') : h('checkin_now')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('account_bookings')}</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0064D2" />
            <Text style={styles.mutedText}>{h('loading_bookings')}</Text>
          </View>
        ) : upcoming.length ? (
          upcoming.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingPick} onPress={() => fillBooking(booking)}>
              <View>
                <Text style={styles.bookingRoute}>
                  {booking.flight.originCode} {'->'} {booking.flight.destinationCode}
                </Text>
                <Text style={styles.bookingMeta}>
                  {booking.pnr} - {booking.passengerName}
                </Text>
              </View>
              <AppIcon name="chevronRight" size={18} color="#0064D2" />
            </TouchableOpacity>
          ))
        ) : (
          <View>
            <Text style={styles.mutedText}>{h('no_booking_checkin')}</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Flights')}>
              <Text style={styles.secondaryText}>{h('book_first')}</Text>
              <AppIcon name="chevronRight" size={16} color="#0064D2" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {checkedIn ? <BoardingPass booking={checkedIn} h={h} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('process')}</Text>
        {CHECKIN_STEP_KEYS.map((stepKey, index) => (
          <View key={stepKey} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNum}>{index + 1}</Text>
            </View>
            <Text style={styles.checkText}>{h(stepKey as keyof typeof HELP_EN)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SupportFeature({ navigation }: { navigation: any }) {
  const { language } = useLanguage();
  const h = (key: keyof typeof HELP_EN) => helpText(language, key);
  const [selectedCategory, setSelectedCategory] = useState(SUPPORT_CATEGORIES[0].id);
  const [pnr, setPnr] = useState('');
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(SUPPORT_FAQ[0].qKey);
  const [submitting, setSubmitting] = useState(false);
  const [openingExternal, setOpeningExternal] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listMyBookingsApi()
      .then((rows) => {
        if (alive) setBookings(rows.slice(0, 3));
      })
      .catch(() => {
        if (alive) setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const openExternalUrl = async (url: string, fallbackTitle: string, fallbackMessage: string) => {
    if (openingExternal) return;
    setOpeningExternal(true);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(fallbackTitle, fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(fallbackTitle, fallbackMessage);
    } finally {
      setTimeout(() => setOpeningExternal(false), 1200);
    }
  };

  const openEmail = () => {
    const subject = encodeURIComponent(`SkyBook support ${pnr ? `- ${pnr}` : ''}`);
    const body = encodeURIComponent(message || h('email_body'));
    void openExternalUrl(
      `mailto:support@skybook.demo?subject=${subject}&body=${body}`,
      h('email_failed_title'),
      'support@skybook.demo',
    );
  };

  const openHotline = () => {
    void openExternalUrl('tel:19000000', h('hotline_title'), '1900-0000, 8:00-22:00');
  };

  const submitTicket = async () => {
    if (!message.trim()) {
      Alert.alert(h('missing_message_title'), h('missing_message_msg'));
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await createSupportTicketApi({
        category: selectedCategory,
        pnr: pnr.trim() || undefined,
        message: message.trim(),
      });
      Alert.alert(
        h('ticket_created_title'),
        `${h('ticket_code')}: ${ticket.code}\n${h('issue_group')}: ${h((SUPPORT_CATEGORIES.find((c) => c.id === selectedCategory)?.labelKey ?? 'support_cat_change') as keyof typeof HELP_EN)}\nPNR: ${ticket.pnr || '-'}`,
      );
      setMessage('');
    } catch (e) {
      Alert.alert(h('support_failed_title'), formatAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.featureHero}>
        <View style={styles.heroIcon}>
          <AppIcon name="support" size={28} color="#0064D2" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{h('support_title')}</Text>
          <Text style={styles.heroSub}>{h('support_sub')}</Text>
        </View>
      </View>

      <View style={styles.quickSupportGrid}>
        <TouchableOpacity style={styles.quickSupportBtn} onPress={() => navigation.navigate('Main', { screen: 'Assistant' })}>
          <AppIcon name="support" size={20} color="#0064D2" />
          <Text style={styles.quickSupportText}>{h('ask_ai')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickSupportBtn} onPress={openHotline}>
          <AppIcon name="phone" size={20} color="#0064D2" />
          <Text style={styles.quickSupportText}>{h('hotline')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickSupportBtn} onPress={openEmail}>
          <AppIcon name="mail" size={20} color="#0064D2" />
          <Text style={styles.quickSupportText}>{h('email')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('choose_issue')}</Text>
        <View style={styles.supportCategoryGrid}>
          {SUPPORT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.supportCategory, selectedCategory === category.id && styles.supportCategoryActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.supportCategoryTitle, selectedCategory === category.id && styles.supportCategoryTextActive]}>
                {h(category.labelKey as keyof typeof HELP_EN)}
              </Text>
              <Text style={[styles.supportCategoryHint, selectedCategory === category.id && styles.supportCategoryTextActive]}>
                {h(category.hintKey as keyof typeof HELP_EN)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('attach_booking')}</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0064D2" />
            <Text style={styles.mutedText}>{h('loading_bookings')}</Text>
          </View>
        ) : bookings.length ? (
          bookings.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingPick} onPress={() => setPnr(booking.pnr)}>
              <View>
                <Text style={styles.bookingRoute}>
                  {booking.flight.originCode} {'->'} {booking.flight.destinationCode}
                </Text>
                <Text style={styles.bookingMeta}>
                  {booking.pnr} - {booking.status}
                </Text>
              </View>
              <Text style={styles.linkText}>{pnr === booking.pnr ? h('selected') : h('select')}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.mutedText}>{h('no_booking_support')}</Text>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{h('pnr_label')}</Text>
          <TextInput
            style={styles.input}
            value={pnr}
            onChangeText={(v) => setPnr(v.toUpperCase())}
            placeholder="SB123456"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{h('issue_desc')}</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder={h('issue_placeholder')}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={[styles.primaryBtn, submitting && { opacity: 0.8 }]} onPress={() => void submitTicket()} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <AppIcon name="check" size={16} color="#fff" />}
          <Text style={styles.primaryText}>{submitting ? h('sending_support') : h('send_support')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{h('faq')}</Text>
        {SUPPORT_FAQ.map((item) => {
          const question = h(item.qKey as keyof typeof HELP_EN);
          const isOpen = openFaq === item.qKey;
          return (
            <TouchableOpacity key={item.qKey} style={styles.faqItem} onPress={() => setOpenFaq(isOpen ? null : item.qKey)}>
              <View style={styles.faqQuestionRow}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <AppIcon name={isOpen ? 'chevronUp' : 'chevronDown'} size={16} color="#0064D2" />
              </View>
              {isOpen ? <Text style={styles.faqAnswer}>{h(item.aKey as keyof typeof HELP_EN)}</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function BoardingPass({ booking, h }: { booking: BookingDto; h: (key: keyof typeof HELP_EN) => string }) {
  const flight = booking.flight;
  return (
    <View style={styles.boardingPass}>
      <View style={styles.boardingHeader}>
        <Text style={styles.boardingAirline}>{flight.airlineName}</Text>
        <Text style={styles.boardingStatus}>{h('checked_in')}</Text>
      </View>
      <View style={styles.boardingRoute}>
        <Text style={styles.airportCode}>{flight.originCode}</Text>
        <AppIcon name="airplane" size={20} color="#fff" />
        <Text style={styles.airportCode}>{flight.destinationCode}</Text>
      </View>
      <View style={styles.boardingInfoGrid}>
        <BoardingInfo label="PNR" value={booking.pnr} />
        <BoardingInfo label={h('flight')} value={flight.flightNumber} />
        <BoardingInfo label={h('boarding')} value={flightTime(flight.departureAt)} />
        <BoardingInfo label={h('seat_label')} value={booking.seatNumber || '--'} />
      </View>
      <Text style={styles.boardingNote}>{h('boarding_note')}</Text>
    </View>
  );
}

function BoardingInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.boardingInfo}>
      <Text style={styles.boardingLabel}>{label}</Text>
      <Text style={styles.boardingValue}>{value}</Text>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0064D2', padding: 16, paddingBottom: 20 },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  body: { padding: 16, paddingBottom: 40 },
  p: { fontSize: 15, lineHeight: 24, color: '#374151', marginBottom: 16 },
  featureHero: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', marginBottom: 3 },
  heroSub: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  packageBtn: {
    width: '31.5%',
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 10,
    justifyContent: 'space-between',
  },
  packageBtnActive: { backgroundColor: '#0064D2', borderColor: '#0064D2' },
  packageKg: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  packageLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  packagePrice: { fontSize: 11, fontWeight: '700', color: '#0064D2', marginTop: 6 },
  packageTextActive: { color: '#fff' },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, color: '#1A1A2E', fontWeight: '700' },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  totalLabel: { fontSize: 15, color: '#1A1A2E', fontWeight: '800' },
  totalValue: { fontSize: 17, color: '#0064D2', fontWeight: '900' },
  primaryBtn: {
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryText: { color: '#0064D2', fontWeight: '800', fontSize: 13 },
  quickSupportGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickSupportBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  quickSupportText: { color: '#1A1A2E', fontWeight: '800', fontSize: 12 },
  supportCategoryGrid: { gap: 8 },
  supportCategory: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  supportCategoryActive: { borderColor: '#0064D2', backgroundColor: '#0064D2' },
  supportCategoryTitle: { color: '#1A1A2E', fontSize: 14, fontWeight: '800', marginBottom: 3 },
  supportCategoryHint: { color: '#6B7280', fontSize: 12, lineHeight: 17 },
  supportCategoryTextActive: { color: '#fff' },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#374151', fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1A1A2E',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
  },
  messageInput: { minHeight: 96, paddingTop: 12 },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mutedText: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  bookingPick: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingRoute: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  bookingMeta: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  linkText: { color: '#0064D2', fontSize: 12, fontWeight: '800' },
  smallActionBtn: {
    backgroundColor: '#0064D2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginLeft: 10,
  },
  smallActionText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: '#0064D2', fontWeight: '900', fontSize: 12 },
  boardingPass: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 12 },
  boardingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardingAirline: { color: '#fff', fontSize: 16, fontWeight: '800' },
  boardingStatus: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: 'rgba(16,185,129,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  boardingRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
  },
  airportCode: { color: '#fff', fontSize: 34, fontWeight: '900' },
  boardingInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  boardingInfo: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 },
  boardingLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  boardingValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 3 },
  boardingNote: { color: '#D1D5DB', fontSize: 12, lineHeight: 18, marginTop: 14 },
  faqItem: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 12 },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  faqQuestion: { flex: 1, color: '#1A1A2E', fontSize: 13, fontWeight: '800', lineHeight: 19 },
  faqAnswer: { color: '#6B7280', fontSize: 13, lineHeight: 20, marginTop: 8 },
});
