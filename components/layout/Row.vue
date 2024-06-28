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
const { isMobile } = useResponsive()
const lastScroll = ref(0)
const navShow = ref(true)
const doc = ref()
const lastDirectionScroll = ref(0)
useEventListener(doc, 'scroll', () => {
  const navHeight = navBar.value?.clientHeight ?? 0
  if (isMobile) {
    if (window.scrollY < navHeight) return navShow.value = true
    const val = window.scrollY - lastScroll.value
    lastScroll.value = window.scrollY
    if ((val > 0) !== (lastDirectionScroll.value > 0)) {
      lastDirectionScroll.value = val
    }
    else {
      lastDirectionScroll.value += val
    }
    if (val === 0) return
    if (Math.abs(lastDirectionScroll.value) > 30) navShow.value = lastDirectionScroll.value < 0
  }
})

const container = ref<HTMLElement>()

onMounted(() => {
  doc.value = document
})
</script>

<template>
  <div class="flex min-h-full max-md:gap-3 max-xl:gap-4 w-full max-xl:flex-col">
    <div ref="container" class="min-xl:min-h-[100vh] relative min-w-0 flex-1 dark:border-zinc-700 xl:border-r xl:pb-20 max-md:mt-14 max-xl:mt-16">
      <div ref="navBar" :class="{ '-translate-y-full': !navShow, 'left-[76px] right-0 top-0': !isMobile, 'left-0 right-0 top-0': isMobile }" class="disable-highlight fixed z-nav h-14 md:h-16 cursor-pointer xl:sticky transition-[transform] duration-500">
        <div class="bg-navbar absolute inset-0 backdrop-blur-md" />
        <LayoutRowTitle :show-back="showBack" :title="title" :sub-title="subTitle" class="z-10" @back="back" @scroll-top="scrollTop">
          <template #actionSection>
            <slot name="actionSection" />
          </template>
        </LayoutRowTitle>
      </div>
      <slot />
    </div>
    <LayoutSticky v-if="!isMobile || (isMobile && mobileSide)" class="px-3 md:px-4 xl:w-[320px] 2xl:w-[350px]" stop-sticky="xl">
      <div class="flex w-full flex-col gap-4">
        <slot name="sidebar" />
        <footer class="max-sm:text-center max-sm:mt-2.5 pb-10 text-sm text-slate-600 dark:text-zinc-300/50">
          <Footer class="!items-start" />
        </footer>
      </div>
    </LayoutSticky>
  </div>
</template>
