import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Search, User, ShoppingCart, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { logoutRequest } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, selectCartCount } from "@/store/cartStore";

export function Header() {
  const cartCount = useCartStore(selectCartCount);
  const currentUser = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const storeLogout = useAuthStore((s) => s.logout);
  const nav = useNavigate();
  const logout = () => {
    if (refreshToken) void logoutRequest(refreshToken).catch(() => undefined);
    storeLogout();
  };
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/menu", search: { q } as never });
  };
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b">
      <div className="px-4 md:px-6 h-[72px] flex items-center gap-3 md:gap-4">
        <Sheet>
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
              <AppSidebar />
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 hover:bg-accent transition text-left">
          <MapPin className="w-4 h-4 text-primary" />
          <div className="text-xs leading-tight">
            <div className="text-muted-foreground">Delivery in</div>
            <div className="font-semibold text-foreground">123456 – Train/Station</div>
          </div>
        </button>

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
        <Button asChild size="sm" className="h-11 rounded-full px-4 gap-2 shadow-pop">
          <Link to="/cart">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart ({cartCount})</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
