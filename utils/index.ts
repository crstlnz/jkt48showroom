/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable regexp/no-unused-capturing-group */
// import { createCanvas, loadImage } from 'canvas'
import { defu } from 'defu'

export function decimalFormat(angka: number): string {
  return Number.isInteger(angka) ? angka.toString() : angka.toFixed(2)
}

export function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5)
}

export function convertToMilliseconds(timestamp: number): number {
  return timestamp * (timestamp < 1e10 ? 1e3 : 1)
}

export function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' // protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(:\\d+)?(\\/[-\\w%.~+]*)*' // port and path
    + '(\\?[;&\\w%.~+=-]*)?' // query string
    + '(#[-\\w]*)?$',
    'i',
  ) // fragment locator
  return !!pattern.test(str)
}

export function getDateRange(type: IDateRangeType): IDateRange {
  const date = new Date()
  date.setHours(0, 0, 0, -1)

  let to: Date, from: Date
  if (type === 'weekly') {
    from = new Date(new Date(date).setDate(date.getDate() - 7))
    to = new Date(date)
  }
  else if (type === 'monthly') {
    to = new Date(date)
    from = new Date(date.setMonth(to.getMonth() - 1))
  }
  else if (type === 'quarterly') {
    to = new Date(date)
    from = new Date(date.setMonth(to.getMonth() - 3))
  }
  else {
    to = date
    from = date
  }

  from.setHours(0, 0, 0, 0)
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

export function flattenAndSoftenColor(
  r: number,
  g: number,
  b: number,
  num = 0.9,
): [number, number, number] {
  // Determine the mid-value of the RGB components
  const mid = Math.round((r + g + b) / 3)

  // Calculate the deviation of each component from the mid-value
  const rDev = Math.abs(r - mid)
  const gDev = Math.abs(g - mid)
  const bDev = Math.abs(b - mid)

  // Determine the maximum deviation
  const maxDev = Math.max(rDev, gDev, bDev)

  // If the maximum deviation is small, return the original RGB values
  if (maxDev <= 30) {
    return [r, g, b]
  }

  // Otherwise, flatten and soften the color by adjusting the RGB values proportionally
  const factor = (maxDev * num) / maxDev
  r = Math.round(mid + factor * (r - mid))
  g = Math.round(mid + factor * (g - mid))
  b = Math.round(mid + factor * (b - mid))

  // return `rgb(${r}, ${g}, ${b})`
  return [r, g, b]
}

export function getDominantColorClient(
  src: string,
  canvas?: HTMLCanvasElement | OffscreenCanvas,
): Promise<[number, number, number]> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = '*'
    image.setAttribute('crossOrigin', '')
    image.src = src
    image.onerror = (e) => {
      reject(e)
    }

    image.onload = () => {
      if (!canvas) canvas = new OffscreenCanvas(image.width, image.height)
      // Set its dimensions to the image dimensions
      canvas.width = image.width
      canvas.height = image.height

      // Draw the image on the canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(image, 0, 0)

      // Get the pixel data of the image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixelData = imageData.data
      // Initialize the total red, green, and blue values to 0
      let totalR = 0
      let totalG = 0
      let totalB = 0

      // Loop through each pixel and sum up the red, green, and blue components
      for (let i = 0; i < pixelData.length; i += 4) {
        totalR += pixelData[i]
        totalG += pixelData[i + 1]
        totalB += pixelData[i + 2]
      }

      // Calculate the average red, green, and blue values
      const avgR = Math.round(totalR / (pixelData.length / 4))
      const avgG = Math.round(totalG / (pixelData.length / 4))
      const avgB = Math.round(totalB / (pixelData.length / 4))
      resolve([avgR, avgG, avgB])
    }
  })
}

export function clamp(min: number, max: number, num: number, pad = 0) {
  return Math.max(min + pad, Math.min(num, max - pad))
}

export function convertRGBtoHex(
  red: number,
  green: number,
  blue: number,
): string {
  const redHex = red.toString(16).padStart(2, '0')
  const greenHex = green.toString(16).padStart(2, '0')
  const blueHex = blue.toString(16).padStart(2, '0')
  const hexCode = `#${redHex}${greenHex}${blueHex}`
  return hexCode
}

export function convertDurationToMs(durationString: string) {
  let durationMs = 0
  if (durationString.endsWith('s')) {
    const durationSeconds = Number.parseFloat(durationString)
    durationMs = durationSeconds * 1000
  }
  else if (durationString.endsWith('ms')) {
    durationMs = Number.parseFloat(durationString)
  }

  return durationMs
}

type Deep = string | number | string[] | number[]
interface IDeepObject {
  [key: string]: Deep | IDeepObject | IDeepObject[]
}
type DeepObject = Record<string, Deep | IDeepObject | IDeepObject[]>
type DeepData = Deep | DeepObject | DeepObject[]

export function deepEqual(obj1: DeepData, obj2: DeepData): boolean {
  if (typeof obj1 === 'number' || typeof obj1 === 'string') return obj1 === obj2
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) return false
    if (obj1.length !== obj2.length) return false
    for (const [idx, obj] of obj1.entries()) {
      if (!deepEqual(obj, obj2[idx])) return false
    }
  }
  else {
    if (
      typeof obj1 !== 'object'
      || obj1 === null
      || typeof obj2 !== 'object'
      || obj2 === null
    ) {
      return false
    }
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) return false
    for (const key of keys1) {
      if (!deepEqual(obj1[key], obj2[key])) return false
    }
  }

  return true
}

interface ParsedCookie {
  value: string
  attributes: { [key: string]: string }
}

