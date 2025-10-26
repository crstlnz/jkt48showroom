// import { useMembers } from './members'
// import { useNotifications } from './notifications'
// import JSONSerializer from '~/library/serializer/json'

// export const useIDNLives = defineStore('useIDNLives', () => {
//   const { data: lives, pending, error, refresh, tryRefresh } = useLocalStoreController<IDNLives[] | null>('idnLivess', {
//     fetch: getIDNLives,
//     expiredIn: 6000,
//     serializer: new JSONSerializer<IDNLives[] | null>(null),
//   })

//   const { members, tryRefresh: refreshMember } = useMembers()

//   const hasLives = computed(() => {
//     return (lives.value?.length || 0) > 0
//   })

//   const liveCount = computed(() => lives.value?.length || 0)

//   const livesMap = computed(() => {
//     const map = new Map()
//     if (!lives.value) return map
//     for (const live of (lives.value ?? [])) {
//       map.set(live.user.username, live)
//     }
//     return map
//   })

//   const { addNotif } = useNotifications()

//   async function alternativeFetch(): Promise<IDNLives[]> {
//     return await $apiFetch<IDNLives[]>(`/api/idn_lives`).catch(() => {
//       addNotif({
//         type: 'danger',
//         message: 'Failed to get IDN Lives Data!',
//       })
//       return []
//     })
//   }

//   async function getIDNLives(): Promise<IDNLives[]> {
//     await refreshMember()
//     const idnUsernames: string[] = members?.filter(i => i.idn_username).map(i => i.idn_username) as string[] || []
//     if (!idnUsernames?.length) {
//       return await alternativeFetch()
//     }

//     try {
//       const res = await $fetch<any>(`https://api.idn.app/graphql`, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         method: 'POST',
//         body: JSON.stringify({
//           query:
//                 'query SearchLivestream { searchLivestream(query: "", limit: 1000) { next_cursor result { slug title image_url view_count playback_url room_identifier status live_at end_at scheduled_at gift_icon_url category { name slug } creator { uuid username name avatar bio_description following_count follower_count is_follow } } }}',
//         }),
//       })

//       const data: IDNLives[] = res?.data?.searchLivestream?.result?.map((i: any) => {
//         return {
//           user: {
//             id: i.creator?.uuid,
//             name: i.creator?.name,
//             username: i.creator?.username,
//             avatar: i.creator?.avatar,
//           },
//           image: i.image_url,
//           stream_url: i.playback_url,
//           title: i.title,
//           slug: i.slug,
//           view_count: i.view_count,
//           live_at: new Date(i.live_at).toISOString(),
//         }
//       }) || []

//       const additionalUsername = ['jkt48-official']
//       idnUsernames.push(...additionalUsername)
//       const config = useRuntimeConfig()
//       const filtered = data.filter(i => idnUsernames.includes(i.user.username))
//       if (config.public.isDev && !filtered.length) {
//         return data.slice(0, 5)
//       }
//       return filtered
//     }
//     catch (e) {
//       return await alternativeFetch()
//     }
//   }

//   function isLive(username: string) {
//     return livesMap.value?.has(username)
//   }

//   return {
//     data: lives,
//     hasLives,
//     liveCount,
//     pending,
//     error,
//     tryRefresh,
//     refresh,
//     isLive,
//   }
// })

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useIDNLives, import.meta.hot))
// }
