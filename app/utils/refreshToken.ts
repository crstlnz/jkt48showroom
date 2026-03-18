import { useSettings } from '~/store/settings'

const refreshTokenKey = '_x'
const accessTokenKey = '_xr'
export default function setRefreshToken(token: string) {
  if (import.meta.client) {
    localStorage.setItem(refreshTokenKey, token)
  }
}

export function getRefreshToken() {
  if (import.meta.client) return localStorage.getItem(refreshTokenKey)
}

export function getAccessToken() {
  if (import.meta.client) return localStorage.getItem(refreshTokenKey)
}

export function setAccessToken(token: string) {
  if (import.meta.client) {
    const { applyAccessToken } = useSettings()
    localStorage.setItem(accessTokenKey, token)
    applyAccessToken(token)
  }
}
