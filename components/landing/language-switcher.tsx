"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5 text-xs">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded px-2 py-1 font-medium transition-colors",
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
