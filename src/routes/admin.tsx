import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatThread } from "@/components/ChatThread";
import { RefreshCw, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner inbox — Chris Hemsworth Fanbase" },
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
  created_at?: string;
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
  const [fanSearch, setFanSearch] = useState("");
  const [banner, setBanner] = useState("");
  const [unreadFans, setUnreadFans] = useState<string[]>([]);
  const [newFans, setNewFans] = useState<string[]>([]);

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
            .select("id, display_name, email, avatar_url, created_at")
            .order("created_at", { ascending: true }),
          supabase
            .from("messages")
            .select("fan_id, sender_id, created_at")
            .order("created_at", { ascending: false }),
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
      const nextUnread: string[] = [];
      for (const message of messages ?? []) {
        const seenAt = Number(localStorage.getItem(`owner-message-seen:${message.fan_id}`) ?? 0);
        if (message.sender_id !== user?.id && new Date(message.created_at).getTime() > seenAt) {
          nextUnread.push(message.fan_id);
        }
        if (!byId.has(message.fan_id) && message.fan_id !== user?.id) {
          byId.set(message.fan_id, {
            id: message.fan_id,
            display_name: "Fan",
            email: null,
            avatar_url: null,
          });
        }
      }
      setUnreadFans([...new Set(nextUnread)]);
      setNewFans(
        (profiles ?? [])
          .filter((profile) => !localStorage.getItem(`owner-fan-seen:${profile.id}`))
          .map((profile) => profile.id),
      );
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

  useEffect(() => {
    if (!isAdmin) return;
    void supabase.from("owner_banner").select("message").eq("id", true).maybeSingle().then(({ data }) => {
      if (data?.message) setBanner(data.message);
    });
  }, [isAdmin]);

  async function claimOwner() {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_owner_role", { p_claim_code: claimCode });
    setClaiming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("Administrator access granted.");
      await refreshRole();
    } else {
      toast.error("An owner already exists for this site.");
      setOwnerExists(true);
    }
  }

  async function clearMessages() {
    if (!selected || !window.confirm("Clear every message in this fan conversation?")) return;
    const { error } = await supabase.rpc("clear_fan_messages", { p_fan_id: selected });
    if (error) toast.error(error.message);
    else toast.success("Conversation cleared.");
  }

  async function removeFan() {
    if (!selected || !window.confirm("Remove this fan and delete their account, profile, and messages?")) return;
    const { error } = await supabase.rpc("remove_fan", { p_fan_id: selected });
    if (error) {
      toast.error(error.message);
      return;
    }
    setFans((current) => current.filter((fan) => fan.id !== selected));
    setSelected(null);
    toast.success("Fan removed.");
  }

  async function saveBanner(event: React.FormEvent) {
    event.preventDefault();
    const { error } = await supabase.rpc("set_owner_banner", { p_message: banner });
    if (error) toast.error(error.message);
    else toast.success("Profile banner updated.");
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
                Claim administrator access
              </Button>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              This area is reserved for the account administrator. Head to your fan chat instead.
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

      <form onSubmit={saveBanner} className="panel mb-4 flex gap-2 p-3">
        <Input value={banner} onChange={(event) => setBanner(event.target.value)} placeholder="Message shown on the fan chat page" maxLength={500} />
        <Button type="submit">Post banner</Button>
      </form>

      <div className="space-y-4">
        <aside className="panel overflow-x-auto p-2">
          <div className="mb-2 flex items-center justify-between gap-2 px-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Fans
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFanSearch((value) => (value ? "" : " "))}
            >
              Add Fans
            </Button>
          </div>
          {fanSearch !== "" && (
            <Input
              value={fanSearch.trim()}
              onChange={(event) => setFanSearch(event.target.value)}
              placeholder="Search name or email"
              className="mb-2"
              autoFocus
            />
          )}
          <div className="flex min-w-max gap-2">
            {fans.filter((fan) => {
              const query = fanSearch.trim().toLowerCase();
              return (
                !query ||
                fan.display_name.toLowerCase().includes(query) ||
                fan.email?.toLowerCase().includes(query)
              );
            }).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No fans have signed up yet.</p>
            ) : (
              fans
                .filter((fan) => {
                  const query = fanSearch.trim().toLowerCase();
                  return (
                    !query ||
                    fan.display_name.toLowerCase().includes(query) ||
                    fan.email?.toLowerCase().includes(query)
                  );
                })
                .map((fan) => (
                  <button
                    key={fan.id}
                    onClick={() => {
                      setSelected(fan.id);
                      localStorage.setItem(`owner-fan-seen:${fan.id}`, String(Date.now()));
                    }}
                    className={cn(
                      "relative min-w-32 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selected === fan.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary",
                    )}
                  >
                    {(unreadFans.includes(fan.id) || newFans.includes(fan.id)) && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-400" aria-label="New activity" />}
                    <Link to="/fans/$id" params={{ id: fan.id }} aria-label={`View ${fan.display_name} profile`} onClick={(event) => event.stopPropagation()}>
                      {fan.avatar_url ? (
                        <img src={fan.avatar_url} alt="" className="mr-2 inline-block h-8 w-8 rounded-full object-cover align-middle" />
                      ) : (
                        <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary align-middle text-xs">
                          {fan.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </Link>
                    <span className="block font-medium">{fan.display_name}</span>
                  </button>
                ))
            )}
          </div>
        </aside>

        {selected ? (
          <div>
            <div className="mb-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => void clearMessages()}>
                Clear messages
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void removeFan()}>
                Remove fan
              </Button>
            </div>
            <ChatThread
              fanId={selected}
              currentUserId={user.id}
              fanProfile={fans.find((fan) => fan.id === selected) ?? null}
              showRefresh={false}
              emptyHint="No messages in this thread yet."
            />
          </div>
        ) : (
          <div className="panel flex min-h-[78vh] items-center justify-center text-sm text-muted-foreground">
            Select a fan conversation.
          </div>
        )}
      </div>
    </main>
  );
}
