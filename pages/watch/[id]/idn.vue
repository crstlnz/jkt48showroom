<script setup lang="ts">
const route = useRoute()
const { data, pending, error } = await useApiFetch<IDNLives>(`/api/watch/${route.params.id}/idn`)
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
</script>

<template>
  <div class="h-full">
    <div v-if="!error" class="max-md:w-full md:max-h-[100vh] flex flex-col items-center mx-auto relative" :class="{ 'h-full': !videoIsLandscape && !isLandscape }">
      <ClientOnly>
        <div class="relative bg-contain flex flex-col h-full gap-3" :class="{ 'w-full': videoIsLandscape || !isLandscape }">
          <NuxtLink :to="$idnLiveUrl(data?.user?.username || '', data?.slug || '')" target="_blank" :external="true" no-prefetch class="absolute top-0 left-0 z-20 p-4 mt-0.5">
            <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/b/ba/IDN_Live.svg" size="64px" class="w-20 md:w-24" />
          </NuxtLink>
          <div v-if="!pending" class="absolute right-0 top-0 px-2 md:px-3 py-1 text-base font-semibold text-white z-20 bg-black/40 rounded-xl m-3">
            {{ data?.user?.name }}
          </div>
          <div v-if="pending" class="w-full h-full" />
          <Suspense v-else>
            <template #fallback>
              <div
                class="max-h-[100vh] bg-black/50"
                :class="(videoIsLandscape && isLandscape) ? 'w-full' : isMobile ? 'h-[calc(100dvh_-_60px)]' : 'h-[100dvh] max-h-[1200px]'"
              />
            </template>
            <LazyWatchVideo
              :landscape="false"
              class="max-h-[100vh]"
              :class="(videoIsLandscape && isLandscape) ? 'w-full' : isMobile ? 'h-[calc(100dvh_-_60px_-_28px_-_24px)]' : 'h-[calc(100dvh_-_28px_-_24px)] max-h-[1200px]'"
              :poster="data?.image ?? ''"
              :sources="streamURLs" @is-landscape="(l) => videoIsLandscape = l" @fullsceen="(isFullscreen) => {
              }"
            />
          </Suspense>
          <!-- <div id="comment-section" class="bottom-0 inset-x-0 absolute bg-blue-500/50 p-3 text-sm max-h-[180px] overflow-y-auto overscroll-contain">
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
            </div>
            <div>
              Comment section
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
    <div v-else>
      <Error :message="error.statusMessage || ''" :img-src="error.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
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
