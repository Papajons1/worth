import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatThread } from "@/components/ChatThread";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner inbox — Kane Westfall Fan Club" },
      {
        name: "description",
        content: "Private owner dashboard for reading and replying to fan messages.",
      },
      { property: "og:title", content: "Owner inbox" },
      {
        property: "og:description",
        content: "Read and reply to every fan conversation in one place.",
      },
    ],
  }),
  component: AdminPage,
});

type FanProfile = {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
};

function AdminPage() {
  const { user, isAdmin, loading, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [fans, setFans] = useState<FanProfile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || isAdmin) return;
    supabase.rpc("owner_exists").then(({ data }) => setOwnerExists(Boolean(data)));
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadFans = async () => {
      const [{ data: profiles, error: profilesError }, { data: messages, error: messagesError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name, email, avatar_url")
            .order("created_at", { ascending: true }),
          supabase.from("messages").select("fan_id").order("created_at", { ascending: false }),
        ]);
      if (profilesError) {
        toast.error(profilesError.message);
        return;
      }
      if (messagesError) {
        toast.error(messagesError.message);
        return;
      }

      const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile as FanProfile]));
      for (const message of messages ?? []) {
        if (!byId.has(message.fan_id) && message.fan_id !== user?.id) {
          byId.set(message.fan_id, {
            id: message.fan_id,
            display_name: "Fan",
            email: null,
            avatar_url: null,
          });
        }
      }
      const list = [...byId.values()].filter((profile) => profile.id !== user?.id);
      setFans(list);
      setSelected((current) => current ?? list[0]?.id ?? null);
    };

    const refreshFans = async () => {
      setRefreshing(true);
      await loadFans();
      setRefreshing(false);
    };

    void refreshFans();
    const refreshTimer = window.setInterval(() => void loadFans(), 5000);
    const channel = supabase
      .channel("owner-inbox-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        void loadFans();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        void loadFans();
      })
      .subscribe();

    return () => {
      window.clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, user?.id]);

  async function claimOwner() {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_owner_role", { p_claim_code: claimCode });
    setClaiming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("You are now the site owner.");
      await refreshRole();
    } else {
      toast.error("An owner already exists for this site.");
      setOwnerExists(true);
    }
  }

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading…</main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <div className="panel p-6 text-center">
          <h1 className="text-2xl">Owner access</h1>
          {ownerExists === false ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                No owner has been set for this site yet. Claim it with this account — this can only
                be done once.
              </p>
              <div className="mt-5 space-y-2 text-left">
                <Label htmlFor="owner-claim-code">Owner claim code</Label>
                <Input
                  id="owner-claim-code"
                  type="password"
                  value={claimCode}
                  onChange={(event) => setClaimCode(event.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <Button
                className="mt-4 w-full"
                onClick={claimOwner}
                disabled={claiming || !claimCode}
              >
                Claim owner role
              </Button>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              This area is reserved for the site owner. Head to your fan chat instead.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Owner inbox</h1>
      <div className="mb-6 mt-2 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Pick a fan to read their thread and reply. New messages appear live.
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.location.reload()}
          disabled={refreshing}
          aria-label="Refresh owner inbox"
          title="Refresh owner inbox"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="panel h-[70vh] overflow-y-auto p-2">
          {fans.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No fans have signed up yet.</p>
          ) : (
            fans.map((fan) => (
              <button
                key={fan.id}
                onClick={() => setSelected(fan.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selected === fan.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                {fan.avatar_url ? (
                  <img
                    src={fan.avatar_url}
                    alt=""
                    className="mr-2 inline-block h-8 w-8 rounded-full object-cover align-middle"
                  />
                ) : (
                  <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary align-middle text-xs">
                    {fan.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="block font-medium">{fan.display_name}</span>
                <span className="block truncate text-xs opacity-70">{fan.email}</span>
              </button>
            ))
          )}
        </aside>

        {selected ? (
          <ChatThread
            fanId={selected}
            currentUserId={user.id}
            fanProfile={fans.find((fan) => fan.id === selected) ?? null}
            showRefresh={false}
            emptyHint="No messages in this thread yet."
          />
        ) : (
          <div className="panel flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
            Select a fan conversation.
          </div>
        )}
      </div>
    </main>
  );
}
