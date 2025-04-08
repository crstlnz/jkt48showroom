<script lang="ts" setup>
import type { PreviewVideo } from '#components'
import { DeferImage } from '#components'
import { useElementHover, useTimeoutFn } from '@vueuse/core'

const props = defineProps<{ live: YoutubeLive }>()
defineEmits(['refreshliveinfo'])
const $device = useDevice()
const openMenu = ref(false)
const container = ref(null)
const listener = ref<(() => void)>()
// const date = ref(props.live.started_at)
const dayjs = useDayjs()
// const dateString = $formatSR(date)
// const dateString = computed(() => dayjs(date.value).format('h:mm A'))

const hover = ref(null)
const isPreview = ref(false)
const isHovered = useElementHover(hover)
const isSupported = ref(false)
const playing = ref(false)
const preview = ref<typeof PreviewVideo>()
// const streamingURL = computed(() => {
//   return (props.live.streaming_url_list[0])?.url ?? ''
// })

useScriptTag(useAppConfig().hlsUrl, () => {
  isSupported.value = Hls.isSupported()
}, {
  defer: true,
})

watch(openMenu, (isOpen) => {
  if (isPreview.value) return
  if (isOpen) {
    if (listener.value) listener.value()
    listener.value = onClickOutside(container, () => {
      openMenu.value = false
    })
  }
  else if (listener.value) {
    listener.value()
  }
})

const { start, stop } = useTimeoutFn(() => {
  openPreview()
}, 1000, { immediate: false })

const { start: startBuffer, stop: stopBuffer } = useTimeoutFn(() => {
  if (!isPreview.value) preview.value?.buffer()
}, 400, { immediate: false })

function openPreview() {
  preview.value?.play()
  isPreview.value = true
  // playing.value = true
}

function closePreview() {
  isPreview.value = false
  preview.value?.stop()
}

const isContainerHovered = useElementHover(container)
watch(isPreview, (preview) => {
  if (!isSupported.value) return
  if (preview) {
    if (listener.value) listener.value()
    listener.value = onClickOutside(container, () => {
      openMenu.value = false
      isHovered.value = false
      closePreview()
    })
  }
  else if (listener.value && !openMenu.value) {
    listener.value()
  }
})

watch(isContainerHovered, (hovered) => {
  if (!isSupported.value) return
  if (!hovered) {
    closePreview()
  }
})

watch(isHovered, (hovered) => {
  if (!isSupported.value) return
  if (hovered) {
    start()
    startBuffer()
  }
  else {
    stop()
    stopBuffer()
    if (!isPreview.value && playing.value) {
      preview.value?.stop()
    }
  }
})

const pending = ref(false)
// async function refreshDate() {
//   pending.value = true
//   try {
//     const data = await $apiFetch<APILiveInfo>('/api/showroom/live_info', { params: { room_id: props.live.room_id } })
//     if (Array.isArray(data)) throw new TypeError('Data must be not in array')
//     // date.value = data.started_at ?? ''
//     pending.value = false
//   }
//   catch (e) {
//     console.error(e)
//     pending.value = false
//   }
// }
</script>

<template>
  <div
    ref="container"
    class="group relative z-0 aspect-20/28 origin-top overflow-hidden rounded-xl shadow-md transition-[transform,box-shadow,z-index] duration-300 md:aspect-20/26"
    :class="{ 'lg:scale=[122%] z-50 translate-y-[-10%] scale-[115%] shadow-black/50 drop-shadow-2xl dark:shadow-black/80 md:scale-[118%] xl:scale-125': isPreview, 'shadow-2xs ': !isPreview }"
  >
    <div class="flex h-full flex-col">
      <div ref="hover" :class="{ 'cursor-pointer': isSupported }" class="disable-highlight relative aspect-video">
        <DeferImage
          alt="Profile Picture"
          lazy="false"
          class="relative h-full w-full brightness-100 transition-all duration-200"
          :src="live.thumbnails.medium.url"
        />
      </div>
      <div class="flex flex-1 flex-col px-3 pb-4 pt-0.5 lg:px-4 lg:pb-5">
        <h2 class="flex-1 truncate text-sm font-bold md:text-base pt-1.5" title="">
          {{ live.title }}
        </h2>
        <div class="ext-center grid grid-cols-1 gap-2 text-sm sm:text-xs font-semibold text-white md:text-sm">
          <NuxtLink
            :to="live.url"
            :external="true"
            target="_blank"
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-500 p-2  hover:bg-red-600 md:px-4 md:py-2"
          >
            <Icon name="ic:round-videocam" />
            <span class="truncate max-sm:hidden">{{ `${$t('watch')} ${$t('at')} Youtube` }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
