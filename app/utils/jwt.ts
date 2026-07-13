/**
 * Custom error untuk identifikasi error JWT
 */
export class JWTError extends Error {
  code: 'INVALID' | 'EXPIRED'
  constructor(message: string, code: 'INVALID' | 'EXPIRED') {
    super(message)
    this.code = code
  }
}

/**
 * Membuat JWT token.
 * @param payload - Data yang ingin disimpan di dalam token.
 * @param expireMs - Lama waktu token berlaku dalam milidetik.
 * @param secret - Kunci rahasia (opsional).
 * @returns Token JWT (string)
 */
export async function createJWT<T extends object>(
  payload: T,
  expireMs: number,
  secret: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = Math.floor(expireMs / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = { ...payload, iat: now, exp: now + expiresIn }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedBody = base64UrlEncode(JSON.stringify(body))
  const unsignedToken = `${encodedHeader}.${encodedBody}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsignedToken))
  return `${unsignedToken}.${base64UrlEncode(signature)}`
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === 'string'
    ? new TextEncoder().encode(value)
    : new Uint8Array(value)

  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}
