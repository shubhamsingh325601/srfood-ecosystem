export const APP_ID = import.meta.env.VITE_APP_ID as string | undefined;

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "SRFOOD";
export const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE ?? "";
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION ?? "";
export const APP_OG_TITLE = import.meta.env.VITE_APP_OG_TITLE ?? `${APP_NAME} – ${APP_TAGLINE}`;
export const APP_OG_DESCRIPTION = import.meta.env.VITE_APP_OG_DESCRIPTION ?? APP_DESCRIPTION;
export const APP_TWITTER_TITLE = APP_OG_TITLE;
export const APP_TWITTER_DESCRIPTION = APP_OG_DESCRIPTION;
export const APP_FAVICON = import.meta.env.VITE_APP_FAVICON ?? "favicon.png";
export const APP_SERVICE_AREA = import.meta.env.VITE_APP_SERVICE_AREA ?? "";

export const FEATURES = {
  trains: import.meta.env.VITE_FEATURE_TRAINS === "true",
  stations: import.meta.env.VITE_FEATURE_STATIONS === "true",
  upiPayments: import.meta.env.VITE_FEATURE_UPI_PAYMENTS === "true",
  floatingCartBar: import.meta.env.VITE_FEATURE_FLOATING_CART_BAR === "true",
} as const;

export const APP_THEME = (import.meta.env.VITE_APP_THEME as "orange" | "red") ?? "orange";

export const CHECKOUT_TITLE = APP_THEME === "red" ? "Delivery Details" : "Train Delivery Details";
export const CHECKOUT_LOCATION_BUTTON =
  APP_THEME === "red" ? "Detect my location" : "Use my location";
export const CHECKOUT_PNR_LABEL = FEATURES.trains ? "PNR (10 digits)" : undefined;
export const CHECKOUT_STATION_LABEL = FEATURES.trains
  ? "Station / Delivery Location"
  : "Delivery Location / Area";
export const CHECKOUT_COACH_LABEL = FEATURES.trains ? "Coach" : undefined;
export const CHECKOUT_SEAT_LABEL = FEATURES.trains ? "Seat" : undefined;
export const CHECKOUT_PAYMENT_METHODS = FEATURES.upiPayments ? ["UPI", "COD"] : ["COD"];
