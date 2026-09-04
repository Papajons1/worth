import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  fan_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Props = {
  fanId: string;
  currentUserId: string;
  emptyHint: string;
  fanProfile?: Profile | null;
  showRefresh?: boolean;
};

type Profile = {
  id?: string;
  display_name: string;
  avatar_url: string | null;
};

export function ChatThread({
  fanId,
  currentUserId,
  emptyHint,
  fanProfile,
  showRefresh = true,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refreshMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("fan_id", fanId)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else setMessages((data ?? []) as Message[]);
  }

  useEffect(() => {
    let active = true;
    setMessages([]);

    const loadMessages = refreshMessages();

    const channel = supabase.channel(`messages-${fanId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `fan_id=eq.${fanId}`,
        },
        (payload) => {
          if (!active) return;
          const next = payload.new as Message;
          if (
            next.sender_id !== currentUserId &&
            localStorage.getItem(`notifications:${currentUserId}`) === "on" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New message", { body: next.body });
          }
          setMessages((prev) =>
            prev.some((message) => message.id === next.id) ? prev : [...prev, next],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      void loadMessages.catch(() => undefined);
      supabase.removeChannel(channel);
    };
  }, [fanId, currentUserId]);

  useEffect(() => {
    if (fanId !== currentUserId) return;
    let active = true;
    void supabase.rpc("get_owner_profile").then(({ data, error }) => {
      if (!active) return;
      if (error) {
        toast.error(error.message);
        return;
      }
      setOwnerProfile(data?.[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [fanId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ fan_id: fanId, sender_id: currentUserId, body })
      .select()
      .single();
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft("");
    setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]));
  }

  return (
    <div className="flex h-[70vh] flex-col panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-medium">Messages</span>
        {showRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => window.location.reload()}
            aria-label="Refresh chat page"
            title="Refresh chat page"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{emptyHint}</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}
              >
                {!mine &&
                  ((fanId === currentUserId ? ownerProfile : fanProfile)?.avatar_url ? (
                    <img
                      src={(fanId === currentUserId ? ownerProfile : fanProfile)?.avatar_url ?? ""}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs">
                      {(
                        (fanId === currentUserId
                          ? ownerProfile?.display_name
                          : fanProfile?.display_name) || (fanId === currentUserId ? "O" : "F")
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  ))}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2 text-sm",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <span className="mt-1 block text-[10px] opacity-70">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
