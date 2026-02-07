
# Plan: Add Follow-Up Suggestions (Like ChatGPT)

This feature adds clickable suggestion chips that appear after AI responses, helping users continue the conversation naturally.

## How It Works

After Santra responds, 2-3 contextual follow-up questions appear as clickable buttons below the message. Clicking a suggestion sends it as the next message automatically.

**Example:**
- User asks: "What are symptoms of the flu?"
- Santra responds with flu information
- Suggestions appear: "How long does flu last?" | "What's the difference between flu and cold?" | "How can I prevent the flu?"

---

## Implementation Approach

### Option A: AI-Generated Suggestions (Recommended)
The AI generates suggestions as part of its response. The edge function instructs the AI to include suggestions in a structured format at the end of each response.

**Pros:** Contextually relevant, dynamic, feels natural
**Cons:** Slightly more tokens per response

### Option B: Static Template Suggestions
Pre-defined suggestion templates based on health topics.

**Pros:** No extra tokens, instant
**Cons:** Generic, may not fit context

**I recommend Option A** for the most ChatGPT-like experience.

---

## Technical Implementation

### 1. Update Edge Function
Modify the system prompt to ask the AI to include suggestions in a specific format:

```
At the end of your response, on a new line, add 2-3 follow-up questions 
the user might want to ask, formatted as:
[SUGGESTIONS]: Question 1? | Question 2? | Question 3?
```

### 2. Create SuggestionChips Component
New component to parse and display suggestions as clickable buttons.

```text
src/components/SuggestionChips.tsx
- Parse the [SUGGESTIONS] line from AI response
- Display as horizontal scrollable chips
- onClick sends the suggestion as next message
- Styling: pill buttons with hover effects
```

### 3. Update ChatMessage Component
- Strip the [SUGGESTIONS] line from displayed message content
- Pass suggestions to the new component if present

### 4. Update Chat Page
- Pass `onSendSuggestion` callback to ChatMessage
- Only show suggestions on the last assistant message
- Hide suggestions while typing/streaming

---

## Files to Change

```text
Files to Create:
+-- src/components/SuggestionChips.tsx

Files to Modify:
+-- supabase/functions/santra-chat/index.ts (update system prompt)
+-- src/components/ChatMessage.tsx (parse & display suggestions)
+-- src/pages/Chat.tsx (handle suggestion clicks)
```

---

## Visual Design

```text
+----------------------------------------------------------+
|  [Santra AI Response about flu symptoms...]              |
|                                                          |
|  Suggested follow-ups:                                   |
|  +------------------+ +-------------------+ +----------+ |
|  | How long does    | | Flu vs cold      | | How to   | |
|  | flu last?        | | differences?      | | prevent? | |
|  +------------------+ +-------------------+ +----------+ |
+----------------------------------------------------------+
```

**Styling:**
- Subtle background (bg-secondary/50)
- Rounded pill buttons
- Hover state with primary color
- Horizontal scroll on mobile
- 3 suggestions max to avoid clutter

---

## Edge Cases Handled

1. **Streaming:** Don't parse suggestions until response is complete
2. **Emergency responses:** Still include suggestions but focus on safety follow-ups
3. **Short responses:** AI may include 1-2 suggestions instead of 3
4. **Missing suggestions:** If AI doesn't include them, component gracefully hides

---

## Summary

| Component | Change |
|-----------|--------|
| Edge function | Add suggestion instruction to system prompt |
| SuggestionChips | New component for clickable chips |
| ChatMessage | Parse [SUGGESTIONS] and render chips |
| Chat page | Handle suggestion click as new message |

This gives users a ChatGPT-like experience with contextual follow-up suggestions after every AI response.
