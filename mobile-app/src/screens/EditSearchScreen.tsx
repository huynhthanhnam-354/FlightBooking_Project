import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { AIRPORT_LIST, airportSearchBlob, normalizeAirportSearchText } from '../data/airports';
import AppIcon from '../components/AppIcon';

function filterAirports(query: string) {
  const s = normalizeAirportSearchText(query);
  if (!s) return AIRPORT_LIST;
  return AIRPORT_LIST.filter((a) => {
    return airportSearchBlob(a).includes(s);
  });
}

function formatDdMmYyyy(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function parseDdMmYyyy(value: string): Date {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return new Date();
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return new Date();
  return date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(viewDate: Date): Array<Date | null> {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DatePickerModal({
  visible,
  title,
  value,
  minDate,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  value: string;
  minDate: Date;
  onPick: (date: string) => void;
  onClose: () => void;
}) {
  const selectedDate = parseDdMmYyyy(value);
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const min = startOfDay(minDate);
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const years = useMemo(() => {
    const start = min.getFullYear();
    return Array.from({ length: 8 }, (_, index) => start + index);
  }, [min]);

  useEffect(() => {
    if (visible) {
      const next = parseDdMmYyyy(value);
      setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
      setYearPickerOpen(false);
    }
  }, [value, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>{title}</Text>
            <TouchableOpacity style={styles.calendarClose} onPress={onClose}>
              <Text style={styles.calendarCloseText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.monthBtn} onPress={() => setViewDate((d) => addMonths(d, -1))}>
              <Text style={styles.monthBtnText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.monthTitleBtn} onPress={() => setYearPickerOpen((open) => !open)}>
              <Text style={styles.monthTitle}>
                {String(viewDate.getMonth() + 1).padStart(2, '0')}/{viewDate.getFullYear()}
              </Text>
              <Text style={styles.monthHint}>{yearPickerOpen ? 'Chọn tháng' : 'Chọn năm'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.monthBtn} onPress={() => setViewDate((d) => addMonths(d, 1))}>
              <Text style={styles.monthBtnText}>›</Text>
            </TouchableOpacity>
          </View>
          {yearPickerOpen ? (
            <View style={styles.yearGrid}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearCell, viewDate.getFullYear() === year && styles.yearCellSelected]}
                  onPress={() => {
                    setViewDate(new Date(year, viewDate.getMonth(), 1));
                    setYearPickerOpen(false);
                  }}
                >
                  <Text style={[styles.yearText, viewDate.getFullYear() === year && styles.yearTextSelected]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.weekRow}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label) => (
                  <Text key={label} style={styles.weekText}>{label}</Text>
                ))}
              </View>
              <View style={styles.dayGrid}>
                {days.map((date, index) => {
                  const disabled = !date || startOfDay(date).getTime() < min.getTime();
                  const selected = !!date && sameDay(date, selectedDate);
                  return (
                    <TouchableOpacity
                      key={`${date?.toISOString() ?? 'blank'}-${index}`}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        disabled && styles.dayCellDisabled,
                      ]}
                      disabled={disabled}
                      onPress={() => {
                        if (!date) return;
                        onPick(formatDdMmYyyy(date));
                        onClose();
                      }}
                    >
                      <Text style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}>
                        {date ? date.getDate() : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function EditSearchScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useLanguage();
  const search = useSearch();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [datePicker, setDatePicker] = useState<'departure' | 'return' | null>(null);

  useEffect(() => {
    if (!fromOpen) setFromFilter('');
  }, [fromOpen]);
  useEffect(() => {
    if (!toOpen) setToFilter('');
  }, [toOpen]);

  const fromList = useMemo(() => filterAirports(fromFilter), [fromFilter]);
  const toList = useMemo(() => filterAirports(toFilter), [toFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('screen_edit_search')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Text style={styles.label}>{t('one_way')} / {t('round_trip')}</Text>
        <View style={styles.tripToggle}>
          {(['oneWay', 'roundTrip'] as const).map((tp) => (
            <TouchableOpacity
              key={tp}
              style={[styles.toggleBtn, search.tripType === tp && styles.toggleActive]}
              onPress={() => search.setTripType(tp)}
            >
              <Text style={[styles.toggleText, search.tripType === tp && styles.toggleTextActive]}>
                {tp === 'oneWay' ? t('one_way') : t('round_trip')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('from')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => {
            setFromOpen(!fromOpen);
            setToOpen(false);
          }}
        >
          <Text style={styles.pickerVal}>
            {search.fromCode} — {AIRPORT_LIST.find((a) => a.code === search.fromCode)?.name[language]}
          </Text>
          <AppIcon name={fromOpen ? 'chevronUp' : 'chevronDown'} size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {fromOpen && (
          <View style={styles.dropdown}>
            <TextInput
              style={styles.filterInput}
              value={fromFilter}
              onChangeText={setFromFilter}
              placeholder={t('search')}
              placeholderTextColor="#9CA3AF"
            />
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
              {fromList.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={[styles.dropRow, search.fromCode === a.code && styles.dropActive]}
                  onPress={() => {
                    if (a.code === search.toCode) search.setToCode(search.fromCode);
                    search.setFromCode(a.code);
                    setFromOpen(false);
                  }}
                >
                  <Text style={styles.dropText}>
                    {a.code} — {a.name[language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('to')}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => {
            setToOpen(!toOpen);
            setFromOpen(false);
          }}
        >
          <Text style={styles.pickerVal}>
            {search.toCode} — {AIRPORT_LIST.find((a) => a.code === search.toCode)?.name[language]}
          </Text>
          <AppIcon name={toOpen ? 'chevronUp' : 'chevronDown'} size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {toOpen && (
          <View style={styles.dropdown}>
            <TextInput
              style={styles.filterInput}
              value={toFilter}
              onChangeText={setToFilter}
              placeholder={t('search')}
              placeholderTextColor="#9CA3AF"
            />
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
              {toList.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={[styles.dropRow, search.toCode === a.code && styles.dropActive]}
                  onPress={() => {
                    if (a.code === search.fromCode) search.setFromCode(search.toCode);
                    search.setToCode(a.code);
                    setToOpen(false);
                  }}
                >
                  <Text style={styles.dropText}>
                    {a.code} — {a.name[language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('departure_date')}</Text>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setDatePicker('departure')}>
          <View>
            <Text style={styles.datePickerValue}>{search.departureDate}</Text>
          </View>
          <AppIcon name="calendar" size={20} color="#0064D2" />
        </TouchableOpacity>

        {search.tripType === 'roundTrip' ? (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>{t('return_date')}</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setDatePicker('return')}>
              <View>
                <Text style={styles.datePickerValue}>{search.returnDate}</Text>
              </View>
              <AppIcon name="calendar" size={20} color="#0064D2" />
            </TouchableOpacity>
          </>
        ) : null}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('passengers')}</Text>
        <View style={styles.stepRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => search.setAdults(Math.max(1, search.adults - 1))}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepVal}>
            {search.adults} {t('adult')}
          </Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => search.setAdults(Math.min(9, search.adults + 1))}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.apply} onPress={() => navigation.goBack()}>
          <Text style={styles.applyText}>{t('save_changes')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <DatePickerModal
        visible={datePicker === 'departure'}
        title={t('departure_date')}
        value={search.departureDate}
        minDate={new Date()}
        onPick={search.setDepartureDate}
        onClose={() => setDatePicker(null)}
      />
      <DatePickerModal
        visible={datePicker === 'return'}
        title={t('return_date')}
        value={search.returnDate}
        minDate={parseDdMmYyyy(search.departureDate)}
        onPick={search.setReturnDate}
        onClose={() => setDatePicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0064D2', padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  body: { padding: 20, paddingBottom: 40 },
  tripToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
  toggleActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  toggleText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  toggleTextActive: { color: '#0064D2', fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 6, marginTop: -4 },
  datePickerBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerValue: { fontSize: 16, color: '#1A1A2E', fontWeight: '800' },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerVal: { flex: 1, fontSize: 14, color: '#1A1A2E', fontWeight: '600' },
  dropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  filterInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
  },
  dropdownScroll: { maxHeight: 280 },
  dropRow: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropActive: { backgroundColor: '#EFF6FF' },
  dropText: { fontSize: 14, color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1A1A2E',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0064D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 22, color: '#0064D2', fontWeight: '700' },
  stepVal: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', minWidth: 120, textAlign: 'center' },
  apply: {
    marginTop: 28,
    backgroundColor: '#0064D2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calendarTitle: { color: '#1A1A2E', fontSize: 17, fontWeight: '800' },
  calendarClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCloseText: { color: '#6B7280', fontSize: 22, lineHeight: 24, fontWeight: '700' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtnText: { color: '#0064D2', fontSize: 28, lineHeight: 30, fontWeight: '800' },
  monthTitleBtn: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  monthTitle: { color: '#1A1A2E', fontSize: 16, fontWeight: '800' },
  monthHint: { color: '#0064D2', fontSize: 11, fontWeight: '700', marginTop: 2 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekText: { flex: 1, textAlign: 'center', color: '#6B7280', fontSize: 12, fontWeight: '700' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellSelected: { backgroundColor: '#0064D2' },
  dayCellDisabled: { opacity: 0.32 },
  dayText: { color: '#1A1A2E', fontSize: 14, fontWeight: '700' },
  dayTextSelected: { color: '#fff' },
  dayTextDisabled: { color: '#9CA3AF' },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yearCell: {
    width: '47.8%',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    alignItems: 'center',
  },
  yearCellSelected: { backgroundColor: '#0064D2', borderColor: '#0064D2' },
  yearText: { color: '#1A1A2E', fontSize: 15, fontWeight: '800' },
  yearTextSelected: { color: '#fff' },
});
