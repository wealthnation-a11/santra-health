import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const MONTHLY_LIMIT = 10;

export function useVoiceInput(onTranscript: (text: string) => void, language: string = "en-US") {
  const [isListening, setIsListening] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  // Fetch current usage
  const fetchUsage = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const monthYear = getCurrentMonthYear();
    
    const { data, error } = await supabase
      .from("voice_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .maybeSingle();

    if (error) {
      console.error("Error fetching voice usage:", error);
    } else {
      setUsageCount(data?.usage_count || 0);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Increment usage
  const incrementUsage = async () => {
    if (!user) return false;

    const monthYear = getCurrentMonthYear();
    
    // Try to update existing record
    const { data: existing } = await supabase
      .from("voice_usage")
      .select("id, usage_count")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("voice_usage")
        .update({ usage_count: existing.usage_count + 1 })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating voice usage:", error);
        return false;
      }
      setUsageCount(existing.usage_count + 1);
    } else {
      // Insert new record
      const { error } = await supabase
        .from("voice_usage")
        .insert({ user_id: user.id, month_year: monthYear, usage_count: 1 });

      if (error) {
        console.error("Error inserting voice usage:", error);
        return false;
      }
      setUsageCount(1);
    }
    
    return true;
  };

  const canUseVoice = usageCount < MONTHLY_LIMIT;
  const remainingUses = MONTHLY_LIMIT - usageCount;

  const startListening = useCallback(async () => {
    if (!canUseVoice) {
      toast.error(`You've reached your monthly limit of ${MONTHLY_LIMIT} voice inputs. Resets next month.`);
      return;
    }

    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast.error("Voice input is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Increment usage on successful transcription
        const success = await incrementUsage();
        
        if (success && transcript.trim()) {
          onTranscript(transcript);
          toast.success(`Voice input received! ${remainingUses - 1} uses remaining this month.`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please enable it in your browser settings.");
        } else if (event.error === "no-speech") {
          toast.error("No speech detected. Please try again.");
        } else if (event.error === "language-not-supported") {
          toast.error("This language is not supported on your device.");
        } else {
          toast.error("Voice input failed. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Error starting voice input:", error);
      toast.error("Could not access microphone. Please check your permissions.");
    }
  }, [canUseVoice, remainingUses, onTranscript, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isLoading,
    canUseVoice,
    usageCount,
    remainingUses,
    startListening,
    stopListening,
  };
}
