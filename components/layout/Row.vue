<script lang="ts" setup>
withDefaults(defineProps<{
  title: string
  subTitle?: string
  mobileSide?: boolean
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
  if (process.client) {
    if (history.state.back === null) {
      router.replace('/')
    }
    else {
      router.back()
    }
  }
}
const navBar = ref()
const { height: navHeight } = useElementSize(navBar)
const { greaterOrEqual, isMobile } = useResponsive()
const isXL = greaterOrEqual('xl')
const paddingTop = computed(() => {
  if (isXL.value) {
    return 0
  }
  return navHeight.value
})

const lastScroll = ref(0)
const navView = ref(0)
useEventListener(document, 'scroll', () => {
  if (isMobile.value) {
    const val = navView.value + window.scrollY - lastScroll.value
    navView.value = Math.max(Math.min(navHeight.value, val), 0)
    lastScroll.value = window.scrollY
  }
})
// const { x, y, isScrolling, arrivedState, directions } = useScroll(window)
// const { isPending, start, stop } = useTimeoutFn(() => {
//   if ((navView.value / navHeight.value * 100) > 40) {
//     navView.value = navHeight.value
//   }
//   else {
//     navView.value = 0
//   }
// }, 300)
// watch(isScrolling, (scrolling) => {
//   if (!scrolling) {
//     start()
//   }
// })

// watch(y, (scrollY) => {
//   if (isMobile.value) {
//     const val = navView.value + scrollY - lastScroll.value
//     navView.value = Math.max(Math.min(navHeight.value, val), 0)
//     lastScroll.value = scrollY
//   }
// })
const container = ref<HTMLElement>()
</script>

<template>
  <div class="flex w-full gap-3 max-xl:flex-col">
    <div ref="container" class="min-xl:min-h-[100vh] relative min-w-0 flex-1 dark:border-zinc-700 xl:border-r xl:pb-20" :style="{ paddingTop: `${paddingTop}px` }">
      <div ref="navBar" :style="{ left: `${container?.getBoundingClientRect().left}px`, right: 0, top: isMobile ? `-${navView}px` : 0 }" class="disable-highlight fixed z-nav flex h-16 cursor-pointer items-center gap-3 px-4 text-2xl xl:sticky">
        <div class="bg-navbar absolute inset-0 backdrop-blur-md" />
        <button v-if="showBack" type="button" aria-label="Back" class="relative h-10 w-10 rounded-full transition-[background-color] hover:bg-hover" @click="back">
          <Icon name="material-symbols:arrow-back-rounded" class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" />
        </button>
        <div class="z-nav flex min-w-0 flex-1 cursor-pointer flex-col justify-center self-stretch" @click="scrollTop">
          <div class="truncate font-semibold md:ml-2 xl:ml-3">
            {{ title ?? 'Missing Title' }}
          </div>
          <div v-if="subTitle" class="text-base font-light">
            {{ subTitle }}
          </div>
        </div>
        <div class="z-nav shrink-0">
          <slot name="actionSection" />
        </div>
      </div>
      <slot />
    </div>
    <LayoutSticky v-if="!isMobile || (isMobile && mobileSide)" class="px-4 xl:w-[320px] 2xl:w-[350px]" stop-sticky="xl">
      <div class="flex w-full flex-col gap-4">
        <slot name="sidebar" />
        <footer class="flex items-center pb-10 text-sm text-slate-600 dark:text-zinc-300/50">
          <a target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
        </footer>
      </div>
    </LayoutSticky>
  </div>
</template>
