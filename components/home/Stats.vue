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
  <div class="flex flex-col sm:flex-row justify-between items-center xl:mt-2 gap-4 sm:gap-8">
    <div class="flex gap-0.5 sm:gap-1 md:gap-4 items-center flex-wrap max-sm:justify-between max-sm:w-full">
      <div class="flex gap-1">
        <Icon name="ph:presentation-chart-bold" class="text-xl sm:text-2xl self-center" />
        <h2 class="text-xl sm:text-2xl font-bold">
          {{ $t(`stats.title`) }}
        </h2>
      </div>
      <div v-if="!pending" class="text-xs md:text-sm opacity-60 sm:flex-1">
        {{ fromDate }} - {{ toDate }}
      </div>
    </div>
    <div class="flex gap-1 justify-end max-sm:w-full bg-white dark:bg-dark-1 p-2 sm:p-1.5 rounded-[35px] overflow-hidden relative">
      <ClientOnly>
        <template #fallback>
          <div v-for="key in statsTypes" :key="`loading-${key}`" class="text-sm md:text-base whitespace-nowrap px-3 max-sm:py-1.5 transition-all max-sm:flex-1 duration-300 sm:rounded-md opacity-60 hover:font-bold hover:opacity-80">
            {{ $t(`stats.${key}`) }}
          </div>
        </template>
        <button
          v-for="key in statsTypes"
          ref="typeButtons"
          :key="key"
          :data-type="key"
          class="text-sm md:text-sm whitespace-nowrap px-4 py-1.5 transition-all max-sm:flex-1 duration-300 sm:rounded-md z-10 disable-highlight"
          :class="{'font-bold text-white' : type === key, 'opacity-60 hover:font-bold hover:opacity-80' : type !== key}"
          type="button"
          @click="(type = key)"
        >
          {{ $t(`stats.${key}`) }}
        </button>
        <div class="bg-blue-500 absolute w-20 h-full rounded-[35px] custom-ease" :style="{top: `${activeStyle?.top}px`,left: `${activeStyle?.left}px`, width: `${activeStyle?.width}px`,height: `${activeStyle?.height}px`}" />
      </ClientOnly>
    </div>
  </div>

  <div class="relative">
    <div v-if="(pending)" key="loading" class="space-y-2.5 sm:space-y-3 xl:space-y-4 ">
      <div class="sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 xl:gap-4 rounded-lg md:rounded-none overflow-hidden max-sm:bg-white max-sm:dark:bg-dark-1 p-4 sm:p-0 max-sm:space-y-3">
        <div v-for="key in 4" :key="key" class="animation-pulse sm:bg-white sm:dark:bg-dark-1 sm:p-5 sm:rounded-lg items-center gap-2 lg:gap-3 sm:shadow-sm flex">
          <div class="flex-1 min-w-0 space-y-1 lg:space-y-2">
            <div class="pulse-color animate-pulse w-16 h-4 lg:h-5 rounded-xl" />
            <div class="pulse-color animate-pulse h-7 rounded-xl w-24" />
          </div>
          <div
            class="group rounded-full overflow-hidden h-14 w-14 lg:h-16 lg:w-16"
          >
            <div
              class="pulse-color animate-pulse aspect-square max-w-16 max-h-16"
            />
          </div>
        </div>
      </div>
      <PulseHomeFans v-if="pending" key="loading" />
    </div>

    <div v-else :key="'data'" class="space-y-2.5 sm:space-y-3 xl:space-y-4">
      <div v-if="(data?.stats?.length ?? 0) <= 1" class="bg-white dark:bg-dark-1 p-3 md:p-4 xl:p-5 rounded-xl shadow-sm ">
        <div class="text-center pb-6">
          <img src="/svg/empty-box.svg" :alt="$t('data.notenough')" class="w-72 max-w-[80%] aspect-[4/3] mx-auto">
          {{ $t('data.notenough') }}
        </div>
      </div>
      <div v-else class="sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 xl:gap-4 rounded-lg md:rounded-none overflow-hidden max-sm:bg-white max-sm:dark:bg-dark-1 p-4 sm:p-0 max-sm:space-y-3">
        <div
          v-for="stat in (data?.stats ?? []).slice(0, 4)"
          :key="(stat?.key ?? stat.title)"
          class="sm:bg-white sm:dark:bg-dark-1 sm:p-5 sm:rounded-lg items-center gap-2 lg:gap-3 sm:shadow-sm flex"
        >
          <div class="flex-1 min-w-0 space-y-1 lg:space-y-2">
            <div :key="data?.type ?? 'data'" class="opacity-60 text-xs lg:text-sm">
              {{ stat?.key ? $t(stat?.key) : stat.title }}
            </div>
            <div :key="data?.type ?? 'data'" class="text-lg xl:text-xl font-bold truncate">
              {{ stat.value }}
            </div>
          </div>
          <div
            v-if="stat.img"
            class="group rounded-full overflow-hidden h-14 w-14 lg:h-16 lg:w-16"
            :title="stat.img.title"
          >
            <img
              class="group-hover:brightness-50 brightness-100 aspect-square cursor-pointer transition-all duration-200 max-w-16 max-h-16 object-cover"
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
