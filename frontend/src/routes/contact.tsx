import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSettings } from "@/features/cms/services/cmsApi";
import { createSupportTicket } from "@/features/support/services/supportApi";
import { getApiErrorMessage } from "@/lib/axios";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact – ${APP_NAME}` },
      { name: "description", content: `Get in touch with ${APP_NAME} support.` },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(1000),
});
type F = z.infer<typeof schema>;

function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () =>
      getSettings().catch(() => ({
        social: {},
        contactEmail: "",
        contactPhone: "",
        contactAddress: "",
        whatsappNumber: "",
        upiVpa: "",
        upiPayeeName: "",
      })),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: F) => {
    try {
      await createSupportTicket({
        name: d.name,
        email: d.email,
        subject: "Contact form inquiry",
        message: d.message,
      });
      toast.success(`Thanks ${d.name}, we'll respond shortly.`);
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send your message"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 grid md:grid-cols-2 gap-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground mt-2">We're here to help — 24/7.</p>
        <div className="mt-6 space-y-4">
          <Info I={Mail} label="Email" v={settings?.contactEmail || "—"} />
          <Info I={Phone} label="Phone" v={settings?.contactPhone || "—"} />
          <Info I={MapPin} label="Address" v={settings?.contactAddress || "—"} />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-card border rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-lg">Send us a message</h2>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Message</Label>
          <Textarea rows={5} {...register("message")} />
          {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </div>
  );
}

function Info({
  I,
  label,
  v,
}: {
  I: React.ComponentType<{ className?: string }>;
  label: string;
  v: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
        <I className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-medium">{v}</div>
      </div>
    </div>
  );
}
