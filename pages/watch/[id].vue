<script lang="ts" setup>
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Ref } from 'vue'
const route = useRoute()
const roomKey = route.params.id
if (roomKey == null) { throw createError({ statusCode: 404, statusMessage: 'Page not found!' }) }
const { data, pending } = await useAsyncData('onlives', () => $fetch('/api/showroom/onlives'), { server: false })
// const { data: streamingURL } = await useAsyncData('streaming_url', () => $fetch(`/api/showroom/streaming_url?room_id=${data.value?.room_id}`))
// const messages = ref<string[]>([])
// const url = streamingURL.value?.streaming_url_list[0]?.url ?? ''
// onMounted(() => {
//   const socket = new WebSocket('wss://online.showroom-live.com')
//   socket.onopen = () => {
//     console.log('OPEN')
//     console.log(data.value)
//     socket.send(`SUB\t${(data.value as any).broadcast_key}`)
//   }
//   socket.onmessage = (msg) => {
//     const jsonstring = String(msg.data).split('\t')[2]
//     if (!jsonstring) { return }
//     const json = JSON.parse(jsonstring)
//     const code = parseInt(json.t, 10)
//     if (code === 1) {
//       messages.value.push(json.cm)
//       console.log(json.cm)
//     }
//   }
// })

const lives : Ref<IRoomLive[]> = computed(() => {
  if (!data.value) { return [] as unknown as IRoomLive[] }
  return (data.value?.onlives[0]?.lives ?? []).splice(0, 10).map((i) => {
    return {
      name: i.main_name ?? 'Sule',
      img: i.image ?? 'https://static.showroom-live.com/image/room/cover/ee38ccf437e220f7ce8149c1c8aac94d6dca66734334bdad84c94bf41e78d3e0_square_s.png?v=1670924861',
      url: i.room_url_key ?? '',
      room_id: i.room_id ?? 0,
      is_graduate: false,
      is_group: false,
      room_exists: true,
      streaming_url_list: i.streaming_url_list ?? [],
      started_at: i.started_at * 1000
    }
  })
})
// const video = ref(null)
// const { playing, tracks, currentTime, enableTrack } = useMediaControls(video, {
//   src: [{ src: 'https://hls-origin245.showroom-cdn.com/liveedge/c9557972ffee89184d73ff351abce9391a9980574d63888db053876cd0645112_source/chunklist.m3u8' }]
//   // src: (streamingURL.value?.streaming_url_list ?? []).map(i => ({ src: i.url, type: i.type }))
// })

// onMounted(() => {
//   const player = videojs('video', {
//     autoplay: true,
//     preload: 'auto',
//     controls: true,
//     sources: (streamingURL.value?.streaming_url_list ?? []).map((i) => {
//       return {
//         src: i.url,
//         type: 'application/x-mpegURL',
//         withCredentials: false
//       }
//     }),
//     html5: {
//       nativeAudioTracks: false,
//       nativeVideoTracks: false,
//       hls: {
//         overrideNative: true
//       }
//     },
//     fluid: true
//   })
// })

// interface IRoomLive {
//   name: string;
//   img: string;
//   url: string;
//   room_id: number;
//   is_graduate: boolean;
//   is_group: boolean;
//   room_exists: boolean;
//   // start_date: string;
// }

// const liveData : IRoomLive = {
//   name: data.value?.room_name ?? 'Sule',
//   img: data.value?.image_s ?? 'https://static.showroom-live.com/image/room/cover/ee38ccf437e220f7ce8149c1c8aac94d6dca66734334bdad84c94bf41e78d3e0_square_s.png?v=1670924861',
//   url: data.value?.room_url_key ?? '',
//   room_id: data.value?.room_id ?? 0,
//   is_graduate: false,
//   is_group: false,
//   room_exists: true
// }
</script>
<template>
  <div class="container py-10">
    <div v-if="!pending" class="grid gap-3 md:gap-4 xl:gap-5 dark:bg-dark-1 rounded-xl">
      <MemberLiveCard v-for="live in lives" :key="live.room_id" :live="live" />
    </div>
    <div v-else>
      Loading boi
    </div>
    <!-- <div>
      <video id="video" ref="video" class="bg-slate-200 video-js vjs-default-skin rounded-xl overflow-hidden" crossorigin="true" controls />
      <div>
        <div v-for="message in messages" :key="message">
          {{ message }}
        </div>
      </div>
    </div> -->
  </div>
</template>
