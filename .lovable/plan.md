
# Plan: Make Santra More Like ChatGPT

Based on my analysis of the current codebase, here are the key ChatGPT features that can be added to enhance the user experience.

## Current State

Santra already has:
- Streaming AI responses with markdown rendering
- Conversation history with sidebar
- Dark/Light theme toggle
- Voice input with language selection
- Delete conversation functionality
- Typing indicator during AI responses

## Features to Add

### 1. Copy Message Button
Add a button to copy AI responses to clipboard with visual feedback.

**What it does:** Users can click to copy any message content instantly.

### 2. Regenerate Response Button
Allow users to regenerate the last AI response if they're not satisfied.

**What it does:** Re-sends the last user message to get a fresh AI response.

### 3. Edit User Message
Let users edit their previous messages and regenerate from that point.

**What it does:** Click on a sent message to edit and resubmit it.

### 4. Stop Generation Button
Add ability to stop the AI mid-response during streaming.

**What it does:** Shows a "Stop generating" button while streaming that cancels the response.

### 5. Message Feedback (Thumbs Up/Down)
Let users rate AI responses for quality feedback.

**What it does:** Adds thumbs up/down buttons to rate responses (stored in database).

### 6. Conversation Rename
Allow users to rename conversation titles inline.

**What it does:** Click on conversation title to edit it directly.

### 7. Search Conversations
Add a search bar to find past conversations quickly.

**What it does:** Filter sidebar conversations by title or content keywords.

### 8. Keyboard Shortcuts
Add keyboard shortcuts for common actions.

**What it does:** 
- `Ctrl/Cmd + Shift + O` - New chat
- `Ctrl/Cmd + Shift + ;` - Toggle sidebar
- `Escape` - Stop generating

---

## Implementation Priority

| Priority | Feature | Complexity |
|----------|---------|------------|
| High | Copy Message | Low |
| High | Regenerate Response | Medium |
| High | Stop Generation | Medium |
| Medium | Message Feedback | Medium |
| Medium | Edit User Message | High |
| Medium | Conversation Rename | Low |
| Low | Search Conversations | Medium |
| Low | Keyboard Shortcuts | Medium |

---

## Technical Details

### File Changes Overview

```text
Files to Create:
+-- src/components/MessageActions.tsx (copy, regenerate, feedback buttons)

Files to Modify:
+-- src/components/ChatMessage.tsx (add action buttons)
+-- src/pages/Chat.tsx (add regenerate + stop logic, AbortController)
+-- src/components/ChatSidebar.tsx (add search + rename)
+-- src/components/ChatInput.tsx (show stop button while streaming)
```

### Database Changes
A new table to store message feedback:

```sql
CREATE TABLE message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback TEXT CHECK (feedback IN ('positive', 'negative')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Implementation Notes

1. **Stop Generation**: Use `AbortController` to cancel the fetch stream mid-response
2. **Copy Button**: Use `navigator.clipboard.writeText()` with toast confirmation
3. **Regenerate**: Delete the last assistant message and re-call `handleSendMessage` with the last user message
4. **Edit Message**: Show inline textarea, update message in DB, delete subsequent messages, regenerate
5. **Message Actions**: Show on hover (desktop) or always visible (mobile)

---

## Summary

This plan adds 8 ChatGPT-like features in order of priority. The high-priority items (Copy, Regenerate, Stop Generation) provide immediate usability improvements with relatively low complexity. The medium-priority items (Feedback, Edit, Rename) add polish and user control. The lower-priority items (Search, Shortcuts) are nice-to-have power-user features.

Would you like me to implement all features, or start with specific ones?
