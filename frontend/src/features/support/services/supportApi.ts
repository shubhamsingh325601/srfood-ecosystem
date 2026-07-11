import { api } from "@/lib/axios";

export interface CreateTicketPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

export async function createSupportTicket(payload: CreateTicketPayload): Promise<void> {
  await api.post("/support/tickets", payload);
}
