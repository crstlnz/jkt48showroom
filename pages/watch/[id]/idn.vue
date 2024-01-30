<script setup lang="ts">
const route = useRoute()
const { data, pending, error } = await useApiFetch<IDNLivesDetail>(`/api/watch/${route.params.id}/idn`)
const title = computed(() => {
  const name = data.value?.user?.name
  return name ? `${name} - IDN Live` : ''
})

const { width, height } = useWindowSize()

const isLandscape = computed(() => {
  return width.value >= height.value
})
const streamURLs = computed(() => {
  if (!data.value?.stream_url) return []
  return [
    {
      is_default: true,
      url: data.value.stream_url,
      type: 'hls',
      id: 1,
      label: 'Original',
      quality: 1,
    },
  ]
})

useHead({
  title: () => title.value,
})

// useIDNComment(data)

const videoIsLandscape = ref(true)
const { isMobile } = useDevice()

function setVideoLandscape(val: boolean) {
  console.log(val)
  videoIsLandscape.value = val
}
</script>

<template>
  <div class="h-full">
    <div v-if="pending" class="flex justify-center items-center w-full aspect-video">
      <div class="aspect-video w-20 max-w-[40%]">
        <Icon name="svg-spinners:ring-resize" class="w-full h-full" />
      </div>
    </div>
    <div v-else-if="error">
      <Error :message="error.statusMessage || ''" :img-src="error.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
    <div v-else-if="!data?.is_live" class="flex flex-col gap-6">
      <div class="flex flex-col gap-5 items-center flex-1 bg-container py-7 md:py-16 px-10">
        <NuxtImg :src="`${$cloudinaryURL}/assets/svg/web/video_files.svg`" class="mx-auto w-[450px] max-w-[70%] dark:brightness-90" alt="" />
        <div>{{ $t('streamoffline') }}</div>
      </div>
      <div class="flex gap-3 mx-6">
        <NuxtLink :to="`/member/${data?.member_info?.key}`" class="w-28 md:w-36 max-w-[40%]">
          <NuxtImg :src="data?.member_info?.img || $errorPicture" size="64px" class="w-full aspect-[5/6] object-cover rounded-xl" />
        </NuxtLink>
        <div>
          <div class="text-xl font-semibold">
            {{ data?.member_info?.name }}
          </div>
          <NuxtLink :to="`/member/${data?.member_info?.key}`" class="text-red-500">
            Open profile
          </NuxtLink>
        </div>
      </div>
    </div>
    <div v-else class="max-md:w-full md:max-h-[100vh] flex flex-col items-center mx-auto relative overflow-hidden">
      <ClientOnly>
        <div
          class="relative flex flex-col gap-3 overflow-hidden transition-all duration-300"
          :class="{
            'w-full aspect-[13.5/9] sm:aspect-[15/9]': videoIsLandscape,
            'h-[calc(100dvh_-_60px)]': !videoIsLandscape,
            'w-full': isMobile || !isLandscape,
            'aspect-[9/16]': !videoIsLandscape && !isMobile,
          }"
        >
          <NuxtLink :to="$idnLiveUrl(data?.user?.username || '', data?.slug || '')" target="_blank" :external="true" no-prefetch class="absolute top-0 left-0 z-20 p-4 mt-0.5">
            <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/b/ba/IDN_Live.svg" size="64px" class="w-20 md:w-24" />
          </NuxtLink>
          <div class="absolute right-0 top-0 px-2 md:px-3 py-1 text-base font-semibold text-white z-20 bg-black/40 rounded-xl m-3">
            {{ data?.user?.name }}
          </div>
          <Suspense>
            <template #fallback>
              <div
                class="max-h-[100vh] bg-black/50 flex-1 bg-container"
                :class="(videoIsLandscape && isLandscape) ? 'w-full' : isMobile ? 'h-[calc(100dvh_-_60px)]' : 'h-[100dvh] max-h-[1200px]'"
              />
            </template>
            <LazyWatchVideo
              :landscape="false"
              class="bg-container flex justify-center flex-col flex-1"
              :video-fill="!videoIsLandscape ? 'height' : 'width'"
              :class="{
                'aspect-square w-full': videoIsLandscape,
                'w-full h-full': !videoIsLandscape,
                // 'w-full': videoIsLandscape && isLandscape,
                // 'h-[calc(100dvh_-_60px_-_28px_-_24px)]': !(videoIsLandscape && isLandscape) && isMobile,
                // 'h-[calc(100dvh_-_28px_-_24px)] max-h-[1200px]': !(videoIsLandscape && isLandscape) && !isMobile,
              }"
              :poster="data?.image ?? ''"
              :sources="streamURLs"
              rotate-fill="height"
              @is-landscape="setVideoLandscape"
              @fullsceen="(isFullscreen) => {
              }"
            >
              <ClientOnly>
                <WatchIDNComment v-if="data" :idn-data="data" class="absolute inset-x-0 bottom-0 pb-10 h-[300px]" />
              </ClientOnly>
            </LazyWatchVideo>
          </Suspense>
          <!-- <div id="comment-section" class="bottom-0 inset-x-0 absolute bg-blue-500/50 p-3 text-sm max-h-[180px] overflow-y-auto overscroll-contain">
            <div>
              Comment example
            </div>
            <div>
              Comment example
            </div>
            <div>
              Comment example
            </div>
          </div> -->
          <div class="flex justify-end pr-3 md:pr-0 w-full">
            <NuxtLink target="_blank" :to="$idnLiveUrl(data?.user?.username || '', data?.slug || '')" class="mb-3 text-sm bg-red-500 self-end h-7 flex items-center text-white px-3 py-1 rounded-md">
              {{ $t('watch_on') }} IDN
            </NuxtLink>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss">
#comment-section {
  --mask: linear-gradient(to top,
      rgba(0,0,0, 1) 0,   rgba(0,0,0, 1) 70%,
      rgba(0,0,0, 0) 100%
  ) 100% 50% / 100% 100% repeat-x;
  -webkit-mask: var(--mask);
  mask: var(--mask);

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
