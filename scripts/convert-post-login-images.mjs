// scripts/convert-post-login-images.mjs
import sharp from "sharp";
import path from "path";

// One-off script: converts 4 of the unused repo-root PNGs (2-8MB each) into
// compressed webp for the post-login welcome screen's rotating visual panel.
// Source files stay untouched at the repo root (out of scope to clean those
// up here) - this only produces the public/ copies actually served.
const conversions = [
  {
    src: "16_3d_isometric_cozy_living_room.png",
    out: "public/images/post-login/3d-isometric-living-room.webp",
  },
  {
    src: "03_before_after_japandi_room.png",
    out: "public/images/post-login/japandi-before-after.webp",
  },
  {
    src: "07_style_luxury_living_room.png",
    out: "public/images/post-login/luxury-living-room.webp",
  },
  {
    src: "10_style_bohemian_living_room.png",
    out: "public/images/post-login/bohemian-living-room.webp",
  },
];

for (const { src, out } of conversions) {
  await sharp(path.resolve(src))
    .resize({ width: 1200 })
    .webp({ quality: 80 })
    .toFile(path.resolve(out));
  console.log(`converted ${src} -> ${out}`);
}
