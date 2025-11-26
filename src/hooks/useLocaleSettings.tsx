import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'FR' | 'EN';
export type Currency = '€' | '$' | '£';

interface LocaleSettings {
  language: Language;
  currency: Currency;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useLocaleSettings = create<LocaleSettings>()(
  persist(
    (set) => ({
      language: 'FR',
      currency: '€',
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'locale-settings',
    }
  )
);
