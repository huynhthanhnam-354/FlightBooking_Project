import React, { createContext, useContext, useState } from 'react';
import { translations, Language } from '../i18n/translations';
import { Currency, CURRENCIES, DEFAULT_CURRENCY_BY_LANG } from '../i18n/currencies';

type TKey = keyof typeof translations['vi'];

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TKey) => string;
  currency: Currency;
  setCurrencyByCode: (code: string) => void;
};

const defaultCurrency = CURRENCIES.find(c => c.code === 'VND')!;

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: (key) => key as string,
  currency: defaultCurrency,
  setCurrencyByCode: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // tự động đổi tiền tệ gợi ý khi đổi ngôn ngữ
    const suggestedCode = DEFAULT_CURRENCY_BY_LANG[lang];
    const suggested = CURRENCIES.find(c => c.code === suggestedCode);
    if (suggested) setCurrencyState(suggested);
  };

  const setCurrencyByCode = (code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setCurrencyState(found);
  };

  const t = (key: TKey): string => {
    return (translations[language] as any)[key]
      ?? (translations['vi'] as any)[key]
      ?? (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currency, setCurrencyByCode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
