import { APP_ID } from "@/lib/brand";

export function Logo({ compact = false }: { compact?: boolean }) {
  const isShreeRadheFood = APP_ID === "shreeradhefood" || APP_ID === "shreeradhefoods";
  const logoSrc = isShreeRadheFood ? "/favicon.jpg" : "/srfoods-logo.jpeg";
  const logoAlt = isShreeRadheFood ? "Shree Radhe Food" : "SRFOOD — Shree Radhe Food";

  return (
    <div className="select-none">
      <img
        src={logoSrc}
        alt={logoAlt}
        className={compact ? "h-12 w-12 object-contain" : "h-14 w-40 object-contain"}
      />
    </div>
  );
}
