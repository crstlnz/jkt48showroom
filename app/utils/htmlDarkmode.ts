/**
 * htmlDarkTheme.ts
 * Sanitize inline style HTML dan konversi warna light theme → dark theme
 * dengan algoritma flip lightness HSL (newL = 100 - l).
 *
 * Usage:
 *   import { convertToDark } from './htmlDarkTheme';
 *   const result = convertToDark(htmlString);
 *   console.log(result.html);    // HTML dengan warna dark theme
 *   console.log(result.changes); // Daftar warna yang dikonversi
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type RGB = [r: number, g: number, b: number]
export type HSL = [h: number, s: number, l: number]

export interface ColorChange {
  property: string
  original: string
  originalHex: string
  converted: string
}

export interface ConvertStats {
  total: number
  sanitized: boolean
}

export interface ConvertResult {
  html: string
  changes: ColorChange[]
  stats: ConvertStats
}

export interface ConvertOptions {
  /** Sanitize HTML berbahaya (script, event handler, javascript: URI). Default: true */
  sanitize?: boolean
  /** Kumpulkan daftar perubahan warna. Default: true */
  logChanges?: boolean
}

// ─── Named CSS colors ──────────────────────────────────────────────────────────

const NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  gainsboro: [220, 220, 220],
  whitesmoke: [245, 245, 245],
  snow: [255, 250, 250],
  ivory: [255, 255, 240],
  seashell: [255, 245, 238],
  linen: [250, 240, 230],
  floralwhite: [255, 250, 240],
  ghostwhite: [248, 248, 255],
  mintcream: [245, 255, 250],
  aliceblue: [240, 248, 255],
  lavender: [230, 230, 250],
  lightyellow: [255, 255, 224],
  lightcyan: [224, 255, 255],
  honeydew: [240, 255, 240],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  navy: [0, 0, 128],
  maroon: [128, 0, 0],
  olive: [128, 128, 0],
  teal: [0, 128, 128],
  purple: [128, 0, 128],
  fuchsia: [255, 0, 255],
  lime: [0, 255, 0],
  aqua: [0, 255, 255],
  yellow: [255, 255, 0],
  orange: [255, 165, 0],
  coral: [255, 127, 80],
  salmon: [250, 128, 114],
  tomato: [255, 99, 71],
  crimson: [220, 20, 60],
  indigo: [75, 0, 130],
  violet: [238, 130, 238],
  pink: [255, 192, 203],
  hotpink: [255, 105, 180],
  deeppink: [255, 20, 147],
  darkorange: [255, 140, 0],
  goldenrod: [218, 165, 32],
  khaki: [240, 230, 140],
  lightblue: [173, 216, 230],
  skyblue: [135, 206, 235],
  steelblue: [70, 130, 180],
  royalblue: [65, 105, 225],
  dodgerblue: [30, 144, 255],
  deepskyblue: [0, 191, 255],
  mediumblue: [0, 0, 205],
  slategray: [112, 128, 144],
  lightslategray: [119, 136, 153],
  transparent: null,
} satisfies Record<string, RGB | null>

type NamedColor = keyof typeof NAMED_COLORS

function isNamedColor(value: string): value is NamedColor {
  return Object.prototype.hasOwnProperty.call(NAMED_COLORS, value)
}

// ─── Color parsing ─────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB | null {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  if (hex.length !== 6) return null
  const n = Number.parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100

  const hue = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue(p, q, h + 1 / 3) * 255),
    Math.round(hue(p, q, h) * 255),
    Math.round(hue(p, q, h - 1 / 3) * 255),
  ]
}

/**
 * Parse semua format warna CSS → RGB atau null.
 * Support: #hex, rgb(), rgba(), hsl(), hsla(), named colors.
 */
export function parseColor(str: string): RGB | null {
  str = str.trim().toLowerCase()

  if (isNamedColor(str)) return NAMED_COLORS[str]

  if (str.startsWith('#')) return hexToRgb(str)

  const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch
    if (r && g && b) return [Number(r), Number(g), Number(b)]
  }

  const hslMatch = str.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?/)
  if (hslMatch) {
    const [, h, s, l] = hslMatch
    if (h && s && l) return hslToRgb(Number(h), Number(s), Number(l))
  }

  return null
}

// ─── Color utilities ───────────────────────────────────────────────────────────

