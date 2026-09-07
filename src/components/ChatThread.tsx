import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Heart, Laugh, Mic, Paperclip, RefreshCw, Search, Square, ThumbsUp, X } from "lucide-react";
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
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
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
  banner_message?: string;
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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({});
  const [reactionMenu, setReactionMenu] = useState<string | null>(null);
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
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId !== currentUserId) setTyping(Boolean(payload?.isTyping));
      })
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        if (
          payload?.userId !== currentUserId &&
          localStorage.getItem(`notifications:${currentUserId}`) === "on" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("New reaction", { body: `${payload.reactionEmoji} reacted to a message` });
        }
      })
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

  useEffect(() => {
    void loadReactions();
  }, [messages.length]);

  useEffect(() => {
    if (!messages.some((message) => message.sender_id !== currentUserId && !message.read_at)) return;
    void supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("fan_id", fanId)
      .neq("sender_id", currentUserId)
      .is("read_at", null);
  }, [messages.length, fanId, currentUserId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body && !attachment) return;
    setSending(true);
    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;
    let attachmentName: string | null = null;
    if (attachment) {
      const path = `${fanId}/${crypto.randomUUID()}-${attachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(path, attachment, {
          contentType: attachment.type,
          upsert: false,
        });
      if (uploadError) {
        setSending(false);
        toast.error(uploadError.message);
        return;
      }
      attachmentUrl = path;
      attachmentType = attachment.type;
      attachmentName = attachment.name;
    }
    const { data, error } = await supabase
      .from("messages")
      .insert({
        fan_id: fanId,
        sender_id: currentUserId,
        body,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      })
      .select()
      .single();
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft("");
    setAttachment(null);
    setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]));
  }

  function updateDraft(value: string) {
    setDraft(value);
    const channel = supabase.channel(`messages-${fanId}`);
    void channel.send({ type: "broadcast", event: "typing", payload: { userId: currentUserId, isTyping: value.length > 0 } });
  }

  useEffect(() => {
    let active = true;
    const paths = messages
      .filter((message) => message.attachment_url)
      .map((message) => message.attachment_url as string);
    if (paths.length === 0) return;
    void Promise.all(
      paths.map(async (path) => {
        const { data } = await supabase.storage.from("chat-media").createSignedUrl(path, 3600);
        return [path, data?.signedUrl] as const;
      }),
    ).then((entries) => {
      if (!active) return;
      setMediaUrls((current) => ({
        ...current,
        ...Object.fromEntries(
          entries.filter((entry): entry is [string, string] => Boolean(entry[1])),
        ),
      }));
    });
    return () => {
      active = false;
    };
  }, [messages]);

  async function loadReactions() {
    const ids = messages.map((message) => message.id);
    if (!ids.length) return;
    const { data } = await supabase
      .from("message_reactions")
      .select("message_id, reaction")
      .in("message_id", ids);
    const next: Record<string, Record<string, number>> = {};
    for (const reaction of data ?? []) {
      next[reaction.message_id] ??= {};
      next[reaction.message_id][reaction.reaction] = (next[reaction.message_id][reaction.reaction] ?? 0) + 1;
    }
    setReactionCounts(next);
  }

  async function toggleReaction(messageId: string, reaction: "heart" | "like" | "laugh") {
    const { data: existing } = await supabase
      .from("message_reactions")
      .select("message_id")
      .eq("message_id", messageId)
      .eq("user_id", currentUserId)
      .eq("reaction", reaction)
      .maybeSingle();
    if (existing) {
      await supabase.from("message_reactions").delete().match({ message_id: messageId, user_id: currentUserId, reaction });
    } else {
      await supabase.from("message_reactions").insert({ message_id: messageId, user_id: currentUserId, reaction });
    }
    const reactionEmoji = reaction === "heart" ? "❤️" : reaction === "like" ? "👍" : "😂";
    void supabase.channel(`messages-${fanId}`).send({
      type: "broadcast",
      event: "reaction",
      payload: { userId: currentUserId, reactionEmoji },
    });
    void loadReactions();
  }

  function chooseAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Files must be smaller than 100 MB.");
      return;
    }
    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/") &&
      !file.type.startsWith("audio/")
    ) {
      toast.error("Only images, videos, and audio files are supported.");
      return;
    }
    setAttachment(file);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toast.error("Voice recording is not supported by this browser.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recordingChunks.current = [];
    recorder.ondataavailable = (event) => recordingChunks.current.push(event.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      setAttachment(
        new File(
          [new Blob(recordingChunks.current, { type: recorder.mimeType })],
          "voice-note.webm",
          { type: recorder.mimeType },
        ),
      );
      setRecording(false);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  return (
    <div className="flex min-h-[78vh] flex-col panel">
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
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs">
        <Search className="h-3 w-3 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chat" className="min-w-0 flex-1 bg-transparent outline-none" />
        {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X className="h-3 w-3" /></button>}
      </div>
      {fanId === currentUserId && ownerProfile?.banner_message && (
        <div className="overflow-hidden border-b border-primary/30 bg-primary/10 py-3 text-sm text-foreground">
          <div className="owner-banner-track flex min-w-max">
            <span className="px-8">{ownerProfile.banner_message}</span>
            <span aria-hidden="true" className="px-8">{ownerProfile.banner_message}</span>
          </div>
        </div>
      )}
      {typing && <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">Someone is typing…</div>}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{emptyHint}</p>
        ) : (
          messages.filter((message) => !search.trim() || message.body.toLowerCase().includes(search.trim().toLowerCase())).map((m) => {
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
                  {m.attachment_url && mediaUrls[m.attachment_url] && (
                    <div className="mt-2 max-w-full">
                      {m.attachment_type?.startsWith("image/") ? (
                        <img
                          src={mediaUrls[m.attachment_url]}
                          alt={m.attachment_name ?? "Shared image"}
                          className="max-h-72 max-w-full rounded-md object-contain"
                        />
                      ) : m.attachment_type?.startsWith("video/") ? (
                        <video
                          controls
                          className="max-h-72 max-w-full rounded-md"
                          src={mediaUrls[m.attachment_url]}
                        />
                      ) : (
                        <audio controls className="max-w-full" src={mediaUrls[m.attachment_url]} />
                      )}
                    </div>
                  )}
                  <div className="relative mt-2 flex gap-1">
                    <button type="button" onClick={() => setReactionMenu(reactionMenu === m.id ? null : m.id)} className="rounded-full px-1 text-sm opacity-80 hover:bg-background/20" title="Add reaction">😊</button>
                    {reactionMenu === m.id && (
                      <div className="absolute bottom-6 left-0 z-10 flex gap-1 rounded-full border border-border bg-background px-2 py-1 shadow-lg">
                        <button type="button" onClick={() => { void toggleReaction(m.id, "heart"); setReactionMenu(null); }} className="text-lg" title="Heart">❤️</button>
                        <button type="button" onClick={() => { void toggleReaction(m.id, "like"); setReactionMenu(null); }} className="text-lg" title="Like">👍</button>
                        <button type="button" onClick={() => { void toggleReaction(m.id, "laugh"); setReactionMenu(null); }} className="text-lg" title="Laugh">😂</button>
                      </div>
                    )}
                    {reactionCounts[m.id]?.heart ? <span className="text-xs">❤️ {reactionCounts[m.id].heart}</span> : null}
                    {reactionCounts[m.id]?.like ? <span className="text-xs">👍 {reactionCounts[m.id].like}</span> : null}
                    {reactionCounts[m.id]?.laugh ? <span className="text-xs">😂 {reactionCounts[m.id].laugh}</span> : null}
                  </div>
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
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          id={`media-${fanId}`}
          onChange={chooseAttachment}
        />
        <Button type="button" variant="ghost" size="icon" asChild title="Attach media">
          <label htmlFor={`media-${fanId}`}>
            <Paperclip className="h-4 w-4" />
          </label>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void toggleRecording()}
          title={recording ? "Stop recording" : "Record voice note"}
        >
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Textarea
          value={draft}
          onChange={(e) => updateDraft(e.target.value)}
          placeholder={attachment ? attachment.name : "Write a message…"}
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(e as unknown as React.FormEvent);
            }
          }}
        />
        {attachment && (
          <span className="max-w-32 truncate text-xs text-muted-foreground" title={attachment.name}>
            {attachment.name}
          </span>
        )}
        <Button type="submit" disabled={sending || (!draft.trim() && !attachment)}>
          Send
        </Button>
      </form>
    </div>
  );
}
