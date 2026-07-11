import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, UtensilsCrossed, ClipboardList, MapPin, Tag,
  HelpCircle, LayoutGrid, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Categories", url: "/categories", icon: LayoutGrid },
  { title: "My Orders", url: "/orders", icon: ClipboardList },
  { title: "Track Order", url: "/track", icon: MapPin },
  { title: "Offers", url: "/offers", icon: Tag },
  { title: "Contact", url: "/contact", icon: Phone },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden lg:flex w-60 shrink-0 sticky top-[72px] self-start h-[calc(100vh-72px)] border-r bg-sidebar">
      <nav className="flex flex-col gap-1 p-3 w-full">
        {items.map((item) => {
          const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
