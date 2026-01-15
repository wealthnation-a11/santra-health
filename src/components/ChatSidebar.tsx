import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Settings, HelpCircle, ExternalLink, LogOut, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { SantraLogo } from "./SantraLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onConsultDoctor: () => void;
  onSignOut?: () => void;
  userName?: string;
}

export function ChatSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onConsultDoctor,
  onSignOut,
  userName = "User",
}: ChatSidebarProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setConversationToDelete(conv);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete && onDeleteConversation) {
      onDeleteConversation(conversationToDelete.id);
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <>
      <aside className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <SantraLogo size="md" />
          <p className="text-xs text-muted-foreground mt-1">A Prescribly Product</p>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            variant="santra-outline"
            className="w-full justify-start gap-2"
            onClick={onNewChat}
          >
            <Plus size={18} />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-2">Recent Chats</div>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageSquare className="mx-auto mb-2 opacity-50" size={24} />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group relative ${
                    activeId === conv.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 pr-8">
                    <MessageSquare size={16} className="flex-shrink-0 opacity-60" />
                    <span className="font-medium text-sm truncate">{conv.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1 pl-6 pr-8">
                    {conv.lastMessage}
                  </p>
                  {onDeleteConversation && (
                    <button
                      onClick={(e) => handleDeleteClick(e, conv)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Consult Doctor CTA */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 text-primary hover:bg-santra-teal-light"
            onClick={onConsultDoctor}
          >
            <ExternalLink size={16} />
            Consult a Doctor on Prescribly
          </Button>
        </div>

        {/* User Menu */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <span className="truncate flex-1 text-left font-medium text-foreground">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings size={16} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle size={16} />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onSignOut && (
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut size={16} />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{conversationToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
