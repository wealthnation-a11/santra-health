import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Stethoscope, MapPin, Clock, Gauge, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";

const bodyAreas = [
  "Head", "Eyes", "Ears", "Nose/Throat", "Chest", "Abdomen", "Back",
  "Arms/Hands", "Legs/Feet", "Skin", "General/Whole Body"
];

const durationOptions = [
  "Just started (today)", "A few days", "About a week", "2-4 weeks", "More than a month"
];

const STEPS = ["Location", "Symptoms", "Duration & Severity", "Additional Info", "Results"];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [bodyArea, setBodyArea] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canNext = () => {
    if (step === 0) return !!bodyArea;
    if (step === 1) return symptoms.trim().length > 3;
    if (step === 2) return !!duration;
    return true;
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setResult("");
    setStep(4);

    const prompt = `The user is using a guided symptom checker. Here is their structured input:

**Affected area:** ${bodyArea}
**Symptoms described:** ${symptoms}
**Duration:** ${duration}
**Severity (1-10):** ${severity[0]}
**Additional info:** ${additionalInfo || "None provided"}

Based on this structured information, provide an educational health summary. Include:
1. Possible general conditions associated with these symptoms (NOT a diagnosis)
2. When they should see a doctor
3. General self-care tips that may help
4. Any red flags to watch for

Remember: You are providing educational health information, not a medical diagnosis.`;

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/santra-chat`;
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          conversationHistory: [],
          userId: user?.id,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to get response");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setResult(full);
            }
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setResult("Sorry, something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [bodyArea, symptoms, duration, severity, additionalInfo, user?.id]);

  const handleNext = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step > 0 && step < 4 ? setStep(s => s - 1) : navigate("/chat")}>
            <ArrowLeft size={20} />
          </Button>
          <Stethoscope size={22} className="text-primary" />
          <h1 className="text-xl font-display font-bold">Symptom Checker</h1>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-primary" />
                <h2 className="font-semibold text-lg">Where are you experiencing the issue?</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bodyAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setBodyArea(area)}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      bodyArea === area
                        ? "border-primary bg-primary/10 text-foreground font-medium"
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-primary" />
                <h2 className="font-semibold text-lg">Describe your symptoms</h2>
              </div>
              <Badge variant="outline" className="mb-2">{bodyArea}</Badge>
              <Textarea
                placeholder="e.g., Sharp pain that gets worse when I move, mild headache, feeling dizzy..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg">How long have you had this?</h2>
                </div>
                <div className="space-y-2">
                  {durationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`w-full p-3 rounded-xl border text-sm text-left transition-all ${
                        duration === d
                          ? "border-primary bg-primary/10 text-foreground font-medium"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gauge size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg">Severity (1 = mild, 10 = severe)</h2>
                </div>
                <Slider value={severity} onValueChange={setSeverity} min={1} max={10} step={1} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mild</span>
                  <span className="font-bold text-foreground text-lg">{severity[0]}</span>
                  <span>Severe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-semibold text-lg">Anything else we should know?</h2>
              <p className="text-sm text-muted-foreground">Optional: mention medications, recent changes, or other symptoms.</p>
              <Textarea
                placeholder="e.g., I recently started a new medication, I've been stressed at work..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="bg-accent rounded-xl p-4 text-sm space-y-1">
                <p className="font-medium text-foreground">Summary</p>
                <p className="text-muted-foreground"><strong>Area:</strong> {bodyArea}</p>
                <p className="text-muted-foreground"><strong>Symptoms:</strong> {symptoms}</p>
                <p className="text-muted-foreground"><strong>Duration:</strong> {duration}</p>
                <p className="text-muted-foreground"><strong>Severity:</strong> {severity[0]}/10</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardContent className="pt-6">
              {loading && !result && (
                <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                  <Loader2 className="animate-spin" size={20} />
                  <p>Analyzing your symptoms...</p>
                </div>
              )}
              {result && (
                <div className="prose prose-sm dark:prose-invert max-w-none animate-fade-in">
                  <ReactMarkdown>{result.replace(/\[SUGGESTIONS\]:.*$/s, "").trim()}</ReactMarkdown>
                </div>
              )}
              {!loading && result && (
                <div className="mt-6 flex gap-3">
                  <Button variant="santra-outline" onClick={() => { setStep(0); setResult(""); setBodyArea(""); setSymptoms(""); setDuration(""); setSeverity([5]); setAdditionalInfo(""); }}>
                    Start Over
                  </Button>
                  <Button onClick={() => navigate("/chat")}>
                    Continue in Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/chat")} disabled={loading}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button onClick={handleNext} disabled={!canNext() || loading} className="gap-2">
              {step === 3 ? "Get Assessment" : "Next"}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          ⚠️ This is for educational purposes only. It is not a medical diagnosis. Please consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
}
