import { useSettings } from '~/store/settings'

const refreshTokenKey = '_xr'
const accessTokenKey = '_xx'
const showroomTokenKey = '_xsr'

export function applyAuthData(key: string, token?: string | null) {
  if (import.meta.client) {
    if (token != null) {
      if (token === '') {
        localStorage.removeItem(key)
        return null
      }
      else {
        localStorage.setItem(key, token)
        return token
      }
    }
  }
  return null
}

export function getHeadersToken() {
  const { accessToken } = useSettings()
  const headers: HeadersInit = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const refreshToken = getRefreshToken()
  const showroomToken = getShowroomToken()
  if (refreshToken) headers['X-Refresh-Token'] = refreshToken
  if (showroomToken) headers['X-SR-Token'] = showroomToken
  return headers
}

export default function setRefreshToken(token?: string | null) {
  applyAuthData(refreshTokenKey, token)
}

export function getRefreshToken() {
  if (import.meta.client) return localStorage.getItem(refreshTokenKey)
  return null
}

export function getAccessToken() {
  if (import.meta.client) return localStorage.getItem(accessTokenKey)
  return null
}

export function getShowroomToken() {
  if (import.meta.client) {
    return localStorage.getItem(showroomTokenKey)
  }
  return null
}

export function setAccessToken(token?: string | null) {
  const data = applyAuthData(refreshTokenKey, token)
  if (data) {
    useSettings().applyAccessToken(data)
  }
}

export function setShowroomToken(token?: string | null) {
  applyAuthData(showroomTokenKey, token)
}

export function applyHeaderToken(headers: Headers) {
  setRefreshToken(headers.get('X-Refresh-Token'))
  setAccessToken(headers.get('X-Access-Token'))
  setShowroomToken(headers.get('X-SR-Token'))
}
