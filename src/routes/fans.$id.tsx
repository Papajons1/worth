import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fans/$id")({ component: FanProfilePage });

function FanProfilePage() {
  const { id } = Route.useParams();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string; email: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void supabase.from("profiles").select("display_name, email, avatar_url").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setProfile(data);
    });
  }, [id, isAdmin]);

  if (loading || !user || !isAdmin) return <main className="mx-auto max-w-3xl px-4 py-16">Loading…</main>;
  if (!profile) return <main className="mx-auto max-w-3xl px-4 py-16">Fan profile not found.</main>;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to inbox</Link>
      </Button>
      <section className="panel p-6 text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="mx-auto h-28 w-28 rounded-full object-cover" />
        ) : (
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-secondary text-3xl">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="mt-5 text-3xl">{profile.display_name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{profile.email ?? "No email available"}</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/admin" })}>Open conversation</Button>
      </section>
    </main>
  );
}
