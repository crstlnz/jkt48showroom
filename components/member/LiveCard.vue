<script lang="ts" setup>
import Hls from 'hls.js/dist/hls.min.js'
import { useElementHover, useTimeoutFn } from '@vueuse/core'
import type { PreviewVideo } from '#components'
import { LazyImage } from '#components'

const props = defineProps<{ live: IRoomLive }>()
defineEmits(['refreshliveinfo'])
const $device = useDevice()
const openMenu = ref(false)
const container = ref(null)
const listener = ref<(() => void)>()
const date = ref(props.live.started_at)
const dayjs = useDayjs()
// const dateString = $formatSR(date)
const dateString = computed(() => dayjs(date.value).format('h:mm A'))

const hover = ref(null)
const isPreview = ref(false)
const isHovered = useElementHover(hover)
const isSupported = ref(Hls.isSupported())
const playing = ref(false)
const preview = ref<typeof PreviewVideo>()
const streamingURL = computed(() => {
  return (props.live.streaming_url_list.find(i => i.id === 3 || i.id === 4) ?? props.live.streaming_url_list[0])?.url ?? ''
})

watch(openMenu, (isOpen) => {
  if (isPreview.value) return
  if (isOpen) {
    if (listener.value) listener.value()
    listener.value = onClickOutside(container, () => {
      openMenu.value = false
    })
  }
  else if (listener.value) listener.value()
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

if (isSupported.value) {
  const isContainerHovered = useElementHover(container)
  watch(isPreview, (preview) => {
    if (preview) {
      if (listener.value) listener.value()
      listener.value = onClickOutside(container, () => {
        openMenu.value = false
        isHovered.value = false
        closePreview()
      })
    }
    else if (listener.value && !openMenu.value) listener.value()
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
    }
    else {
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
async function refreshDate() {
  pending.value = true
  try {
    const data = await $fetch('/api/showroom/live_info', { params: { room_id: props.live.room_id } })
    if (Array.isArray(data)) throw new TypeError('Data must be not in array')
    date.value = data.started_at ?? ''
    pending.value = false
  }
  catch (e) {
    // console.log(e)
    pending.value = false
  }
}
</script>

<template>
  <div
    ref="container"
    class="group relative z-0 aspect-[20/28] origin-top overflow-hidden rounded-xl shadow-md transition-[transform,box-shadow,z-index] duration-300 will-change-transform md:aspect-[20/26]"
    :class="{ 'lg:scale=[122%] z-50 translate-y-[-10%] scale-[115%] shadow-black/50 drop-shadow-2xl dark:shadow-black/80 md:scale-[118%] xl:scale-125': isPreview, 'shadow-sm ': !isPreview }"
  >
    <div class="flex h-full flex-col">
      <button
        type="button"
        class="absolute right-0 z-[25] m-2 flex aspect-square w-5 cursor-pointer select-none items-center justify-center rounded-full hover:bg-zinc-500 hover:text-slate-700 dark:hover:text-slate-100 md:m-3 md:w-6 xl:m-4"
        :class="{
          '!text-white': openMenu || isPreview,
          'bg-zinc-500/60': !openMenu || !isPreview,
        }"
        @click="openMenu = !openMenu"
      >
        <Icon v-if="!openMenu" name="ph:dots-three-outline-fill" class="aspect-square text-xs text-white md:text-base" />
        <Icon v-else name="ph:x-bold" class="aspect-square text-xs md:text-base" />
      </button>
      <div ref="hover" :class="{ 'cursor-pointer': isSupported }" class="disable-highlight relative">
        <div :class="isHovered && !isPreview && isSupported ? 'visible opacity-100' : 'invisible opacity-0'" class="absolute bottom-2 right-2 z-10 rounded-md bg-black px-2 py-1 text-xs text-white dark:bg-slate-100 dark:text-black">
          Keep Hover
        </div>
        <div section="preview-on" :class="{ 'visible opacity-100': isPreview, 'invisible opacity-0': !isPreview }" class="absolute inset-x-0 top-0 z-20 transition-opacity duration-[400ms]">
          <LazyPreviewVideo v-if="!live.is_premium" ref="preview" :src="streamingURL" :playing="playing" />
          <div v-else class="flex aspect-video h-full w-full items-center justify-center bg-black/90 font-bold text-white">
            {{ $t("premium_live") }}
          </div>
        </div>
        <div section="preview-off" :class="{ 'bg-slate-200 dark:bg-dark-1/60': isHovered && !isPreview && isSupported }" class="relative top-0 aspect-video overflow-hidden rounded-t-xl transition-colors">
          <div class="relative inset-0 flex h-full items-end justify-center">
            <div
              :class="{ 'pointer-events-none': openMenu }"
              class="z-[1] inline-block h-full w-full overflow-hidden"
              no-prefetch
            >
              <LazyImage
                alt="Profile Picture"
                lazy="false"
                class="relative h-full w-full brightness-100 transition-all duration-200"
                :src="$fixCloudinary(live.img)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-1 flex-col px-3 pb-4 pt-0.5 lg:px-4 lg:pb-5">
        <div class="mb-1 mt-2 flex flex-wrap items-center gap-1.5">
          <div
            :class="live.is_group ? 'bg-sky-400' : live.is_graduate ? 'bg-red-500' : 'bg-green-500'"
            class="flex aspect-square h-4 select-none items-center justify-center rounded-full p-1 text-white md:h-5"
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
            v-if="!live.is_premium"
            class="inline-block h-4 rounded-md bg-gray-500 px-1.5 align-middle text-[10px] leading-4 text-white md:h-5 md:text-xs md:font-semibold md:leading-5"
            :title="dateString ? $t('date.started', { date: dateString }) : 'Start date not provided'"
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
          <div v-else class="inline-block h-4 rounded-md bg-gray-500 px-1.5 align-middle text-[10px] leading-4 text-white md:h-5 md:text-xs md:font-semibold md:leading-5">
            Premium Live
          </div>
        </div>
        <h2 class="flex-1 truncate text-sm font-bold md:text-base" :title="live.name">
          {{ live.name }}
        </h2>
        <div class="ext-center grid grid-cols-2 gap-2 text-xs font-semibold text-white md:text-sm">
          <NuxtLink
            :to="`/watch/${live.url}`"
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-500 p-2  hover:bg-red-600 md:px-4 md:py-2"
          >
            <Icon name="ic:round-videocam" class="text-sm md:text-base" />
            <span class="truncate">Open</span>
          </NuxtLink>
          <a
            :tabindex="openMenu ? -1 : undefined"
            :href="$liveURL(live.url)"
            target="_blank"
            class="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-500 p-2 hover:bg-blue-600 md:px-4 md:py-2"
          >
            <Icon name="octicon:link-external-16" />
            <span class="truncate">View</span>
          </a>
        </div>
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
            <NuxtLink :to="`/member/${live.url}`" no-prefetch>
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
              :href="$tweetURL(`${live.name}%20Broadcasting!%0Ahttps://www.showroom-live.com/r${live.url.startsWith('/') ? '' : '/'}${live.url}?t=${Math.floor(new Date().getTime() / 1000)}`)"
              data-size="large"
            >
              Tweet</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
