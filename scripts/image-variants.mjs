/*
  Makes the resized copies of every photo in public/images, one per width in next.config.ts.
  They are served as plain files (src/lib/imageLoader.ts), so nothing is resized on the server
  while a visitor waits. Runs before dev and build; files that are up to date are skipped.
*/
import { mkdir, readdir, stat } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

// Hostinger caps threads across the plan, so the build resizes on one.
sharp.concurrency(1)

const ROOT = 'public/images'
const OUT = path.join(ROOT, '_w')
export const WIDTHS = [128, 256, 384, 640, 828, 1200, 1600]

async function photos(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const found = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return full === OUT ? [] : photos(full)
      return entry.name.endsWith('.webp') ? [full] : []
    }),
  )
  return found.flat()
}

const modified = (file) =>
  stat(file).then(
    (s) => s.mtimeMs,
    () => 0,
  )

let made = 0
for (const source of await photos(ROOT)) {
  const name = path.relative(ROOT, source).replace(/\.webp$/, '')
  const sourceTime = await modified(source)
  for (const width of WIDTHS) {
    const target = path.join(OUT, `${name}-${width}.webp`)
    if ((await modified(target)) > sourceTime) continue
    await mkdir(path.dirname(target), { recursive: true })
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 })
      .toFile(target)
    made++
  }
}
console.log(`Image variants: ${made} made.`)
