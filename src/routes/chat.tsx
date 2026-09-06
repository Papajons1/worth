import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatThread } from "@/components/ChatThread";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "My chat — Chris Hemsworth Fanbase" },
      {
        name: "description",
        content: "Your private one-to-one message thread in the Chris Hemsworth fanbase.",
      },
      { property: "og:title", content: "My chat — Chris Hemsworth Fanbase" },
      {
        property: "og:description",
        content: "A private message thread in the Chris Hemsworth fanbase.",
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
      <h1 className="text-3xl">Your chat</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        Messages here are private between you and Chris. Replies arrive live.
      </p>
      <ChatThread
        fanId={user.id}
        currentUserId={user.id}
        emptyHint="Say hi — every message is read by the fanbase administrator."
      />
    </main>
  );
}
