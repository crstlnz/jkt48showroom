<script setup lang="ts">
const route = useRoute()
const { data, pending, error, refresh: refreshWatchData } = await useApiFetch<IDNLives>(`/api/watch/${route.params.id}/idn`, { params: { _: new Date().getTime() } })
const streamURLs = computed(() => {
  console.log(data.value?.stream_url)
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
</script>

<template>
  <div class="">
    <div v-if="!error" class="max-md:w-full md:max-h-[100vh] mx-auto aspect-[9/16] relative bg-container">
      <NuxtLink :to="`https://idn.app/${data?.user?.username}/live/${data?.slug}`" target="_blank" :external="true" no-prefetch class="absolute top-0 left-0 z-20 p-4 mt-0.5">
        <NuxtImg src="https://upload.wikimedia.org/wikipedia/commons/b/ba/IDN_Live.svg" size="64px" class="w-20 md:w-24" />
      </NuxtLink>
      <div v-if="!pending" class="absolute right-0 top-0 px-2 md:px-3 py-1 text-base font-semibold text-white z-20 bg-black/40 rounded-xl m-3">
        {{ data?.user?.name }}
      </div>
      <ClientOnly>
        <div v-if="pending" class="w-full h-full" />
        <Suspense v-else>
          <LazyWatchVideo
            :landscape="false"
            class="w-full h-full"
            :poster="data?.image ?? ''" :sources="streamURLs" @fullsceen="(isFullscreen) => {
            }"
          />
        </Suspense>
      </ClientOnly>
    </div>
    <div v-else>
      <Error :message="error.statusMessage || ''" :img-src="error.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    </div>
  </div>
</template>
