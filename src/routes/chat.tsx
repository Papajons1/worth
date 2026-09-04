import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatThread } from "@/components/ChatThread";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "My chat with Kane — Fan Club" },
      {
        name: "description",
        content: "Your private one-to-one message thread with actor Kane Westfall.",
      },
      { property: "og:title", content: "My chat with Kane" },
      {
        property: "og:description",
        content: "A private message thread between you and Kane Westfall.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", replace: true });
    else if (isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">
        Loading your chat…
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Your chat with Kane</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Messages here are private between you and the site owner. Replies arrive live.
      </p>
      <ChatThread
        fanId={user.id}
        currentUserId={user.id}
        emptyHint="Say hi — Kane reads every message from the fan club."
      />
    </main>
  );
}
