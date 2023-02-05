<script lang="ts" setup>
import Hls from 'hls.js/dist/hls.min.js'
import { useElementHover, useTimeoutFn } from '@vueuse/core'
import { LazyImage, PreviewVideo } from '#components'
const { $formatSR } = useNuxtApp()
const props = defineProps<{ live: IRoomLive}>()
defineEmits(['refreshliveinfo'])
const openMenu = ref(false)
const container = ref(null)
const listener = ref<(() => void)>()
console.log(props.live.started_at)
const date = ref(props.live.started_at)
const dateString = $formatSR(date)
console.log(dateString.value)
watch(openMenu, (isOpen) => {
  if (isPreview.value) { return }
  if (isOpen) {
    if (listener.value) { listener.value() }
    listener.value = onClickOutside(container, () => {
      openMenu.value = false
    })
  } else if (listener.value) { listener.value() }
})

const hover = ref(null)
const isPreview = ref(false)
const isHovered = useElementHover(hover)
const isSupported = ref(Hls.isSupported())
const playing = ref(false)
const preview = ref<typeof PreviewVideo>()
const streamingURL = computed(() => {
  return (props.live.streaming_url_list.find(i => i.id === 3 || i.id === 4) ?? props.live.streaming_url_list[0])?.url ?? ''
})
const { start, stop } = useTimeoutFn(() => {
  openPreview()
}, 1000, { immediate: false })

const { start: startBuffer, stop: stopBuffer } = useTimeoutFn(() => {
  if (!isPreview.value) { preview.value?.buffer() }
}, 400, { immediate: false })

function openPreview () {
  preview.value?.play()
  isPreview.value = true
  // playing.value = true
}

function closePreview () {
  isPreview.value = false
  preview.value?.stop()
}

if (isSupported.value) {
  const isContainerHovered = useElementHover(container)
  watch(isPreview, (preview) => {
    if (preview) {
      if (listener.value) { listener.value() }
      listener.value = onClickOutside(container, () => {
        openMenu.value = false
        isHovered.value = false
        console.log('CLOSE 1')
        closePreview()
      })
    } else if (listener.value && !openMenu.value) { listener.value() }
  })

  watch(isContainerHovered, (hovered) => {
    if (!hovered) {
      console.log('CLOSE 2')
      closePreview()
    }
  })

  watch(isHovered, (hovered) => {
    if (hovered) {
      start()
      startBuffer()
    } else {
      stop()
      stopBuffer()
      if (!isPreview.value && playing.value) {
        preview.value?.stop()
      }
    }
  })
}
// const { pending, data, error, refresh } = await useFetch('/api/showroom/live_info', { params: { room_id: props.live.room_id }, immediate: false })
const pending = ref(false)
async function refreshDate () {
  pending.value = true
  try {
    const data = await $fetch('/api/showroom/live_info', { params: { room_id: props.live.room_id } })
    if (Array.isArray(data)) { throw new TypeError('Data must be not in array') }
    date.value = data.started_at ?? ''
    pending.value = false
  } catch (e) {
    // console.log(e)
    pending.value = false
  }
}
</script>

