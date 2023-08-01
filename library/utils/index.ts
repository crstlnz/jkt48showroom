// import { createCanvas, loadImage } from 'canvas'
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
  const pattern = new RegExp('^(https?:\\/\\/)?' // protocol
        + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
        + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
        + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
        + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
        + '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
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

export function flattenAndSoftenColor(r: number, g: number, b: number, num = 0.9): [number, number, number] {
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

export function getDominantColorClient(src: string, canvas?: HTMLCanvasElement | OffscreenCanvas): Promise<[number, number, number]> {
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

// export function getDominantColorServer(src: string): Promise<[number, number, number]> {
//   return new Promise((resolve, reject) => {
//     // Draw cat with lime helmet
//     loadImage(src).then((image) => {
//       const canvas = createCanvas(image.width, image.height)
//       const ctx = canvas.getContext('2d')
//       // Draw the image on the canvas
//       ctx.drawImage(image, 0, 0)
//       // Get the pixel data of the image
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
//       const pixelData = imageData.data
//       // Initialize the total red, green, and blue values to 0
//       let totalR = 0
//       let totalG = 0
//       let totalB = 0

//       // Loop through each pixel and sum up the red, green, and blue components
//       for (let i = 0; i < pixelData.length; i += 4) {
//         totalR += pixelData[i]
//         totalG += pixelData[i + 1]
//         totalB += pixelData[i + 2]
//       }
//       // Calculate the average red, green, and blue values
//       const avgR = Math.round(totalR / (pixelData.length / 4))
//       const avgG = Math.round(totalG / (pixelData.length / 4))
//       const avgB = Math.round(totalB / (pixelData.length / 4))
//       resolve([avgR, avgG, avgB])
//     }).catch((e) => {
//       reject(e)
//     })
//   })
// }

export function clamp(min: number, max: number, num: number, pad = 0) {
  return Math.max(min + pad, Math.min(num, max - pad))
}

export function convertRGBtoHex(red: number, green: number, blue: number): string {
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

export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  return true
}

interface ParsedCookie {
  value: string
  attributes: { [key: string]: string }
}

export function parseCookieString(cookieString: string): { [key: string]: ParsedCookie } {
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
