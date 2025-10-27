<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const { getBanner } = useAppConfig()
const LOCAL_STORAGE_KEY = 'cached_banners'

const settings = useSettings()

const banners = ref<Record<string, Banner[]> | null>(null)
const banner = ref<Banner[] | null>(null)

function getCachedBanners(): Record<string, Banner[]> | null {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  }
  catch {
    // ignore
  }
  return null
}
function setCachedBanners(bannersValue: Record<string, Banner[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bannersValue))
  }
  catch {
    // ignore
  }
}

// Helper for deep compare
function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// SSR/NUXT server-injected data
// NOTE: Use useNuxtData to get SSR data injected during server render
const ssrBanners = ref<Record<string, Banner[]> | null>(null)
const nuxtApp = useNuxtApp()

if (import.meta.server) {
  // On server, fetch data so SSR context matches
  const { data } = await useApiFetch<Record<string, Banner[]>>('/api/banner')
  nuxtApp.payload.banners = data.value ?? null

  banners.value = data.value ?? null
}
else if (import.meta.client) {
  // On client, try to grab SSR banners if available from Nuxt payload
  // Nuxt 3: useNuxtData will have the payload hydrated from SSR
  const nuxtBanners = useNuxtData<Record<string, Banner[]>>('api/banner')
  ssrBanners.value = nuxtBanners?.data.value ?? null
}

// Now wait until mounted to compare with localStorage and potentially replace
onMounted(() => {
  const cached = getCachedBanners()
  const ssrBanners = nuxtApp.payload.banners as Record<string, Banner[]>
  // 1. SSR data injected (ssrBanners), 2. local cached data
  if (ssrBanners && !deepEqual(ssrBanners, cached)) {
    // SSR and localStorage are different, replace cache
    setCachedBanners(ssrBanners)
    banners.value = ssrBanners
  }
  else if (cached) {
    banners.value = cached
  }

  // Also, fallback: API fetch only if nothing at all
  if (!banners.value) {
    useApiFetch<Record<string, Banner[]>>('/api/banner').then((response) => {
      if (response?.data?.value) {
        banners.value = response.data.value
        setCachedBanners(response.data.value)
      }
    })
  }
})

watch(
  banners,
  (b) => {
    if (b) {
      const bannerData = b[settings.group]
      if (bannerData) {
        banner.value = bannerData
      }
    }
  },
  { immediate: true },
)

// fallback: ensure initial banner as empty array if nothing yet
if (!banner.value) {
  banner.value = getBanner(settings.group) ?? []
}

const index = ref(0)

const { start } = useTimeoutFn(() => {
  if (banner.value && index.value + 1 >= banner.value.length) {
    index.value = 0
  }
  else if (banner.value) {
    index.value++
  }
  start()
}, 6000)
</script>

<template>
  <div class="relative aspect-3/1 overflow-hidden shadow-2xs lg:aspect-[4.5/1] bg-container border-none!">
    <Transition
      mode="in-out"
      enter-active-class="transition-opacity duration-1000"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="absolute inset-0 transition-opacity duration-1000"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="banner![index]" :key="index" :title="banner![index]?.title" class="aspect-3/1 lg:aspect-[4.5/1] overflow-hidden shadow-2xs bg-container border-none!">
        <a
          :aria-label="banner![index]?.title"
          :href="banner![index]?.url"
          target="_blank"
          class="aspect-3/1 lg:aspect-[4.5/1] block transition-all duration-300 hover:brightness-75 focus-visible:brightness-75"
        >
          <NuxtImg
            sizes="600px sm:750px md:900px lg:1000px"
            :modifiers="{
              aspectRatio: 4.5 / 1,
            }"
            :placeholder="[45, 10, 75, 50]"
            densities="x1"
            width="450"
            height="100"
            fit="fill"
            preload
            format="webp"
            :alt="banner![index]?.title"
            class="w-full h-full object-cover"
            :src="banner![index]?.img"
          />
        </a>
      </div>
    </Transition>
  </div>
</template>
