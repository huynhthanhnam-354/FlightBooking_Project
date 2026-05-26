import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language } from '../i18n/translations';

const LANGUAGE_KEY = 'skybook_language';
const CURRENCY_KEY = 'skybook_currency';
const ONBOARDING_DONE_KEY = 'skybook_onboarding_done';

const LANGUAGES: Language[] = ['vi', 'en', 'ko', 'ja', 'zh', 'th', 'es'];

export async function getLanguagePreference(): Promise<Language | null> {
  const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
  return LANGUAGES.includes(raw as Language) ? (raw as Language) : null;
}

export async function saveLanguagePreference(language: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export async function getCurrencyPreference(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(CURRENCY_KEY);
  return raw && raw.trim() ? raw.trim().toUpperCase() : null;
}

export async function saveCurrencyPreference(code: string): Promise<void> {
  await AsyncStorage.setItem(CURRENCY_KEY, code.trim().toUpperCase());
}

export async function getOnboardingDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_DONE_KEY)) === '1';
}

export async function saveOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, '1');
}
