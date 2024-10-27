// export default function (data: Ref<IDNLives | null>) {
//   const config = useRuntimeConfig()
//   const error = ref(null)
//   const socket = ref()
//   const socketChatHost = (region: string) => `wss://edge.ivschat.${region}.amazonaws.com`
//   const awsRegion = 'us-east-1'

//   async function prepareSocket(data: IDNLives) {
//     const res = await fetchToken(data)
//     if (res) {
//       createSocket(res.token)
//     }
//   }

//   async function createSocket(token: string) {
//     const socket = new WebSocket(socketChatHost(awsRegion), [token])
//     socket.onopen = () => {
//       console.log('Socket open!')
//     }

//     socket.onmessage = (msg) => {
//       const data = JSON.parse(msg.data) as any
//       console.log(data)
//     }
//   }

//   async function fetchToken(data: IDNLives): Promise< { uuid: string, token: string } | null> {
//     try {
//       const token = await $fetch<{ uuid: string, token: string }>(`${config.public.api_second}/api/token`, {
//         query: {
//           slug: data.slug,
//           username: data.user.username,
//         },
//       })

//       return token
//     }
//     catch (e) {
//       console.error(e)
//       return null
//     }
//   }

//   watch(data, async (d) => {
//     if (process.server) return
//     if (d) {
//       await prepareSocket(d)
//     }
//   }, {
//     immediate: true,
//   })
// }
