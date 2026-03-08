import { countries } from "./countries";

export type EduBillingInterval = "monthly" | "annual";
export type EduPlanKey = "edu_starter" | "edu_pro";

export interface EduPricingTier {
  amount: number;
  currency: string;
  symbol: string;
  displayPrice: string;
}

export interface EduPricingPlan {
  monthly: EduPricingTier;
  annual: EduPricingTier;
  annualSavingsLabel: string;
}

export interface EduPricingConfig {
  starter: EduPricingPlan;
  pro: EduPricingPlan;
}

const AFRICAN_COUNTRY_CODES = [
  "NG", "GH", "ZA", "KE", "EG", "TZ", "UG", "ET",
  "RW", "CM", "SN", "CI", "AO", "MZ", "ZW", "BW",
  "NA", "ZM", "MW", "MG", "CD", "ML", "BF", "NE",
  "TD", "GN", "BJ", "TG", "SL", "LR", "MR", "GM",
  "GA", "CG", "DJ", "ER", "SS", "SO", "LS", "SZ",
];

// Nigeria-specific pricing (NGN)
const ngPricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 200000, currency: "NGN", symbol: "₦", displayPrice: "₦2,000/mo" },
    annual: { amount: 1670000, currency: "NGN", symbol: "₦", displayPrice: "₦16,700/yr" },
    annualSavingsLabel: "Save ₦7,300",
  },
  pro: {
    monthly: { amount: 800000, currency: "NGN", symbol: "₦", displayPrice: "₦8,000/mo" },
    annual: { amount: 6670000, currency: "NGN", symbol: "₦", displayPrice: "₦66,700/yr" },
    annualSavingsLabel: "Save ₦29,300",
  },
};

// Ghana-specific pricing (GHS)
const ghPricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 2000, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵20/mo" },
    annual: { amount: 16700, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵167/yr" },
    annualSavingsLabel: "Save GH₵73",
  },
  pro: {
    monthly: { amount: 8000, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵80/mo" },
    annual: { amount: 66700, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵667/yr" },
    annualSavingsLabel: "Save GH₵293",
  },
};

// South Africa (ZAR)
const zaPricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 3600, currency: "ZAR", symbol: "R", displayPrice: "R36/mo" },
    annual: { amount: 30000, currency: "ZAR", symbol: "R", displayPrice: "R300/yr" },
    annualSavingsLabel: "Save R132",
  },
  pro: {
    monthly: { amount: 14400, currency: "ZAR", symbol: "R", displayPrice: "R144/mo" },
    annual: { amount: 120000, currency: "ZAR", symbol: "R", displayPrice: "R1,200/yr" },
    annualSavingsLabel: "Save R528",
  },
};

// Kenya (KES)
const kePricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 26000, currency: "KES", symbol: "KES", displayPrice: "KES 260/mo" },
    annual: { amount: 216700, currency: "KES", symbol: "KES", displayPrice: "KES 2,167/yr" },
    annualSavingsLabel: "Save KES 953",
  },
  pro: {
    monthly: { amount: 104000, currency: "KES", symbol: "KES", displayPrice: "KES 1,040/mo" },
    annual: { amount: 866700, currency: "KES", symbol: "KES", displayPrice: "KES 8,667/yr" },
    annualSavingsLabel: "Save KES 3,813",
  },
};

// Other African countries (USD)
const otherAfricaPricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 200, currency: "USD", symbol: "$", displayPrice: "$2/mo" },
    annual: { amount: 1700, currency: "USD", symbol: "$", displayPrice: "$17/yr" },
    annualSavingsLabel: "Save $7",
  },
  pro: {
    monthly: { amount: 800, currency: "USD", symbol: "$", displayPrice: "$8/mo" },
    annual: { amount: 6700, currency: "USD", symbol: "$", displayPrice: "$67/yr" },
    annualSavingsLabel: "Save $29",
  },
};

// Rest of world (USD)
const rowPricing: EduPricingConfig = {
  starter: {
    monthly: { amount: 200, currency: "USD", symbol: "$", displayPrice: "$2/mo" },
    annual: { amount: 1700, currency: "USD", symbol: "$", displayPrice: "$17/yr" },
    annualSavingsLabel: "Save $7",
  },
  pro: {
    monthly: { amount: 800, currency: "USD", symbol: "$", displayPrice: "$8/mo" },
    annual: { amount: 6700, currency: "USD", symbol: "$", displayPrice: "$67/yr" },
    annualSavingsLabel: "Save $29",
  },
};

const pricingMap: Record<string, EduPricingConfig> = {
  Nigeria: ngPricing,
  Ghana: ghPricing,
  "South Africa": zaPricing,
  Kenya: kePricing,
};

function isAfricanCountry(countryName: string): boolean {
  const country = countries.find((c) => c.name === countryName);
  if (!country) return false;
  return AFRICAN_COUNTRY_CODES.includes(country.code);
}

export function getEduPricingForCountry(countryName: string | null | undefined): EduPricingConfig {
  if (!countryName) return rowPricing;
  if (pricingMap[countryName]) return pricingMap[countryName];
  if (isAfricanCountry(countryName)) return otherAfricaPricing;
  return rowPricing;
}
