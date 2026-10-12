// Copies images that live next to each article (content/posts/<slug>/*, content/case-studies/<slug>/*)
// into public/<section>/<slug>/, so the static export serves them beside the page.
import fs from "node:fs";
import path from "node:path";

const assets = /\.(webp|avif|png|jpe?g|gif|svg)$/i;
let copied = 0;

for (const section of ["posts", "case-studies"]) {
  const src = path.join(process.cwd(), "content", section);
  const dest = path.join(process.cwd(), "public", section);
  fs.rmSync(dest, { recursive: true, force: true });
  for (const slug of fs.existsSync(src) ? fs.readdirSync(src) : []) {
    const dir = path.join(src, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir).filter((f) => assets.test(f))) {
      fs.mkdirSync(path.join(dest, slug), { recursive: true });
      fs.copyFileSync(path.join(dir, file), path.join(dest, slug, file));
      copied++;
    }
  }
}
console.log(`content assets: ${copied} file(s) copied to public/`);
