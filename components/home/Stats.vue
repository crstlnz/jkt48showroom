<script lang="ts" setup>
import { Serializer, useEventListener } from '@vueuse/core'
import JSONSerializer from '~~/library/serializer/json'
import { getDateRange } from '~~/library/utils/index'
import sleep from '~~/library/utils/sleep'
const statsTypes : IDateRangeType[] = ['weekly', 'monthly', 'quarterly']
const defaultStat : IDateRangeType = 'weekly'

function isValid (data: string) {
  return (statsTypes as string[]).includes(data)
}

class SerializeStat implements Serializer<string> {
  read (raw: string): string {
    if (isValid(raw)) return raw
    return defaultStat
  }

  write (value: string): string {
    if (isValid(value)) return String(value)
    return defaultStat
  }
}
const type = useLocalStorage('stat-type', defaultStat, { serializer: new SerializeStat() })
// const type = useCookie('statType', { default: () => defaultStat })
const pending = ref(true)
const error = ref(false)

const localData = computed(() => useLocalStorage<IShowroomStats | null>(`stats-${type.value}`, null, { serializer: new JSONSerializer(null) }))
const data = computed(() => localData.value.value)

async function fetch () {
  if (error.value === true)error.value = false
  if (pending.value === false)pending.value = true
  try {
    localData.value.value = await $fetch(`/api/showroom/stats?type=${type.value || defaultStat}`)
  } catch (e) {
    if (error.value === false)error.value = true
  }
  if (pending.value === true) pending.value = false
}

async function refresh () {
  const statsData = localData.value.value
  if (!statsData) {
    return await fetch()
  }
  const dateRange = getDateRange(type.value as IDateRangeType)
  if (statsData.date.to === dateRange.to) {
    if (pending.value === true) pending.value = false
  } else {
    return await fetch()
  }
}

const { $toDateString } = useNuxtApp()
const fromDateSource = computed(() => data.value?.date?.from ?? 0)
const toDateSource = computed(() => data.value?.date?.to ?? 0)
const fromDate = $toDateString(fromDateSource)
const toDate = $toDateString(toDateSource)

const typeButtons = ref<HTMLElement[]>([])
const defaultStyle = { top: 0, left: 0, width: 0, height: 0 }
const activeStyle = ref(defaultStyle)

watch(localData, () => {
  refresh()
})

function getStyle () {
  return new Promise((resolve) => {
    nextTick(() => {
      if (process.server || !typeButtons.value?.length) return resolve(defaultStyle)
      const div = typeButtons.value.find(i => i.getAttribute('data-type') === type.value)
      resolve({ top: div?.offsetTop ?? 0, left: div?.offsetLeft ?? 0, width: div?.offsetWidth ?? 0, height: div?.offsetHeight ?? 0 })
    })
  })
}

async function calculateActiveButton () : Promise<void> {
  const style = await getStyle() as any
  if (style?.width === 0 || style?.height === 0) {
    await sleep(50)
    return calculateActiveButton()
  }
  activeStyle.value = style
}

const win = ref<Window | null>(null)
useEventListener(win, 'resize', () => {
  calculateActiveButton()
})

watch(type, () => {
  calculateActiveButton()
})

onMounted(() => {
  win.value = window
  refresh()
  calculateActiveButton()
})

</script>

