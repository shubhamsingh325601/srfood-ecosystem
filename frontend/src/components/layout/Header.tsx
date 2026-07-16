import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, User, ShoppingCart, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { DeliveryTrainDialog } from "./DeliveryTrainDialog";
import { logoutRequest } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, selectCartCount } from "@/store/cartStore";
import { useDeliveryStore } from "@/store/deliveryStore";
import { getSettings } from "@/features/cms/services/cmsApi";

const WHATSAPP_MESSAGE = "Hi, I need help with my SR Food order.";

function whatsAppLink(rawNumber: string): string {
  const digits = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.55-3.7 8.24-8.25 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
    </svg>
  );
}

export function Header() {
  const cartCount = useCartStore(selectCartCount);
  const { data: settings } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () => getSettings().catch(() => null),
  });
  const currentUser = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const storeLogout = useAuthStore((s) => s.logout);
  const trainNumber = useDeliveryStore((s) => s.trainNumber);
  const trainName = useDeliveryStore((s) => s.trainName);
  const nav = useNavigate();
  const logout = () => {
    if (refreshToken) void logoutRequest(refreshToken).catch(() => undefined);
    storeLogout();
  };
  const [q, setQ] = useState("");
  const [trainDialogOpen, setTrainDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/menu", search: { q } as never });
  };
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b">
      <div className="px-4 md:px-6 h-[72px] flex items-center gap-3 md:gap-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="p-4 border-b">
              <Logo />
            </div>
            <div className="-mt-[72px] pt-[72px]">
              <AppSidebar mobile onNavigate={() => setSidebarOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <button
          type="button"
          onClick={() => setTrainDialogOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 hover:bg-accent transition text-left"
        >
          <MapPin className="w-4 h-4 text-primary" />
          <div className="text-xs leading-tight">
            <div className="text-muted-foreground">Delivery in</div>
            <div className="font-semibold text-foreground">
              {trainNumber ? `#${trainNumber}${trainName ? ` – ${trainName}` : ""}` : "Set your train"}
            </div>
          </div>
        </button>
        <DeliveryTrainDialog open={trainDialogOpen} onOpenChange={setTrainDialogOpen} />

        <form onSubmit={submit} className="flex-1 max-w-xl relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for food or cuisine…"
            className="pl-10 h-11 rounded-full bg-muted border-transparent focus-visible:bg-background"
          />
        </form>

        <div className="flex-1 sm:hidden" />

        {currentUser ? (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium">Hi, {currentUser.name.split(" ")[0]}</span>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:inline-flex h-11 rounded-full px-4 gap-2"
          >
            <Link to="/auth">
              <User className="w-4 h-4" />
              <span>Login / Sign up</span>
            </Link>
          </Button>
        )}
        {settings?.whatsappNumber && (
          <a
            href={whatsAppLink(settings.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            title="Chat with us on WhatsApp"
            className="shrink-0 h-11 rounded-full px-3 sm:px-4 gap-2 inline-flex items-center border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 transition"
          >
            <WhatsAppIcon className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline text-sm font-semibold">WhatsApp Support</span>
          </a>
        )}
        <Button asChild size="sm" className="h-11 rounded-full px-4 gap-2 shadow-pop">
          <Link to="/cart">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart ({cartCount})</span>
          </Link>
        </Button>
      </div>

      <form onSubmit={submit} className="sm:hidden px-4 pb-3 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for food or cuisine…"
          className="pl-10 h-11 rounded-full bg-muted border-transparent focus-visible:bg-background"
        />
      </form>
    </header>
  );
}
