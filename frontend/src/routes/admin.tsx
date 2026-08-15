import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Home,
  Users,
  Package,
  UtensilsCrossed,
  Palette,
  Star,
  Layers,
  MapPin,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { login, logoutRequest } from "@/features/auth/services/authApi";
import { isAdminRole, useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getDashboardSummary,
  listAdminOrders,
  updateOrderStatus,
  listAdminUsers,
  setUserBlocked,
  type AdminOrder,
  type AdminUser,
} from "@/features/admin/services/adminApi";
import { nextValidStatuses, statusLabel } from "@/features/admin/orderStatusTransitions";
import {
  listNotifications,
  markNotificationRead,
} from "@/features/notifications/services/notificationsApi";
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  type MenuItemPayload,
  type CategoryPayload,
} from "@/features/menu/services/menuApi";
import { paiseToRupees } from "@/features/menu/mappers";
import type { ApiCategory, ApiMenuItem } from "@/features/menu/types";
import { listAdminRatings, moderateRating } from "@/features/ratings/services/ratingsApi";
import {
  getStations,
  createStation,
  updateStation,
  deleteStation,
  type StationPayload,
} from "@/features/stations/services/stationsApi";
import type { ApiStation } from "@/features/stations/types";
import {
  getHomepage,
  updateHomepage,
  getFaqs,
  updateFaqs,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getTerms,
  updateTerms,
  getSettings,
  updateSettings,
} from "@/features/cms/services/cmsApi";
import type {
  FaqContent,
  HomepageContent,
  LegalContent,
  SettingsContent,
} from "@/features/cms/types";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: `Admin Panel – ${APP_NAME}` }] }),
  component: AdminPage,
});

function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const authLogout = useAuthStore((s) => s.logout);
  const logoutAdmin = () => {
    if (refreshToken) void logoutRequest(refreshToken).catch(() => undefined);
    authLogout();
  };

  if (!isAdminRole(currentUser?.role)) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <div className="bg-card border rounded-2xl p-8 w-full max-w-sm space-y-4 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            {currentUser
              ? "Your account does not have admin access."
              : "Sign in with your admin account to continue."}
          </p>
          <AdminLoginForm />
          <Link
            to="/"
            className="block text-center text-xs text-muted-foreground hover:text-primary"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:block pl-3 border-l">
              <div className="font-bold text-sm">Admin Panel</div>
              <div className="text-xs text-muted-foreground">Manage everything</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="w-4 h-4 mr-1" />
                View Site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logoutAdmin}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6 h-auto">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Home className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-1.5">
              <UtensilsCrossed className="w-4 h-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5">
              <Layers className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="stations" className="gap-1.5">
              <MapPin className="w-4 h-4" />
              Stations
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5">
              <Palette className="w-4 h-4" />
              Content
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          <TabsContent value="menu">
            <MenuAdmin />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesAdmin />
          </TabsContent>
          <TabsContent value="stations">
            <StationsAdmin />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersAdmin />
          </TabsContent>
          <TabsContent value="users">
            <UsersAdmin />
          </TabsContent>
          <TabsContent value="reviews">
            <ReviewsAdmin />
          </TabsContent>
          <TabsContent value="content">
            <ContentAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const adminLoginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(1, "Password is required"),
});
type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

