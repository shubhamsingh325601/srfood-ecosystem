import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home, UtensilsCrossed, ClipboardList, MapPin, Tag,
  HelpCircle, LayoutGrid, Phone, Heart, User, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { logoutRequest } from "@/features/auth/services/authApi";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Menu", url: "/menu", icon: UtensilsCrossed },
  { title: "Categories", url: "/categories", icon: LayoutGrid },
  { title: "Favourites", url: "/favorites", icon: Heart },
  { title: "My Orders", url: "/orders", icon: ClipboardList },
  { title: "Track Order", url: "/track", icon: MapPin },
  { title: "Offers", url: "/offers", icon: Tag },
  { title: "Contact", url: "/contact", icon: Phone },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
];

function rowClass(active: boolean) {
  return cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-left",
    active
      ? "bg-primary text-primary-foreground shadow-soft"
      : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

/**
 * Used both as the persistent desktop rail (`mobile` unset, in __root.tsx) and as the
 * content of the mobile hamburger Sheet (`mobile`, in Header.tsx). The Sheet already gates
 * visibility to small screens via its trigger button, so the mobile variant must render its
 * own content unconditionally rather than inheriting the desktop `hidden lg:flex` wrapper.
 */
export function AppSidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const currentUser = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const storeLogout = useAuthStore((s) => s.logout);
  const nav = useNavigate();

  const handleLogout = () => {
    onNavigate?.();
    if (refreshToken) void logoutRequest(refreshToken).catch(() => undefined);
    storeLogout();
    nav({ to: "/" });
  };

  const nav_ = (
    <nav className="flex flex-col gap-1 p-3 w-full">
      {items.map((item) => {
        const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
        const Icon = item.icon;
        return (
          <Link key={item.title} to={item.url} onClick={onNavigate} className={rowClass(active)}>
            <Icon className="w-[18px] h-[18px]" />
            <span>{item.title}</span>
          </Link>
        );
      })}

      {mobile && (
        <>
          <div className="my-2 border-t" />
          {currentUser ? (
            <>
              <Link
                to="/profile"
                onClick={onNavigate}
                className={rowClass(pathname.startsWith("/profile"))}
              >
                <User className="w-[18px] h-[18px]" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  rowClass(false),
                  "text-destructive hover:bg-destructive/10 hover:text-destructive",
                )}
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={onNavigate}
              className={rowClass(pathname.startsWith("/auth"))}
            >
              <User className="w-[18px] h-[18px]" />
              <span>Login / Sign up</span>
            </Link>
          )}
        </>
      )}
    </nav>
  );

  if (mobile) return nav_;

  return (
    <aside className="hidden lg:flex w-60 shrink-0 sticky top-[72px] self-start h-[calc(100vh-72px)] border-r bg-sidebar">
      {nav_}
    </aside>
  );
}
