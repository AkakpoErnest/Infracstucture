export function AiUnavailableBanner() {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      AI generation is currently unavailable (no Gemini API key configured). You can still
      browse the catalog and manage your account; design generation will work once a key is added.
    </div>
  );
}