export function parseCookieString(cookieString: string): {
  [key: string]: ParsedCookie
} {
  const cookieObj: { [key: string]: ParsedCookie } = {}

  if (cookieString) {
    const cookies = cookieString.split(',')

    cookies.forEach((cookie) => {
      const parts = cookie.trim().split(';')
      const [name, value] = parts[0].trim().split('=')
      const attributes: { [key: string]: string } = {}

      parts.slice(1).forEach((attr) => {
        const [attrName, attrValue] = attr.trim().split('=')
        attributes[attrName.toLowerCase()] = attrValue
      })

      cookieObj[name] = {
        value: decodeURIComponent(value),
        attributes,
      }
    })
  }

  return cookieObj
}

interface RelativeTimeOpts {
  year?: boolean
  month?: boolean
  day?: boolean
  hour?: boolean
  minute?: boolean
  second?: boolean
}

const defaultOpts = {
  year: false,
  month: false,
  day: true,
  hour: true,
  minute: true,
  second: true,
}

export function formatDuration(
  time: string | number,
  opt?: RelativeTimeOpts,
): string {
  try {
    const opts = defu(opt, defaultOpts)
    const { t } = useI18n()
    const dayjs = useDayjs()
    const ms = Number(time)
    if (Number.isNaN(ms)) throw new Error('Not a number!')
    const duration = dayjs.duration(ms)
    const str = []
    const year = duration.years()
    const month = duration.months()
    const day = duration.days()
    const hour = duration.hours()
    const minute = duration.minutes()
    const second = duration.seconds()
    if (year && opts.year) str.push(`${year || ''} ${t('year', year)}`)
    if (month && opts.month) str.push(`${month || ''} ${t('month', month)}`)
    if (day && opts.day) str.push(`${day || ''} ${t('day', day)}`)
    if (hour && opts.hour) str.push(`${hour || ''} ${t('hour', hour)}`)
    if (minute && opts.minute) {
      str.push(`${minute || ''} ${t('minute', minute)}`)
    }
    if (second && opts.second) {
      str.push(`${second || ''} ${t('second', second)}`)
    }
    return str.join(' ')
  }
  catch (e) {
    console.error(e)
    return 'Parse duration error!'
  }
}

export function getNumColor(num: number) {
  if (num <= 100) {
    return 'text-blue-500 dark:text-blue-400'
  }
  else if (num <= 500) {
    return 'text-green-500 dark:text-green-400'
  }
  else if (num <= 1000) {
    return 'text-violet-500 dark:text-violet-400'
  }
  else {
    return 'text-red-500 dark:text-red-400'
  }
}

export function deepCompare(obj1: any, obj2: any): boolean {
  try {
    if (!obj1 || !obj2) return false
    if (typeof obj1 !== typeof obj2) {
      return false
    }

    // Compare arrays recursively
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        return false
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!deepCompare(obj1[i], obj2[i])) {
          return false
        }
      }
      return true
    }

    // Compare objects recursively
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)

      if (keys1.length !== keys2.length) {
        return false
      }

      for (const key of keys1) {
        if (!deepCompare(obj1[key], obj2[key])) {
          return false
        }
      }

      return true
    }

    // Compare primitive types
    return obj1 === obj2
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export function getProxyServer(): string[] {
  return [
    ...(useRuntimeConfig().public.proxy ?? '')
      ?.split(',')
      ?.map(i => i.trim())
      ?.filter(i => i !== ''),
    `${useRuntimeConfig().public.api}/api/stream?url=`,
  ]
}

const allowed = [
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'showroom-live.com',
  'idn.media',
]
export function getAllowedSocials(socials: SocialNetwork[]) {
  return socials.filter(i => allowed.some(u => i.url?.includes(u)))
}

export function youtubeViewsFormat(
  views: string | number | null | undefined,
  locale: string,
  suffix: boolean = true,
) {
  views = Number.isNaN(views) ? 0 : Number(views)
  let formattedViews: string

  // Pilih format sesuai dengan lokal yang diberikan
  if (locale === 'id') {
    if (views >= 1_000_000_000) {
      formattedViews = `${(views / 1_000_000).toFixed(1)} M x`
    }
    else if (views >= 1_000_000) {
      formattedViews = `${(views / 1_000_000).toFixed(1)} jt x`
    }
    else if (views >= 1_000) {
      formattedViews = `${(views / 1_000).toFixed(1)} rb x`
    }
    else {
      formattedViews = views.toString()
    }
  }
  else {
    if (views >= 1_000_000_000) {
      formattedViews = `${(views / 1_000_000).toFixed(1)}B`
    }
    else if (views >= 1_000_000) {
      formattedViews = `${(views / 1_000_000).toFixed(1)}M`
    }
    else if (views >= 1_000) {
      formattedViews = `${(views / 1_000).toFixed(1)}K`
    }
    else {
      formattedViews = views.toString()
    }
  }

  formattedViews = formattedViews.replace(/\.0$/, '') // Menghapus .0 jika ada
  if (suffix) {
    if (locale === 'id') {
      formattedViews += ' ditonton'
    }
    else {
      formattedViews += ' views'
    }
  }
  return formattedViews
}

export function getVideoId(youtubeUrl: string): string | null {
  try {
    const url = new URL(youtubeUrl)
    const videoId = url.searchParams.get('v') ?? url.pathname.split('/').pop()

    if (videoId) {
      return videoId
    }

    return youtubeUrl
  }
  catch (error) {
    console.error('Invalid URL:', error)
    return youtubeUrl
  }
}
