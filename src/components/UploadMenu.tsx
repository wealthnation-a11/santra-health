import { Image, FileText, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UploadMenuProps {
  onSelectOption: () => void;
  disabled?: boolean;
}

export function UploadMenu({ onSelectOption, disabled }: UploadMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Paperclip size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={onSelectOption} className="gap-2 cursor-pointer">
          <Image className="h-4 w-4" />
          Upload Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSelectOption} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Upload Document (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSelectOption} className="gap-2 cursor-pointer">
          <Mic className="h-4 w-4" />
          Record Audio
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
