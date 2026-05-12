import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { getHelpTopic, type HelpTopicId } from '../content/helpTopics';

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
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{content.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {content.paragraphs.map((p, i) => (
          <Text key={i} style={styles.p}>
            {p}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  },
  backText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  body: { padding: 20, paddingBottom: 40 },
  p: { fontSize: 15, lineHeight: 24, color: '#374151', marginBottom: 16 },
});
