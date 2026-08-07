import { createFileRoute } from "@tanstack/react-router";
import { HeroSlider } from "@/components/home/HeroSlider";
import { OffersBanner } from "@/components/home/OffersBanner";
import { HomeSectionTabs } from "@/components/home/HomeSectionTabs";
import { Categories } from "@/components/home/Categories";
import { MenuItems } from "@/components/home/MenuItems";
import { Features } from "@/components/home/Features";
import { Reviews } from "@/components/home/Reviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SRFOOD – Fresh Food Delivered in Kota & Sawai Madhopur" },
      {
        name: "description",
        content:
          "Order hygienic, fresh meals delivered fast across Kota & Sawai Madhopur.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="px-4 md:px-6 py-5 space-y-10 max-w-[1400px] mx-auto animate-fade-in">
      <HeroSlider />
      <OffersBanner />
      <HomeSectionTabs />
      <Categories />
      <MenuItems />
      <Features />
      <Reviews />
    </div>
  );
}
