import syncServerCookies from '~/composables/syncServerCookies'
import { API_KEY_SECRET, getSecret, sign } from '~/utils/secret'

interface ApiFetchOptions {
  includeApiKey?: boolean
  useSignature?: boolean
}

interface RequestOptionsWithPayload {
  body?: unknown
  method?: unknown
  params?: unknown
  query?: unknown
}

export function getApiBaseURL() {
  const config = useRuntimeConfig()
  if (!config.public.api) throw new Error('Api url not defined!')
  return config.public.api as string
}

export function useApiFetchShared(options: ApiFetchOptions = {}) {
  const { getHeaders, setCookie } = syncServerCookies()

  function getRequestHeaders(headersInit?: unknown) {
    const headers = new Headers(toValue(headersInit) as HeadersInit | undefined)

    if (import.meta.server) {
      const serverHeaders = new Headers(getHeaders())
      serverHeaders.forEach((value, key) => headers.set(key, value))
    }

    const tokenHeaders = new Headers(getHeadersToken())
    tokenHeaders.forEach((value, key) => headers.set(key, value))

    if (options.includeApiKey) {
      const apiKey = getSecret(API_KEY_SECRET)
      if (apiKey) headers.set('x-api-key', apiKey)
    }

    return headers
  }

  async function applyRequestHeaders(requestOptions: RequestOptionsWithPayload & { headers?: unknown }) {
    const headers = getRequestHeaders(requestOptions.headers)

    if (options.useSignature) {
      // const payload = applyNonce(requestOptions)
      const nonce = createNonce()
      headers.set('x-signature', await sign(nonce))
      headers.set('x-nonce', nonce)
    }

    requestOptions.headers = headers
  }

  function handleResponse(response: Response, setStatus = false) {
    applyHeaderToken(response.headers)

    if (!import.meta.server) return

    setCookie(response.headers)

    if (setStatus && response.status !== 200) {
      const event = useRequestEvent()
      if (event) {
        setResponseStatus(event, response.status, response.statusText)
      }
    }
  }

  return {
    baseURL: getApiBaseURL(),
    applyRequestHeaders,
    getRequestHeaders,
    handleResponse,
  }
}

function getSignaturePayload(options: RequestOptionsWithPayload) {
  const method = String(toValue(options.method) || 'GET').toUpperCase()

  if (method === 'GET') {
    return getQueryPayload(options)
  }

  if (method === 'POST') {
    return toValue(options.body)
  }

  return toValue(options.body) ?? getQueryPayload(options)
}

function applyNonce(options: RequestOptionsWithPayload) {
  const method = String(toValue(options.method) || 'GET').toUpperCase()

  if (method === 'GET') {
    const payload = withNonce(getQueryPayload(options))
    if (options.query != null) options.query = payload
    else options.params = payload
    return payload
  }

  if (method === 'POST') {
    const payload = withNonce(toValue(options.body))
    options.body = payload
    return payload
  }

  const payload = withNonce(getSignaturePayload(options))
  if (options.body != null) options.body = payload
  else if (options.query != null) options.query = payload
  else options.params = payload
  return payload
}

function getQueryPayload(options: RequestOptionsWithPayload) {
  const query = toValue(options.query)
  if (query != null) return query

  const params = toValue(options.params)
  if (params != null) return params

  return null
}

function hasNonce(payload: unknown): boolean {
  const value = toValue(payload)
  if (value == null) return false

  if (value instanceof FormData || value instanceof URLSearchParams) {
    return Boolean(value.get('nonce'))
  }

  if (typeof value === 'string') {
    try {
      return hasNonce(JSON.parse(value))
    }
    catch {
      return new URLSearchParams(value).has('nonce')
    }
  }

  if (typeof value !== 'object') return false

  return Object.prototype.hasOwnProperty.call(value, 'nonce') && Boolean((value as { nonce?: unknown }).nonce)
}

function createNonce() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

function withNonce(payload: unknown): unknown {
  const value = toValue(payload)

  if (value instanceof FormData) {
    if (!value.get('nonce')) value.set('nonce', createNonce())
    return value
  }

  if (value instanceof URLSearchParams) {
    if (!value.get('nonce')) value.set('nonce', createNonce())
    return value
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(withNonce(parsed))
    }
    catch {
      const params = new URLSearchParams(value)
      if (!params.has('nonce')) params.set('nonce', createNonce())
      return params.toString()
    }
  }

  if (value && typeof value === 'object') {
    return hasNonce(value) ? value : { ...value, nonce: createNonce() }
  }

  return { nonce: createNonce() }
}
