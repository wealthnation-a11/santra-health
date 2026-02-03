import santraLogoImg from "@/assets/santra-logo.png";

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

export function SantraLogo({ size = "md", showText = true, className = "" }: SantraLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={santraLogoImg} 
        alt="Santra Logo" 
        className={`${sizeClasses[size]} rounded-xl object-cover`}
      />
      {showText && (
        <span className={`font-display font-bold santra-gradient-text ${textSizeClasses[size]}`}>
          Santra
        </span>
      )}
    </div>
  );
}
