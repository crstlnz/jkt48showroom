export default function (host: string, key: string) {
  let socket: WebSocket | null = null
  const comment = createEventHook<Watch.Comment>()
  const isLive = createEventHook<boolean>()
  function createSocket() {
    destroySocket()
    socket = new WebSocket(host)
    socket.onopen = () => {
      socket?.send(`SUB\t${key}`)
    }

    socket.onmessage = (message) => {
      try {
        const msg = JSON.parse(message.data.split('\t')[2])
        const code = Number.parseInt(msg.t, 10)
        if (code === 1) {
          if (!Number.isNaN(msg.cm) && Number.parseInt(msg.cm) <= 50) return
          const cm: Watch.Comment = {
            id: String(msg.u) + String(msg.created_at),
            user_id: msg.u,
            name: msg.ac,
            comment: msg.cm,
            created_at: msg.created_at,
            avatar_id: msg.av,
          }
          comment.trigger(cm)
        }
        else if (code === 101) {
          isLive.trigger(false)
        }
        else if (code === 104) {
          isLive.trigger(true)
        }
      }
      catch (e) {
        console.log(e)
      }
    }

    socket.onclose = (closeEvent) => {
      if (closeEvent.code === 3030) return
      createSocket()
    }
  }

  function destroySocket() {
    if (socket) socket.close(3030, 'Manual Stop')
  }

  onMounted(() => {
    createSocket()
  })

  onBeforeUnmount(() => {
    destroySocket()
  })

  return {
    onComment: comment.on,
    onLiveState: isLive.on,
  }
}