<template>
  <div class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-8 xl:mt-2">
    <div class="flex flex-wrap items-center gap-0.5 max-sm:w-full max-sm:justify-between sm:gap-1 md:gap-4">
      <div class="flex gap-1">
        <Icon name="ph:presentation-chart-bold" class="self-center text-xl sm:text-2xl" />
        <h2 class="text-xl font-bold sm:text-2xl">
          {{ $t(`stats.title`) }}
        </h2>
      </div>
      <div v-if="!pending" class="text-xs opacity-60 sm:flex-1 md:text-sm">
        {{ fromDate }} - {{ toDate }}
      </div>
    </div>
    <div class="relative flex justify-end gap-1 overflow-hidden rounded-[35px] bg-white p-2 dark:bg-dark-1 max-sm:w-full sm:p-1.5">
      <ClientOnly>
        <template #fallback>
          <div v-for="key in statsTypes" :key="`loading-${key}`" class="z-10 inline-block whitespace-nowrap px-4 py-1.5 text-center text-sm opacity-60 duration-300 max-sm:flex-1 sm:rounded-md md:text-sm">
            {{ $t(`stats.${key}`) }}
          </div>
        </template>
        <button
          v-for="key in statsTypes"
          ref="typeButtons"
          :key="key"
          :data-type="key"
          class="disable-highlight z-10 whitespace-nowrap px-4 py-1.5 text-center text-sm transition-all duration-300 max-sm:flex-1 sm:rounded-md md:text-sm"
          :class="{'font-bold text-white' : type === key, 'opacity-60 hover:font-bold hover:opacity-80' : type !== key}"
          type="button"
          @click="(type = key)"
        >
          {{ $t(`stats.${key}`) }}
        </button>
        <div class="custom-ease absolute h-full w-20 rounded-[35px] bg-blue-500" :style="{top: `${activeStyle?.top}px`,left: `${activeStyle?.left}px`, width: `${activeStyle?.width}px`,height: `${activeStyle?.height}px`}" />
      </ClientOnly>
    </div>
  </div>

  <div class="relative">
    <div v-if="(pending)" key="loading" class="space-y-2.5 sm:space-y-3 xl:space-y-4 ">
      <div class="overflow-hidden rounded-lg p-4 max-sm:space-y-3 max-sm:bg-white max-sm:dark:bg-dark-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:p-0 md:rounded-none lg:grid-cols-4 xl:gap-4">
        <div v-for="key in 4" :key="key" class="animation-pulse flex items-center gap-2 sm:rounded-lg sm:bg-white sm:p-5 sm:shadow-sm sm:dark:bg-dark-1 lg:gap-3">
          <div class="min-w-0 flex-1 space-y-1 lg:space-y-2">
            <div class="pulse-color h-4 w-16 animate-pulse rounded-xl lg:h-5" />
            <div class="pulse-color h-7 w-24 animate-pulse rounded-xl" />
          </div>
          <div
            class="group h-14 w-14 overflow-hidden rounded-full lg:h-16 lg:w-16"
          >
            <div
              class="pulse-color max-w-16 aspect-square max-h-16 animate-pulse"
            />
          </div>
        </div>
      </div>
      <PulseHomeFans v-if="pending" key="loading" />
    </div>

    <div v-else :key="'data'" class="space-y-2.5 sm:space-y-3 xl:space-y-4">
      <div v-if="(data?.stats?.length ?? 0) <= 1" class="rounded-xl bg-white p-3 shadow-sm dark:bg-dark-1 md:p-4 xl:p-5 ">
        <div class="pb-6 text-center">
          <img src="/svg/empty-box.svg" :alt="$t('data.notenough')" class="mx-auto aspect-[4/3] w-72 max-w-[80%]">
          {{ $t('data.notenough') }}
        </div>
      </div>
      <div v-else class="overflow-hidden rounded-lg p-4 max-sm:space-y-3 max-sm:bg-white max-sm:dark:bg-dark-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:p-0 md:rounded-none lg:grid-cols-4 xl:gap-4">
        <div
          v-for="stat in (data?.stats ?? []).slice(0, 4)"
          :key="(stat?.key ?? stat.title)"
          class="flex items-center gap-2 sm:rounded-lg sm:bg-white sm:p-5 sm:shadow-sm sm:dark:bg-dark-1 lg:gap-3"
        >
          <div class="min-w-0 flex-1 space-y-1 lg:space-y-2">
            <div :key="data?.type ?? 'data'" class="text-xs opacity-60 lg:text-sm">
              {{ stat?.key ? $t(stat?.key) : stat.title }}
            </div>
            <div :key="data?.type ?? 'data'" class="truncate text-lg font-bold xl:text-xl">
              {{ stat.value }}
            </div>
          </div>
          <div
            v-if="stat.img"
            class="group h-14 w-14 overflow-hidden rounded-full lg:h-16 lg:w-16"
            :title="stat.img.title"
          >
            <img
              class="max-w-16 aspect-square max-h-16 cursor-pointer object-cover brightness-100 transition-all duration-200 group-hover:brightness-50"
              :alt="stat.img.title"
              :src="$fixCloudinary(stat.img.src)"
            >
          </div>
          <div v-else class="h-14 w-14 lg:h-16 lg:w-16" />
        </div>
      </div>
      <HomeFans v-if="(data?.ranks?.fans?.length)" :key="data?.type ?? 'data'" :data="data?.ranks.fans" />
    </div>
  </div>
</template>

<style lang="scss">
.custom-ease{
  transition-property: width,left;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.170, 0.795, 0.285, 1.000);
}
</style>
