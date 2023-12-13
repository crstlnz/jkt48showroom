interface CookieOptions {
  name: string
  value?: string
}

interface CookieObject {
  name: string
  value: string
  options: CookieOptions[]
}

const cookieOpts = ['Path', 'Expires', 'Max-Age', 'Secure', 'HttpOnly', 'SameSite', 'Domain']
class CookieParser extends Map<string, CookieObject> {
  constructor(cookieString?: string) {
    super()
    if (cookieString) {
      this.addCookies(cookieString)
    }
  }

  addCookies(cookieString: string): CookieParser {
    const cookies = this.parseCookie(cookieString)
    for (const [key, value] of cookies.entries()) {
      this.set(key, value)
    }

    return this
  }

  toArray() {
    return [...this.values()]
  }

  toString() {
    return this.serializeCookie(this.toArray())
  }

  parseCookie(cookieString: string): Map<string, CookieObject> {
    const splitted = cookieString.split(';')
    const cookieMap = new Map<string, CookieObject>()
    const cookieArray: CookieObject[] = []
    let num = -1
    for (const s of splitted) {
      if (s) {
        const c = s?.trim().split('=')
        if (!cookieOpts.some(i => i.toLowerCase() === c[0]?.trim()?.toLowerCase())) {
          num++
          cookieArray.push({
            name: c[0],
            value: c[1],
            options: [],
          })
        }
        else {
          cookieArray[num].options.push({ name: c[0], value: c.slice(1, c.length)?.join('=') || undefined })
        }
      }
    }

    for (const a of cookieArray) {
      cookieMap.set(a.name, a)
    }
    return cookieMap
  }

  serializeCookie(cookies: CookieObject[]): string {
    const c = []
    for (const cookie of cookies) {
      c.push(`${cookie.name}=${cookie.value}`)

      for (const opt of cookie.options) {
        if (opt.value) {
          c.push(`${opt.name}=${opt.value}`)
        }
        else {
          c.push(opt.name)
        }
      }
    }

    return c.join('; ')
  }
}

export default CookieParser
