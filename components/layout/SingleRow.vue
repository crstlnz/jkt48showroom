<script lang="ts" setup>
const props = withDefaults(defineProps<{
  title: string
  subTitle?: string
  search?: string
  enableSearch?: boolean
}>(), {
  enableSearch: false,
  search: '',
})

const emit = defineEmits<{ (e: 'search', query: string): void }>()
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

const search = ref(props.search)
const searchInput = ref<HTMLElement>()
watch(search, (val) => {
  emit('search', val)
})

const navBar = ref()

const { isMobile } = useResponsive()
const lastScroll = ref(0)
const navShow = ref(true)
useEventListener(document, 'scroll', () => {
  if (isMobile) {
    const val = window.scrollY - lastScroll.value
    lastScroll.value = window.scrollY
    if (val === 0) return
    navShow.value = val < 0
  }
})
</script>

<template>
  <div class="relative min-h-[100vh] min-w-0 flex-1 border-r pb-20 dark:border-zinc-700">
    <div ref="navBar" :class="{ '-translate-y-full': !navShow }" :style="{ top: 0 }" class="disable-highlight sticky  top-0 z-nav flex h-16 w-full cursor-pointer items-center gap-3 px-4 text-2xl transition-[transform] duration-500 ">
      <div class="bg-navbar absolute inset-0 -z-10 backdrop-blur-md" />
      <button v-if="showBack" type="button" aria-label="Back" class="relative h-10 w-10 rounded-full transition-[background-color] hover:bg-hover" @click="back">
        <Icon name="material-symbols:arrow-back-rounded" class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" />
      </button>
      <div class="flex flex-1 cursor-pointer flex-col justify-center self-stretch" @click="scrollTop">
        <div class="relative flex items-center justify-between">
          <div class="w-0 flex-1 truncate font-semibold md:ml-2 xl:ml-3">
            {{ title ?? 'Missing Title' }}
          </div>
          <div v-if="enableSearch" class="pointer-events-none inset-x-0 max-sm:absolute">
            <div class="bg-container pointer-events-auto float-right flex items-center rounded-2xl p-1.5 text-sm ring-blue-500 focus-within:ring-2 max-sm:focus-within:w-full max-sm:focus-within:pl-3" :class="{ 'pl-3 max-sm:w-full': search.length !== 0 }">
              <input id="search" ref="searchInput" v-model="search" class="flex-1 truncate bg-transparent outline-none focus-visible:!outline-none max-sm:w-0 sm:ml-3" placeholder="Search...">
              <button v-if="search.length === 0" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="searchInput?.focus()">
                <Icon name="uil:search" class="h-full w-full text-slate-800  dark:text-white/50 dark:group-hover:text-white" />
              </button>
              <button v-else class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="search = ''">
                <Icon name="ic:round-close" class="h-full w-full text-neutral-400/80 group-hover:text-white dark:text-slate-100" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="subTitle" class="text-base font-light">
          {{ subTitle }}
        </div>
      </div>
      <div class="shrink-0">
        <slot name="actionSection" />
      </div>
    </div>
    <slot />
  </div>
</template>
