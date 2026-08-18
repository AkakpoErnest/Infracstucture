"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const STYLE_IMAGES = [
  "/images/styles/scandinavian.webp",
  "/images/styles/japandi.webp",
  "/images/styles/luxury.webp",
  "/images/styles/industrial.webp",
  "/images/styles/mediterranean.webp",
  "/images/styles/bohemian.webp",
  "/images/styles/rustic.webp",
  "/images/styles/minimalist.webp",
];

export function StyleGallery({ names }: { names: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {names.map((name, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="group relative aspect-[3/4] overflow-hidden rounded-lg"
        >
          <Image
            src={STYLE_IMAGES[i]}
            alt={name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
            {name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
