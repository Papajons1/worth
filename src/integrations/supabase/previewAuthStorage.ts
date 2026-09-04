// Auth storage for Supabase. Uses localStorage for session persistence.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
