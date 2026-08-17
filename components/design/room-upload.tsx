"use client";
import { useState } from "react";

export function RoomUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      return;
    }

    const data = await res.json();
    onUploaded(data.url);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Room preview"
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <span>Click to upload a photo of your room (JPG, PNG, WEBP — max 10MB)</span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
