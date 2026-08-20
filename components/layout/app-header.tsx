"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Minimal shared header for the logged-in pages (/design/new, /design/[id],
 * /design, /profile). The marketing homepage (app/page.tsx) has its own
 * separate nav and does not use this - this header is specifically for
 * pages that assume a signed-in user.
 */
export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">
          Afuna AI
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/design" className="text-sm text-muted-foreground hover:text-foreground">
            My Designs
          </Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Profile
          </Link>
          {session && (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
