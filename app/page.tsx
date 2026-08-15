import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">Interior AI</h1>
      <p className="max-w-md text-muted-foreground">
        Upload a photo of your room and get AI-generated redesigns built
        entirely from real, purchasable products.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-border px-4 py-2"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
