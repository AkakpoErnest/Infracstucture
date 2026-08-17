"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DesignSummary {
  id: string;
  roomType: string;
  style: string;
  createdAt: string;
}

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/designs");
        if (!res.ok) {
          setError(
            res.status === 401
              ? "Please sign in to view your designs."
              : "Could not load your designs. Please try again."
          );
          return;
        }
        setDesigns(await res.json());
      } catch {
        setError("Could not load your designs. Please try again.");
      }
    })();
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/design/new" className="mt-4 inline-block text-sm underline">
          Start a new design
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My designs</h1>
        <Link href="/design/new">
          <Button>New design</Button>
        </Link>
      </div>

      {designs === null && <p className="text-sm text-muted-foreground">Loading...</p>}
      {designs?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No designs yet — upload a room photo to get started.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {designs?.map((d) => (
          <Link key={d.id} href={`/design/${d.id}`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <CardTitle>
                    {d.roomType} — {d.style}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
