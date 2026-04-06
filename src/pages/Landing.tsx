import { ArrowRight, MessageCircle, Shield, Zap, Heart, Users, Globe, Clock, Brain, Lock, CheckCircle, Stethoscope, BookOpen, Calculator, Droplets, Flame, Search, FileText, Bookmark, Mic, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SantraLogo } from "@/components/SantraLogo";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleStartChat = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };

  if (loading) {
    return <LoadingScreen message="Welcome to Santra" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <SantraLogo size="md" />
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Button variant="santra" onClick={() => navigate("/chat")}>
                  Open Chat
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button variant="santra" onClick={() => navigate("/auth")}>
                    Start Chat
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground mb-6 sm:mb-8">
              <Zap size={16} className="text-primary" />
              <span>AI-Powered Health Assistance</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Santra —{" "}
              <span className="santra-gradient-text">The Global Health AI</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Your trusted AI companion for health questions, guidance, and support. 
              Get instant, reliable health information — anytime, anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="santra" size="xl" onClick={handleStartChat}>
                Start Chat
                <ArrowRight size={20} />
              </Button>
              <Button variant="santra-outline" size="xl" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Features
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 santra-gradient opacity-10 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border rounded-3xl shadow-santra-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border flex items-center gap-3">
                <SantraLogo size="sm" showText={false} />
                <div>
                  <h3 className="font-semibold text-foreground">Santra Health Assistant</h3>
                  <span className="text-xs text-primary">Online • Ready to help</span>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-end">
                  <div className="bg-santra-chat-user rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                    <p className="text-foreground text-sm sm:text-base">What are the symptoms of dehydration?</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 santra-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart size={14} className="text-primary-foreground" />
                  </div>
                  <div className="bg-santra-chat-ai rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                    <p className="text-foreground text-sm sm:text-base">
                      Common signs of dehydration include increased thirst, dry mouth, 
                      dark yellow urine, fatigue, and dizziness. In more severe cases, 
                      you might experience rapid heartbeat or confusion...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold santra-gradient-text mb-2">24/7</p>
              <p className="text-sm sm:text-base text-muted-foreground">Always Available</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold santra-gradient-text mb-2">100+</p>
              <p className="text-sm sm:text-base text-muted-foreground">Health Topics</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold santra-gradient-text mb-2">50+</p>
              <p className="text-sm sm:text-base text-muted-foreground">Countries Supported</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold santra-gradient-text mb-2">Free</p>
              <p className="text-sm sm:text-base text-muted-foreground">To Get Started</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need for Your Health
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Santra comes packed with powerful tools and features — all designed to keep you informed and healthy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: MessageCircle, title: "AI Health Chat", desc: "Ask any health question and get instant, reliable answers powered by advanced AI. Supports conversation history and branching." },
              { icon: Stethoscope, title: "Symptom Checker", desc: "Describe your symptoms naturally and get educational information about possible causes and when to see a doctor." },
              { icon: Upload, title: "Lab Result Analysis", desc: "Upload lab reports or images and get AI-powered interpretations of your results in plain language." },
              { icon: BookOpen, title: "Medical Libraries", desc: "Browse curated medical knowledge libraries covering anatomy, pharmacology, clinical medicine, and more." },
              { icon: Search, title: "Medical Dictionary", desc: "Look up any medical term and get clear, easy-to-understand definitions instantly." },
              { icon: Heart, title: "First Aid Guide", desc: "Step-by-step first aid instructions for common emergencies — always available when you need them." },
              { icon: Calculator, title: "BMI Calculator", desc: "Calculate your Body Mass Index with instant results and category classification." },
              { icon: Droplets, title: "Water Intake Calculator", desc: "Find your recommended daily water intake based on your weight and activity level." },
              { icon: Flame, title: "Calorie Estimator", desc: "Estimate your daily calorie needs using the Mifflin-St Jeor equation for weight management." },
              { icon: Mic, title: "Voice Input", desc: "Speak your health questions instead of typing — with support for multiple languages." },
              { icon: Bookmark, title: "Bookmarks & Pins", desc: "Save important messages and pin key responses to find them easily later." },
              { icon: Users, title: "Consult a Doctor", desc: "When AI isn't enough, connect instantly with licensed doctors on Prescribly for professional care." },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-santra transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="text-primary" size={20} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-16 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {[
              { step: "1", title: "Create Your Account", desc: "Sign up with email or Google. We personalize your experience with a quick onboarding." },
              { step: "2", title: "Ask Your Question", desc: "Type or speak any health question. Upload lab results for instant analysis." },
              { step: "3", title: "Get Guidance", desc: "Receive clear health information, use built-in tools, or connect to a real doctor when needed." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 sm:gap-6 items-start">
                <div className="w-11 h-11 sm:w-12 sm:h-12 santra-gradient rounded-xl flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-lg shadow-santra">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Button variant="santra" size="lg" onClick={handleStartChat}>
              Get Started Now
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Your Privacy & Safety Come First
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: "End-to-End Encryption", desc: "All your conversations are encrypted and stored securely" },
                  { icon: Shield, title: "Never Shared", desc: "Your health data is never sold or shared with third parties" },
                  { icon: CheckCircle, title: "Emergency Detection", desc: "Santra recognizes emergencies and provides immediate guidance" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <Globe className="text-primary mb-6" size={48} />
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Global Health, Made Accessible
              </h3>
              <p className="text-muted-foreground mb-6">
                Santra uses inclusive, neutral language designed for a global audience. 
                Get health information that's relevant, clear, and trustworthy — no matter where you are.
              </p>
              <Button variant="santra-outline" onClick={handleStartChat}>
                Start Your Health Journey
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="santra-gradient rounded-3xl p-8 sm:p-12 text-primary-foreground">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 max-w-xl mx-auto">
              Join thousands of users who trust Santra for reliable health information and guidance.
            </p>
            <Button 
              size="xl" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleStartChat}
            >
              Start Chatting with Santra
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <SantraLogo size="sm" />
              <span className="text-sm text-muted-foreground">A product of Prescribly</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground max-w-md">
                Santra is an AI-powered health assistant and does not replace professional medical advice. 
                Always consult a healthcare provider for medical concerns.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Prescribly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
