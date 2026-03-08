import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  total_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  total_conversations: number;
  library_conversations: number;
  general_conversations: number;
  total_messages: number;
  messages_today: number;
  total_subscriptions: number;
  chat_premium: number;
  edu_starter: number;
  edu_pro: number;
  voice_usage_this_month: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_stats");
      if (error) throw error;
      return data as unknown as AdminStats;
    },
  });
}

export function useAdminUsers(page: number, search: string) {
  return useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users", {
        _limit: 20,
        _offset: page * 20,
        _search: search,
      });
      if (error) throw error;
      return data as unknown as {
        users: Array<{
          id: string;
          full_name: string | null;
          country: string | null;
          state: string | null;
          gender: string | null;
          created_at: string;
          onboarding_completed: boolean;
          preferred_language: string | null;
          date_of_birth: string | null;
          phone: string | null;
          subscriptions: Array<{ plan_type: string; plan: string; status: string }> | null;
        }>;
        total: number;
      };
    },
  });
}

export function useAdminSubscriptions(page: number, planType: string, plan: string) {
  return useQuery({
    queryKey: ["admin-subscriptions", page, planType, plan],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_subscriptions", {
        _limit: 20,
        _offset: page * 20,
        _plan_type: planType,
        _plan: plan,
      });
      if (error) throw error;
      return data as unknown as {
        subscriptions: Array<{
          id: string;
          user_id: string;
          plan_type: string;
          plan: string;
          status: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          country: string | null;
        }>;
        total: number;
      };
    },
  });
}

export function useAdminConversations(page: number) {
  return useQuery({
    queryKey: ["admin-conversations", page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_conversations", {
        _limit: 20,
        _offset: page * 20,
      });
      if (error) throw error;
      return data as unknown as {
        conversations: Array<{
          id: string;
          title: string;
          library_id: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          full_name: string | null;
          message_count: number;
        }>;
        total: number;
      };
    },
  });
}

export function useAdminDailyMessages(days = 30) {
  return useQuery({
    queryKey: ["admin-daily-messages", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_daily_messages", { _days: days });
      if (error) throw error;
      return data as unknown as Array<{ date: string; count: number }>;
    },
  });
}

export function useAdminDailySignups(days = 30) {
  return useQuery({
    queryKey: ["admin-daily-signups", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_daily_signups", { _days: days });
      if (error) throw error;
      return data as unknown as Array<{ date: string; count: number }>;
    },
  });
}

export function useAdminTopCountries() {
  return useQuery({
    queryKey: ["admin-top-countries"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_top_countries", { _limit: 10 });
      if (error) throw error;
      return data as unknown as Array<{ country: string; count: number }>;
    },
  });
}
