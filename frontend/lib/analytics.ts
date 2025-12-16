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

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Conversion Events for Google Ads
export const trackSignup = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", {
      method: method,
    });
  }
};

export const trackLogin = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "login", {
      method: method,
    });
  }
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = "USD",
  items?: { name: string; quantity: number; price: number }[]
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
  }
};

export const trackBeginCheckout = (value: number, currency: string = "USD") => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      value: value,
      currency: currency,
    });
  }
};

export const trackVideoGenerated = (
  duration: number,
  resolution: string,
  creditsUsed: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "video_generated", {
      event_category: "engagement",
      video_duration: duration,
      video_resolution: resolution,
      credits_used: creditsUsed,
    });
  }
};
