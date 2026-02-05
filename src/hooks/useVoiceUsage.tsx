 import { useState, useCallback, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 
 const MONTHLY_LIMIT = 10;
 
 export function useVoiceUsage() {
   const [usageCount, setUsageCount] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
 
   const getCurrentMonthYear = () => {
     const now = new Date();
     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
   };
 
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
 
   const remainingUses = MONTHLY_LIMIT - usageCount;
 
   return {
     usageCount,
     remainingUses,
     isLoading,
     monthlyLimit: MONTHLY_LIMIT,
   };
 }