<script lang="ts" setup>
import { useTimeoutFn } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    showBack: boolean
    title: string
    subTitle?: string
    search?: string
    enableSearch?: boolean
  }>(),
  {
    search: '',
    enableSearch: false,
  },
)

const emit = defineEmits<{ (e: 'search', query: string): void, (e: 'scrollTop'): void, (e: 'back'): void }>()
const search = ref(props.search)
const searchInput = ref<HTMLElement>()
const { start } = useTimeoutFn(() => {
  emit('search', search.value)
}, 50, { immediate: false })

watch(search, () => {
  start()
})
</script>

<template>
  <div class="w-full h-full flex items-center gap-2 px-3 md:px-4 md:gap-3 transition-[transform] duration-500">
    <button v-if="showBack" v-ripple type="button" aria-label="Back" class="relative h-10 w-10 rounded-full transition-[background-color] hover:bg-hover" @click="$emit('back')">
      <Icon name="material-symbols:arrow-back-rounded" class="absolute left-1/2 top-1/2 p-2.5 md:p-2 w-full h-full -translate-x-1/2 -translate-y-1/2" />
    </button>
    <div class="z-nav flex w-0 flex-1 cursor-pointer justify-center self-stretch relative" @click="$emit('scrollTop')">
      <div class="w-0 flex-1 flex flex-col justify-center">
        <div class="truncate font-semibold text-xl md:text-xl leading-5">
          {{ title ?? 'Missing Title' }}
        </div>
        <div v-if="subTitle" class="truncate text-xs opacity-80 leading-5 md:leading-4">
          {{ subTitle }}
        </div>
      </div>
      <div v-if="enableSearch" class="pointer-events-none inset-x-0 top-1/2 -translate-y-1/2 absolute">
        <div class="bg-container pointer-events-auto float-right flex items-center rounded-2xl p-1.5 text-sm ring-blue-500 focus-within:ring-2 max-sm:focus-within:w-full max-sm:focus-within:pl-3" :class="{ 'pl-3 max-sm:w-full': search.length !== 0 }">
          <input id="search_input" ref="searchInput" v-model="search" class="flex-1 truncate bg-transparent outline-none focus-visible:!outline-none max-sm:w-0 sm:ml-3" placeholder="Search...">
          <button v-if="search.length === 0" aria-label="Search" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="searchInput?.focus()">
            <Icon name="uil:search" class="h-full w-full text-slate-800  dark:text-white/50 dark:group-hover:text-white" />
          </button>
          <button v-else aria-label="Close" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="search = ''">
            <Icon name="ic:round-close" class="h-full w-full text-neutral-400/80 group-hover:text-white dark:text-slate-100" />
          </button>
        </div>
      </div>
    </div>
    <div class="z-nav flex shrink-0 items-center">
      <slot name="actionSection" />
    </div>
  </div>
</template>
