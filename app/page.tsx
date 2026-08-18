"use client";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { Upload, Sparkles, ShoppingBag, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/landing/feature-card";

const FEATURES = [
  {
    icon: Upload,
    title: "Upload your room",
    description:
      "Snap a photo of any room — living room, bedroom, kitchen, or office.",
  },
  {
    icon: Sparkles,
    title: "Get 4 AI redesigns",
    description:
      "Pick a style and budget; our AI generates four distinct, photorealistic redesigns.",
  },
  {
    icon: ShoppingBag,
    title: "Shop every product",
    description:
      "Every item in the design is real and clickable — see the price, brand, and details.",
  },
  {
    icon: Wrench,
    title: "Have us install it",
    description:
      "Buy the products yourself, or let our team handle the entire project.",
  },
];

const STEPS = [
  { number: "01", title: "Upload a photo", description: "Any room, any angle." },
  { number: "02", title: "Set your style & budget", description: "Scandinavian, Japandi, Luxury, and more." },
  { number: "03", title: "Review 4 designs", description: "Each one built entirely from our catalog." },
  { number: "04", title: "Buy or book install", description: "Purchase products, or go fully turnkey." },
];

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-screen flex-col">
        <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <span className="text-lg font-bold">Interior AI</span>
            <div className="flex gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="blob-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="blob-float-delayed absolute -right-24 top-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 pt-20 text-center sm:pt-28">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Redesign your room with AI —
              <br />
              shop every product in it.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md text-muted-foreground"
            >
              Upload a photo of your room and get AI-generated redesigns built
              entirely from real, purchasable products — no generic internet
              furniture, ever.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4"
            >
              <Link href="/sign-up">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl p-8 py-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-5xl p-8 py-16">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center text-2xl font-bold"
            >
              How it works
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.number}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col gap-2"
                >
                  <span className="text-sm font-mono text-primary/60">{s.number}</span>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl p-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="text-2xl font-bold">Ready to see your room reimagined?</h2>
            <p className="max-w-sm text-muted-foreground">
              It&apos;s free to try — sign up and upload your first room in
              under a minute.
            </p>
            <Link href="/sign-up">
              <Button size="lg">Get started free</Button>
            </Link>
          </motion.div>
        </section>

        <footer className="border-t border-border p-8 text-center text-sm text-muted-foreground">
          Interior AI — AI-powered interior design & shopping platform.
        </footer>
      </main>
    </MotionConfig>
  );
}
