<script lang="ts" setup>
import type { PreviewVideo } from '#components'
import { DeferImage } from '#components'
import { useElementHover, useTimeoutFn } from '@vueuse/core'

const props = defineProps<{ live: INowLive }>()
defineEmits(['refreshliveinfo'])
const $device = useDevice()
const openMenu = ref(false)
const container = ref(null)
const listener = ref<(() => void)>()
const hover = ref(null)
const isPreview = ref(false)
const isHovered = useElementHover(hover)
const isSupported = ref(false)
const playing = ref(false)
const preview = ref<typeof PreviewVideo>()
const streamingURL = computed(() => props.live.streaming_url_list?.[0].url)

useScriptTag(useAppConfig().hlsUrl, () => {
  isSupported.value = Hls.isSupported()
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
</script>

<template>
  <div
    ref="container"
    class="group relative z-0 aspect-[20/28] origin-top overflow-hidden rounded-xl shadow-md transition-[transform,box-shadow,z-index] duration-300 will-change-transform md:aspect-[20/26]"
    :class="{ 'lg:scale=[122%] z-50 translate-y-[-10%] scale-[115%] shadow-black/50 drop-shadow-2xl dark:shadow-black/80 md:scale-[118%] xl:scale-125': isPreview, 'shadow-sm ': !isPreview }"
  >
    <div class="flex h-full w-full flex-col">
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
      <!-- <NuxtLink ref="hover" :to="$idnLiveUrl(live.url_key ?? '', live.slug ?? '')" :external="true" target="_blank" :class="{ 'cursor-pointer': isSupported }" class="disable-highlight relative w-full h-full"> -->
      <NuxtLink ref="hover" :to="`/watch/${live.url_key}/idn`" :class="{ 'cursor-pointer': isSupported }" class="disable-highlight relative w-full h-full">
        <div :class="isHovered && !isPreview && isSupported ? 'visible opacity-100' : 'invisible opacity-0'" class="absolute bottom-10 left-3 md:bottom-11 md:left-4 z-40 rounded-md bg-black px-2 py-1 text-xs text-white dark:bg-slate-100 dark:text-black">
          Keep Hover
        </div>
        <div section="preview-on" :class="{ 'visible opacity-100': isPreview, 'invisible opacity-0': !isPreview }" class="absolute h-full w-full inset-x-0 top-0 z-20 transition-opacity duration-[400ms]">
          <LazyPreviewVideo ref="preview" :use-proxy="true" :src="streamingURL" :playing="playing" class="w-full h-full" />
        </div>
        <div section="preview-off" :class="{ 'bg-slate-200 dark:bg-dark-1/60': isHovered && !isPreview && isSupported }" class="relative top-0 w-full h-full overflow-hidden rounded-t-xl transition-colors">
          <div class="relative inset-0 flex h-full items-end justify-center">
            <div
              :class="{ 'pointer-events-none': openMenu }"
              class="z-[1] inline-block h-full w-full overflow-hidden"
              no-prefetch
            >
              <DeferImage
                alt="Profile Picture"
                lazy="false"
                class="relative h-full w-full brightness-100 transition-all duration-200"
                :src="$fixCloudinary(live.img)"
              />
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
    <div class="absolute top-0 left-0 z-20 p-3 md:p-4 pointer-events-none">
      <NuxtLink class="pointer-events-auto" :to="$idnLiveUrl(live?.url_key ?? '0', live?.slug ?? '0')" target="_blank" :external="true" no-prefetch>
        <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/b/ba/IDN_Live.svg" size="64px" class="w-16" />
      </NuxtLink>
    </div>
    <div class="absolute bottom-0 left-0 z-20 font-semibold w-full pointer-events-none">
      <div class="flex gap-1.5 items-center p-3 md:p-4 relative">
        <div class="shadow-bawah z-10" />
        <div class="flex gap-1.5 items-center z-20 w-full">
          <div class="text-white truncate text-sm md:text-base w-0 flex-1">
            {{ live.name }}
          </div>
          <!-- <div class="bg-red-500 px-1.5 rounded-sm text-xs text-white">
            IDN
          </div> -->
        </div>
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
          <NuxtLink :to="$idnLiveUrl(live?.url_key ?? '0', live?.slug ?? '0')" target="_blank" :external="true" no-prefetch>
            Buka di IDN
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.shadow-bawah {
  display: block;
  position: absolute;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, #000 100%);
  content: '';
  top:0;
  right:0;
  bottom:0;
  left:0;
  opacity: 0.8;
}
</style>
