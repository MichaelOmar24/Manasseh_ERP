import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { rolePortal } from "@/lib/navigation";
import type { Role } from "@/lib/types";

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <Navigate
        to={`/login${location.search}`}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (!roles.includes(profile.role)) {
    return <Navigate to={rolePortal(profile.role)} replace />;
  }

  return <>{children}</>;
}
