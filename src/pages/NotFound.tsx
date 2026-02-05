 import { useLocation, Link } from "react-router-dom";
 import { useEffect } from "react";
 import { SantraLogo } from "@/components/SantraLogo";
 import { Button } from "@/components/ui/button";
 import { Home, MessageCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       {/* Glowing background effect */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
       </div>
       
       <div className="relative z-10 text-center space-y-6">
         {/* Bouncing logo */}
         <div className="flex justify-center animate-logo-bounce">
           <div className="relative">
             <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-xl scale-125 animate-pulse" />
             <div className="relative">
               <SantraLogo size="xl" showText={false} />
             </div>
           </div>
         </div>
         
         {/* Error message */}
         <div className="space-y-2">
           <h1 className="text-6xl font-bold santra-gradient-text">404</h1>
           <p className="text-xl text-muted-foreground">
             Oops! This page doesn't exist
           </p>
           <p className="text-sm text-muted-foreground/70">
             The page you're looking for might have been moved or deleted.
           </p>
         </div>
         
         {/* Navigation buttons */}
         <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
           <Button asChild className="santra-gradient">
             <Link to="/chat">
               <MessageCircle size={18} className="mr-2" />
               Go to Chat
             </Link>
           </Button>
           <Button asChild variant="outline">
             <Link to="/">
               <Home size={18} className="mr-2" />
               Back to Home
             </Link>
           </Button>
         </div>
      </div>
    </div>
  );
};

export default NotFound;
