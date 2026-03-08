

## Assessment & Plan: Educational/Training Subscription Tiers for Libraries

### My Assessment

Your proposed pricing structure is solid, but here's what I'd adjust to fit Santra's current architecture:

**What works well:**
- Tiered approach (Starter/Pro/Institution) is smart for different user segments
- Keeping the main health chat free is the right call — it drives adoption
- The library section is the natural home for these paid features

**What needs adjustment:**
- The **Institution/Enterprise tier** ($25/mo) requires multi-user management, educator dashboards, and white-labeling — that's a massive feature set that should be a later phase. I recommend starting with Starter + Pro only.
- The existing "Premium" subscription (₦4,500/mo) already gates features like lab uploads and voice input. We need to decide: does the new educational tier **replace** it, or **coexist alongside** it? I recommend they coexist — Premium unlocks chat features, while Starter/Pro unlocks advanced library features.
- Paystack handles the payment, but the `subscriptions` table currently only stores a single `plan` string. We'll need to support multiple plan types (e.g., `premium` for chat features, `edu_starter` / `edu_pro` for library features).

**What's NOT part of libraries (from your list):**
- "AI-assisted symptom analysis tutorials" — this is more of a general chat/tools feature, not library-specific
- "Interactive AI feedback on lab reports" — this is already in the main chat as the Lab Result Interpreter (premium feature)
- Everything else maps well to the Libraries section

### Plan

#### 1. Database: Update subscriptions table
Add support for multiple subscription types by adding a `plan_type` column to distinguish between `chat` (existing premium) and `edu` (new educational) subscriptions. Migration:
- Add `plan_type` column (default `'chat'`) to `subscriptions`
- Update existing rows to have `plan_type = 'chat'`

#### 2. Create `src/data/eduPricing.ts`
Define Starter ($2/mo, $17/yr) and Pro ($8/mo, $67/yr) tiers with the same geo-localized pricing pattern as the main subscription.

#### 3. New hook: `src/hooks/useEduSubscription.tsx`
Query `subscriptions` where `plan_type = 'edu'` to determine if user has `edu_starter` or `edu_pro` plan. Expose `eduPlan`, `isEduStarter`, `isEduPro`.

#### 4. Update Library data (`src/data/libraries.ts`)
Add a `tier` field to each library: `"free"`, `"starter"`, or `"pro"`. Split:
- **Free** (accessible to all): Medical Dictionary, Anatomy & Physiology, Diseases & Conditions
- **Starter**: Pharmacology, Laboratory Tests, Study & Exam Prep
- **Pro**: Clinical Case Learning, Research & Evidence Basics + new features (quizzes, progress dashboard)

#### 5. Gate library access in `Libraries.tsx` and `LibraryChat.tsx`
- Show lock icons on gated libraries
- When a user clicks a locked library, show an upgrade modal with Starter/Pro options
- In `LibraryChat.tsx`, check tier before allowing chat

#### 6. Create `/pricing/education` page
A dedicated pricing page for educational tiers showing Starter vs Pro comparison, with Paystack checkout integration using the same `usePaystack` pattern but for edu plans.

#### 7. Update `usePaystack.tsx`
Support a `planType` parameter so the payment reference and verification flow can distinguish between chat premium and edu subscriptions.

#### 8. Update `verify-payment` edge function
Handle the new `edu_starter` and `edu_pro` plan values, storing them with `plan_type = 'edu'` in the subscriptions table.

### Files Summary

| Action | File |
|---|---|
| Migration | Add `plan_type` column to `subscriptions` |
| Create | `src/data/eduPricing.ts` |
| Create | `src/hooks/useEduSubscription.tsx` |
| Create | `src/pages/EduPricing.tsx` |
| Create | `src/components/EduUpgradeModal.tsx` |
| Modify | `src/data/libraries.ts` — add `tier` field |
| Modify | `src/pages/Libraries.tsx` — show lock icons, upgrade flow |
| Modify | `src/pages/LibraryChat.tsx` — gate access by tier |
| Modify | `src/hooks/usePaystack.tsx` — support `planType` param |
| Modify | `supabase/functions/verify-payment/index.ts` — handle edu plans |
| Modify | `src/App.tsx` — add `/pricing/education` route |

### Institution tier
Deferred to a future phase — requires user management, bulk accounts, educator analytics, and white-labeling which are significant features beyond a pricing change.

