// import { Buffer } from 'buffer'

// export default function (data: IDNLivesDetail) {
//   const config = useRuntimeConfig()
//   const error = ref(null)
//   const socket = ref<WebSocket>()
//   const socketChatHost = (region: string) => `wss://edge.ivschat.${region}.amazonaws.com`
//   const awsRegion = 'us-east-1'
//   const uuid = useLocalStorage('uuid', () => crypto.randomUUID())
//   // const comments = useSessionStorage<(IDN.Comment & { id: string })[]>(`${data.user?.username}-${data.slug}1`, () => [])
//   // const delayedComments = useSessionStorage<(IDN.Comment & { id: string })[]>(`${data.user?.username}-${data.slug}-delayed1`, () => [])
//   const comments = ref<(IDN.Comment & { id: string })[]>([])
//   // const viewerEvent = createEventHook<(IDN.Comment & { id: string })>()
//   const delayedComments = ref<(IDN.Comment & { id: string })[]>([])
//   const pinnedMessage = useSessionStorage<IDN.PinnedMessage | null>(`${data.user?.username}-${data.slug}-pinned`, () => null)

//   async function prepareSocket(data: IDNLivesDetail) {
//     console.log('Preparing socket...')
//     const res = await fetchToken(data)
//     console.log('Token Fetched', res?.token)
//     if (res) {
//       createSocket(res.token)
//     }
//   }

//   watch(comments, () => {
//     if (comments.value?.length > 100) {
//       comments.value = comments.value.slice(80)
//     }
//   })

//   watch(delayedComments, () => {
//     if (delayedComments.value?.length > 100) {
//       delayedComments.value = delayedComments.value.slice(80)
//     }
//   })
//   const c = useAppConfig()

//   async function createSocket(token: string) {
//     destroySocket()
//     socket.value = new WebSocket(`${c.liveInfo}/${getLiveInfoSocketQuery()}`, ['graphql-ws'])
//     socket.value.onopen = () => {
//       console.log('Socket open!')
//       socket.value?.send(JSON.stringify({ type: 'connection_init' }))
//     }

//     socket.value.onmessage = msg => (raw) => {
//       try {
//         const data = JSON.parse(String(raw))
//         if (data.type === 'connection_ack') {
//           log.info(`${this.ctx.name} Sending auth..`)
//           this.sendAuthorization()
//         }
//         else if (data.type === 'data') {
//           const event = data.payload?.data?.onLivestreamEvent
//           if (event) {
//             const eventData = JSON.parse(event.data)
//             if (event.eventType === 'room-viewer') {
//               ///
//               this.emit('viewer', Number(eventData?.viewer_count ?? 0))
//             }
//             else if (event.eventType === 'room-status') {
//               log.info(event)
//               if (eventData.status === 'end') {
//                 log.info(`${this.ctx.name} live telah selesai!`)
//                 this.emit('finish')
//               }
//               else {
//                 // log.info(JSON.stringify(eventData, null, 4))
//               }
//             }
//             else {
//               log.info('Anomaly')
//               log.info(JSON.stringify(data, null, 4))
//               // log.info('Event Type:', event.eventType)
//             }
//           }
//           else {
//             log.info('Anomaly')
//             log.info(JSON.stringify(data.payload, null, 4))
//             // log.info(JSON.stringify(data.payload, null, 4))
//           }
//           // log.info(JSON.stringify(data, null, 4))
//         }
//         else if (data.type === 'ka') {
//           //
//         }
//         else if (data.type === 'start_ack') {
//           log.info(this.ctx.name, 'Live info auth success!')
//         }
//         else {
//           log.info('Anomaly')
//           log.info(JSON.stringify(data, null, 4))
//         }
//       }
//       catch (e) {
//         log.error(raw)
//         log.error(e)
//       }
//     }

//     socket.value.onerror = (error) => {
//       console.log(error)
//     }
//   }

//   async function getPinnedMessage() {
//     const res = await $fetch<{ data?: IDN.PinnedMessage }>(`${config.public.api_second}/api/pin`, {
//       query: {
//         slug: data.slug,
//       },
//     })
//     if (res.data) {
//       pinnedMessage.value = res.data
//     }
//   }

//   function getLiveInfoSocketQuery(): string {
//     const value = {
//       'host': c.liveInfo,
//       'x-api-key': c.liveInfoX,
//     }
//     const header = Buffer.from(JSON.stringify(value)).toString('base64')
//     const payload = Buffer.from(JSON.stringify({})).toString('base64')
//     return `graphql?header=${header}&payload=${payload}`
//   }

//   async function fetchToken(data: IDNLivesDetail): Promise< { uuid: string, token: string } | null> {
//     if (!uuid.value) uuid.value = crypto.randomUUID()
//     try {
//       const token = await $fetch<{ uuid: string, token: string }>(`${config.public.api_second}/api/token`, {
//         query: {
//           slug: data.slug,
//           username: data.user?.username,
//           uuid: uuid.value,
//         },
//       })

//       return token
//     }
//     catch (e) {
//       console.error(e)
//       return null
//     }
//   }

//   onMounted(() => {
//     nextTick(async () => {
//       await prepareSocket(data)
//       getPinnedMessage()
//     })
//   })

//   function destroySocket() {
//     if (socket.value) {
//       socket.value.close(3030, 'Manual Stop')
//     }
//   }

//   onBeforeUnmount(() => {
//     destroySocket()
//   })

//   return {
//     comments,
//     delayedComments,
//     pinnedMessage,
//     //   onViewer: commentEvent.on,
//   }
// }
