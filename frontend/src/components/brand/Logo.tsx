import logoCircle from "@/assets/logo-circle.jpeg";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={logoCircle}
        alt="Shree Radhe Food"
        className={`rounded-full object-cover shadow-pop ${compact ? "w-10 h-10" : "w-12 h-12"}`}
      />
    </div>
  );
}
