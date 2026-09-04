import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthValue = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const roleRequestId = useRef(0);
  const sessionKey = useRef<string | null>(null);

  const loadRole = async (userId: string | undefined) => {
    const requestId = ++roleRequestId.current;
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      const roleRequest = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      const timeout = new Promise<never>((_, reject) =>
        window.setTimeout(() => reject(new Error("Role lookup timed out")), 8000),
      );
      const { data } = await Promise.race([roleRequest, timeout]);
      if (requestId !== roleRequestId.current) return;
      setIsAdmin(Boolean(data));
    } catch {
      if (requestId !== roleRequestId.current) return;
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let active = true;
    let subscription: { unsubscribe: () => void } | undefined;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      const nextKey = nextSession?.access_token ?? null;
      if (sessionKey.current === nextKey) return;
      sessionKey.current = nextKey;
      setSession(nextSession);
      setLoading(false);
      void loadRole(nextSession?.user?.id);
    };

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        applySession(data.session);
      } catch {
        if (!active) return;
        sessionKey.current = null;
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
      }

      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        applySession(nextSession);
      });
      subscription = data.subscription;
    })();

    return () => {
      active = false;
      subscription?.unsubscribe();
      roleRequestId.current += 1;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAdmin,
        loading,
        refreshRole: () => loadRole(session?.user?.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
