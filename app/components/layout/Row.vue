<script lang="ts" setup>
import { useNavScroll } from '~/composables/useNavScroll'

withDefaults(defineProps<{
  title: string
  subTitle?: string
  mobileSide?: boolean
  noPadding?: boolean
}>(), {
  mobileSide: true,
})

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
const navBar = ref()
const { isMobile } = useResponsive()
const { navShow } = useNavScroll(navBar)
</script>

<template>
  <div class="flex min-h-full max-md:gap-3 max-xl:gap-4 w-full max-xl:flex-col">
    <div class="xl:min-h-screen relative min-w-0 flex-1 border-color-1 xl:border-r xl:pb-20 max-md:mt-14 max-xl:mt-16">
      <div ref="navBar" :class="{ '-translate-y-full': !navShow, 'left-20.25 right-0 top-0': !isMobile, 'left-0 right-0 top-0': isMobile }" class="disable-highlight fixed z-nav h-14 md:h-16 cursor-pointer xl:sticky transition-all duration-500">
        <div class="bg-navbar absolute inset-0 backdrop-blur-md border-b border-color-1" />
        <LayoutRowTitle :show-back="showBack" :title="title" :sub-title="subTitle" class="z-10" @back="back" @scroll-top="scrollTop">
          <template #actionSection>
            <slot name="actionSection" />
          </template>
        </LayoutRowTitle>
      </div>
      <div :class="{ 'pt-3 xl:pt-4': !noPadding }">
        <slot />
      </div>
    </div>
    <LayoutSticky v-if="!isMobile || (isMobile && mobileSide)" class="px-3 md:px-4 xl:w-[320px] 2xl:w-87.5" stop-sticky="xl">
      <div class="flex w-full flex-col gap-4">
        <slot name="sidebar" />
        <footer class="max-sm:text-center max-sm:mt-2.5 pb-10 text-sm text-slate-600 dark:text-zinc-300/50">
          <Footer class="items-start! pt-3" />
        </footer>
      </div>
    </LayoutSticky>
  </div>
</template>
