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
const date = ref(props.live.started_at)
const dateString = $formatSR(date)
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
        closePreview()
      })
    } else if (listener.value && !openMenu.value) { listener.value() }
  })

  watch(isContainerHovered, (hovered) => {
    if (!hovered) {
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
    class="group relative z-0 aspect-[20/30] origin-top overflow-hidden rounded-xl bg-slate-50 transition-[transform,box-shadow,z-index] duration-300 will-change-transform dark:bg-dark-2 lg:aspect-[20/28]"
    :class="{'lg:scale=[122%] z-50 translate-y-[-10%] scale-[115%] shadow-2xl shadow-black/50 dark:shadow-black/80 md:scale-[118%] xl:scale-125': isPreview, 'shadow-sm ' : !isPreview}"
  >
    <div class="flex h-full flex-col">
      <button
        type="button"
        class="absolute right-0 z-[25] m-2 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full hover:bg-slate-500/40 hover:text-slate-700 dark:hover:text-slate-100 md:m-3 md:w-6 xl:m-4"
        :class="{
          '!text-white' : openMenu || isPreview,
          'bg-slate-500' : !openMenu || !isPreview
        }"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs text-white md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs md:text-base" />
      </button>
      <div ref="hover" :class="{'cursor-pointer' : isSupported}" class="disable-highlight relative">
        <div :class="isHovered && !isPreview && isSupported ? 'visible opacity-100' : 'invisible opacity-0'" class="absolute bottom-2 right-2 z-10 rounded-md bg-black px-1.5 py-0.5 text-xs text-white dark:bg-slate-200 dark:text-black">
          Hover Me
        </div>
        <div section="preview-on" :class="{'visible opacity-100': isPreview, 'invisible opacity-0' : !isPreview}" class="absolute inset-x-0 top-0 z-20 transition-opacity duration-[400ms]">
          <NuxtLink :to="`/watch/${live.url}`">
            <LazyPreviewVideo ref="preview" :src="streamingURL" :playing="playing" />
          </NuxtLink>
        </div>
        <div section="preview-off" :class="{'bg-slate-200 dark:bg-dark-1/60' : isHovered && !isPreview && isSupported}" class="relative top-0 aspect-video overflow-hidden rounded-t-xl transition-colors">
          <div class="relative inset-0 flex h-full items-end justify-center">
            <div
              :class="{ 'pointer-events-none': openMenu }"
              class="z-[1] inline-block h-full w-full overflow-hidden"
              no-prefetch
            >
              <LazyImage
                lazy="false"
                class="relative h-full w-full brightness-100 transition-all duration-200"
                :src="$fixCloudinary(live.img)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-1 flex-col px-2 pb-3 md:px-3 md:pb-4 lg:px-4 lg:pb-5">
        <div class="mb-1 mt-2 flex flex-wrap items-center gap-1.5">
          <div
            :class="live.is_group ? 'bg-sky-400' : live.is_graduate ? 'bg-red-500' : 'bg-green-500'"
            class="flex aspect-square h-5 select-none items-center justify-center rounded-full text-white"
            :title="`${live.is_group ? 'Official' : live.is_graduate ? 'Graduated' : 'Active'} Member`"
          >
            <Icon
              :name="
                live.is_group ? 'ph:check-circle-fill' : live.is_graduate ? 'ph:graduation-cap-fill' : 'ph:microphone-stage-fill'
              "
              class="i aspect-square text-xs font-bold md:text-xs"
            />
            <div class="text-xs leading-5 md:font-semibold" />
          </div>
          <div
            class="inline-block h-5 rounded-md bg-red-500 px-1.5 align-middle text-xs leading-5 text-white md:font-semibold"
            :title="dateString ? $t('date.started',{date:dateString}) : 'Start date not provided'"
          >
            <div v-if="dateString">
              {{ dateString }}
            </div>
            <div v-else>
              Error
              <Icon v-if="pending" name="bx:loader-alt" class="animate-spin" />
              <button v-else type="button" @click="refreshDate">
                <Icon name="ion:md-refresh" class="self-center text-base" />
              </button>
            </div>
          </div>
        </div>
        <h2 class="flex-1 truncate text-base font-bold md:text-lg" :title="live.name">
          {{ live.name }}
        </h2>
        <div class="flex items-center gap-1.5 md:gap-2 xl:gap-2.5" />
        <a
          :tabindex="openMenu ? -1 : undefined"
          :href="$liveURL(live.url)"
          target="_blank"
          class="mx-auto mt-auto flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-500 p-2 text-center text-xs font-semibold text-white hover:bg-blue-600 sm:text-sm md:px-5 md:py-3 md:text-base lg:rounded-2xl"
        ><Icon name="ph:video-camera-fill" class="seft-center text-base md:text-lg" /> {{ $t('viewlive') }}</a>
      </div>
      <div
        class="visible absolute left-0 top-0 z-20 flex h-full w-full flex-col justify-center rounded-t-xl bg-red-500 p-3 text-white transition-[transform,visibility] duration-300 sm:p-4 md:p-5"
        :class="{ 'invisible translate-y-full': !openMenu }"
      >
        <ul
          :class="{ 'no-scrollbar': $device.isMobile }"
          class="flex max-h-[75%] flex-col overflow-hidden overflow-y-auto text-lg [&>li]:my-3 [&>li]:cursor-pointer [&>li]:px-4 [&>li]:text-center [&>li]:font-semibold"
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
