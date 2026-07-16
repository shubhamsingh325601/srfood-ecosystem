import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logoutRequest } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile – SRFOOD" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const currentUser = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const storeLogout = useAuthStore((s) => s.logout);
  const nav = useNavigate();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Log In / Sign Up</Link>
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    if (refreshToken) void logoutRequest(refreshToken).catch(() => undefined);
    storeLogout();
    toast.success("Logged out");
    nav({ to: "/" });
  };

  const rows = [
    { icon: User, label: "Name", value: currentUser.name },
    ...(currentUser.email ? [{ icon: Mail, label: "Email", value: currentUser.email }] : []),
    { icon: Phone, label: "Mobile", value: currentUser.mobile },
    { icon: ShieldCheck, label: "Role", value: currentUser.role },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-bold mb-5">My Profile</h1>
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary font-bold text-xl grid place-items-center shrink-0">
            {currentUser.name[0]}
          </div>
          <div>
            <div className="font-bold text-lg">{currentUser.name}</div>
            <div className="text-sm text-muted-foreground">{currentUser.mobile}</div>
          </div>
        </div>
        <div className="border-t pt-4 space-y-3">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-16">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/orders">Order History</Link>
          </Button>
          <Button variant="destructive" className="rounded-full gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
