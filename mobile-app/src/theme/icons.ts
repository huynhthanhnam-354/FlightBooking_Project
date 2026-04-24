/**
 * Bảng icon tập trung của toàn bộ app.
 * Thư viện: @expo/vector-icons (đi kèm Expo, không cần cài thêm)
 *
 * Cách dùng:
 *   import { ICONS } from '../theme/icons';
 *   <AppIcon name="search" size={20} color="#0064D2" />
 */

export type IconLib =
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'Feather';

export type IconDef = {
  lib: IconLib;
  name: string;
};

export type AppIconName = keyof typeof ICONS;

export const ICONS = {
  // ── Điều hướng (Tab bar) ─────────────────────────
  home:          { lib: 'Ionicons',               name: 'home-outline' },
  flights:       { lib: 'Ionicons',               name: 'airplane-outline' },
  bookings:      { lib: 'MaterialCommunityIcons', name: 'ticket-outline' },
  profile:       { lib: 'Ionicons',               name: 'person-circle-outline' },

  // ── Hành động chung ──────────────────────────────
  search:        { lib: 'Ionicons',               name: 'search-outline' },
  edit:          { lib: 'Feather',                name: 'edit-2' },
  back:          { lib: 'Ionicons',               name: 'arrow-back' },
  next:          { lib: 'Ionicons',               name: 'arrow-forward' },
  close:         { lib: 'Ionicons',               name: 'close' },
  check:         { lib: 'Ionicons',               name: 'checkmark' },
  chevronRight:  { lib: 'Ionicons',               name: 'chevron-forward' },
  chevronDown:   { lib: 'Ionicons',               name: 'chevron-down' },
  chevronUp:     { lib: 'Ionicons',               name: 'chevron-up' },

  // ── Form input ───────────────────────────────────
  mail:          { lib: 'Ionicons',               name: 'mail-outline' },
  lock:          { lib: 'Ionicons',               name: 'lock-closed-outline' },
  eye:           { lib: 'Ionicons',               name: 'eye-outline' },
  eyeOff:        { lib: 'Ionicons',               name: 'eye-off-outline' },
  phone:         { lib: 'Ionicons',               name: 'call-outline' },
  star:          { lib: 'Ionicons',               name: 'star' },
  wave:          { lib: 'MaterialCommunityIcons', name: 'hand-wave-outline' },

  // ── Luồng đặt vé ─────────────────────────────────
  airplane:      { lib: 'Ionicons',               name: 'airplane' },
  airplaneTakeoff: { lib: 'MaterialCommunityIcons', name: 'airplane-takeoff' },
  airplaneLanding: { lib: 'MaterialCommunityIcons', name: 'airplane-landing' },
  seat:          { lib: 'MaterialCommunityIcons', name: 'seat-passenger' },
  price:         { lib: 'MaterialCommunityIcons', name: 'cash-multiple' },
  passenger:     { lib: 'Ionicons',               name: 'person-outline' },
  passengers:    { lib: 'Ionicons',               name: 'people-outline' },
  payment:       { lib: 'Ionicons',               name: 'card-outline' },
  clipboard:     { lib: 'Ionicons',               name: 'clipboard-outline' },
  ticket:        { lib: 'MaterialCommunityIcons', name: 'ticket-confirmation-outline' },
  luggage:       { lib: 'MaterialCommunityIcons', name: 'bag-suitcase-outline' },
  direct:        { lib: 'MaterialCommunityIcons', name: 'ray-start-arrow' },

  // ── Thông tin chuyến bay ──────────────────────────
  calendar:      { lib: 'Ionicons',               name: 'calendar-outline' },
  clock:         { lib: 'Ionicons',               name: 'time-outline' },
  flightStatus:  { lib: 'MaterialCommunityIcons', name: 'radar' },
  checkin:       { lib: 'MaterialCommunityIcons', name: 'cellphone-check' },

  // ── Thanh toán ────────────────────────────────────
  creditCard:    { lib: 'Ionicons',               name: 'card-outline' },
  bankTransfer:  { lib: 'MaterialCommunityIcons', name: 'bank-transfer' },
  eWallet:       { lib: 'MaterialCommunityIcons', name: 'wallet-outline' },
  cod:           { lib: 'MaterialCommunityIcons', name: 'cash-check' },

  // ── Hồ sơ / Cài đặt ──────────────────────────────
  settings:      { lib: 'Ionicons',               name: 'settings-outline' },
  history:       { lib: 'MaterialCommunityIcons', name: 'history' },
  notification:  { lib: 'Ionicons',               name: 'notifications-outline' },
  language:      { lib: 'Ionicons',               name: 'language-outline' },
  currency:      { lib: 'MaterialCommunityIcons', name: 'currency-usd' },
  security:      { lib: 'Ionicons',               name: 'shield-checkmark-outline' },
  support:       { lib: 'MaterialCommunityIcons', name: 'headset' },
  rateApp:       { lib: 'Ionicons',               name: 'star-outline' },
  logout:        { lib: 'MaterialCommunityIcons', name: 'logout' },
  register:      { lib: 'MaterialCommunityIcons', name: 'rocket-launch-outline' },
  success:       { lib: 'MaterialCommunityIcons', name: 'check-circle-outline' },
} as const satisfies Record<string, IconDef>;
