export default function (host: string, key: string) {
  let socket: WebSocket | null = null
  const comment = createEventHook<Watch.Comment>()
  const isLive = createEventHook<boolean>()
  const gift = createEventHook<ShowroomAPI.GiftLogItem>()
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
        else if (code === 2) {
          gift.trigger(
            {
              num: msg.n,
              avatar_url: `https://static.showroom-live.com/image/avatar/${msg.av}.png`,
              name: msg.ac ?? '',
              image: `https://static.showroom-live.com/image/gift/${msg.g}_m.png`,
              gift_id: msg.g,
              created_at: msg.created_at,
              user_id: msg.u,
              ua: msg.ua,
              avatar_id: msg.av,
              aft: msg.aft,
              image2: '',
            },
          )
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
    onGift: gift.on,
  }
}