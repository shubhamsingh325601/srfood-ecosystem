export interface HeroSlide {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
}

export interface HomepageContent {
  hero: HeroSlide[];
  offer: { code: string; percent: number; headline: string; sub: string };
}

export interface FaqItem {
  question: string;
  answer: string;
  displayOrder: number;
}

export interface FaqContent {
  faqs: FaqItem[];
}

export interface LegalContent {
  text: string;
}

export interface SettingsContent {
  social: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber: string;
}
