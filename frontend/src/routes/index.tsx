import { createFileRoute } from "@tanstack/react-router";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Categories } from "@/components/home/Categories";
import { PopularItems } from "@/components/home/PopularItems";
import { OfferBanner } from "@/components/home/OfferBanner";
import { Features } from "@/components/home/Features";
import { Reviews } from "@/components/home/Reviews";
import { APP_DESCRIPTION, APP_OG_TITLE } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: APP_OG_TITLE },
      { name: "description", content: APP_DESCRIPTION },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="px-4 md:px-6 py-5 space-y-10 max-w-[1400px] mx-auto animate-fade-in">
      <HeroSlider />
      <Categories />
      <PopularItems />
      <OfferBanner />
      <Features />
      <Reviews />
    </div>
  );
}
