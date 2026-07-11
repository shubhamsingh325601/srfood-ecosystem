import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  CheckCircle2,
  MapPin,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { createOrder } from "@/features/orders/services/ordersApi";
import { openRazorpayCheckout } from "@/features/payments/razorpayCheckout";
import { getStations } from "@/features/stations/services/stationsApi";
import { getApiErrorMessage } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout – SRFOOD" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  email: z.string().trim().email("Valid email required").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Valid phone required"),
  pnr: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "10-digit PNR"),
  coach: z.string().trim().min(1).max(6),
  seat: z.string().trim().min(1).max(4),
  station: z.string().trim().min(2).max(60),
});
type Form = z.infer<typeof schema>;

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clear);
  const currentUser = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const [payment, setPayment] = useState<"Card" | "UPI" | "COD" | "Wallet">("UPI");
  const [placed, setPlaced] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [stationOpen, setStationOpen] = useState(false);

  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => getStations(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.mobile ?? "",
      station: "",
    },
  });

  const stationValue = watch("station");

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          const place: string =
            data.locality ||
            data.city ||
            data.principalSubdivision ||
            `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          const match = stations?.find((s) => s.name.toLowerCase().includes(place.toLowerCase()));
          if (match) {
            setValue("station", match.name, { shouldValidate: true });
            toast.success(`Location detected: ${match.name}`);
          } else {
            toast.error(`No matching station found near "${place}" — please select one manually`);
            setStationOpen(true);
          }
        } catch {
          toast.error("Could not detect a nearby station — please select one manually");
          setStationOpen(true);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Unable to fetch location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const gst = Math.round(cartTotal * 0.05);
  const delivery = cartTotal > 0 ? 29 : 0;
  const grand = cartTotal + gst + delivery;

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <p className="text-muted-foreground">Please log in to complete checkout.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Log In / Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (!items.length && !placed) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      const { order, payment: paymentInfo } = await createOrder(
        {
          cart: {
            items: items.map((it) => ({
              menuItemId: it.menuItemId,
              quantity: it.quantity,
              customizations: it.customizations,
              specialNote: it.specialNote,
            })),
          },
          paymentMethod: payment,
          pnr: data.pnr,
          coach: data.coach,
          seat: data.seat,
          deliveryStation: data.station,
        },
        idempotencyKey,
      );

      if (paymentInfo) {
        const result = await openRazorpayCheckout({
          keyId: paymentInfo.keyId,
          amountPaise: paymentInfo.amountPaise,
          currency: paymentInfo.currency,
          razorpayOrderId: paymentInfo.razorpayOrderId,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
        });
        if (!result) {
          toast.error("Payment cancelled — you can complete payment from My Orders");
          setSubmitting(false);
          return;
        }
      }

      clearCart();
      toast.success(`Order ${order.orderId} placed!`);
      setPlaced(order.orderId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not place order"));
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center px-4">
        <CheckCircle2 className="w-20 h-20 mx-auto text-primary" />
        <h1 className="text-3xl font-bold mt-4">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your order <b>{placed}</b> is being prepared.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Button asChild variant="outline">
            <Link to="/orders">My Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/track">Track Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  const methods = [
    { k: "UPI", I: Smartphone, label: "UPI" },
    { k: "Card", I: CreditCard, label: "Card" },
    { k: "Wallet", I: Wallet, label: "Wallet" },
    { k: "COD", I: Banknote, label: "Cash on Delivery" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <section className="bg-card border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold">Contact</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Full Name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </Field>
            <Field label="Email" error={errors.email?.message} full>
              <Input type="email" {...register("email")} />
            </Field>
          </div>
        </section>

        <section className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Train Delivery Details</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={detectLocation}
              disabled={locating}
              className="rounded-full"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-1.5" />
              )}
              {locating ? "Detecting..." : "Use my location"}
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="PNR (10 digits)" error={errors.pnr?.message}>
              <Input maxLength={10} {...register("pnr")} />
            </Field>
            <Field label="Station / Delivery Location" error={errors.station?.message}>
              <Popover open={stationOpen} onOpenChange={setStationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={stationOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className={stationValue ? "" : "text-muted-foreground"}>
                      {stationValue || "Select a station"}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search stations..." />
                    <CommandList>
                      <CommandEmpty>No station found.</CommandEmpty>
                      <CommandGroup>
                        {(stations ?? []).map((s) => (
                          <CommandItem
                            key={s._id}
                            value={s.name}
                            onSelect={() => {
                              setValue("station", s.name, { shouldValidate: true });
                              setStationOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 w-4 h-4 ${stationValue === s.name ? "opacity-100" : "opacity-0"}`}
                            />
                            {s.name}
                            {s.code ? ` (${s.code})` : ""}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
            <Field label="Coach" error={errors.coach?.message}>
              <Input placeholder="e.g. B3" {...register("coach")} />
            </Field>
            <Field label="Seat" error={errors.seat?.message}>
              <Input placeholder="e.g. 42" {...register("seat")} />
            </Field>
          </div>
        </section>

        <section className="bg-card border rounded-2xl p-5 space-y-3">
          <h2 className="font-bold">Payment Method</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {methods.map(({ k, I, label }) => (
              <button
                type="button"
                key={k}
                onClick={() => setPayment(k)}
                className={`border rounded-xl p-3 flex flex-col items-center gap-2 transition ${payment === k ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
              >
                <I className={`w-5 h-5 ${payment === k ? "text-primary" : ""}`} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </section>
      </form>

      <aside className="bg-card border rounded-2xl p-5 h-fit sticky top-[88px] space-y-3">
        <h2 className="font-bold text-lg">Order Summary</h2>
        {items.map((it) => (
          <div key={it.menuItemId} className="flex justify-between text-sm">
            <span className="truncate">
              {it.name} × {it.quantity}
            </span>
            <span>₹{it.price * it.quantity}</span>
          </div>
        ))}
        <div className="border-t pt-3 space-y-1 text-sm">
          <Row label="Subtotal" v={cartTotal} />
          <Row label="GST" v={gst} />
          <Row label="Delivery" v={delivery} />
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{grand}</span>
        </div>
        <Button
          size="lg"
          className="w-full rounded-full h-12"
          onClick={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          {submitting ? "Placing order…" : `Place Order (₹${grand})`}
        </Button>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
function Row({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>₹{v}</span>
    </div>
  );
}
