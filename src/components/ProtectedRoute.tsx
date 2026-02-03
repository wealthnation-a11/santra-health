import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if onboarding is required and not completed
  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
