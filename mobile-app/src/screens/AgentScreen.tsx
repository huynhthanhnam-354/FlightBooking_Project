import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../components/AppIcon';
import { AgentAction, AgentMessage, AgentSuggestion, sendMessageToAgent } from '../services/agent';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { AIRLINE_COLORS, flightCodePrefix, type CatalogFlight } from '../data/flightCatalog';
import { AI_DESTINATION_FILTERS, AI_DESTINATIONS, AIDestination, AIDestinationFilter } from '../data/aiDestinations';
import { AIRPORT_LIST, airportName, airportSearchBlob, normalizeAirportSearchText } from '../data/airports';
import { searchFlightsApi } from '../services/flightApi';
import { formatPrice } from '../utils/price';

function makeMessage(role: 'user' | 'assistant', content: string): AgentMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

type DestinationPrice = {
  priceVND: number;
  hasLiveResult: boolean;
  routeFrom: string;
  duration?: string;
};

type AssistantFlightResults = {
  from: string;
  to: string;
  date: string;
  flights: CatalogFlight[];
  usedFlexibleDate: boolean;
};

function originForDestination(currentOrigin: string, destination: string): string {
  if (currentOrigin !== destination) return currentOrigin;
  return currentOrigin === 'HAN' ? 'SGN' : 'HAN';
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(text);
}

function scoreAirportMatch(message: string, airportCode: string): number {
  const normalized = normalizeAirportSearchText(message);
  const upperMessage = message.toUpperCase();
  const blob = airportSearchBlob(AIRPORT_LIST.find((a) => a.code === airportCode)!);
  const tokens = Array.from(new Set(blob.split(/\s+/).filter((token) => token.length >= 4)));
  let score = upperMessage.includes(airportCode) ? 5 : 0;
  tokens.forEach((token) => {
    if (hasWord(normalized, token)) score += 1;
  });
  return score;
}

