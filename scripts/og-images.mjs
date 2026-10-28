/**
 * Builds the social share images in public/og (1200 x 630, charcoal, brand logos as supplied).
 * The shared image has no logo, because the two logos never appear together (brand rule).
 *
 *   node scripts/og-images.mjs
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'public/og')
const brand = path.join(root, 'public/brand')
const W = 1200
const H = 630
const CHARCOAL = '#0d0d0d'
const GOLD = '#c9a96e'

const canvas = () =>
  sharp({ create: { width: W, height: H, channels: 4, background: CHARCOAL } }).png()

// A thin gold frame, as on the brand's printed material.
const frame = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/></svg>`,
)

async function centred(file, width) {
  const logo = await sharp(file, { density: 300 }).resize({ width }).png().toBuffer()
  const { height } = await sharp(logo).metadata()
  return { input: logo, left: Math.round((W - width) / 2), top: Math.round((H - height) / 2) }
}

await mkdir(out, { recursive: true })

await canvas()
  .composite([{ input: frame }, await centred(path.join(brand, 'fma/horizontal-gold.svg'), 820)])
  .toFile(path.join(out, 'clinic.png'))

await canvas()
  .composite([{ input: frame }, await centred(path.join(brand, 'faa/stacked-white.png'), 400)])
  .toFile(path.join(out, 'academy.png'))

// Names set in type (Cambria is the brand's heading fallback), no logos.
const names = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: Cambria, 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 64px; fill: #f7f4ef; }
    .accent { font-style: italic; fill: ${GOLD}; }
    .label { font-family: Arial, sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 6px; fill: ${GOLD}; }
  </style>
  <text x="50%" y="250" text-anchor="middle" class="name">French Medical <tspan class="accent">Aesthetics</tspan></text>
  <rect x="${W / 2 - 40}" y="300" width="80" height="1.5" fill="${GOLD}"/>
  <text x="50%" y="400" text-anchor="middle" class="name">French Aesthetics <tspan class="accent">Academy</tspan></text>
  <text x="50%" y="500" text-anchor="middle" class="label">LAHORE · KARACHI</text>
</svg>`)

await canvas()
  .composite([{ input: frame }, { input: names }])
  .toFile(path.join(out, 'site.png'))

console.log('Social images written to public/og.')
