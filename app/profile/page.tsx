"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface DesignSummary {
  id: string;
  roomType: string;
  style: string;
  createdAt: string;
}

export default function ProfilePage() {
  // `required: true` makes next-auth redirect to the configured sign-in
  // page (pages.signIn = "/sign-in" in lib/auth.ts) when there's no
  // session, rather than rendering this page in a broken half-logged-out
  // state - this is the one route in the app that explicitly needs a
  // session to make sense at all.
  const { data: session } = useSession({ required: true });
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);
  const [designsError, setDesignsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/designs");
        if (!res.ok) {
          setDesignsError("Could not load your designs.");
          return;
        }
        setDesigns(await res.json());
      } catch {
        setDesignsError("Could not load your designs.");
      }
    })();
  }, []);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Account</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Design history</h2>
            <Link href="/design" className="text-sm underline">
              View all
            </Link>
          </div>
          {designsError && <p className="text-sm text-destructive">{designsError}</p>}
          {designs === null && !designsError && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {designs?.length === 0 && (
            <p className="text-sm text-muted-foreground">No designs yet.</p>
          )}
          <div className="flex flex-col gap-3">
            {designs?.slice(0, 3).map((d) => (
              <Link key={d.id} href={`/design/${d.id}`}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <CardTitle>
                        {d.roomType}, {d.style}
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
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Favorites</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Saved addresses</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Turnkey bookings</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Purchase history</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Coming soon — needs checkout/payments to exist first.
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
