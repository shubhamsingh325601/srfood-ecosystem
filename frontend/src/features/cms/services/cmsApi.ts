import { api } from "@/lib/axios";
import type { FaqContent, HomepageContent, LegalContent, SettingsContent } from "../types";

export async function getHomepage(): Promise<HomepageContent> {
  const { data } = await api.get("/cms/homepage");
  return data.data;
}
export async function updateHomepage(payload: HomepageContent): Promise<HomepageContent> {
  const { data } = await api.put("/admin/cms/homepage", payload);
  return data.data;
}

export async function getFaqs(): Promise<FaqContent> {
  const { data } = await api.get("/cms/faqs");
  return data.data;
}
export async function updateFaqs(payload: FaqContent): Promise<FaqContent> {
  const { data } = await api.put("/admin/cms/faqs", payload);
  return data.data;
}

export async function getPrivacyPolicy(): Promise<LegalContent> {
  const { data } = await api.get("/cms/privacy-policy");
  return data.data;
}
export async function updatePrivacyPolicy(payload: LegalContent): Promise<LegalContent> {
  const { data } = await api.put("/admin/cms/privacy-policy", payload);
  return data.data;
}

export async function getTerms(): Promise<LegalContent> {
  const { data } = await api.get("/cms/terms");
  return data.data;
}
export async function updateTerms(payload: LegalContent): Promise<LegalContent> {
  const { data } = await api.put("/admin/cms/terms", payload);
  return data.data;
}

export async function getSettings(): Promise<SettingsContent> {
  const { data } = await api.get("/cms/settings");
  return data.data;
}
export async function updateSettings(payload: SettingsContent): Promise<SettingsContent> {
  const { data } = await api.put("/admin/cms/settings", payload);
  return data.data;
}
