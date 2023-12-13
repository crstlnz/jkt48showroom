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
useEventListener(doc, 'scroll', () => {
  if (isMobile) {
    const val = window.scrollY - lastScroll.value
    lastScroll.value = window.scrollY
    if (val === 0) return
    navShow.value = val < 0
  }
})
const container = ref<HTMLElement>()

onMounted(() => {
  doc.value = document
})
</script>

<template>
  <div class="flex min-h-full w-full gap-3 max-xl:flex-col">
    <div ref="container" class="min-xl:min-h-[100vh] relative min-w-0 flex-1 dark:border-zinc-700 xl:border-r xl:pb-20">
      <div ref="navBar" :class="{ '-translate-y-full': !navShow }" :style="{ left: `0px`, right: 0, top: 0 }" class="disable-highlight sticky z-nav h-14 md:h-16 cursor-pointer xl:sticky transition-[transform] duration-500">
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
        <footer class="mt-4 flex items-center pb-10 text-sm text-slate-600 dark:text-zinc-300/50">
          <a target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
        </footer>
      </div>
    </LayoutSticky>
  </div>
</template>
