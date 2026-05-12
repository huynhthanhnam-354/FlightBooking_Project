import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, userInitial } from '../context/AuthContext';
import { LANGUAGE_LABELS, Language } from '../i18n/translations';
import { CURRENCIES } from '../i18n/currencies';
import { formatPrice } from '../utils/price';
import AppIcon from '../components/AppIcon';
import { AppIconName } from '../theme/icons';
import { listMyBookingsApi } from '../services/bookingApi';
import { mapBookingDtoToProfileRow, type ProfileBookingRow } from '../utils/profileBookings';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, language, setLanguage, currency, setCurrencyByCode } = useLanguage();
  const { user, signOut } = useAuth();
  const [notif, setNotif] = useState(true);
  const [tab, setTab]               = useState<'info' | 'bookings'>('info');
  const [showLangPicker, setShowLangPicker]   = useState(false);
  const [showCurrPicker, setShowCurrPicker]   = useState(false);

  const displayName = user?.fullName?.trim() || t('passenger');
  const displayEmail = user?.email?.trim() || '—';

  const [apiBookings, setApiBookings] = useState<ProfileBookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!user) {
      setApiBookings([]);
      return;
    }
    setBookingsLoading(true);
    try {
      const list = await listMyBookingsApi();
      setApiBookings(list.map(mapBookingDtoToProfileRow));
    } catch {
      setApiBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadBookings();
    }, [loadBookings]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialTab === 'bookings') {
        setTab('bookings');
        navigation.setParams({ initialTab: undefined });
      }
    }, [navigation, route.params?.initialTab]),
  );

  const bookingsToShow = apiBookings;

  const currentLangLabel = Object.keys(LANGUAGE_LABELS).find(k => LANGUAGE_LABELS[k] === language) ?? 'Tiếng Việt';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <View style={styles.avatarCircle}><Text style={styles.avatarText}>{userInitial(user)}</Text></View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <AppIcon name="airplane" size={12} color="#fff" />
            <Text style={styles.badgeText}>  {bookingsToShow.length} {t('trips')}</Text>
          </View>
          <View style={styles.badge}>
            <AppIcon name="star" size={12} color="#FFD700" />
            <Text style={styles.badgeText}>  {t('member')} {user?.role?.trim() || '—'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(['info', 'bookings'] as const).map(tb => (
          <TouchableOpacity key={tb} style={[styles.tabBtn, tab === tb && styles.tabBtnActive]} onPress={() => setTab(tb)}>
            <Text style={[styles.tabText, tab === tb && styles.tabTextActive]}>
              {tb === 'info' ? t('settings_tab') : t('history_tab')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'info' && (
          <View style={{ padding: 16 }}>
            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={styles.menuIconWrap}>
                  <AppIcon name="notification" size={20} color="#0064D2" />
                </View>
                <Text style={styles.toggleLabel}>{t('push_notif')}</Text>
                <Switch value={notif} onValueChange={setNotif} trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }} thumbColor={notif ? '#0064D2' : '#9CA3AF'} />
              </View>
            </View>

            {/* Language picker */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowLangPicker(!showLangPicker)}>
                <View style={styles.menuIconWrap}>
                  <AppIcon name="language" size={20} color="#0064D2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{t('language')}</Text>
                  <Text style={styles.menuSub}>{currentLangLabel}</Text>
                </View>
                <AppIcon name={showLangPicker ? 'chevronUp' : 'chevronDown'} size={18} color="#D1D5DB" />
              </TouchableOpacity>
              {showLangPicker && (
                <View style={styles.langDropdown}>
                  {Object.entries(LANGUAGE_LABELS).map(([label, code]) => (
                    <TouchableOpacity
                      key={code}
                      style={[styles.langItem, language === code && styles.langItemActive]}
                      onPress={() => { setLanguage(code as Language); setShowLangPicker(false); }}
                    >
                      <Text style={[styles.langText, language === code && styles.langTextActive]}>{label}</Text>
                      {language === code && <AppIcon name="check" size={16} color="#0064D2" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Currency picker */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowCurrPicker(!showCurrPicker); setShowLangPicker(false); }}>
                <View style={styles.menuIconWrap}>
                  <AppIcon name="currency" size={20} color="#0064D2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{t('currency')}</Text>
                  <Text style={styles.menuSub}>{currency.flag} {currency.names[language]} · {currency.code}</Text>
                </View>
                <AppIcon name={showCurrPicker ? 'chevronUp' : 'chevronDown'} size={18} color="#D1D5DB" />
              </TouchableOpacity>
              {showCurrPicker && (
                <View style={styles.langDropdown}>
                  {CURRENCIES.map(c => (
                    <TouchableOpacity
                      key={c.code}
                      style={[styles.langItem, currency.code === c.code && styles.langItemActive]}
                      onPress={() => { setCurrencyByCode(c.code); setShowCurrPicker(false); }}
                    >
                      <View style={styles.currRow}>
                        <Text style={styles.currFlag}>{c.flag}</Text>
                        <View>
                          <Text style={[styles.langText, currency.code === c.code && styles.langTextActive]}>
                            {c.names[language]}
                          </Text>
                          <Text style={styles.currCode}>{c.code} · {c.symbol}</Text>
                        </View>
                      </View>
                      {currency.code === c.code && <AppIcon name="check" size={16} color="#0064D2" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              {([
                { iconName: 'edit' as AppIconName, labelKey: 'edit_info' as const, onPress: () => navigation.navigate('EditProfile') },
                { iconName: 'security' as AppIconName, labelKey: 'security' as const, onPress: () => navigation.navigate('Security') },
                { iconName: 'support' as AppIconName, labelKey: 'support' as const, onPress: () => navigation.navigate('HelpTopic', { topic: 'support' }) },
                {
                  iconName: 'rateApp' as AppIconName,
                  labelKey: 'rate_app' as const,
                  onPress: () => Alert.alert(t('rate_app'), t('thanks_rating')),
                },
              ] as const).map((item, i, arr) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuItem, i < arr.length - 1 && styles.menuItemBorder]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuIconWrap}>
                    <AppIcon name={item.iconName} size={20} color="#0064D2" />
                  </View>
                  <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
                  <AppIcon name="chevronRight" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => Alert.alert(t('logout_title'), t('logout_confirm'), [
                { text: t('cancel_btn'), style: 'cancel' },
                {
                  text: t('logout_title'),
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                    navigation.navigate('Login');
                  },
                },
              ])}
            >
              <AppIcon name="logout" size={18} color="#EF4444" />
              <Text style={[styles.logoutText, { marginLeft: 8 }]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'bookings' && (
          <View style={{ padding: 16 }}>
            {user && bookingsLoading ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0064D2" />
              </View>
            ) : null}
            {!(user && bookingsLoading) && bookingsToShow.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6B7280', paddingVertical: 24, fontSize: 15 }}>
                {user ? t('no_bookings_yet') : t('profile_login_for_bookings')}
              </Text>
            ) : null}
            {!(user && bookingsLoading) &&
              bookingsToShow.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('Eticket', { ticket: b.ticket })}
              >
                <View style={styles.bookingTop}>
                  <Text style={styles.bookingId}>#{b.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: b.statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: b.statusColor }]}>{t(b.statusKey)}</Text>
                  </View>
                </View>
                <Text style={styles.bookingRoute}>{b.route}</Text>
                <View style={styles.bookingBottom}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <AppIcon name="calendar" size={13} color="#6B7280" />
                    <Text style={styles.bookingDate}>{b.date}</Text>
                  </View>
                  <Text style={styles.bookingPrice}>{formatPrice(b.priceVND, currency)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F5F7FA' },
  header:        { backgroundColor: '#0064D2', alignItems: 'center', paddingTop: 20, paddingBottom: 28 },
  avatarCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText:    { fontSize: 36, fontWeight: '800', color: '#fff' },
  name:          { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  email:         { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 12 },
  badgeRow:      { flexDirection: 'row', gap: 8 },
  badge:         { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' },
  badgeText:     { color: '#fff', fontSize: 12, fontWeight: '600' },
  tabRow:        { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tabBtn:        { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabBtnActive:  { borderBottomColor: '#0064D2' },
  tabText:       { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  tabTextActive: { color: '#0064D2', fontWeight: '700' },
  card:          { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', padding: 16 },
  toggleLabel:   { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },
  menuItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  menuItemBorder:{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconWrap:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel:     { flex: 1, fontSize: 14, color: '#374151', fontWeight: '500' },
  menuSub:       { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  langDropdown:  { borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#F9FAFB' },
  langItem:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  langItemActive:{ backgroundColor: '#EFF6FF' },
  langText:      { fontSize: 14, color: '#374151' },
  langTextActive:{ color: '#0064D2', fontWeight: '600' },
  currRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currFlag:      { fontSize: 22 },
  currCode:      { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  logoutBtn:     { backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4, borderWidth: 1.5, borderColor: '#FECACA', flexDirection: 'row', justifyContent: 'center' },
  logoutText:    { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  bookingCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  bookingTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingId:     { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  statusBadge:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText:    { fontSize: 12, fontWeight: '700' },
  bookingRoute:  { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  bookingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingDate:   { fontSize: 13, color: '#6B7280' },
  bookingPrice:  { fontSize: 15, fontWeight: '800', color: '#0064D2' },
});
