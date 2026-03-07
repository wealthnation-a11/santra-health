

## Plan: Geolocation-Based Regional Pricing

### Overview
Use the user's **profile country** (set during onboarding) to determine pricing tier. Paystack supports NGN, GHS, ZAR, KES, and USD currencies, so we map each supported African country to its local currency and fall back to USD for everyone else.

### Pricing Tiers

```text
Region             Currency   Amount    Display
─────────────────────────────────────────────────
Nigeria            NGN        4,500     ₦4,500/mo
Ghana              GHS        50        GH₵50/mo
South Africa       ZAR        90        R90/mo
Kenya              KES        650       KES 650/mo
Other Africa*      USD        3         $3/mo
Rest of World      USD        5         $5/mo
```
*Other Africa = countries in `countries.ts` with African country codes (EG, TZ, UG, ET) that Paystack doesn't support in local currency.

### Technical Approach

#### 1. New file: `src/data/pricing.ts`
- Export a `getPricingForCountry(countryName: string)` function
- Returns `{ amount, currency, symbol, display }` based on country
- Contains the pricing map and African country list

#### 2. New hook: `src/hooks/usePricing.tsx`
- Reads the user's `country` from their profile (via `useAuth`)
- Calls `getPricingForCountry()` and returns the pricing object
- Exposes `{ price, currency, symbol, displayPrice }` for use in UI

#### 3. Modified: `src/hooks/usePaystack.tsx`
- Accept dynamic `amount` and `currency` from `usePricing`
- Pass them to `PaystackPop.setup()` instead of hardcoded values

#### 4. Modified UI files (dynamic price display)
All hardcoded "₦4,500" references replaced with `displayPrice` from `usePricing`:
- `src/pages/Pricing.tsx` — pricing cards, upgrade button, FAQ
- `src/components/DailyLimitModal.tsx` — upgrade button
- `src/components/PremiumUploadModal.tsx` — price display
- `src/components/settings/SubscriptionCard.tsx` — plan details and upgrade button

### Files Summary

| Action | File |
|---|---|
| Create | `src/data/pricing.ts` |
| Create | `src/hooks/usePricing.tsx` |
| Modify | `src/hooks/usePaystack.tsx` |
| Modify | `src/pages/Pricing.tsx` |
| Modify | `src/components/DailyLimitModal.tsx` |
| Modify | `src/components/PremiumUploadModal.tsx` |
| Modify | `src/components/settings/SubscriptionCard.tsx` |

No database changes needed — pricing is derived from the existing `profiles.country` field.

