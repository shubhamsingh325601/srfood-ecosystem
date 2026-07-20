import bannerSrf from "@/assets/banner-srf.jpeg";

export function BrandBanner() {
  return (
    <section className="rounded-2xl overflow-hidden border shadow-card">
      <img
        src={bannerSrf}
        alt="Shree Radhe Food — Delighting Your Taste"
        className="w-full object-cover aspect-[2/1] object-right sm:aspect-[16/5] sm:object-center max-h-[220px] md:max-h-[240px]"
      />
    </section>
  );
}