<template>
  <div
    ref="container"
    class="aspect-[20/27] lg:aspect-[20/26] bg-slate-50 dark:bg-dark-2 rounded-xl overflow-hidden origin-top transition-[transform,box-shadow,z-index] z-0 group relative will-change-transform duration-300"
    :class="{'scale-[110%] md:scale-[115%] lg:scale=[120%] xl:scale-125 -translate-y-[10%] shadow-2xl z-50': isPreview, 'shadow-md' : !isPreview}"
  >
    <div class="pb-6 md:pb-8 xl:pb-10 h-full flex flex-col">
      <button
        type="button"
        class="aspect-square w-5 md:w-6 rounded-full flex justify-center items-center cursor-pointer select-none z-[25] hover:bg-slate-500/40 hover:text-slate-700 dark:hover:text-slate-100 absolute right-0 m-2 md:m-3 xl:m-4"
        :class="{
          '!text-white' : openMenu || isPreview,
        }"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs md:text-base" />
      </button>
      <div ref="hover" :class="{'cursor-pointer' : isSupported}" class="relative disable-highlight">
        <div :class="isHovered && !isPreview && isSupported ? 'visible opacity-100' : 'invisible opacity-0'" class="z-10 absolute bottom-2 right-2 bg-black dark:bg-slate-200 text-white dark:text-black text-xs px-1.5 py-0.5 rounded-md">
          Hover Me
        </div>
        <div section="preview-on" :class="{'opacity-100 visible': isPreview, 'invisible opacity-0' : !isPreview}" class="absolute top-0 left-0 right-0 z-20 transition-opacity duration-[400ms]">
          <PreviewVideo ref="preview" :src="streamingURL" :playing="playing" />
        </div>
        <div section="preview-off" :class="{'bg-slate-200 dark:bg-dark-1/60' : isHovered && !isPreview && isSupported}" class="aspect-video relative top-0 overflow-hidden rounded-t-xl transition-colors p-2 md:p-3 lg:p-4 !pb-1.5 md:!pb-2 lg:!pb-2.5">
          <div class="relative flex items-end justify-center left-0 right-0 top-0 bottom-0 h-full">
            <div
              :class="live.is_group ? 'bg-sky-400' : live.is_graduate ? 'bg-red-500' : 'bg-green-500'"
              class="aspect-square w-5 md:w-6 rounded-full flex justify-center items-center text-white select-none absolute top-0 left-0"
              :title="`${live.is_group ? 'Official' : live.is_graduate ? 'Graduated' : 'Active'} Member`"
            >
              <Icon
                :name="
                  live.is_group ? 'ic:round-check font-bold' : live.is_graduate ? 'ph:graduation-cap' : 'ph:microphone-stage'
                "
                class="i aspect-square text-xs md:text-sm"
              />
            </div>
            <div
              :class="{ 'pointer-events-none': openMenu }"
              class="h-16 md:h-20 lg:h-28 aspect-square drop-shadow-sm gap-0.5 rounded-full overflow-hidden inline-block max-h-[85%]"
              no-prefetch
            >
              <LazyImage
                lazy="false"
                class="brightness-100 relative transition-all duration-200 w-full h-full"
                :src="$fixCloudinary(live.img)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="px-2 md:px-3 lg:px-4 text-center flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-3.5 pt-1 md:pt-1.5 lg:pt-2 flex-1">
        <h2 class="font-bold text-sm md:text-lg text-center truncate" :title="live.name">
          {{ live.name }}
        </h2>
        <div>
          <div
            class="bg-red-500 rounded-xl px-2 py-1 md:px-3 md:py-2 text-white md:font-semibold inline-block align-middle leading-3 text-[10px] md:text-[11px] xl:text-xs"
          >
            <div v-if="dateString">
              {{ dateString }}
            </div>
            <div v-else>
              Error
              <Icon v-if="pending" name="bx:loader-alt" class="animate-spin" />
              <button v-else type="button" @click="refreshDate">
                <Icon name="ion:md-refresh" class="text-base self-center" />
              </button>
            </div>
          </div>
        </div>
        <!-- <div v-else class="h-6 md:h-8 w-[74px] animate-pulse bg-red-500 mx-auto rounded-xl" /> -->
        <a
          :tabindex="openMenu ? -1 : undefined"
          :href="$liveURL(live.url)"
          target="_blank"
          class="mt-auto flex justify-center items-center gap-1.5 w-full text-center p-2 md:px-5 md:py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-xl mx-auto font-semibold text-white text-xs sm:text-sm md:text-base"
        ><Icon name="ph:video-camera-fill" class="seft-center text-base md:text-lg" /> {{ $t('viewlive') }}</a>
      </div>
      <div
        class="absolute visible flex flex-col justify-center p-3 sm:p-4 md:p-5 bg-red-500 top-0 left-0 w-full h-full transition-[transform,visibility] duration-300 rounded-t-xl text-white z-20"
        :class="{ 'translate-y-full invisible': !openMenu }"
      >
        <ul
          :class="{ 'no-scrollbar': $device.isMobile }"
          class="flex flex-col text-lg [&>li]:cursor-pointer [&>li]:font-semibold [&>li]:my-3 [&>li]:px-4 [&>li]:text-center max-h-[75%] overflow-hidden overflow-y-auto"
        >
          <li>
            <NuxtLink to="/" no-prefetch>
              Profile
            </NuxtLink>
          </li>
          <li>
            <a target="_blank" :href="$profileURL(live.room_id)">Showroom</a>
          </li>
          <li>
            <a
              target="_blank"
              class="twitter-share-button"
              :href="$tweetURL(`${live.name}%20Broadcasting!%0Ahttps://www.showroom-live.com/r${live.url.startsWith('/') ? '' : '/'}${live.url}?t=${Math.floor(new Date().getTime()/1000)}`)"
              data-size="large"
            >
              Tweet</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
