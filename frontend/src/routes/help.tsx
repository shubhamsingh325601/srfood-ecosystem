import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFaqs } from "@/features/cms/services/cmsApi";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: `Help & Support – ${APP_NAME}` }] }),
  component: HelpPage,
});

function HelpPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["cms-faqs"],
    queryFn: () => getFaqs().catch(() => ({ faqs: [] })),
  });
  const faqs = data?.faqs ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-3xl font-bold">Help & Support</h1>
      <p className="text-muted-foreground mt-2">Frequently asked questions</p>
      <div className="mt-6 bg-card border rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground p-2">Loading…</p>
        ) : !faqs.length ? (
          <p className="text-sm text-muted-foreground p-2">No FAQs published yet.</p>
        ) : (
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`i${i}`}>
                <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