function AdminPasswordInput({ field }: { field: UseFormRegisterReturn }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-10" {...field} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function AdminLoginForm() {
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = async (values: AdminLoginFormValues) => {
    try {
      const { tokens, user } = await login(values.mobile, values.password);
      if (!isAdminRole(user.role)) {
        toast.error("This account does not have admin access");
        return;
      }
      setSession(user, tokens.accessToken, tokens.refreshToken);
      toast.success(`Welcome back, ${user.name}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid mobile number or password"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-left">
      <div className="space-y-1.5">
        <Label>Mobile Number</Label>
        <Input inputMode="numeric" maxLength={10} placeholder="9876543210" {...field("mobile")} />
        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <AdminPasswordInput field={field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login to Admin Panel"}
      </Button>
    </form>
  );
}

function NotificationsBell() {
  const queryClient = useQueryClient();
  const previousUnread = useRef<number | null>(null);
  const { data } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => listNotifications({ limit: 20 }),
    refetchInterval: 15000,
  });
  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (previousUnread.current !== null && unreadCount > previousUnread.current) {
      toast.info("New order received");
    }
    previousUnread.current = unreadCount;
  }, [unreadCount]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] leading-4 text-white text-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b font-semibold text-sm">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {!notifications.length ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
                className={`w-full text-left p-3 border-b last:border-0 hover:bg-accent transition ${n.isRead ? "" : "bg-primary/5"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardSummary,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Total Revenue"
          value={`₹${paiseToRupees(data.totalRevenuePaise)}`}
          hint="Captured payments only"
        />
        <Stat label="Orders" value={data.totalOrders} hint={`${data.pendingOrders} pending`} />
        <Stat label="Users" value={data.totalUsers} />
        <Stat label="Menu Items" value={data.totalMenuItems} />
      </div>
      <div className="bg-card border rounded-2xl p-5">
        <h2 className="font-bold mb-3">Recent Orders</h2>
        {!data.recentOrders.length ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs">{o.orderId}</TableCell>
                  <TableCell>₹{paiseToRupees(o.grandTotal)}</TableCell>
                  <TableCell>{statusLabel(o.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function MenuAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: getMenu,
  });
  const categories = data?.categories ?? [];
  const items = data?.items ?? [];
  const categoryName = (id: string) => categories.find((c) => c._id === id)?.name ?? "—";

  const [editing, setEditing] = useState<ApiMenuItem | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiMenuItem | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-menu"] });

  const saveMutation = useMutation({
    mutationFn: (payload: MenuItemPayload) =>
      editing ? updateMenuItem(editing._id, payload) : createMenuItem(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
      setOpen(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      invalidate();
      toast.success("Deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Menu Items ({items.length})</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>
      <div className="bg-card border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Veg</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((f) => (
              <TableRow key={f._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={f.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="font-medium">{f.name}</div>
                  </div>
                </TableCell>
                <TableCell>{categoryName(f.categoryId)}</TableCell>
                <TableCell>₹{paiseToRupees(f.price)}</TableCell>
                <TableCell>{f.isVeg ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(f);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDel(f)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MenuPanel
        open={open}
        onOpenChange={setOpen}
        item={editing}
        categories={categories}
        onSave={(payload) => saveMutation.mutate(payload)}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete menu item?"
        description={
          confirmDel ? `"${confirmDel.name}" will be permanently removed from your menu.` : ""
        }
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel) deleteMutation.mutate(confirmDel._id);
          setConfirmDel(null);
        }}
      />
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface MenuDraft {
  name: string;
  shortDescription: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  categoryId: string;
}

function MenuPanel({
  open,
  onOpenChange,
  item,
  categories,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: ApiMenuItem | null;
  categories: ApiCategory[];
  onSave: (payload: MenuItemPayload) => void;
}) {
  const empty: MenuDraft = {
    name: "",
    shortDescription: "",
    price: 0,
    imageUrl: "",
    isVeg: true,
    categoryId: categories[0]?._id ?? "",
  };
  const toDraft = (i: ApiMenuItem | null): MenuDraft =>
    i
      ? {
          name: i.name,
          shortDescription: i.shortDescription ?? "",
          price: paiseToRupees(i.price),
          imageUrl: i.imageUrl ?? "",
          isVeg: i.isVeg,
          categoryId: i.categoryId,
        }
      : empty;
  const [f, setF] = useState<MenuDraft>(toDraft(item));

  useEffect(() => {
    if (open) setF(toDraft(item));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>{item ? "Edit Item" : "Add Menu Item"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={f.shortDescription}
              onChange={(e) => setF({ ...f, shortDescription: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={f.price}
                onChange={(e) => setF({ ...f, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={f.categoryId} onValueChange={(v) => setF({ ...f, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          {f.imageUrl && (
            <img src={f.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg border" />
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="veg"
              checked={f.isVeg}
              onChange={(e) => setF({ ...f, isVeg: e.target.checked })}
            />
            <Label htmlFor="veg">Vegetarian</Label>
          </div>
        </div>
        <SheetFooter className="p-5 border-t flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!f.name || !f.imageUrl || !f.categoryId) {
                toast.error("Name, image and category are required");
                return;
              }
              onSave({
                name: f.name,
                shortDescription: f.shortDescription,
                price: Math.round(f.price * 100),
                imageUrl: f.imageUrl,
                isVeg: f.isVeg,
                categoryId: f.categoryId,
              });
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getMenu().then((m) => m.categories),
  });
  const categories = data ?? [];

  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiCategory | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] });

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      editing ? updateCategory(editing._id, payload) : createCategory(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
      setOpen(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Categories ({categories.length})</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </div>
      <div className="bg-card border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div className="font-medium">
                      {c.icon} {c.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.displayOrder}</TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-semibold ${c.isActive ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDel(c)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CategoryPanel
        open={open}
        onOpenChange={setOpen}
        category={editing}
        onSave={(payload) => saveMutation.mutate(payload)}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete category?"
        description={
          confirmDel
            ? `"${confirmDel.name}" will be permanently removed. Menu items in this category will remain but lose their category label.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel) deleteMutation.mutate(confirmDel._id);
          setConfirmDel(null);
        }}
      />
    </div>
  );
}

interface CategoryDraft {
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  displayOrder: number;
}

function CategoryPanel({
  open,
  onOpenChange,
  category,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  category: ApiCategory | null;
  onSave: (payload: CategoryPayload) => void;
}) {
  const empty: CategoryDraft = { name: "", slug: "", icon: "", imageUrl: "", displayOrder: 0 };
  const toDraft = (c: ApiCategory | null): CategoryDraft =>
    c
      ? {
          name: c.name,
          slug: c.slug,
          icon: c.icon ?? "",
          imageUrl: c.imageUrl ?? "",
          displayOrder: c.displayOrder,
        }
      : empty;
  const [f, setF] = useState<CategoryDraft>(toDraft(category));

  useEffect(() => {
    if (open) setF(toDraft(category));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>{category ? "Edit Category" : "Add Category"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={f.name}
              onChange={(e) => {
                const name = e.target.value;
                setF((p) => ({
                  ...p,
                  name,
                  slug: category
                    ? p.slug
                    : name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                }));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Icon (emoji)</Label>
              <Input value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={f.displayOrder}
                onChange={(e) => setF({ ...f, displayOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          {f.imageUrl && (
            <img src={f.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg border" />
          )}
        </div>
        <SheetFooter className="p-5 border-t flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!f.name || !f.slug) {
                toast.error("Name and slug are required");
                return;
              }
              onSave({
                name: f.name,
                slug: f.slug,
                icon: f.icon || undefined,
                imageUrl: f.imageUrl || undefined,
                displayOrder: f.displayOrder,
              });
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function StationsAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stations"],
    queryFn: () => getStations(),
  });
  const stations = data ?? [];

  const [editing, setEditing] = useState<ApiStation | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiStation | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-stations"] });

  const saveMutation = useMutation({
    mutationFn: (payload: StationPayload) =>
      editing ? updateStation(editing._id, payload) : createStation(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
      setOpen(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStation(id),
    onSuccess: () => {
      invalidate();
      toast.success("Deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Stations ({stations.length})</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Station
        </Button>
      </div>
      <div className="bg-card border rounded-2xl overflow-hidden">
        {!stations.length ? (
          <p className="p-6 text-sm text-muted-foreground text-center">
            No stations yet. Add the stations passengers can select at checkout.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.code ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold ${s.isActive ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(s);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmDel(s)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <StationPanel
        open={open}
        onOpenChange={setOpen}
        station={editing}
        onSave={(payload) => saveMutation.mutate(payload)}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete station?"
        description={
          confirmDel ? `"${confirmDel.name}" will no longer be selectable at checkout.` : ""
        }
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel) deleteMutation.mutate(confirmDel._id);
          setConfirmDel(null);
        }}
      />
    </div>
  );
}

interface StationDraft {
  name: string;
  code: string;
  isActive: boolean;
}

function StationPanel({
  open,
  onOpenChange,
  station,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  station: ApiStation | null;
  onSave: (payload: StationPayload) => void;
}) {
  const empty: StationDraft = { name: "", code: "", isActive: true };
  const toDraft = (s: ApiStation | null): StationDraft =>
    s ? { name: s.name, code: s.code ?? "", isActive: s.isActive } : empty;
  const [f, setF] = useState<StationDraft>(toDraft(station));

  useEffect(() => {
    if (open) setF(toDraft(station));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, station]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>{station ? "Edit Station" : "Add Station"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="space-y-1.5">
            <Label>Station Name</Label>
            <Input
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              placeholder="e.g. Kanpur Central"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Station Code (optional)</Label>
            <Input
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CNB"
            />
          </div>
          {station && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="station-active"
                checked={f.isActive}
                onChange={(e) => setF({ ...f, isActive: e.target.checked })}
              />
              <Label htmlFor="station-active">Active (visible at checkout)</Label>
            </div>
          )}
        </div>
        <SheetFooter className="p-5 border-t flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!f.name) {
                toast.error("Station name is required");
                return;
              }
              onSave({ name: f.name, code: f.code || undefined, isActive: f.isActive });
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function OrdersAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listAdminOrders({ limit: 100 }),
  });
  const orders = data?.items ?? [];
  const revenue = orders
    .filter((o) => o.paymentStatus === "captured")
    .reduce((a, o) => a + o.grandTotal, 0);
  const TERMINAL = [
    "DELIVERED",
    "COMPLETED",
    "CANCELLED_BY_PASSENGER",
    "CANCELLED_BY_RESTAURANT",
    "CANCELLED_BY_ADMIN",
    "REFUND_PROCESSED",
    "PAYMENT_FAILED",
  ];
  const pending = orders.filter((o) => !TERMINAL.includes(o.status)).length;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total Orders" value={orders.length} />
        <Stat label="Revenue Collected" value={`₹${paiseToRupees(revenue)}`} />
        <Stat label="Pending" value={pending} />
      </div>
      <div className="bg-card border rounded-2xl overflow-hidden">
        {!orders.length ? (
          <p className="p-6 text-sm text-muted-foreground text-center">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const nextOptions = nextValidStatuses(o.status);
                return (
                  <TableRow key={o._id}>
                    <TableCell>
                      <div className="font-mono text-xs">{o.orderId}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.items.map((i) => `${i.name}×${i.quantity}`).join(", ")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{o.paymentMethod}</div>
                      <div
                        className={`text-xs ${o.paymentStatus === "captured" ? "text-green-600" : "text-amber-600"}`}
                      >
                        {o.paymentStatus}
                      </div>
                      {o.utrReference && (
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          UTR: {o.utrReference}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">₹{paiseToRupees(o.grandTotal)}</TableCell>
                    <TableCell>
                      {nextOptions.length === 0 ? (
                        <span className="text-xs font-semibold">{statusLabel(o.status)}</span>
                      ) : (
                        <Select
                          key={o.status}
                          onValueChange={(v) => statusMutation.mutate({ id: o._id, status: v })}
                        >
                          <SelectTrigger className="w-44 h-8">
                            <SelectValue placeholder={statusLabel(o.status)} />
                          </SelectTrigger>
                          <SelectContent>
                            {nextOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {statusLabel(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function UsersAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listAdminUsers({ limit: 100 }),
  });
  const users = data?.items ?? [];

  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<AdminUser | null>(null);

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      setUserBlocked(id, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Registered Users ({users.length})</h2>
      <div className="bg-card border rounded-2xl overflow-hidden">
        {!users.length ? (
          <p className="p-6 text-sm text-muted-foreground text-center">
            No users yet. Users appear here after signing up.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.mobile}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold ${u.isBlocked ? "text-destructive" : "text-green-600"}`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(u)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmBlock(u)}>
                        {u.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <UserDetailPanel user={viewing} open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} />
      <ConfirmDialog
        open={!!confirmBlock}
        title={confirmBlock?.isBlocked ? "Unblock this user?" : "Block this user?"}
        description={
          confirmBlock
            ? confirmBlock.isBlocked
              ? `"${confirmBlock.name}" will regain access to their account and be able to order again.`
              : `"${confirmBlock.name}" will be blocked from logging in and placing new orders.`
            : ""
        }
        confirmLabel={confirmBlock?.isBlocked ? "Unblock" : "Block"}
        destructive={!confirmBlock?.isBlocked}
        onCancel={() => setConfirmBlock(null)}
        onConfirm={() => {
          if (confirmBlock) {
            blockMutation.mutate({ id: confirmBlock._id, isBlocked: !confirmBlock.isBlocked });
          }
          setConfirmBlock(null);
        }}
      />
    </div>
  );
}

function UserDetailPanel({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-orders", user?._id],
    queryFn: () => listAdminOrders({ passengerId: user!._id, limit: 50 }),
    enabled: open && !!user,
  });
  const orders: AdminOrder[] = data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] flex flex-col p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>
        {user && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="space-y-1">
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-sm text-muted-foreground">{user.mobile}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs font-semibold ${user.isBlocked ? "text-destructive" : "text-green-600"}`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Orders ({orders.length})</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
              ) : !orders.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  This user hasn't placed any orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <div key={o._id} className="border rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{o.orderId}</span>
                        <span className="font-bold text-sm">₹{paiseToRupees(o.grandTotal)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.items.map((i) => `${i.name}×${i.quantity}`).join(", ")}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{statusLabel(o.status)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReviewsAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ratings"],
    queryFn: () => listAdminRatings({ limit: 50 }),
  });
  const ratings = data ?? [];

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { isHidden?: boolean; isFeatured?: boolean };
    }) => moderateRating(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ratings"] }),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Ratings &amp; Reviews Moderation</h2>
      {!ratings.length ? (
        <p className="text-sm text-muted-foreground">
          No ratings submitted yet — they appear here once passengers rate a delivered order.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {ratings.map((r) => {
            const name = typeof r.passengerId === "string" ? "Traveler" : r.passengerId.name;
            return (
              <div
                key={r._id}
                className={`bg-card border rounded-2xl p-4 ${r.isHidden ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{name}</div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title={r.isFeatured ? "Unfeature" : "Feature on homepage"}
                      onClick={() =>
                        moderateMutation.mutate({ id: r._id, patch: { isFeatured: !r.isFeatured } })
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${r.isFeatured ? "fill-primary text-primary" : ""}`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={r.isHidden ? "Unhide" : "Hide"}
                      onClick={() =>
                        moderateMutation.mutate({ id: r._id, patch: { isHidden: !r.isHidden } })
                      }
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-primary mb-2">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="text-sm text-foreground/85">
                  {r.reviewText ? (
                    `"${r.reviewText}"`
                  ) : (
                    <span className="italic text-muted-foreground">No written review</span>
                  )}
                </p>
                {r.isHidden && (
                  <p className="text-xs text-destructive mt-2">Hidden from public view</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentAdmin() {
  const queryClient = useQueryClient();
  const emptyHomepage: HomepageContent = {
    hero: [],
    offer: { code: "", percent: 0, headline: "", sub: "" },
  };
  const emptyFaq: FaqContent = { faqs: [] };
  const emptyLegal: LegalContent = { text: "" };
  const emptySettings: SettingsContent = {
    social: {},
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    whatsappNumber: "",
    upiVpa: "",
    upiPayeeName: "",
  };

  const { data: homepage } = useQuery({
    queryKey: ["cms-homepage"],
    queryFn: () => getHomepage().catch(() => emptyHomepage),
  });
  const { data: faqData } = useQuery({
    queryKey: ["cms-faqs"],
    queryFn: () => getFaqs().catch(() => emptyFaq),
  });
  const { data: privacy } = useQuery({
    queryKey: ["cms-privacy"],
    queryFn: () => getPrivacyPolicy().catch(() => emptyLegal),
  });
  const { data: terms } = useQuery({
    queryKey: ["cms-terms"],
    queryFn: () => getTerms().catch(() => emptyLegal),
  });
  const { data: settings } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () => getSettings().catch(() => emptySettings),
  });

  const [heroDraft, setHeroDraft] = useState<HomepageContent | null>(null);
  const [faqDraft, setFaqDraft] = useState<FaqContent | null>(null);
  const [privacyDraft, setPrivacyDraft] = useState<LegalContent | null>(null);
  const [termsDraft, setTermsDraft] = useState<LegalContent | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SettingsContent | null>(null);
  const [confirmDeleteHero, setConfirmDeleteHero] = useState<number | null>(null);
  const [confirmDeleteFaq, setConfirmDeleteFaq] = useState<number | null>(null);

  const deleteHeroMutation = useMutation({
    mutationFn: (index: number) => {
      if (!heroDraft) throw new Error("Content not loaded yet");
      return updateHomepage({ ...heroDraft, hero: heroDraft.hero.filter((_, x) => x !== index) });
    },
    onSuccess: (updated) => {
      setHeroDraft(updated);
      queryClient.invalidateQueries({ queryKey: ["cms-homepage"] });
      toast.success("Hero slide removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (index: number) => {
      if (!faqDraft) throw new Error("Content not loaded yet");
      return updateFaqs({ faqs: faqDraft.faqs.filter((_, x) => x !== index) });
    },
    onSuccess: (updated) => {
      setFaqDraft(updated);
      queryClient.invalidateQueries({ queryKey: ["cms-faqs"] });
      toast.success("FAQ removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  useEffect(() => {
    if (homepage && !heroDraft) setHeroDraft(homepage);
  }, [homepage, heroDraft]);
  useEffect(() => {
    if (faqData && !faqDraft) setFaqDraft(faqData);
  }, [faqData, faqDraft]);
  useEffect(() => {
    if (privacy && !privacyDraft) setPrivacyDraft(privacy);
  }, [privacy, privacyDraft]);
  useEffect(() => {
    if (terms && !termsDraft) setTermsDraft(terms);
  }, [terms, termsDraft]);
  useEffect(() => {
    if (settings && !settingsDraft) setSettingsDraft(settings);
  }, [settings, settingsDraft]);

  const save = async () => {
    try {
      if (heroDraft) await updateHomepage(heroDraft);
      if (faqDraft) await updateFaqs(faqDraft);
      if (privacyDraft) await updatePrivacyPolicy(privacyDraft);
      if (termsDraft) await updateTerms(termsDraft);
      if (settingsDraft) await updateSettings(settingsDraft);
      toast.success("Content updated");
      queryClient.invalidateQueries({ queryKey: ["cms-homepage"] });
      queryClient.invalidateQueries({ queryKey: ["cms-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["cms-privacy"] });
      queryClient.invalidateQueries({ queryKey: ["cms-terms"] });
      queryClient.invalidateQueries({ queryKey: ["cms-settings"] });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  if (!heroDraft || !faqDraft || !privacyDraft || !termsDraft || !settingsDraft) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>;
  }
  const c = heroDraft;

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <h2 className="font-bold">Hero Slides</h2>
        {c.hero.map((s, i) => (
          <div
            key={i}
            className="grid md:grid-cols-4 gap-2 items-start border-b pb-3 last:border-0"
          >
            <Input
              placeholder="Eyebrow"
              value={s.eyebrow}
              onChange={(e) => {
                const h = [...c.hero];
                h[i] = { ...s, eyebrow: e.target.value };
                setHeroDraft({ ...c, hero: h });
              }}
            />
            <Input
              placeholder="Title"
              value={s.title}
              onChange={(e) => {
                const h = [...c.hero];
                h[i] = { ...s, title: e.target.value };
                setHeroDraft({ ...c, hero: h });
              }}
            />
            <Input
              placeholder="Description"
              value={s.desc}
              onChange={(e) => {
                const h = [...c.hero];
                h[i] = { ...s, desc: e.target.value };
                setHeroDraft({ ...c, hero: h });
              }}
            />
            <div className="flex gap-2">
              <Input
                placeholder="CTA"
                value={s.cta}
                onChange={(e) => {
                  const h = [...c.hero];
                  h[i] = { ...s, cta: e.target.value };
                  setHeroDraft({ ...c, hero: h });
                }}
              />
              <Button size="icon" variant="ghost" onClick={() => setConfirmDeleteHero(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setHeroDraft({
              ...c,
              hero: [...c.hero, { eyebrow: "", title: "", desc: "", cta: "Order Now" }],
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Slide
        </Button>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold">Homepage Offer Banner</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Coupon Code</Label>
            <Input
              value={c.offer.code}
              onChange={(e) => setHeroDraft({ ...c, offer: { ...c.offer, code: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Percent Off</Label>
            <Input
              type="number"
              value={c.offer.percent}
              onChange={(e) =>
                setHeroDraft({ ...c, offer: { ...c.offer, percent: Number(e.target.value) } })
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Headline</Label>
            <Input
              value={c.offer.headline}
              onChange={(e) =>
                setHeroDraft({ ...c, offer: { ...c.offer, headline: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-4">
            <Label>Subtitle (shown right side)</Label>
            <Input
              value={c.offer.sub}
              onChange={(e) => setHeroDraft({ ...c, offer: { ...c.offer, sub: e.target.value } })}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-4">
        <h2 className="font-bold">FAQs</h2>
        {faqDraft.faqs.map((item, i) => (
          <div
            key={i}
            className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-start border-b pb-3 last:border-0"
          >
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const f = [...faqDraft.faqs];
                f[i] = { ...item, question: e.target.value };
                setFaqDraft({ faqs: f });
              }}
            />
            <Textarea
              rows={2}
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => {
                const f = [...faqDraft.faqs];
                f[i] = { ...item, answer: e.target.value };
                setFaqDraft({ faqs: f });
              }}
            />
            <Button size="icon" variant="ghost" onClick={() => setConfirmDeleteFaq(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFaqDraft({
              faqs: [
                ...faqDraft.faqs,
                { question: "", answer: "", displayOrder: faqDraft.faqs.length },
              ],
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" />
          Add FAQ
        </Button>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold">Social Media Links</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {(["facebook", "instagram", "twitter", "youtube"] as const).map((k) => (
            <div key={k} className="space-y-1.5">
              <Label className="capitalize">{k}</Label>
              <Input
                value={settingsDraft.social[k] ?? ""}
                onChange={(e) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    social: { ...settingsDraft.social, [k]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold">Contact Info</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={settingsDraft.contactEmail}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, contactEmail: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={settingsDraft.contactPhone}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, contactPhone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={settingsDraft.contactAddress}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, contactAddress: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input
              placeholder="+91 98765 43210"
              value={settingsDraft.whatsappNumber}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, whatsappNumber: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold">Payment Settings</h2>
        <p className="text-sm text-muted-foreground">
          The UPI ID customers pay into. Every order's payment link is built from this — update it
          here if the receiving account changes.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>UPI ID (VPA)</Label>
            <Input
              placeholder="srfood@ybl"
              value={settingsDraft.upiVpa}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, upiVpa: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Payee Name</Label>
            <Input
              placeholder="SR Food"
              value={settingsDraft.upiPayeeName}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, upiPayeeName: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold">Legal Pages</h2>
        <div className="space-y-1.5">
          <Label>Privacy Policy</Label>
          <Textarea
            rows={6}
            value={privacyDraft.text}
            onChange={(e) => setPrivacyDraft({ text: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Terms of Service</Label>
          <Textarea
            rows={6}
            value={termsDraft.text}
            onChange={(e) => setTermsDraft({ text: e.target.value })}
          />
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={save} className="shadow-lg">
          Save All Changes
        </Button>
      </div>
      <ConfirmDialog
        open={confirmDeleteHero !== null}
        title="Remove this hero slide?"
        description="This will permanently remove the slide from the homepage right away."
        confirmLabel="Remove"
        destructive
        onCancel={() => setConfirmDeleteHero(null)}
        onConfirm={() => {
          if (confirmDeleteHero !== null) deleteHeroMutation.mutate(confirmDeleteHero);
          setConfirmDeleteHero(null);
        }}
      />
      <ConfirmDialog
        open={confirmDeleteFaq !== null}
        title="Remove this FAQ?"
        description="This will permanently remove the FAQ from the site right away."
        confirmLabel="Remove"
        destructive
        onCancel={() => setConfirmDeleteFaq(null)}
        onConfirm={() => {
          if (confirmDeleteFaq !== null) deleteFaqMutation.mutate(confirmDeleteFaq);
          setConfirmDeleteFaq(null);
        }}
      />
    </div>
  );
}
