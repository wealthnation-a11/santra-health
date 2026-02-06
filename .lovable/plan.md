
# Plan: Make Santra More Like ChatGPT

## ✅ COMPLETED

All 8 ChatGPT-like features have been implemented:

### 1. ✅ Copy Message Button
- Added to `MessageActions.tsx`
- Copies message content to clipboard with toast confirmation

### 2. ✅ Regenerate Response Button
- Shows on the last assistant message
- Deletes the previous response and re-generates from the last user message

### 3. ✅ Edit User Message
- Click edit icon on last user message to edit inline
- Saves edit and regenerates the conversation from that point

### 4. ✅ Stop Generation Button
- Shows "Stop generating" button while streaming
- Uses `AbortController` to cancel the fetch stream mid-response
- Saves partial response with "[Response stopped by user]" note

### 5. ✅ Message Feedback (Thumbs Up/Down)
- Added `message_feedback` table in database
- Thumbs up/down buttons on all assistant messages
- Feedback stored in database with user association

### 6. ✅ Conversation Rename
- Click pencil icon on conversation in sidebar
- Inline rename with Enter to save, Escape to cancel

### 7. ✅ Search Conversations
- Search bar in sidebar filters by title or content
- Shows filtered count when searching

### 8. ✅ Keyboard Shortcuts
- `Ctrl/Cmd + Shift + O` - New chat
- `Ctrl/Cmd + Shift + ;` - Toggle sidebar
- `Escape` - Stop generating

---

## Files Created

- `src/components/MessageActions.tsx` - Copy, regenerate, feedback buttons
- `src/components/StopGenerationButton.tsx` - Stop generation UI
- `src/components/EditMessageInput.tsx` - Inline edit textarea
- `src/components/ConversationSearch.tsx` - Sidebar search
- `src/components/ConversationRenameInput.tsx` - Inline rename input
- `src/hooks/useKeyboardShortcuts.tsx` - Global keyboard shortcuts
- `src/lib/arrayUtils.ts` - ES2023 polyfill for findLastIndex

## Files Modified

- `src/components/ChatMessage.tsx` - Integrated MessageActions, edit mode
- `src/components/ChatSidebar.tsx` - Added search, rename functionality
- `src/components/ChatInput.tsx` - Added stop generation button
- `src/pages/Chat.tsx` - AbortController, regenerate, edit, shortcuts
- `src/hooks/useConversations.tsx` - Added rename, delete message functions

## Database Changes

- Created `message_feedback` table with RLS policies
- Added UPDATE and DELETE policies for messages table
