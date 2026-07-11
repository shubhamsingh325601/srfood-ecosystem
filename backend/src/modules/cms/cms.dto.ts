import { z } from 'zod';

const heroSlideSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().max(120),
  desc: z.string().trim().max(300),
  cta: z.string().trim().max(60),
});

export const homepageContentSchema = z.object({
  hero: z.array(heroSlideSchema).max(10),
  offer: z.object({
    code: z.string().trim().max(30),
    percent: z.number().min(0).max(100),
    headline: z.string().trim().max(120),
    sub: z.string().trim().max(200),
  }),
});
export type HomepageContentInput = z.infer<typeof homepageContentSchema>;

export const faqContentSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(3).max(200),
        answer: z.string().trim().min(3).max(1000),
        displayOrder: z.number().int().default(0),
      }),
    )
    .max(50),
});
export type FaqContentInput = z.infer<typeof faqContentSchema>;

export const legalContentSchema = z.object({
  text: z.string().trim().min(10),
});
export type LegalContentInput = z.infer<typeof legalContentSchema>;

export const settingsContentSchema = z.object({
  social: z.object({
    facebook: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    twitter: z.string().trim().optional(),
    youtube: z.string().trim().optional(),
  }),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim(),
  contactAddress: z.string().trim().max(300),
});
export type SettingsContentInput = z.infer<typeof settingsContentSchema>;
