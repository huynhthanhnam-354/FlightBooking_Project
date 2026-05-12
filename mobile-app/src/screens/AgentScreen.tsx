import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import AppIcon from '../components/AppIcon';
import { AgentMessage, sendMessageToAgent } from '../services/agent';
import { useLanguage } from '../context/LanguageContext';

function makeMessage(role: 'user' | 'assistant', content: string): AgentMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export default function AgentScreen() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setMessages([makeMessage('assistant', t('agent_intro'))]);
    setSuggestions([]);
  }, [language, t]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg = makeMessage('user', text);
    setMessages((prev) => [userMsg, ...prev]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessageToAgent(text, undefined, language);
      setMessages((prev) => [makeMessage('assistant', response.reply), ...prev]);
      setSuggestions(response.suggestions.map((s) => s.label));
    } catch (_err) {
      setMessages((prev) => [makeMessage('assistant', t('agent_service_error')), ...prev]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0064D2" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSub}>Tu van tim chuyen bay va dat ve</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.suggestionWrap}>
        {suggestions.map((s) => (
          <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSend(s)} disabled={loading}>
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Nhap cau hoi cho AI..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          editable={!loading}
        />
        <TouchableOpacity style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]} onPress={() => handleSend()} disabled={!canSend}>
          <AppIcon name="next" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#0064D2', paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { color: '#fff', fontSize: 19, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  bubble: { maxWidth: '84%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0064D2' },
  bubbleText: { color: '#1F2937', fontSize: 14, lineHeight: 20 },
  userBubbleText: { color: '#fff' },
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
  suggestionChip: { backgroundColor: '#EAF2FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { color: '#1D4ED8', fontSize: 12, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1A1A2E', backgroundColor: '#F9FAFB' },
  sendBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#0064D2', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#9CA3AF' },
});

