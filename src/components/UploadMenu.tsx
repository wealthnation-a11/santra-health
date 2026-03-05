import { useState, useRef } from "react";
import { Image, FileText, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UploadMenuProps {
  onUploadFile: (file: File) => void;
  onComingSoon: () => void;
  disabled?: boolean;
}

export function UploadMenu({ onUploadFile, onComingSoon, disabled }: UploadMenuProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleDocSelect = () => {
    docInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    onUploadFile(file);
    // Reset input
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
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
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleImageSelect} className="gap-2 cursor-pointer">
            <Image className="h-4 w-4" />
            <div>
              <p className="font-medium">Upload Lab Image</p>
              <p className="text-xs text-muted-foreground">Analyze lab results from photo</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDocSelect} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            <div>
              <p className="font-medium">Upload Lab Document</p>
              <p className="text-xs text-muted-foreground">Interpret PDF lab reports</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onComingSoon} className="gap-2 cursor-pointer">
            <Mic className="h-4 w-4" />
            <div>
              <p className="font-medium">Record Audio</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
