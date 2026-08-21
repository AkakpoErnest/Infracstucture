"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export function FeatureCard({
  iconSrc,
  title,
  description,
  delay = 0,
}: {
  iconSrc: string;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col gap-3 rounded-lg border border-border p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center">
        <Image src={iconSrc} alt="" width={40} height={40} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
