/* eslint-disable no-console */
import { decode, encode } from 'cbor-x'
import { cachedFetch } from '../utils/cachedFetch'
import { useNotifications } from './notifications'
import { useSettings } from './settings'

export const useSocket = defineStore('socket', () => {
  const { user } = useAuth()
  const pending = ref(true)
  const error = ref(false)
  const config = useRuntimeConfig()
  const { addNotif } = useNotifications()
  const livesBus = useEventBus<ExtINowLive[]>('lives')
  const settings = useSettings()
  const userCount = ref(0)
  const paths = ref<Record<string, number>>({})
  const adminCount = ref(0)

  let socket: WebSocket | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10

  // --- heartbeat ---
  let lastMessageAt = Date.now()
  let timeoutChecker: ReturnType<typeof setInterval> | null = null
  const TIMEOUT_LIMIT = 60000 // 60s tanpa pesan → reconnect

  useIntervalFn(() => {
    sendSocket('PING')
  }, 20000)

  function manualClose() {
    socket?.close(3060, 'Manual close')
  }

  function refreshTimeout() {
    lastMessageAt = Date.now()

    // Jalankan interval sekali saja
    if (!timeoutChecker) {
      timeoutChecker = setInterval(() => {
        const diff = Date.now() - lastMessageAt
        if (diff > TIMEOUT_LIMIT) {
          console.warn('⚠️ No message for too long, reconnecting WebSocket...')
          clearInterval(timeoutChecker!)
          timeoutChecker = null
          manualClose()
          attemptReconnect()
        }
      }, 10000) // cek tiap 10 detik
    }
  }

  function sendSocket(msg: string) {
    socket?.send(encode(msg))
  }

  function init() {
    try {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const url = new URL(config.public.api)
      const wsUrl = `${protocol}://${url.host}/ws`
      if (socket) {
        manualClose()
      }
      socket = new WebSocket(`${wsUrl}?token=${settings.apiKey}`)
      socket.binaryType = 'arraybuffer'
      socket.onopen = () => {
        console.log('✅ WebSocket connected')
        reconnectAttempts = 0
        sendSocket(`listen ${settings.group}`)
        // socket!.send(`listen ${settings.group}`)
        if (user.value?.is_admin) {
          registerAdmin()
        }
        refreshTimeout()
      }

      socket.onmessage = async (event) => {
        refreshTimeout()
        try {
          const rawMsg = decode(new Uint8Array(event.data))
          if (rawMsg.startsWith('ok-listen')) {
            pending.value = false
            requestPageView(useRoute().path)
            return
          }
          const msg = JSON.parse(rawMsg)
          if (msg.type === 'jkt48' || msg.type === 'hinatazaka46') {
            livesBus.emit(msg.data ?? [] as ExtINowLive[])
          }
          else if (msg.type === 'admin') {
            if (msg.data.type === 'user-count') {
              paths.value = msg.data.data.paths
              userCount.value = msg.data.data.user_count ?? 0
              adminCount.value = msg.data.data.admin_count ?? 0
            }
          }
        }
        catch {
          // abaikan parse error
        }
      }

      socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err)
      }

      socket.onclose = (event) => {
        console.warn(`🔌 WebSocket closed (code: ${event.code})`)
        if (event.code !== 3060) {
          attemptReconnect()
        }
      }
    }
    catch (e) {
      console.error('WebSocket init error:', e)
      attemptReconnect()
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached. Giving up.')
      error.value = true
      addNotif({
        type: 'danger',
        message: 'Failed to connect websocket!',
        duration: 60000,
      })
      return
    }

    reconnectAttempts++
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000)
    console.log(`🔁 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts})`)

    setTimeout(() => {
      init()
    }, delay)
  }

  function requestPageView(path: string) {
    sendSocket(`view ${path}`)
  }

  async function registerAdmin() {
    try {
      const res = await cachedFetch.fetch('admin-token', async () => {
        return await $apiFetch('/api/admin/get_token')
      }, 60 * 1000 * 2 - 1)
      sendSocket(`admin ${res}`)
      // socket?.send(`admin ${res}`)
    }
    catch (e) {
      console.error(e)
    }
  }

  function reconnectNow() {
    if (socket && socket.readyState !== WebSocket.OPEN) {
      console.log('🔁 Manual reconnecting...')
      manualClose()
    }
  }

  return {
    init,
    requestPageView,
    pending,
    error,
    userCount,
    adminCount,
    paths,
    reconnectNow,
    onLives: livesBus.on,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSocket, import.meta.hot))
}
