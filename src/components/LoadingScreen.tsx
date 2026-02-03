import santraLogoImg from "@/assets/santra-logo.png";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Glowing background effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      </div>
      
      {/* Bouncing logo */}
      <div className="relative z-10 animate-logo-bounce">
        <div className="relative">
          {/* Glow ring behind logo */}
          <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-xl scale-125 animate-pulse" />
          <img 
            src={santraLogoImg} 
            alt="Santra" 
            className="relative w-24 h-24 rounded-3xl shadow-santra-lg"
          />
        </div>
      </div>
      
      {/* Loading text */}
      <p className="mt-8 text-lg font-medium text-muted-foreground animate-fade-in">
        {message}
      </p>
    </div>
  );
}
