<!-- <script lang="ts" setup>
import type { Serializer } from '@vueuse/core'
import { useEventListener } from '@vueuse/core'
import { useSettings } from '~~/store/settings'
import JSONSerializer from '~~/library/serializer/json'

const props = defineProps<{
  roomId?: number
}>()

const settings = useSettings()

const statsAllTypes: IDateRangeType[] = ['weekly', 'monthly', 'quarterly']
const statsMemberTypes: IDateRangeMemberType[] = ['weekly', 'monthly', 'all']
const defaultStat: IDateRangeType = 'weekly'
const defaultMemberStat: IDateRangeMemberType = 'weekly'

const statsTypes = computed<IDateRangeType[] | IDateRangeMemberType[] >(() => {
  return props.roomId ? statsMemberTypes : statsAllTypes
})
function isValid(data: string) {
  return (statsAllTypes as string[]).includes(data)
}

function isMemberValid(data: string) {
  return (statsMemberTypes as string[]).includes(data)
}

class SerializeStat implements Serializer<string> {
  read(raw: string): string {
    if (isValid(raw)) return raw
    return defaultStat
  }

  write(value: string): string {
    if (isValid(value)) return String(value)
    return defaultStat
  }
}

class SerializeMemberStat implements Serializer<string> {
  read(raw: string): string {
    if (isMemberValid(raw)) return raw
    return defaultMemberStat
  }

  write(value: string): string {
    if (isMemberValid(value)) return String(value)
    return defaultMemberStat
  }
}

const statTypeKey = props.roomId ? 'stats-member-type' : 'stats-type'
const type = useSessionStorage(statTypeKey, props.roomId ? defaultMemberStat : defaultStat, { serializer: props.roomId ? new SerializeMemberStat() : new SerializeStat() })
const pending = ref(true)
const error = ref(false)
const cacheKey = computed(() => {
  if (props.roomId) return `${props.roomId}-${type.value}`
  return settings.group == null ? type.value : `${settings.group}-${type.value}`
})

const localData = computed(() => useLocalStorage<IShowroomStats | null>(`stats-${cacheKey.value}`, null, { serializer: new JSONSerializer(null) }))
const data = computed(() => localData.value.value)
const config = useRuntimeConfig()
async function fetch() {
  if (error.value === true) error.value = false
  if (pending.value === false) pending.value = true
  try {
    const baseAPI = config.public.api
    const url = props.roomId ? `${baseAPI}/api/stats?type=${type.value || defaultStat}&room_id=${props.roomId}` : `${baseAPI}/api/stats?type=${type.value || defaultStat}&group=${settings.group}`
    localData.value.value = await $apiFetch(url)
  }
  catch (e) {
    if (error.value === false) error.value = true
  }
  if (pending.value === true) pending.value = false
}

async function refresh() {
  const statsData = localData.value.value
  if (!statsData) {
    return await fetch()
  }
  const dateRange = getDateRange(type.value as IDateRangeType)
  const dataDate = new Date(statsData.date?.to ?? '')
  const requestDate = new Date(dateRange.to)

  if (dataDate.getDate() === requestDate.getDate()) {
    if (pending.value === true) pending.value = false
  }
  else {
    return await fetch()
  }
}

const { $toDateString } = useNuxtApp()
const fromDateSource = computed(() => data.value?.date?.from ?? 0)
const toDateSource = computed(() => data.value?.date?.to ?? 0)
const fromDate = $toDateString(fromDateSource)
const toDate = $toDateString(toDateSource)

const typeButtons = ref<HTMLButtonElement[]>([])
const defaultStyle = { top: 0, left: 0, width: 0, height: 0 }
const activeStyle = ref(defaultStyle)

// watch(localData, () => {
// refresh()
// })

function getStyle() {
  return new Promise((resolve) => {
    nextTick(() => {
      if (process.server || !typeButtons.value?.length) return resolve(defaultStyle)
      const div = typeButtons.value.find(i => i.getAttribute('data-type') === type.value)
      resolve({ top: div?.offsetTop ?? 0, left: div?.offsetLeft ?? 0, width: div?.offsetWidth ?? 0, height: div?.offsetHeight ?? 0 })
    })
  })
}

async function calculateActiveButton(): Promise<void> {
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
  refresh()
  calculateActiveButton()
})

const isAnimated = ref(false)
const activeBtnMark = ref<HTMLElement>()

