import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    setNotifications(localStorage.getItem(`notifications:${user.id}`) !== "off");
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name);
          setAvatarUrl(data.avatar_url);
        }
      });
  }, [user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let savedAvatarUrl = avatarUrl;
      if (avatarFile) {
        const path = `${user.id}/avatar`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadError) {
          throw new Error(
            uploadError.message === "Bucket not found"
              ? "The avatars bucket is not set up yet. Run the avatar migration in Supabase."
              : uploadError.message,
          );
        }
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        savedAvatarUrl = `${data.publicUrl}?v=${Date.now()}`;
      }
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName.trim() || "Fan",
        email: user.email ?? null,
        avatar_url: savedAvatarUrl,
      });
      if (error) throw error;
      if (email.trim() && email.trim() !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
        if (emailError) throw emailError;
        toast.success("Profile updated. Check your email to confirm the new address.");
      } else {
        toast.success("Profile updated.");
      }
      localStorage.setItem(`notifications:${user.id}`, notifications ? "on" : "off");
      if (notifications && "Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      setAvatarUrl(savedAvatarUrl);
      setAvatarFile(null);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  if (loading || !user) return <main className="mx-auto max-w-3xl px-4 py-16">Loading…</main>;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="panel p-6">
        <h1 className="text-3xl">Account settings</h1>
        <label
          htmlFor="avatar"
          className="mt-5 flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            "Add picture"
          )}
        </label>
        <form className="mt-6 space-y-4" onSubmit={saveProfile}>
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-email">Email address</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <Label htmlFor="notifications">Message notifications</Label>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={selectAvatar}
            className="sr-only"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          Sign out
        </Button>
      </div>
    </main>
  );
}
