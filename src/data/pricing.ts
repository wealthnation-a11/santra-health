import { countries } from "./countries";

export type BillingInterval = "monthly" | "annual";

export interface PricingTier {
  amount: number; // in smallest currency unit (kobo, pesewas, cents)
  currency: string;
  symbol: string;
  displayPrice: string;
}

export interface PricingPlan {
  monthly: PricingTier;
  annual: PricingTier;
  annualSavingsLabel: string; // e.g. "2 months free"
}

const AFRICAN_COUNTRY_CODES = [
  "NG", "GH", "ZA", "KE", "EG", "TZ", "UG", "ET",
  "RW", "CM", "SN", "CI", "AO", "MZ", "ZW", "BW",
  "NA", "ZM", "MW", "MG", "CD", "ML", "BF", "NE",
  "TD", "GN", "BJ", "TG", "SL", "LR", "MR", "GM",
  "GA", "CG", "DJ", "ER", "SS", "SO", "LS", "SZ",
];

const pricingMap: Record<string, PricingPlan> = {
  Nigeria: {
    monthly: { amount: 450000, currency: "NGN", symbol: "₦", displayPrice: "₦4,500/mo" },
    annual: { amount: 3750000, currency: "NGN", symbol: "₦", displayPrice: "₦37,500/yr" },
    annualSavingsLabel: "Save ₦16,500",
  },
  Ghana: {
    monthly: { amount: 5000, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵50/mo" },
    annual: { amount: 41700, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵417/yr" },
    annualSavingsLabel: "Save GH₵183",
  },
  "South Africa": {
    monthly: { amount: 9000, currency: "ZAR", symbol: "R", displayPrice: "R90/mo" },
    annual: { amount: 75000, currency: "ZAR", symbol: "R", displayPrice: "R750/yr" },
    annualSavingsLabel: "Save R330",
  },
  Kenya: {
    monthly: { amount: 65000, currency: "KES", symbol: "KES", displayPrice: "KES 650/mo" },
    annual: { amount: 541700, currency: "KES", symbol: "KES", displayPrice: "KES 5,417/yr" },
    annualSavingsLabel: "Save KES 2,383",
  },
};

const OTHER_AFRICA: PricingPlan = {
  monthly: { amount: 300, currency: "USD", symbol: "$", displayPrice: "$3/mo" },
  annual: { amount: 2500, currency: "USD", symbol: "$", displayPrice: "$25/yr" },
  annualSavingsLabel: "Save $11",
};

const REST_OF_WORLD: PricingPlan = {
  monthly: { amount: 500, currency: "USD", symbol: "$", displayPrice: "$5/mo" },
  annual: { amount: 4167, currency: "USD", symbol: "$", displayPrice: "$41.67/yr" },
  annualSavingsLabel: "Save $18.33",
};

function isAfricanCountry(countryName: string): boolean {
  const country = countries.find((c) => c.name === countryName);
  if (!country) return false;
  return AFRICAN_COUNTRY_CODES.includes(country.code);
}

export function getPricingPlanForCountry(countryName: string | null | undefined): PricingPlan {
  if (!countryName) return REST_OF_WORLD;
  if (pricingMap[countryName]) return pricingMap[countryName];
  if (isAfricanCountry(countryName)) return OTHER_AFRICA;
  return REST_OF_WORLD;
}

/** @deprecated Use getPricingPlanForCountry instead */
export function getPricingForCountry(countryName: string | null | undefined): PricingTier {
  return getPricingPlanForCountry(countryName).monthly;
}
