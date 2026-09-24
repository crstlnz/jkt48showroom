const betaDeviceIdKey = 'beta-device-id'

export function hasBetaDeviceId() {
  return localStorage.getItem(betaDeviceIdKey) != null
}

export async function useBetaDeviceId() {
  let deviceId = localStorage.getItem(betaDeviceIdKey)
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(betaDeviceIdKey, deviceId)
  }

  if (navigator.storage?.persist) {
    void navigator.storage.persist().catch(() => false)
  }

  return deviceId
}
