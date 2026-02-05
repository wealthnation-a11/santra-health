
# Plan: Make Santra Fully Functional

Based on my thorough analysis of the codebase, I've identified several issues that need to be fixed and improvements to make the application fully functional.

## Issues Found

### 1. Console Warning: Skeleton Ref Issue
The `VoiceUsageCard` component is passing refs to `Skeleton` components that don't support them. This causes React warnings.

### 2. 404 Page Not Branded
The NotFound page is using a generic design without Santra branding - no logo, no proper styling.

### 3. VoiceUsageCard Loading State Issue
The `VoiceUsageCard` creates a new instance of `useVoiceInput` hook just to read usage data, which is inefficient and causes the loading states to re-trigger.

### 4. Missing Back Button on Support Page Header
While there's a back arrow, the header could be more consistent with the Settings page UX.

---

## Implementation Plan

### Step 1: Fix VoiceUsageCard Component
Create a dedicated hook for fetching voice usage data instead of reusing the full `useVoiceInput` hook. This will:
- Remove unnecessary Speech Recognition initialization
- Fix the ref warning by removing skeleton refs
- Make the component more efficient

**Changes:**
- Create `src/hooks/useVoiceUsage.tsx` - A lightweight hook just for reading usage data
- Update `src/components/settings/VoiceUsageCard.tsx` - Use the new hook and fix skeleton refs

### Step 2: Brand the 404 Page
Update the NotFound page to include:
- Santra logo with bouncing animation
- Consistent color scheme and styling
- Better navigation back to chat

**Changes:**
- Update `src/pages/NotFound.tsx`

### Step 3: Minor UX Improvements
Small fixes to improve overall polish:
- Fix skeleton components (ensure no refs are passed)
- Consistent navigation patterns

---

## Technical Details

```text
Files to Create:
+-- src/hooks/useVoiceUsage.tsx (new - lightweight usage-only hook)

Files to Modify:
+-- src/components/settings/VoiceUsageCard.tsx (use new hook, fix skeleton)
+-- src/pages/NotFound.tsx (add Santra branding)
```

### New Hook: useVoiceUsage
```typescript
// Lightweight hook that only fetches voice usage data
// without initializing Speech Recognition
export function useVoiceUsage() {
  // Fetch usage from voice_usage table
  // Return: { usageCount, remainingUses, isLoading }
}
```

### Updated NotFound Page
- Add SantraLogo component with animation
- Use consistent styling with the rest of the app
- Provide clear navigation back to home/chat

---

## Summary

The application is mostly functional with the following fixes needed:

| Priority | Issue | Fix |
|----------|-------|-----|
| High | VoiceUsageCard inefficient hook usage | Create dedicated useVoiceUsage hook |
| Medium | Skeleton ref warnings | Remove refs from skeleton components |
| Medium | Unbranded 404 page | Add Santra branding and styling |

These changes will resolve the console warnings and ensure a polished, fully functional experience.
