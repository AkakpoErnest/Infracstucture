// scripts/convert-auth-images.mjs
import sharp from "sharp";
import path from "path";

// One-off script (same pattern as scripts/convert-post-login-images.mjs):
// converts 5 of the unused repo-root PNGs into compressed webp for the
// sign-in/sign-up visual panel. Source files stay untouched at the repo
// root - this only produces the public/ copies actually served.
const conversions = [
  {
    src: "02_hero_modern_living_golden_hour.png",
    out: "public/images/auth/hero-golden-hour.webp",
  },
  {
    src: "05_style_scandinavian_bedroom.png",
    out: "public/images/auth/style-scandinavian-bedroom.webp",
  },
  {
    src: "08_style_industrial_loft.png",
    out: "public/images/auth/style-industrial-loft.webp",
  },
  {
    src: "21_archviz_openplan_living_room.png",
    out: "public/images/auth/archviz-openplan-living-room.webp",
  },
  {
    src: "26_abstract_fluid_violet_indigo.png",
    out: "public/images/auth/abstract-fluid-violet-indigo.webp",
  },
];

for (const { src, out } of conversions) {
  await sharp(path.resolve(src))
    .resize({ width: 1200 })
    .webp({ quality: 80 })
    .toFile(path.resolve(out));
  console.log(`converted ${src} -> ${out}`);
}
