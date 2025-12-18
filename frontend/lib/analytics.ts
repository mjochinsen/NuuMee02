// Google Analytics 4 Tracking Utilities
// Measurement ID: G-GN64HWEKWS

export const GA_MEASUREMENT_ID = "G-GN64HWEKWS";

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Safe gtag wrapper - uses real gtag when available, falls back to dataLayer
const gtag = (...args: unknown[]) => {
  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  }
};

// Track page views
export const pageview = (url: string) => {
  gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const event = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Conversion Events for Google Ads
export const trackSignup = (method: string) => {
  console.log("[GA4] Tracking signup:", method);
  gtag("event", "sign_up", {
    method: method,
  });
};

export const trackLogin = (method: string) => {
  console.log("[GA4] Tracking login:", method);
  gtag("event", "login", {
    method: method,
  });
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = "USD",
  items?: { name: string; quantity: number; price: number }[]
) => {
  console.log("[GA4] Tracking purchase:", { transactionId, value, currency });
  gtag("event", "purchase", {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
};

export const trackBeginCheckout = (value: number, currency: string = "USD") => {
  console.log("[GA4] Tracking begin_checkout:", { value, currency });
  gtag("event", "begin_checkout", {
    value: value,
    currency: currency,
  });
};

export const trackVideoGenerated = (
  duration: number,
  resolution: string,
  creditsUsed: number
) => {
  console.log("[GA4] Tracking video_generated:", { duration, resolution, creditsUsed });
  gtag("event", "video_generated", {
    event_category: "engagement",
    video_duration: duration,
    video_resolution: resolution,
    credits_used: creditsUsed,
  });
};
