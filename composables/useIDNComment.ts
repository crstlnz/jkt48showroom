import { createEventHook } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

const host = 'wss://chat.idn.app/'

interface Comment {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar_url: string
    color_code: string
  }
  chat: {
    message: string
  }
  time: Date
}

export default function (chat_room_id: string, max_comment = 100) {
  const comments = useSessionStorage<Comment[]>(`comments-${chat_room_id}`, [])
  const delayedComments = ref<Comment[]>([])
  const onComment = createEventHook<Comment>()
  const autoAppend = ref(true)
  const socket = ref<WebSocket>()

  function appendComment(comment: Comment) {
    if (comments.value.length > max_comment) comments.value = comments.value.slice(comments.value.length - max_comment, comments.value.length)
    comments.value.push(comment)
  }

  watch(autoAppend, (newVal, oldVal) => {
    if (oldVal === false && newVal === true) {
      for (const c of delayedComments.value) {
        appendComment(c)
      }
      delayedComments.value = []
    }
  })

  onComment.on((comment) => {
    if (autoAppend.value) {
      appendComment(comment)
    }
    else {
      delayedComments.value.push(comment)
    }
  })

  onMounted(() => {
    createSocket()
  })

  onUnmounted(() => {
    socket.value?.close()
  })

  async function createSocket() {
    socket.value = new WebSocket(host)
    socket.value.onopen = () => {
      const uuid = uuidv4()
      const userId = uuidv4()
      socket.value!.send('CAP LS 302')
      socket.value!.send(`NICK idn-${userId}-${new Date().getTime()}`)
      socket.value!.send(`USER ${userId}_${uuid} 0 * null`)
      socket.value!.send(`CAP REQ :account-notify account-tag away-notify batch cap-notify chghost echo-message extended-join invite-notify labeled-response message-tags multi-prefix server-time setname userhost-in-names`)
      socket.value!.send(`CAP END`)
    }

    socket.value.onmessage = (msg) => {
      const raw = msg.data
      if (raw.includes(':Welcome')) {
        console.log('Socket open!')
        socket.value!.send(`@label=1 JOIN #${chat_room_id}`)
      }
      else if (raw.includes('PING :')) {
        try {
          const split = raw.split('PING :') || []
          const key = split?.[split.length - 1]
          socket.value!.send(`PONG ${key}`)
        }
        catch (e) {
          console.error(e)
        }
      }
      else if (raw.includes(`${chat_room_id} :`)) {
        try {
          const data = raw.split(`${chat_room_id} :`)?.pop()
          if (data) {
            const event = JSON.parse(data)
            if (event.chat) {
              const comment = {
                user: {
                  id: event.user?.uuid,
                  name: event.user?.name,
                  username: event.user?.usernamae,
                  avatar_url: event.user?.avatar_url,
                  color_code: event.user?.color_code,
                },
                chat: event.chat,
                time: new Date(),
              }

              onComment.trigger({ id: uuidv4(), ...comment })
            }
          }
        }
        catch {

        }
      }
    }
  }

  function setAutoAppend(val: boolean) {
    autoAppend.value = val
  }

  return { comments, onComment: onComment.on, delayedComments, setAutoAppend, autoAppend }
}
