import jwt from 'jsonwebtoken'

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
export function createJWT<T extends object>(
  payload: T,
  expireMs: number,
  secret: string,
): string {
  return jwt.sign(payload, secret, {
    expiresIn: Math.floor(expireMs / 1000), // konversi ms ke detik
  })
}
