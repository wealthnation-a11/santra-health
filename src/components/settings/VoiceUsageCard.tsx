import { Mic, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHLY_LIMIT = 10;

export function VoiceUsageCard() {
  const { usageCount, remainingUses, isLoading } = useVoiceInput(() => {});
  
  const usagePercentage = (usageCount / MONTHLY_LIMIT) * 100;
  const isNearLimit = remainingUses <= 3;
  const isAtLimit = remainingUses === 0;

  // Get next reset date (first day of next month)
  const getNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="w-32 h-5 mb-1" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        <Skeleton className="w-full h-2 rounded-full mb-2" />
        <Skeleton className="w-24 h-4" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isAtLimit ? "bg-destructive/20" : isNearLimit ? "bg-warning/20" : "santra-gradient"
        }`}>
          <Mic size={20} className={isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-primary-foreground"} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Voice Input Usage</h2>
          <p className="text-sm text-muted-foreground">Monthly voice input allowance</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {usageCount} of {MONTHLY_LIMIT} uses this month
          </span>
          <span className={`text-sm font-medium ${
            isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-primary"
          }`}>
            {remainingUses} remaining
          </span>
        </div>

        <Progress 
          value={usagePercentage} 
          className={`h-2 ${isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-warning" : ""}`}
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw size={12} />
          <span>Resets on {getNextResetDate()}</span>
        </div>

        {isAtLimit && (
          <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              You've reached your monthly limit
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Your voice input will reset at the beginning of next month.
            </p>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
            <p className="text-sm text-warning font-medium">
              Running low on voice inputs
            </p>
            <p className="text-xs text-warning/80 mt-1">
              You have {remainingUses} voice input{remainingUses !== 1 ? "s" : ""} left this month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
