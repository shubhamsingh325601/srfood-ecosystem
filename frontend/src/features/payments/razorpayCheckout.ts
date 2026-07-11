declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  scriptLoadPromise ??= new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

export interface OpenRazorpayCheckoutInput {
  keyId: string;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput,
): Promise<{ paymentId: string } | null> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable");

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: input.keyId,
      amount: input.amountPaise,
      currency: input.currency,
      name: "SR Food",
      description: "Order payment",
      order_id: input.razorpayOrderId,
      prefill: {
        name: input.customerName,
        email: input.customerEmail,
        contact: input.customerPhone,
      },
      theme: { color: "#f97316" },
      handler: (response) => resolve({ paymentId: response.razorpay_payment_id }),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
