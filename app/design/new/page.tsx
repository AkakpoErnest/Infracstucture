"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomUpload } from "@/components/design/room-upload";
import { DesignRequestForm } from "@/components/design/design-request-form";
import type { DesignRequestInput } from "@/types/design";

export default function NewDesignPage() {
  const router = useRouter();
  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: DesignRequestInput) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Could not generate designs");
        return;
      }

      const data = await res.json();
      router.push(`/design/${data.designId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Design your room</h1>
      {!roomPhotoUrl ? (
        <RoomUpload onUploaded={setRoomPhotoUrl} />
      ) : (
        <DesignRequestForm roomPhotoUrl={roomPhotoUrl} onSubmit={handleSubmit} submitting={submitting} />
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </main>
  );
}
