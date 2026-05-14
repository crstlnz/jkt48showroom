export type SecretPacket = [string[], number]

export const API_KEY_SECRET = 'api:key'
export const SIGNATURE_SECRET = 'signature:key'

const PARTS = 7
const secrets = new Map<string, SecretPacket>()
const encoder = new TextEncoder()

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string) {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function mask(value: string, seed: number) {
  return Array.from(value, (char, index) => {
    const key = (seed + index * 31) & 255
    return String.fromCharCode(char.charCodeAt(0) ^ key)
  }).join('')
}

function split(value: string) {
  const size = Math.ceil(value.length / PARTS)
  return Array.from({ length: PARTS }, (_, index) => value.slice(index * size, (index + 1) * size)).reverse()
}

function clone(packet: SecretPacket): SecretPacket {
  return [[...packet[0]], packet[1]]
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function setSecret(key: string, value: string | null | undefined) {
  if (!value) {
    secrets.delete(key)
    return null
  }

  const seed = Math.floor(Math.random() * 0xFFFFFFFF)
  const packet: SecretPacket = [split(btoa(mask(toBase64(value), seed))), seed]
  secrets.set(key, packet)
  return clone(packet)
}

export function setSecretPacket(key: string, packet: SecretPacket | null | undefined) {
  if (!packet) {
    secrets.delete(key)
    return
  }

  secrets.set(key, clone(packet))
}

export function getSecret(key: string) {
  const packet = secrets.get(key)
  if (!packet) return ''

  try {
    const [chunks, seed] = packet
    return fromBase64(mask(atob([...chunks].reverse().join('')), seed))
  }
  catch {
    return ''
  }
}

export function clearSecret(key: string) {
  secrets.delete(key)
}

export async function sign(bodyRequest: unknown, secretKey: string | null = null) {
  secretKey = secretKey ?? getSecret(SIGNATURE_SECRET)
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const body = typeof bodyRequest === 'string' ? bodyRequest : JSON.stringify(bodyRequest)
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(body)))
}
