import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Smartphone,
  Banknote,
  CheckCircle2,
  MapPin,
  Loader2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { createOrder } from "@/features/orders/services/ordersApi";
import { submitPaymentReference, declinePayment } from "@/features/payments/services/paymentsApi";
import type { UpiPaymentInfo } from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout – SRFOOD" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Valid phone required"),
  address: z.string().trim().min(10, "Please enter a complete address"),
  landmark: z.string().trim().max(100).optional(),
});
type Form = z.infer<typeof schema>;

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clear);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscountPaise = useCartStore((s) => s.couponDiscountPaise);
  const currentUser = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const [payment, setPayment] = useState<"UPI" | "COD">("UPI");
  const [placed, setPlaced] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ orderId: string; upi: UpiPaymentInfo } | null>(null);
  const [awaitingReturn, setAwaitingReturn] = useState(false);
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [confirmChoice, setConfirmChoice] = useState<"yes" | null>(null);
  const [utr, setUtr] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentUser?.name ?? "",
      phone: currentUser?.mobile ?? "",
      address: "",
      landmark: "",
    },
  });

  // After "Proceed to Pay" sends the browser to the UPI app, detect when the user comes back to
  // this tab and prompt them for what happened — there's no gateway callback to detect it for us.
  useEffect(() => {
    if (!awaitingReturn) return;
    const onReturn = () => {
      if (document.visibilityState === "visible") {
        setAwaitingReturn(false);
        setShowConfirmPrompt(true);
      }
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [awaitingReturn]);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          const city: string = data.city || data.locality || data.principalSubdivision || "";
          const formatted: string = [data.locality, data.city, data.principalSubdivision]
            .filter(Boolean)
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .join(", ");

          if (formatted) {
            setValue("address", formatted, { shouldValidate: true });
          }
          if (city && !city.toLowerCase().includes("kota")) {
            toast.error("This location looks outside Kota — we currently deliver only within Kota, Rajasthan. Please double check your address.");
          } else {
            toast.success("Location detected — please add your house/flat number and landmark.");
          }
        } catch {
          toast.error("Could not detect your address — please enter it manually");
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
  const discount = Math.round(couponDiscountPaise / 100);
  const grand = Math.max(0, cartTotal + gst + delivery - discount);

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
            couponCode: couponCode ?? undefined,
          },
          paymentMethod: payment,
          customerName: data.name,
          customerMobile: data.phone,
          deliveryAddress: {
            line: data.address,
            landmark: data.landmark || undefined,
            city: "Kota",
            state: "Rajasthan",
            lat: coords?.lat,
            lng: coords?.lng,
          },
        },
        idempotencyKey,
      );

      if (paymentInfo) {
        setPendingPayment({ orderId: order._id, upi: paymentInfo });
        setSubmitting(false);
        return;
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

  const confirmUpiPayment = async () => {
    if (!pendingPayment) return;
    if (utr.trim().length < 4) {
      toast.error("Enter the UPI transaction / reference number from your payment app");
      return;
    }
    setConfirming(true);
    try {
      const order = await submitPaymentReference(pendingPayment.orderId, utr.trim());
      clearCart();
      toast.success(`Order ${order.orderId} placed!`);
      setPlaced(order.orderId);
      setPendingPayment(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not record your payment"));
    } finally {
      setConfirming(false);
    }
  };

  const handleDeclinePayment = async () => {
    if (!pendingPayment) return;
    setDeclining(true);
    try {
      await declinePayment(pendingPayment.orderId);
      toast.error("Payment not completed — you can try again whenever you're ready.");
      setPendingPayment(null);
      setAwaitingReturn(false);
      setShowConfirmPrompt(false);
      setConfirmChoice(null);
      setUtr("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update payment status"));
    } finally {
      setDeclining(false);
    }
  };

  if (pendingPayment) {
    const { upi } = pendingPayment;
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="bg-card border rounded-2xl p-6 space-y-5 text-center">
          <Smartphone className="w-10 h-10 mx-auto text-primary" />
          <div>
            <h1 className="text-xl font-bold">Pay via UPI</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tap below to pay ₹{(upi.amountPaise / 100).toFixed(2)} — it'll open your UPI app
              directly.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="w-full rounded-full h-12"
            onClick={() => setAwaitingReturn(true)}
          >
            <a href={upi.upiLink}>
              Proceed to Pay ₹{(upi.amountPaise / 100).toFixed(2)}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </a>
          </Button>

          <details className="text-left">
            <summary className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground">
              On a computer? Scan the QR from your phone instead
            </summary>
            <div className="flex justify-center mt-3">
              <div className="p-3 bg-white rounded-xl border">
                <QRCodeSVG value={upi.upiLink} size={160} />
              </div>
            </div>
          </details>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(upi.payeeVpa);
              toast.success("UPI ID copied");
            }}
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mx-auto hover:text-foreground"
          >
            <Copy className="w-3 h-3" />
            Pay manually to {upi.payeeVpa}
          </button>

          {!showConfirmPrompt ? (
            <button
              type="button"
              onClick={() => setShowConfirmPrompt(true)}
              className="text-xs text-primary underline underline-offset-2 mx-auto block"
            >
              Already paid? Confirm here
            </button>
          ) : confirmChoice !== "yes" ? (
            <div className="border-t pt-4 space-y-3 text-left">
              <p className="text-sm font-medium text-center">Did your payment go through?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleDeclinePayment}
                  disabled={declining}
                >
                  {declining ? "…" : "No, it failed"}
                </Button>
                <Button className="flex-1 rounded-full" onClick={() => setConfirmChoice("yes")}>
                  Yes, I've paid
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 space-y-2 text-left">
              <Label>UPI transaction / reference number (UTR)</Label>
              <Input
                placeholder="e.g. 123456789012"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the reference number shown in your UPI app so we can confirm your order.
              </p>
              <Button className="w-full rounded-full" onClick={confirmUpiPayment} disabled={confirming}>
                {confirming ? "Confirming…" : "Confirm Order"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
          </div>
        </section>

        <section className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Delivery Details</h2>
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
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
            <MapPin className="w-3.5 h-3.5" />
            Delivering in Kota, Rajasthan
          </div>
          <div className="grid gap-3">
            <Field label="Full Address (house/flat no., street, area)" error={errors.address?.message} full>
              <Input placeholder="e.g. 12, Talwandi, Near City Mall" {...register("address")} />
            </Field>
            <Field label="Landmark (optional)" error={errors.landmark?.message} full>
              <Input placeholder="e.g. Opposite City Mall" {...register("landmark")} />
            </Field>
          </div>
        </section>

        <section className="bg-card border rounded-2xl p-5 space-y-3">
          <h2 className="font-bold">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
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
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Coupon Discount{couponCode ? ` (${couponCode})` : ""}</span>
              <span>-₹{discount}</span>
            </div>
          )}
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
