"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n/translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "interior-ai-locale";

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "az";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always starts "en" on both server and first client render, then
  // corrects from localStorage after mount — avoids a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) setLocaleState(stored);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