onMounted(() => {
  win.value = window
  refresh()
  calculateActiveButton()
})

function setButton(key: string) {
  if (!isAnimated.value) isAnimated.value = true
  type.value = key
}
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-2 px-3 sm:flex-row sm:gap-8 md:gap-3 md:px-4">
    <div class="flex flex-wrap items-center gap-0.5 max-sm:w-full max-sm:justify-between sm:gap-1 md:gap-4">
      <div class="flex gap-1">
        <Icon name="ph:presentation-chart-bold" class="self-center text-xl sm:text-2xl" />
        <h2 class="text-xl font-bold leading-10 sm:text-2xl">
          {{ $t(`stats.title`) }}
        </h2>
      </div>
      <div v-if="!pending && type !== 'all'" class="text-xs opacity-60 sm:flex-1 md:text-sm">
        {{ fromDate }} - {{ toDate }}
      </div>
    </div>
    <div class="bg-container relative flex justify-end gap-1 overflow-hidden rounded-[35px] p-2 max-sm:w-full sm:p-1.5">
      <button
        v-for="key in statsTypes"
        :key="key"
        ref="typeButtons"
        :data-type="key"
        class="typeButtons disable-highlight z-10 whitespace-nowrap px-4 py-1.5 text-center text-sm transition-all duration-300 max-sm:flex-1 sm:rounded-md md:text-sm"
        :class="{ 'text-white': type === key, 'opacity-50 hover:opacity-100': type !== key }"
        type="button"
        @click="() => setButton(key)"
      >
        {{ $t(`stats.${key}`) }}
      </button>
      <div ref="activeBtnMark" :class="isAnimated ? 'custom-ease' : ''" class="absolute h-full w-20 rounded-[35px] bg-blue-500" :style="{ top: `${activeStyle?.top}px`, left: `${activeStyle?.left}px`, width: `${activeStyle?.width}px`, height: `${activeStyle?.height}px` }" />
    </div>
  </div>
  <div class="relative px-3 md:px-4">
    <PulseStats v-if="pending" key="loading" />
    <div v-else key="data" class="space-y-3 md:space-y-4">
      <div v-if="(data?.stats?.length ?? 0) <= 1" class="rounded-xl bg-white p-3 shadow-2xs dark:bg-dark-1 md:p-4 xl:p-5 ">
        <div class="pb-6 text-center">
          <NuxtImg :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" :alt="$t('data.notenough')" class="mx-auto aspect-4/3 w-72 max-w-[80%]" />
          {{ $t('data.notenough') }}
        </div>
      </div>
      <div v-else class="flex flex-wrap gap-1 max-sm:bg-container max-sm:flex-col max-sm:rounded-xl max-sm:p-3 sm:gap-4">
        <div
          v-for="stat in (data?.stats ?? []).slice(0, 4)"
          :key="stat?.key ?? stat.title"
          class="flex items-center gap-3 rounded-xl px-5 py-3 sm:bg-container max-sm:p-3 sm:flex-[calc(50%_-_1rem)]"
        >
          <div class="w-0 flex-1 space-y-2">
            <div :key="data?.type ?? 'data'" class="opacity-50">
              {{ stat?.key ? $t(stat?.key) : stat.title }}
            </div>
            <Parser :key="data?.type ?? 'data'" :parse-type="stat.parseType" :value="stat.value" class="truncate text-xl font-bold" />
          </div>
          <div
            v-if="stat.img"
            class="group h-16 w-16 overflow-hidden rounded-full md:h-20 md:w-20"
            :title="stat.img.title"
          >
            <NuxtImg
              class="h-full w-full"
              :src="stat.img.src || $errorPicture"
              :alt="stat.img.title"
              loading="lazy"
              fit="fill"
              :modifiers="{
                aspectRatio: 1,
                gravity: 'faceCenter',
              }"
              sizes="64px md:80px"
              :placeholder="[10, 10, 75, 5]"
              format="webp"
            />
          </div>
          <div v-else class="h-16 w-16 md:h-20 md:w-20" />
        </div>
      </div>
      <HomeFans v-if="(data?.ranks?.fans?.length)" :key="data?.type ?? 'data'" class="rounded-xl" :data="data?.ranks.fans" />
    </div>
  </div>
</template>

<style lang="scss">
.custom-ease{
  transition-property: width,left;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.170, 0.795, 0.285, 1.000);
}
</style> -->
<template>
  <div>Stats</div>
</template>
