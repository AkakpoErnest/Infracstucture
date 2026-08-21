"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import {
  ShoppingBag,
  Eye,
  PiggyBank,
  ShieldCheck,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/landing/feature-card";
import { HeroSceneLoader } from "@/components/landing/hero-scene-loader";
import { LanguageSwitcher } from "@/components/landing/language-switcher";
import { StyleGallery } from "@/components/landing/style-gallery";
import { useLanguage } from "@/components/providers/language-provider";

const BENEFIT_ICONS = [Eye, ShoppingBag, PiggyBank, ShieldCheck];
const STEP_NUMBERS = ["01", "02", "03", "04"];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-screen flex-col">
        <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <span className="text-lg font-bold">Afuna AI</span>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">{t.nav.signUp}</Button>
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-20">
            <Image
              src="/images/hero/scandinavian-living-room.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="blob-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="blob-float-delayed absolute -right-24 top-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-4 p-8 pt-16 sm:grid-cols-2 sm:pt-24">
            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
              <motion.span
                key={t.hero.tagline}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {t.hero.tagline}
              </motion.span>
              <motion.h1
                key={t.hero.titleLine1}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {t.hero.titleLine1}
                <br />
                {t.hero.titleLine2}
              </motion.h1>
              <motion.p
                key={t.hero.subtitle}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="max-w-md text-muted-foreground"
              >
                {t.hero.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex gap-4"
              >
                <Link href="/sign-up">
                  <Button size="lg">{t.hero.getStarted}</Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg">
                    {t.hero.signIn}
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="h-64 w-full sm:h-80"
              aria-hidden
            >
              <HeroSceneLoader />
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border p-8 py-16">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h2 className="text-2xl font-bold">{t.beforeAfter.heading}</h2>
              <p className="mt-2 text-muted-foreground">{t.beforeAfter.subtitle}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video overflow-hidden rounded-xl"
            >
              <Image
                src="/images/before-after/japandi-room.webp"
                alt="Empty room transformed into a fully styled Japandi living room"
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border p-8 py-16">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h2 className="text-2xl font-bold">{t.benefits.heading}</h2>
              <p className="mt-2 text-muted-foreground">{t.benefits.subtitle}</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.benefits.items.map((b, i) => (
                <FeatureCard
                  key={b.title}
                  icon={BENEFIT_ICONS[i]}
                  title={b.title}
                  description={b.description}
                  delay={i * 0.08}
                />
              ))}
            </div>
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
              {t.howItWorks.heading}
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {t.howItWorks.steps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col gap-2"
                >
                  <span className="text-sm font-mono text-primary/60">{STEP_NUMBERS[i]}</span>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border p-8 py-16">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h2 className="text-2xl font-bold">{t.styles.heading}</h2>
              <p className="mt-2 text-muted-foreground">{t.styles.subtitle}</p>
            </motion.div>
            <StyleGallery names={t.styles.names} />
          </div>
        </section>

        <section className="border-t border-border bg-muted/40 p-8 py-16">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h2 className="text-2xl font-bold">{t.different.heading}</h2>
              <p className="mt-2 text-muted-foreground">{t.different.subtitle}</p>
            </motion.div>
            <div className="flex flex-col gap-4">
              {t.different.comparisons.map((c, i) => (
                <motion.div
                  key={c.new}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2"
                >
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/70" />
                    <span>{c.old}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{c.new}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border p-8 py-16">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mb-10 text-center"
            >
              <h2 className="text-2xl font-bold">{t.team.heading}</h2>
              <p className="mt-2 text-muted-foreground">{t.team.subtitle}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-border shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                <Image
                  src="/images/team/founders.webp"
                  alt="The Afuna AI team"
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover object-top grayscale transition-all duration-500 hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </motion.div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {t.team.members.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                  className="rounded-lg border border-border p-4 text-center"
                >
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border">
          <div aria-hidden className="absolute inset-0 -z-10">
            <Image
              src="/images/abstract/violet-fluid.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-background/90" />
          </div>
          <div className="mx-auto w-full max-w-3xl p-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="text-2xl font-bold">{t.cta.heading}</h2>
              <p className="max-w-sm text-muted-foreground">{t.cta.subtitle}</p>
              <Link href="/sign-up">
                <Button size="lg">{t.cta.button}</Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-border p-8 text-center text-sm text-muted-foreground">
          {t.footer}
        </footer>
      </main>
    </MotionConfig>
  );
}