export function rgbToHsl([r, g, b]: RGB): HSL {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  return `#${hslToRgb(h, s, l).map(c => c.toString(16).padStart(2, '0')).join('')}`
}

function rgbToHex(rgb: RGB): string {
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`
}

// ─── Konversi warna ke dark mode ───────────────────────────────────────────────

/**
 * Konversi satu warna untuk dark mode dengan flip lightness.
 *
 * Algoritma: newL = 100 - l
 *   #000000 → HSL(0°,   0%,   0%) → HSL(0°,   0%, 100%) → #ffffff
 *   navy    → HSL(240°, 100%, 25%) → HSL(240°, 100%, 75%) → biru muda
 *   #ffffff → HSL(0°,   0%, 100%) → HSL(0°,   0%,   0%) → #000000
 */
export function convertColorForDark(rgb: RGB): string {
  const [h, s, l] = rgbToHsl(rgb)
  return hslToHex(h, s, 100 - l)
}

// ─── CSS properties yang mengandung warna ─────────────────────────────────────

const COLOR_PROPERTIES = new Set<string>([
  'color',
  'background-color',
  'background',
  'border-color',
  'border',
  'border-top',
  'border-bottom',
  'border-left',
  'border-right',
  'outline',
  'outline-color',
  'box-shadow',
  'text-shadow',
  'fill',
  'stroke',
  'stop-color',
  'flood-color',
  'lighting-color',
  'column-rule-color',
  'text-decoration-color',
  'caret-color',
])

const NAMED_COLOR_PATTERN = Object.keys(NAMED_COLORS)
  .sort((a, b) => b.length - a.length)
  .join('|')

const COLOR_VALUE_PATTERN = new RegExp(
  String.raw`#[0-9a-f]{3}(?:[0-9a-f]{3})?\b|rgba?\([^)]+\)|hsla?\([^)]+\)|\b(?:${NAMED_COLOR_PATTERN})\b`,
  'gi',
)

// ─── Sanitizer ─────────────────────────────────────────────────────────────────

/**
 * Hapus atribut dan tag berbahaya dari HTML string.
 * (Untuk sanitasi lebih lengkap di production, gunakan DOMPurify.)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/(href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<(object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/(src|href)\s*=\s*["']\s*data:[^"']*["']/gi, '')
}

// ─── Main API ──────────────────────────────────────────────────────────────────

/**
 * Konversi HTML dari light theme ke dark theme dengan flip lightness.
 *
 * @param html     - HTML string input (inline style)
 * @param options  - Opsi konversi
 * @returns        - { html, changes, stats }
 *
 * @example
 * const { html, changes, stats } = convertToDark(
 *   `<p style="color:#000000;background:#ffffff">Hello</p>`
 * );
 * // color:      #000000 → #ffffff
 * // background: #ffffff → #000000
 */
export function convertToDark(html: string, options: ConvertOptions = {}): ConvertResult {
  if (typeof html !== 'string') throw new TypeError('Input harus string HTML.')

  const { sanitize = true, logChanges = true } = options

  let processed = sanitize ? sanitizeHtml(html) : html
  const changes: ColorChange[] = []
  let total = 0

  processed = processed.replace(
    /style\s*=\s*(["'])([\s\S]*?)\1/gi,
    (_match: string, quote: string, styleValue: string) => {
      const newStyle = styleValue.replace(
        /([\w-]+)\s*:\s*([^;]+)/g,
        (decl: string, prop: string, val: string) => {
          const propLow = prop.trim().toLowerCase()
          const isColorProp = COLOR_PROPERTIES.has(propLow) || propLow.endsWith('-color')
          if (!isColorProp) return decl

          const newValue = val.replace(COLOR_VALUE_PATTERN, (rawColor: string) => {
            const rgb = parseColor(rawColor)
            if (!rgb) return rawColor

            const newColor = convertColorForDark(rgb)
            total += 1

            if (logChanges) {
              changes.push({
                property: propLow,
                original: rawColor,
                originalHex: rgbToHex(rgb),
                converted: newColor,
              })
            }

            return newColor
          })

          return decl.replace(val, newValue)
        },
      )

      return `style=${quote}${newStyle}${quote}`
    },
  )

  return {
    html: processed,
    changes,
    stats: { total, sanitized: sanitize },
  }
}
