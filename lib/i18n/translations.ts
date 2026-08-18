/**
 * Landing-page copy in both supported languages. Deliberately a plain
 * in-memory dictionary rather than a full i18n routing framework (no
 * /en /az URL segments, no middleware) — the app currently only needs the
 * landing page translated, and this keeps that scoped and simple.
 */
export const translations = {
  en: {
    nav: { signIn: "Sign in", signUp: "Sign up" },
    hero: {
      titleLine1: "Redesign your room with AI.",
      titleLine2: "Shop every product in it.",
      subtitle:
        "Upload a photo of your room and get AI-generated redesigns built entirely from real, purchasable products. No generic internet furniture, ever.",
      getStarted: "Get started free",
      signIn: "Sign in",
    },
    features: [
      {
        title: "Upload your room",
        description:
          "Snap a photo of any room: living room, bedroom, kitchen, or office.",
      },
      {
        title: "Get 4 AI redesigns",
        description:
          "Pick a style and budget; our AI generates four distinct, photorealistic redesigns.",
      },
      {
        title: "Shop every product",
        description:
          "Every item in the design is real and clickable. See the price, brand, and details.",
      },
      {
        title: "Have us install it",
        description:
          "Buy the products yourself, or let our team handle the entire project.",
      },
    ],
    howItWorks: {
      heading: "How it works",
      steps: [
        { title: "Upload a photo", description: "Any room, any angle." },
        {
          title: "Set your style & budget",
          description: "Scandinavian, Japandi, Luxury, and more.",
        },
        {
          title: "Review 4 designs",
          description: "Each one built entirely from our catalog.",
        },
        {
          title: "Buy or book install",
          description: "Purchase products, or go fully turnkey.",
        },
      ],
    },
    cta: {
      heading: "Ready to see your room reimagined?",
      subtitle:
        "It's free to try. Sign up and upload your first room in under a minute.",
      button: "Get started free",
    },
    footer: "Interior AI: AI-powered interior design & shopping platform.",
  },
  az: {
    nav: { signIn: "Daxil ol", signUp: "Qeydiyyat" },
    hero: {
      titleLine1: "Otağınızı süni intellektlə yenidən dizayn edin —",
      titleLine2: "içindəki hər məhsulu satın alın.",
      subtitle:
        "Otağınızın şəklini yükləyin və tamamilə real, satın alına bilən məhsullardan hazırlanmış süni intellekt dizaynları əldə edin — heç vaxt adi internet mebeli yox.",
      getStarted: "Pulsuz başlayın",
      signIn: "Daxil ol",
    },
    features: [
      {
        title: "Otağınızı yükləyin",
        description:
          "Hər hansı otağın şəklini çəkin — qonaq otağı, yataq otağı, mətbəx və ya ofis.",
      },
      {
        title: "4 süni intellekt dizaynı əldə edin",
        description:
          "Stil və büdcə seçin; süni intellektimiz dörd fərqli, fotorealistik dizayn yaradır.",
      },
      {
        title: "Hər məhsulu satın alın",
        description:
          "Dizaynda olan hər əşya realdır və klikləyə bilərsiniz — qiyməti, brendi və təfərrüatları görün.",
      },
      {
        title: "Quraşdırmanı bizə həvalə edin",
        description:
          "Məhsulları özünüz alın, ya da komandamız bütün layihəni idarə etsin.",
      },
    ],
    howItWorks: {
      heading: "Necə işləyir",
      steps: [
        { title: "Şəkil yükləyin", description: "Hər hansı otaq, hər hansı bucaq." },
        {
          title: "Stil və büdcənizi seçin",
          description: "Skandinav, Japandi, Lüks və daha çox.",
        },
        {
          title: "4 dizaynı nəzərdən keçirin",
          description: "Hər biri tamamilə kataloqumuzdan hazırlanıb.",
        },
        {
          title: "Alın və ya quraşdırma sifariş edin",
          description: "Məhsulları alın, ya da tam xidmətdən istifadə edin.",
        },
      ],
    },
    cta: {
      heading: "Otağınızın yeni görünüşünü görməyə hazırsınız?",
      subtitle:
        "Sınamaq pulsuzdur — qeydiyyatdan keçin və bir dəqiqədən az vaxtda ilk otağınızı yükləyin.",
      button: "Pulsuz başlayın",
    },
    footer:
      "Interior AI — Süni intellektlə interyer dizaynı və alış-veriş platforması.",
  },
} as const;

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "az", label: "AZ" },
];