function parseFlightIntent(message: string, fallbackOrigin: string): { from: string; to: string } | null {
  const ranked = AIRPORT_LIST
    .map((airport) => ({ code: airport.code, score: scoreAirportMatch(message, airport.code) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return null;

  const to = ranked[0].code;
  const fromCandidate = ranked.find((item) => item.code !== to)?.code;
  const from = fromCandidate ?? originForDestination(fallbackOrigin, to);
  return { from, to };
}

export default function AgentScreen() {
  const navigation = useNavigation<any>();
  const { t, language, currency } = useLanguage();
  const search = useSearch();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [activeDestinationFilter, setActiveDestinationFilter] = useState<AIDestinationFilter>('season');
  const [destinationPrices, setDestinationPrices] = useState<Record<string, DestinationPrice>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [assistantFlights, setAssistantFlights] = useState<AssistantFlightResults | null>(null);
  const [assistantFlightLoading, setAssistantFlightLoading] = useState(false);
  const [assistantFlightError, setAssistantFlightError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([makeMessage('assistant', t('agent_intro'))]);
    setSuggestions([]);
    setActions([]);
  }, [language, t]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setInputFocused(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const visibleDestinations = useMemo(
    () => AI_DESTINATIONS.filter((item) => item.categories.includes(activeDestinationFilter)),
    [activeDestinationFilter],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPricesLoading(true);
      try {
        const rows = await Promise.all(
          AI_DESTINATIONS.map(async (destination) => {
            const routeFrom = originForDestination(search.fromCode, destination.code);
            try {
              const flights = await searchFlightsApi(routeFrom, destination.code, search.departureDate);
              const cheapest = flights.length
                ? [...flights].sort((a, b) => a.priceVND - b.priceVND)[0]
                : null;
              return [
                destination.id,
                {
                  priceVND: cheapest?.priceVND ?? destination.basePriceVND,
                  hasLiveResult: !!cheapest,
                  routeFrom,
                  duration: cheapest?.duration,
                },
              ] as const;
            } catch {
              return [
                destination.id,
                {
                  priceVND: destination.basePriceVND,
                  hasLiveResult: false,
                  routeFrom,
                },
              ] as const;
            }
          }),
        );
        if (!cancelled) setDestinationPrices(Object.fromEntries(rows));
      } finally {
        if (!cancelled) setPricesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search.fromCode, search.departureDate]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);
  const isTyping = keyboardVisible || inputFocused;
  const hasConversation = messages.length > 1;
  const showDiscoveryPanel = !isTyping && !hasConversation;
  const showSuggestionChips = !isTyping && (actions.length > 0 || suggestions.length > 0);

  async function findFlightsForMessage(text: string) {
    const route = parseFlightIntent(text, search.fromCode);
    if (!route) return;

    setAssistantFlightLoading(true);
    setAssistantFlightError(null);
    setAssistantFlights(null);

    try {
      let flights = await searchFlightsApi(route.from, route.to, search.departureDate);
      let usedFlexibleDate = false;

      if (!flights.length) {
        flights = await searchFlightsApi(route.from, route.to);
        usedFlexibleDate = flights.length > 0;
      }

      search.setTripType('oneWay');
      search.setFromCode(route.from);
      search.setToCode(route.to);
      search.setSelectedFlight(null);

      if (!flights.length) {
        setAssistantFlightError(`Mình chưa tìm thấy chuyến ${route.from} → ${route.to} cho dữ liệu hiện có.`);
        return;
      }

      setAssistantFlights({
        from: route.from,
        to: route.to,
        date: search.departureDate,
        flights: [...flights].sort((a, b) => a.priceVND - b.priceVND).slice(0, 5),
        usedFlexibleDate,
      });
    } catch {
      setAssistantFlightError('Mình chưa kết nối được dữ liệu chuyến bay. Bạn thử lại sau nhé.');
    } finally {
      setAssistantFlightLoading(false);
    }
  }

  function chooseAssistantFlight(flight: CatalogFlight) {
    if (!assistantFlights) return;
    search.setTripType('oneWay');
    search.setFromCode(assistantFlights.from);
    search.setToCode(assistantFlights.to);
    search.setSelectedFlight(flight);
    navigation.navigate('Bookings');
  }

  function applyDestination(destination: AIDestination) {
    const routeFrom = originForDestination(search.fromCode, destination.code);
    search.setTripType('oneWay');
    search.setFromCode(routeFrom);
    search.setToCode(destination.code);
    search.setSelectedFlight(null);
    setMessages((prev) => [
      makeMessage(
        'assistant',
        `Mình đã chuẩn bị tuyến ${routeFrom} → ${destination.code} đến ${destination.city}. Mở tab Chuyến bay để chọn vé phù hợp.`,
      ),
      ...prev,
    ]);
    navigation.navigate('Flights');
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg = makeMessage('user', text);
    setMessages((prev) => [userMsg, ...prev]);
    setInput('');
    setLoading(true);
    findFlightsForMessage(text);

    try {
      const response = await sendMessageToAgent(text, {
        from: search.fromCode,
        to: search.toCode,
        date: search.departureDate,
        passengers: search.adults,
      }, language);
      setMessages((prev) => [makeMessage('assistant', response.reply), ...prev]);
      setSuggestions(response.suggestions);
      setActions(response.actions);
    } catch (_err) {
      setMessages((prev) => [makeMessage('assistant', t('agent_service_error')), ...prev]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionPress(suggestion: AgentSuggestion) {
    const id = suggestion.id || suggestion.label || '';
    if (['checkin'].includes(id)) {
      navigation.navigate('HelpTopic', { topic: 'checkin' });
      return;
    }
    if (['support', 'refund', 'payment'].includes(id)) {
      navigation.navigate('HelpTopic', { topic: 'support' });
      return;
    }
    if (['baggage', 'extra-baggage'].includes(id)) {
      navigation.navigate('HelpTopic', { topic: 'baggage' });
      return;
    }
    if (['book-baggage', 'flights', 'search-flight'].includes(id)) {
      navigation.navigate('Flights');
      return;
    }
    if (['my-bookings', 'ticket', 'eticket', 'pnr'].includes(id)) {
      navigation.navigate('Profile');
      return;
    }
    handleSend(suggestion.label);
  }

  function handleActionPress(action: AgentAction) {
    const route = String(action.route || '').trim();
    if (route.includes('check-in')) {
      navigation.navigate('HelpTopic', { topic: 'checkin' });
      return;
    }
    if (route.includes('support')) {
      navigation.navigate('HelpTopic', { topic: 'support' });
      return;
    }
    if (route.includes('booking') || route.includes('flight')) {
      navigation.navigate('Flights');
      return;
    }
    const id = String(action.type || action.label || '').toLowerCase();
    if (id.includes('navigate') && action.label) {
      handleSend(action.label);
      return;
    }
    if (action.label) {
      handleSend(action.label);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fly AI Assistant</Text>
        <Text style={styles.headerSub}>Tu van tim chuyen bay va dat ve</Text>
      </View>

      {showDiscoveryPanel ? <View style={styles.discoveryPanel}>
        <View style={styles.discoveryTitleRow}>
          <View style={styles.aiBadge}>
            <AppIcon name="sparkles" size={14} color="#fff" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
          <View style={styles.discoveryTitleBox}>
            <Text style={styles.discoveryTitle}>Gợi ý điểm đến đang đáng đi</Text>
            <Text style={styles.discoverySubtitle}>
              Từ {search.fromCode} · {search.departureDate}
            </Text>
          </View>
          {pricesLoading ? <ActivityIndicator size="small" color="#0064D2" /> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {AI_DESTINATION_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.discoveryFilter, activeDestinationFilter === filter.key && styles.discoveryFilterActive]}
              onPress={() => setActiveDestinationFilter(filter.key)}
            >
              <AppIcon name={filter.iconName} size={14} color={activeDestinationFilter === filter.key ? '#fff' : '#0064D2'} />
              <Text style={[styles.discoveryFilterText, activeDestinationFilter === filter.key && styles.discoveryFilterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationContent}>
          {visibleDestinations.map((destination) => {
            const price = destinationPrices[destination.id];
            const routeFrom = price?.routeFrom ?? originForDestination(search.fromCode, destination.code);
            return (
              <TouchableOpacity
                key={destination.id}
                style={styles.destinationCard}
                activeOpacity={0.86}
                onPress={() => applyDestination(destination)}
              >
                <View style={styles.destinationTop}>
                  <View style={[styles.destinationIcon, { backgroundColor: `${destination.accentColor}1A` }]}>
                    <AppIcon name={destination.iconName} size={20} color={destination.accentColor} />
                  </View>
                  <View style={styles.destinationHeading}>
                    <Text style={styles.destinationCity}>{destination.city}</Text>
                    <Text style={styles.destinationRoute}>{routeFrom} → {destination.code}</Text>
                  </View>
                </View>
                <Text style={styles.destinationBadge}>{destination.badge}</Text>
                <Text style={styles.destinationDescription} numberOfLines={2}>
                  {destination.description}
                </Text>
                <View style={styles.metaRow}>
                  <AppIcon name="sun" size={13} color="#F59E0B" />
                  <Text style={styles.metaText}>{destination.weather}</Text>
                </View>
                <View style={styles.metaRow}>
                  <AppIcon name="leaf" size={13} color="#10B981" />
                  <Text style={styles.metaText} numberOfLines={1}>{destination.season}</Text>
                </View>
                <View style={styles.destinationFooter}>
                  <View>
                    <Text style={styles.priceLabel}>{price?.hasLiveResult ? 'Giá live từ' : 'AI gợi ý từ'}</Text>
                    <Text style={styles.destinationPrice}>{formatPrice(price?.priceVND ?? destination.basePriceVND, currency)}</Text>
                  </View>
                  <View style={[styles.pickButton, { backgroundColor: destination.accentColor }]}>
                    <Text style={styles.pickButtonText}>Tìm vé</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View> : null}

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          style={styles.messageList}
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.content}</Text>
            </View>
          )}
        />

        {(assistantFlightLoading || assistantFlightError || assistantFlights) ? (
          <View style={styles.assistantFlightPanel}>
            <View style={styles.assistantFlightHeader}>
              <View>
                <Text style={styles.assistantFlightEyebrow}>Kết quả AI tìm được</Text>
                <Text style={styles.assistantFlightTitle}>
                  {assistantFlights
                    ? `${airportName(assistantFlights.from, language)} → ${airportName(assistantFlights.to, language)}`
                    : 'Đang tìm chuyến bay phù hợp'}
                </Text>
              </View>
              {assistantFlightLoading ? <ActivityIndicator size="small" color="#0064D2" /> : null}
            </View>

            {assistantFlightError ? <Text style={styles.assistantFlightError}>{assistantFlightError}</Text> : null}

            {assistantFlights ? (
              <>
                <Text style={styles.assistantFlightNote}>
                  {assistantFlights.usedFlexibleDate
                    ? 'Không có chuyến đúng ngày đang chọn, mình hiển thị các chuyến phù hợp trong dữ liệu hiện có.'
                    : `${assistantFlights.date} · ${assistantFlights.flights.length} chuyến giá tốt nhất`}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assistantFlightList}>
                  {assistantFlights.flights.map((flight) => {
                    const prefix = flightCodePrefix(flight.code);
                    const badgeColor = AIRLINE_COLORS[prefix] ?? '#9CA3AF';
                    return (
                      <TouchableOpacity
                        key={flight.id}
                        style={styles.assistantFlightCard}
                        activeOpacity={0.88}
                        onPress={() => chooseAssistantFlight(flight)}
                      >
                        <View style={styles.assistantAirlineRow}>
                          <View style={[styles.assistantAirlineBadge, { backgroundColor: badgeColor }]}>
                            <Text style={styles.assistantAirlineBadgeText}>{prefix}</Text>
                          </View>
                          <View style={styles.assistantAirlineInfo}>
                            <Text style={styles.assistantAirlineName} numberOfLines={1}>{flight.airline}</Text>
                            <Text style={styles.assistantFlightCode}>{flight.code}</Text>
                          </View>
                        </View>
                        <View style={styles.assistantTimeRow}>
                          <View>
                            <Text style={styles.assistantTime}>{flight.dep}</Text>
                            <Text style={styles.assistantAirport}>{assistantFlights.from}</Text>
                          </View>
                          <View style={styles.assistantDurationBox}>
                            <Text style={styles.assistantDuration}>{flight.duration}</Text>
                            <AppIcon name="airplaneTakeoff" size={15} color="#0064D2" />
                          </View>
                          <View style={styles.assistantArriveBox}>
                            <Text style={styles.assistantTime}>{flight.arr}</Text>
                            <Text style={styles.assistantAirport}>{assistantFlights.to}</Text>
                          </View>
                        </View>
                        <View style={styles.assistantCardFooter}>
                          <View>
                            <Text style={styles.assistantPrice}>{formatPrice(flight.priceVND, currency)}</Text>
                            <Text style={styles.assistantPerPax}>/ khách</Text>
                          </View>
                          <View style={styles.assistantChooseBtn}>
                            <Text style={styles.assistantChooseText}>Chọn chuyến này</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
          </View>
        ) : null}

        {showSuggestionChips ? <View style={styles.suggestionWrap}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={`${action.type || 'action'}-${action.label || index}-${index}`}
              style={[styles.suggestionChip, styles.actionChip]}
              onPress={() => handleActionPress(action)}
              disabled={loading}
            >
              <Text style={[styles.suggestionText, styles.actionText]}>{action.label || action.route || action.type}</Text>
            </TouchableOpacity>
          ))}
          {suggestions.map((s, index) => (
            <TouchableOpacity
              key={`${s.id || 'suggestion'}-${s.label || index}-${index}`}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(s)}
              disabled={loading}
            >
            <Text style={styles.suggestionText}>{s.label || s.id}</Text>
          </TouchableOpacity>
        ))}
        </View> : null}

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Nhap cau hoi cho AI..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!loading}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          <TouchableOpacity style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]} onPress={() => handleSend()} disabled={!canSend}>
            <AppIcon name="next" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  chatArea: { flex: 1 },
  header: { backgroundColor: '#0064D2', paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  discoveryPanel: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingTop: 12, paddingBottom: 10 },
  discoveryTitleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 10, gap: 10 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  aiBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  discoveryTitleBox: { flex: 1 },
  discoveryTitle: { color: '#111827', fontSize: 15, fontWeight: '800' },
  discoverySubtitle: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  filterContent: { paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  discoveryFilter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  discoveryFilterActive: { borderColor: '#0064D2', backgroundColor: '#0064D2' },
  discoveryFilterText: { color: '#0064D2', fontSize: 12, fontWeight: '700' },
  discoveryFilterTextActive: { color: '#fff' },
  destinationContent: { paddingHorizontal: 14, gap: 10 },
  destinationCard: { width: 260, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  destinationTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  destinationIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  destinationHeading: { flex: 1 },
  destinationCity: { color: '#111827', fontSize: 16, fontWeight: '800' },
  destinationRoute: { color: '#6B7280', fontSize: 12, marginTop: 1 },
  destinationBadge: { alignSelf: 'flex-start', color: '#075985', backgroundColor: '#E0F2FE', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  destinationDescription: { color: '#374151', fontSize: 13, lineHeight: 18, minHeight: 36, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  metaText: { flex: 1, color: '#6B7280', fontSize: 12 },
  destinationFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  priceLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '700' },
  destinationPrice: { color: '#0064D2', fontSize: 15, fontWeight: '900', marginTop: 2 },
  pickButton: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  pickButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  messageList: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  bubble: { maxWidth: '84%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0064D2' },
  bubbleText: { color: '#1F2937', fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#fff' },
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
  suggestionChip: { backgroundColor: '#EAF2FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { color: '#1D4ED8', fontSize: 12, fontWeight: '600' },
  actionChip: { backgroundColor: '#0064D2' },
  actionText: { color: '#fff' },
  assistantFlightPanel: { flexShrink: 0, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#fff', paddingVertical: 10 },
  assistantFlightHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 6 },
  assistantFlightEyebrow: { color: '#6B7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  assistantFlightTitle: { color: '#111827', fontSize: 14, fontWeight: '800', marginTop: 2 },
  assistantFlightNote: { color: '#6B7280', fontSize: 11, paddingHorizontal: 12, marginBottom: 8 },
  assistantFlightError: { color: '#B91C1C', backgroundColor: '#FEF2F2', borderRadius: 10, fontSize: 12, marginHorizontal: 12, padding: 10 },
  assistantFlightList: { paddingHorizontal: 12, gap: 10 },
  assistantFlightCard: { width: 280, borderWidth: 1, borderColor: '#DBEAFE', borderRadius: 14, backgroundColor: '#F8FBFF', padding: 12 },
  assistantAirlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  assistantAirlineBadge: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  assistantAirlineBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  assistantAirlineInfo: { flex: 1, marginLeft: 9 },
  assistantAirlineName: { color: '#111827', fontSize: 13, fontWeight: '800' },
  assistantFlightCode: { color: '#6B7280', fontSize: 11, marginTop: 1 },
  assistantTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assistantTime: { color: '#111827', fontSize: 19, fontWeight: '900' },
  assistantAirport: { color: '#6B7280', fontSize: 11, marginTop: 1 },
  assistantDurationBox: { alignItems: 'center', minWidth: 78 },
  assistantDuration: { color: '#6B7280', fontSize: 11, marginBottom: 3 },
  assistantArriveBox: { alignItems: 'flex-end' },
  assistantCardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 },
  assistantPrice: { color: '#0064D2', fontSize: 16, fontWeight: '900' },
  assistantPerPax: { color: '#9CA3AF', fontSize: 10 },
  assistantChooseBtn: { backgroundColor: '#0064D2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  assistantChooseText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  inputBar: { flexDirection: 'row', alignItems: 'center', flexShrink: 0, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1A1A2E', backgroundColor: '#F9FAFB' },
  sendBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#0064D2', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#9CA3AF' },
});

