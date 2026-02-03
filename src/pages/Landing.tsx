import { ArrowRight, MessageCircle, Shield, Zap, Heart, Users, Globe, Clock, Brain, Lock, CheckCircle, Stethoscope } from "lucide-react";
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
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground mb-8">
              <Zap size={16} className="text-primary" />
              <span>AI-Powered Health Assistance</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Santra —{" "}
              <span className="santra-gradient-text">The Global Health AI</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Your trusted AI companion for health questions, guidance, and support. 
              Get instant, reliable health information — anytime, anywhere.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="santra" size="xl" onClick={handleStartChat}>
                Start Chat
                <ArrowRight size={20} />
              </Button>
              <Button variant="santra-outline" size="xl" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                How Santra Works
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 santra-gradient opacity-10 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border rounded-3xl shadow-santra-lg overflow-hidden">
              {/* Mock Chat Interface */}
              <div className="p-6 border-b border-border flex items-center gap-3">
                <SantraLogo size="sm" showText={false} />
                <div>
                  <h3 className="font-semibold text-foreground">Santra Health Assistant</h3>
                  <span className="text-xs text-primary">Online • Ready to help</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-santra-chat-user rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                    <p className="text-foreground">What are the symptoms of dehydration?</p>
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 santra-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart size={14} className="text-primary-foreground" />
                  </div>
                  <div className="bg-santra-chat-ai rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                    <p className="text-foreground">
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
      <section className="py-16 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold santra-gradient-text mb-2">24/7</p>
              <p className="text-muted-foreground">Always Available</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold santra-gradient-text mb-2">100+</p>
              <p className="text-muted-foreground">Health Topics</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold santra-gradient-text mb-2">50+</p>
              <p className="text-muted-foreground">Countries Supported</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold santra-gradient-text mb-2">Free</p>
              <p className="text-muted-foreground">To Get Started</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How Santra Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get reliable health information in seconds, with smart escalation when you need human expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-santra transition-shadow">
              <div className="w-16 h-16 santra-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-santra">
                <MessageCircle className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Ask Any Health Question</h3>
              <p className="text-muted-foreground">
                From symptoms to medications, mental health to wellness — Santra provides 
                clear, educational answers to your health queries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-santra transition-shadow">
              <div className="w-16 h-16 santra-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-santra">
                <Shield className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Safe & Responsible</h3>
              <p className="text-muted-foreground">
                Santra detects emergencies and guides you appropriately. It never diagnoses 
                or prescribes — just educates and empowers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-santra transition-shadow">
              <div className="w-16 h-16 santra-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-santra">
                <Users className="text-primary-foreground" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Doctor When Needed</h3>
              <p className="text-muted-foreground">
                When professional care is required, Santra connects you to licensed doctors 
                on Prescribly — seamlessly and instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              What Can Santra Help With?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From everyday wellness questions to understanding complex health topics
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Symptom Checker", desc: "Describe your symptoms and get educational information about possible causes" },
              { icon: Brain, title: "Mental Health", desc: "Resources and guidance for stress, anxiety, sleep issues, and emotional wellbeing" },
              { icon: Stethoscope, title: "Medical Conditions", desc: "Learn about conditions, treatments, and what to expect from your healthcare journey" },
              { icon: Clock, title: "Medication Info", desc: "Understand your medications, side effects, and important interactions to watch for" },
              { icon: Shield, title: "Preventive Care", desc: "Tips for staying healthy, vaccination schedules, and recommended screenings" },
              { icon: Globe, title: "Nutrition & Wellness", desc: "Evidence-based advice on diet, exercise, and lifestyle for optimal health" },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <item.icon className="text-primary mb-4" size={24} />
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Create Your Account", desc: "Sign up with your email or Google account. We'll ask for basic info to personalize your experience." },
              { step: "2", title: "Ask Your Question", desc: "Type any health-related question naturally. Santra understands context and provides thoughtful responses." },
              { step: "3", title: "Get Guidance", desc: "Receive educational information, wellness tips, or get connected to a real doctor when needed." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 santra-gradient rounded-xl flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-lg shadow-santra">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="santra" size="lg" onClick={handleStartChat}>
              Get Started Now
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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
            <div className="bg-card border border-border rounded-2xl p-8">
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="santra-gradient rounded-3xl p-12 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
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
      <footer className="py-12 px-4 border-t border-border bg-muted/20">
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
