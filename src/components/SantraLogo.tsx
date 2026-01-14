import { Heart, Sparkles } from "lucide-react";

interface SantraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

export function SantraLogo({ size = "md", showText = true, className = "" }: SantraLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} santra-gradient rounded-xl flex items-center justify-center shadow-santra`}>
        <Heart className="text-primary-foreground" size={iconSizes[size]} strokeWidth={2.5} />
        <Sparkles 
          className="absolute -top-1 -right-1 text-primary" 
          size={iconSizes[size] * 0.5} 
        />
      </div>
      {showText && (
        <span className={`font-display font-bold santra-gradient-text ${textSizeClasses[size]}`}>
          Santra
        </span>
      )}
    </div>
  );
}
