interface UseWebviewDetectorOptions {
  userAgent?: string
  xRequestedWith?: string
  appPackages?: string[]
}

function normalizePackageName(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function parsePackageList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map(item => normalizePackageName(String(item)))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => normalizePackageName(item))
      .filter(Boolean)
  }

  return []
}

function checkWebviewFromAppPackage(
  xRequestedWith: string,
  appPackageSet: Set<string>,
) {
  const normalizedHeader = normalizePackageName(xRequestedWith)
  if (!normalizedHeader || appPackageSet.size === 0) return false
  return appPackageSet.has(normalizedHeader)
}

export default function (opts: UseWebviewDetectorOptions = {}) {
  const runtimeConfig = useRuntimeConfig()
  const requestHeaders = import.meta.server
    ? useRequestHeaders(['user-agent', 'x-requested-with'])
    : {}

  const fallbackUserAgent = import.meta.client
    ? navigator.userAgent
    : requestHeaders['user-agent']
  const fallbackXRequestedWith = normalizePackageName(
    requestHeaders['x-requested-with'],
  )

  // Persist server header to client to avoid hydration mismatch.
  const requestedWithState = useState<string>(
    'webview-detector:x-requested-with',
    () => normalizePackageName(opts.xRequestedWith ?? fallbackXRequestedWith),
  )
  if (opts.xRequestedWith) {
    requestedWithState.value = normalizePackageName(opts.xRequestedWith)
  }

  const configuredPackages = computed(() =>
    parsePackageList(
      opts.appPackages
      ?? runtimeConfig.public.webviewAppPackages,
    ),
  )
  const appPackageSet = computed(() => new Set(configuredPackages.value))
  const userAgent = computed(() => opts.userAgent ?? fallbackUserAgent ?? '')
  const xRequestedWith = computed(() =>
    normalizePackageName(opts.xRequestedWith ?? requestedWithState.value),
  )
  const matchedPackage = computed(() => {
    if (!xRequestedWith.value || appPackageSet.value.size === 0) return null
    return appPackageSet.value.has(xRequestedWith.value)
      ? xRequestedWith.value
      : null
  })

  const isWebviewByAppPackage = computed(() =>
    checkWebviewFromAppPackage(xRequestedWith.value, appPackageSet.value),
  )
  const isWebview = computed(() => isWebviewByAppPackage.value)

  return {
    userAgent,
    xRequestedWith,
    configuredPackages,
    matchedPackage,
    isWebviewByAppPackage,
    isWebview,
    checkWebviewFromAppPackage,
  }
}
