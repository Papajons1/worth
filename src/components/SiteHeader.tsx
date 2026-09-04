import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<{
    display_name: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const loadProfile = () => {
      void supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    };
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl tracking-widest">
          <span className="text-gold">CH</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={isAdmin ? "/admin" : "/chat"}>{isAdmin ? "Owner inbox" : "My chat"}</Link>
              </Button>
              <Link
                to="/settings"
                aria-label="Open account settings"
                title="Account settings"
                className="flex items-center gap-2 rounded-md pl-1 text-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs">
                    {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-32 truncate sm:inline">
                  {profile?.display_name || user.email}
                </span>
              </Link>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
