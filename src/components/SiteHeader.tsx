import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<{
    display_name: string;
    avatar_url: string | null;
  } | null>(null);
  const [activity, setActivity] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);

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

  useEffect(() => {
    if (!user) {
      setActivity(false);
      return;
    }
    const checkActivity = async () => {
      const [{ data: messages }, { data: reactions }, { data: profiles }] = await Promise.all([
        supabase.from("messages").select("fan_id, sender_id, read_at"),
        supabase.from("message_reactions").select("message_id, user_id"),
        isAdmin ? supabase.from("profiles").select("id") : Promise.resolve({ data: null }),
      ]);
      const unreadMessage = (messages ?? []).some((message) =>
        message.sender_id !== user.id && !message.read_at && (isAdmin || message.fan_id === user.id),
      );
      const newReaction = (reactions ?? []).some((reaction) => reaction.user_id !== user.id);
      const newFan = isAdmin && (profiles ?? []).some((profile) => !localStorage.getItem(`owner-fan-seen:${profile.id}`));
      setActivity(unreadMessage || newReaction || Boolean(newFan));
    };
    void checkActivity();
    const channel = supabase
      .channel(`navbar-activity-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => void checkActivity())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => void checkActivity())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_reactions" }, () => void checkActivity())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => void checkActivity())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass-nav">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="block" aria-label="Chris Hemsworth fanbase home">
          <span
            aria-hidden="true"
            className="block h-9 w-24 bg-primary"
            style={{
              maskImage:
                "url(https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chris_Hemsworth_Signature.svg/250px-Chris_Hemsworth_Signature.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)",
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskImage:
                "url(https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chris_Hemsworth_Signature.svg/250px-Chris_Hemsworth_Signature.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
            }}
          />
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={isAdmin ? "/admin" : "/chat"} className="relative">
                  {isAdmin ? "Owner inbox" : "My chat"}
                  {activity && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-yellow-400" aria-label="New activity" />}
                </Link>
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
                    className={cn("h-8 w-8 rounded-full object-cover ring-2", online ? "ring-emerald-400" : "ring-muted")}
                  />
                ) : (
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs ring-2", online ? "ring-emerald-400" : "ring-muted")}>
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
