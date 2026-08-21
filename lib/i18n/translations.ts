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
      tagline: "Design for everybody",
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
    benefits: {
      heading: "Why people use Afuna AI",
      subtitle: "Real outcomes, not just pretty pictures.",
      items: [
        {
          title: "See it before you buy it",
          description:
            "Know exactly how a piece will look in your actual room before you spend a cent — not a showroom, not a guess.",
        },
        {
          title: "Every item is real and buyable",
          description:
            "No generic AI furniture that doesn't exist. Every piece in your design links to a real product you can purchase today.",
        },
        {
          title: "Save thousands vs. a designer",
          description:
            "Get four professional-quality redesigns in minutes — free to try — instead of weeks of consultations and design fees.",
        },
        {
          title: "No more returns, no more regrets",
          description:
            "Skip the guesswork of buying furniture that doesn't fit your space or match your style — see it working together first.",
        },
      ],
    },
    different: {
      heading: "How Afuna AI is different",
      subtitle: "Compared to the alternatives.",
      comparisons: [
        {
          old: "Generic AI design apps show furniture that doesn't exist and can't be bought.",
          new: "Every item Afuna AI shows you is real, priced, and one click from checkout.",
        },
        {
          old: "Hiring an interior designer takes weeks and costs thousands in fees.",
          new: "Afuna AI gives you four professional redesigns in minutes, free to try.",
        },
        {
          old: "Buying furniture online means guessing whether it'll fit or match.",
          new: "Afuna AI shows it in your actual room first, so you buy with confidence.",
        },
      ],
    },
    styles: {
      heading: "Explore design styles",
      subtitle: "Pick a look, then let our AI build it around your room.",
      names: [
        "Scandinavian",
        "Japandi",
        "Luxury",
        "Industrial",
        "Mediterranean",
        "Bohemian",
        "Rustic",
        "Minimalist",
      ],
    },
    beforeAfter: {
      heading: "See the transformation",
      subtitle:
        "From an empty room to a fully styled space, built entirely from real products.",
    },
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
    team: {
      heading: "Meet the team",
      subtitle: "The people building Afuna AI.",
      members: [
        { name: "Farida Mukhtarzade", role: "Architecture Design" },
        { name: "Pablo", role: "Engineer" },
      ],
    },
    cta: {
      heading: "Ready to see your room reimagined?",
      subtitle:
        "It's free to try. Sign up and upload your first room in under a minute.",
      button: "Get started free",
    },
    footer: "Afuna AI: AI-powered interior design & shopping platform.",
  },
  az: {
    nav: { signIn: "Daxil ol", signUp: "Qeydiyyat" },
    hero: {
      tagline: "Hər kəs üçün dizayn",
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
    benefits: {
      heading: "İnsanlar niyə Afuna AI istifadə edir",
      subtitle: "Sadəcə gözəl şəkillər deyil, real nəticələr.",
      items: [
        {
          title: "Almazdan əvvəl görün",
          description:
            "Bir əşyanın otağınızda necə görünəcəyini bir qəpik xərcləmədən dəqiq bilin — nümayiş zalı deyil, təxmin deyil.",
        },
        {
          title: "Hər əşya realdır və satın alına bilər",
          description:
            "Mövcud olmayan ümumi süni intellekt mebeli yoxdur. Dizaynınızdakı hər əşya bu gün satın ala biləcəyiniz real məhsula bağlıdır.",
        },
        {
          title: "Dizaynerdən minlərlə qənaət edin",
          description:
            "Həftələrlə konsultasiya və dizayn haqqı əvəzinə, dəqiqələr içində dörd peşəkar dizayn əldə edin — sınamaq pulsuzdur.",
        },
        {
          title: "Daha çox geri qaytarma, daha çox peşmançılıq yox",
          description:
            "Məkanınıza uyğun olmayan və ya üslubunuzla uyğunlaşmayan mebel almaq təxmini buraxın — əvvəlcə birlikdə necə işlədiyini görün.",
        },
      ],
    },
    different: {
      heading: "Afuna AI necə fərqlidir",
      subtitle: "Alternativlərlə müqayisədə.",
      comparisons: [
        {
          old: "Adi süni intellekt dizayn tətbiqləri mövcud olmayan və alına bilməyən mebel göstərir.",
          new: "Afuna AI-nin göstərdiyi hər əşya realdır, qiymətləndirilib və bir kliklə satın almağa hazırdır.",
        },
        {
          old: "İnteryer dizayneri işə götürmək həftələr çəkir və minlərlə haqq tələb edir.",
          new: "Afuna AI dəqiqələr içində dörd peşəkar dizayn təklif edir — sınamaq pulsuzdur.",
        },
        {
          old: "Onlayn mebel almaq uyğun gələcəyini və ya üslubla uyğunlaşacağını təxmin etmək deməkdir.",
          new: "Afuna AI onu əvvəlcə real otağınızda göstərir, beləliklə əminliklə alış-veriş edirsiniz.",
        },
      ],
    },
    styles: {
      heading: "Dizayn üslublarını kəşf edin",
      subtitle: "Bir görünüş seçin, süni intellektimiz onu otağınıza uyğunlaşdırsın.",
      names: [
        "Skandinav",
        "Japandi",
        "Lüks",
        "Sənaye",
        "Aralıq dənizi",
        "Boho",
        "Rustik",
        "Minimalist",
      ],
    },
    beforeAfter: {
      heading: "Dəyişikliyi görün",
      subtitle:
        "Boş otaqdan tamamilə real məhsullardan hazırlanmış dizayn edilmiş məkana.",
    },
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
    team: {
      heading: "Komandamızla tanış olun",
      subtitle: "Afuna AI-ni quran insanlar.",
      members: [
        { name: "Farida Mukhtarzade", role: "Memarlıq Dizaynı" },
        { name: "Pablo", role: "Mühəndis" },
      ],
    },
    cta: {
      heading: "Otağınızın yeni görünüşünü görməyə hazırsınız?",
      subtitle:
        "Sınamaq pulsuzdur — qeydiyyatdan keçin və bir dəqiqədən az vaxtda ilk otağınızı yükləyin.",
      button: "Pulsuz başlayın",
    },
    footer:
      "Afuna AI — Süni intellektlə interyer dizaynı və alış-veriş platforması.",
  },
} as const;

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "az", label: "AZ" },
];
