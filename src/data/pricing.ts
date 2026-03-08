import { countries } from "./countries";

export interface PricingTier {
  amount: number; // in smallest currency unit (kobo, pesewas, cents)
  currency: string;
  symbol: string;
  displayPrice: string;
}

const AFRICAN_COUNTRY_CODES = [
  "NG", "GH", "ZA", "KE", "EG", "TZ", "UG", "ET",
  "RW", "CM", "SN", "CI", "AO", "MZ", "ZW", "BW",
  "NA", "ZM", "MW", "MG", "CD", "ML", "BF", "NE",
  "TD", "GN", "BJ", "TG", "SL", "LR", "MR", "GM",
  "GA", "CG", "DJ", "ER", "SS", "SO", "LS", "SZ",
];

const pricingMap: Record<string, PricingTier> = {
  Nigeria: { amount: 450000, currency: "NGN", symbol: "₦", displayPrice: "₦4,500/mo" },
  Ghana: { amount: 5000, currency: "GHS", symbol: "GH₵", displayPrice: "GH₵50/mo" },
  "South Africa": { amount: 9000, currency: "ZAR", symbol: "R", displayPrice: "R90/mo" },
  Kenya: { amount: 65000, currency: "KES", symbol: "KES", displayPrice: "KES 650/mo" },
};

const OTHER_AFRICA: PricingTier = { amount: 300, currency: "USD", symbol: "$", displayPrice: "$3/mo" };
const REST_OF_WORLD: PricingTier = { amount: 500, currency: "USD", symbol: "$", displayPrice: "$5/mo" };

function isAfricanCountry(countryName: string): boolean {
  const country = countries.find((c) => c.name === countryName);
  if (!country) return false;
  return AFRICAN_COUNTRY_CODES.includes(country.code);
}

export function getPricingForCountry(countryName: string | null | undefined): PricingTier {
  if (!countryName) return REST_OF_WORLD;

  // Direct match for Paystack-supported local currencies
  if (pricingMap[countryName]) return pricingMap[countryName];

  // Other African countries → discounted USD
  if (isAfricanCountry(countryName)) return OTHER_AFRICA;

  // Rest of world
  return REST_OF_WORLD;
}
