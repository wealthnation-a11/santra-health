import { ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface BranchSelectorProps {
  currentIndex: number;
  totalBranches: number;
  onNavigate: (direction: "prev" | "next") => void;
}

export function BranchSelector({ currentIndex, totalBranches, onNavigate }: BranchSelectorProps) {
  if (totalBranches <= 1) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onNavigate("prev")}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Previous branch</p></TooltipContent>
        </Tooltip>

        <span className="text-xs font-medium min-w-[2rem] text-center">
          {currentIndex + 1}/{totalBranches}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onNavigate("next")}
              disabled={currentIndex === totalBranches - 1}
            >
              <ChevronRight size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Next branch</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
