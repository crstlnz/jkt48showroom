<script lang="ts" setup>
import { useNavScroll } from '~/composables/useNavScroll'

withDefaults(defineProps<{
  title: string
  subTitle?: string
  search?: string
  enableSearch?: boolean
  noPadding?: boolean
}>(), {
  enableSearch: false,
  search: '',
})

defineEmits<{ (e: 'search', query: string): void }>()

const route = useRoute()
const router = useRouter()
const showBack = computed(() => {
  return route.path !== '/'
})
function scrollTop() {
  window.scrollTo(0, 0)
}

function back() {
  if (import.meta.client) {
    if (history.state.back === null) {
      router.replace('/')
    }
    else {
      router.back()
    }
  }
}

const navBar = ref<HTMLElement>()

const { isMobile } = useResponsive()

const { navShow } = useNavScroll(navBar)

const id = computed(() => {
  if (route.path.startsWith('/theater/')) {
    return 'show-detail'
  }
  return ''
}) // for theater scrape
</script>

<template>
  <div class="relative min-h-dvh min-w-0 flex-1 border-r dark:border-zinc-700 flex flex-col">
    <div ref="navBar" :class="{ '-translate-y-full': !navShow }" :style="{ top: 0 }" class="disable-highlight sticky top-0 z-nav flex h-14 md:h-16 w-full cursor-pointer items-center gap-3 transition-all duration-500">
      <div class="bg-navbar absolute inset-0 -z-10 backdrop-blur-md border-b border-color-1" />
      <LayoutRowTitle :show-back="showBack" :search="search" :title="title" :sub-title="subTitle" class="z-10" :enable-search="enableSearch" @back="back" @scroll-top="scrollTop" @search="(val) => $emit('search', val)">
        <template #actionSection>
          <slot name="actionSection" />
        </template>
      </LayoutRowTitle>
    </div>
    <div :id="id" class="flex-1" :class="{ 'pt-3 xl:pt-4': !noPadding }">
      <slot />
    </div>
    <div :class="{ 'pb-18': isMobile }" class="pt-4 pb-10 text-center px-3 md:px-4">
      <Footer class="mt-12 opacity-50" />
    </div>
  </div>
</template>
