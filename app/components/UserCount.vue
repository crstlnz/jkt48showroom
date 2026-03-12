<script lang="ts" setup>
import { OnClickOutside } from '@vueuse/components'
import { useSocket } from '~/store/socket'

const isOpen = ref(false)
const { userCount, adminCount, paths } = storeToRefs(useSocket())
const re = ref<HTMLElement | null>(null)

const sortedPaths = computed(() => {
  return Object.entries(paths.value).sort((a, b) => b[1] - a[1])
})
</script>

<template>
  <div
    ref="re"
    :class="{
      'hover:translate-y-[40%] translate-y-[80%] size-20': !isOpen,
      'translate-0 w-56 h-40': isOpen,
    }" class="z-aboveNav transition-all duration-300 ease-linear -translate-x-1/2 bottom-0 left-1/2 flex fixed text-center justify-center align-middle items-center"
  >
    <OnClickOutside v-if="isOpen" class="hidden" :options="{ ignore: [re] }" @trigger="() => isOpen = false">
      <div />
    </OnClickOutside>
    <div class="relative size-full group">
      <div
        :class="{
          'rounded-xl size-full -translate-y-5 ': isOpen,
          'rounded-4xl size-12': !isOpen,
        }" class="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-linear bg-dark-3 border border-white/5"
      />
      <div
        :class="{
          'opacity-100 duration-500': isOpen,
          'opacity-0 duration-100': !isOpen,
        }" class="absolute left-1/2 w-56 h-40 flex flex-col items-center justify-center transition-all top-1/2 -translate-x-1/2 -translate-y-[calc(50%+15px)]"
      >
        <div class="w-full px-2 flex items-center justify-center gap-1.5">
          <div class="rounded-md bg-sky-500/20 text-sky-200 text-[10px] px-1.5 py-0.5 font-semibold">
            {{ userCount }} users
          </div>
          <div class="rounded-md bg-amber-500/20 text-amber-200 text-[10px] px-1.5 py-0.5 font-semibold">
            {{ adminCount }} admins
          </div>
        </div>
        <div v-if="sortedPaths.length" class="w-[calc(100%-20px)] rounded-md p-2 mt-2 text-[10px] bg-dark-1 h-24 leading-tight overflow-auto space-y-0.5">
          <div v-for="([path, count], idx) in sortedPaths" :key="`${path}-${idx}`" class="truncate flex items-center justify-between rounded-sm bg-black/20 px-1.5 py-0.5">
            <span class="truncate text-left text-white/85">{{ path || '/' }}</span>
            <span class="ml-1 text-cyan-300 font-semibold">{{ count }}</span>
          </div>
        </div>
        <div v-else class="mt-1 text-[10px] text-white/60">
          No active paths
        </div>
      </div>

      <button
        aria-label="open" :class="{
          'rotate-180 -translate-y-[calc(50%+21px)] scale-[75%] bg-dark-1 border-color-1 rounded-full ease-out': isOpen,
          'rotate-0 border-transparent ease-in': !isOpen,
        }" class="absolute transition-all border duration-300 rounded-full left-1/2 -translate-x-1/2 text-xl size-12 flex items-center top-0 justify-center" @click="() => isOpen = !isOpen"
      >
        <Icon name="material-symbols:keyboard-double-arrow-up-rounded" class="" />
      </button>
    </div>
  </div>
</template>
