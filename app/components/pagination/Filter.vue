<script lang="ts" setup>
import { useMembers } from '~/store/members'
import { useSettings } from '~/store/settings'

const props = defineProps({
  showSearch: {
    type: Boolean,
    default() {
      return false
    },
  },
  mustCalculateHeight: {
    type: Boolean,
    default() {
      return false
    },
  },
  members: {
    type: Array,
    default() {
      return []
    },
  },
  query: {
    type: Object,
    default() {
      return {}
    },
  },
})
const emit = defineEmits<{ (e: 'apply', filter: any): void, (e: 'title', title: string): void, (e: 'showDuration', show: boolean): void }>()
const config = useAppConfig()
const SortList: SortData[] = config.sortList
const membersStore = useMembers()
const { members: storeMembers } = storeToRefs(membersStore)
const { group } = useSettings()

const search = useState('filter-search', () => props.query.search)
const date = useState<QueryDateRange>('filter-date', () => props.query.date)

const temp = ref<RecentsQuery>({})

const isEnabled = computed(() => {
  if (Object.keys(temp.value).length || search.value !== props.query.search || props.query.date !== date.value) return true
  return false
})

watch(
  () => props.query,
  (newVal) => {
    search.value = newVal.search
    temp.value = {}
    // changeTitle(newVal)
  },
)

// changeTitle(props.query)

function isActive(bool: boolean) {
  const val = temp.value.filter ?? props.query.filter
  if ((val !== undefined && val === 'graduated') || val === 'active') {
    return (val === 'graduated') === bool
  }
  return false
}

function setType(type: LogType) {
  const t = temp.value.type ?? props.query.type
  temp.value.type = t === type ? 'all' : type
}

function isType(type: LogType) {
  const t = temp.value.type ?? props.query.type
  return t === type
}

function setGraduated(bool: boolean) {
  const getFilter = (b: boolean) => (b ? 'graduated' : 'active')
  const newVal = getFilter(bool)
  if (temp.value.filter !== undefined) {
    if (temp.value.filter === newVal) {
      if (props.query.filter === 'all') return (temp.value.filter = undefined)
      return (temp.value.filter = 'all')
    }
    return (temp.value.filter = newVal)
  }

  if (props.query.filter === newVal) {
    temp.value.filter = 'all'
  }
  else {
    temp.value.filter = newVal
  }
}

const defaultQuery = config.defaultRecentQuery

function setOrder(order: 1 | -1) {
  if (order === Number.parseInt((props.query.order ?? defaultQuery.order))) {
    return delete temp.value.order
  }
  temp.value.order = order
}

function setSort(key: string) {
  if (key === props.query.sort) {
    return delete temp.value.sort
  }
  temp.value.sort = key
}

const fallbackGeneration = computed(() => {
  return generateGen()[group as 'jkt48' | 'hinatazaka46'] ?? []
})

const sourceMembers = computed(() => {
  if (Array.isArray(props.members) && props.members.length) {
    return props.members as Array<{ generation?: string }>
  }
  return (storeMembers.value ?? []) as Array<{ generation?: string }>
})

const dynamicGeneration = computed(() => {
  const generationKeys = Array.from(
    new Set(
      sourceMembers.value
        .map(member => member.generation)
        .filter((generation): generation is string => Boolean(generation)),
    ),
  ).sort((a, b) => {
    const numA = Number.parseInt(a.match(/gen(\d+)/i)?.[1] || '0', 10)
    const numB = Number.parseInt(b.match(/gen(\d+)/i)?.[1] || '0', 10)
    if (numA !== numB) return numA - numB
    return a.localeCompare(b)
  })

  return generationKeys.map((key) => {
    const generationNumber = Number.parseInt(key.match(/gen(\d+)/i)?.[1] || '0', 10)
    return {
      key,
      num: generationNumber,
      short_title: parseGeneration(key, true) || key,
      title: parseGeneration(key) || key,
    }
  })
})

const generation = computed(() => {
  return dynamicGeneration.value.length ? dynamicGeneration.value : fallbackGeneration.value
})
const generationKeys = computed(() => generation.value.map(item => item.key))

function normalizeGenerationToken(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ''
  if (/^gen\d{1,2}-[a-z0-9]+$/i.test(normalized)) return normalized
  if (/^gen\d{1,2}$/i.test(normalized)) return `${normalized}-${group}`
  if (/^\d{1,2}$/.test(normalized)) return `gen${normalized}-${group}`
  return ''
}

function parseGenerationQuery(value: unknown) {
  const raw = Array.isArray(value) ? value.join(',') : String(value ?? '')
  return raw
    .split(',')
    .map(normalizeGenerationToken)
    .filter(Boolean)
}

const selectedGenerationKeys = computed(() => {
  if (!generationKeys.value.length) return []
  const validGeneration = new Set(generationKeys.value)
  const selected = parseGenerationQuery(temp.value.gen ?? props.query.gen)
    .filter(key => validGeneration.has(key))

  if (!selected.length) return [...generationKeys.value]
  return generationKeys.value.filter(key => selected.includes(key))
})

const allGenerationSelected = computed(() => {
  return generationKeys.value.length > 0 && selectedGenerationKeys.value.length === generationKeys.value.length
})

function setGenerationSelection(keys: string[]) {
  const selected = generationKeys.value.filter(key => keys.includes(key))

  if (selected.length === generationKeys.value.length) {
    if (props.query.gen == null || props.query.gen === '') {
      delete temp.value.gen
    }
    else {
      temp.value.gen = ''
    }
    return
  }

  temp.value.gen = selected
    .map(key => key.split('-')[0] || '')
    .filter(Boolean)
    .join(',')
}

function toggleGeneration(key: string) {
  const selected = selectedGenerationKeys.value
  if (selected.includes(key)) {
    const next = selected.filter(item => item !== key)
    if (!next.length) {
      setGenerationSelection([...generationKeys.value])
      return
    }
    setGenerationSelection(next)
    return
  }
  setGenerationSelection([...selected, key])
}

function apply() {
  const q = { ...temp.value, search: search.value, date: date.value }
  for (const key of Object.keys(props.query)) {
    if (!Object.hasOwn(q, key)) {
      q[key as keyof typeof q] = props.query[key]
    }
  }
  emit('apply', q)
}

function clearSearch() {
  if (!isEnabled.value) {
    search.value = ''
    apply()
  }
  else {
    search.value = ''
  }
}

const { isMobile } = useResponsive()

const element = ref<HTMLElement>()
const { height } = useWindowSize()

const padding = 40
const fixedHeight = ref<string | null>(null)
const el = ref()
const originalHeight = ref(0)
watch(height, (val) => {
  if (props.mustCalculateHeight && !isMobile) calculateHeight(val)
})

function calculateHeight(windowHeight: number) {
  const rect = element.value?.getBoundingClientRect()
  if (rect) {
    const screenHeight = windowHeight - rect.top - padding
    if (originalHeight.value > screenHeight) {
      fixedHeight.value = `${screenHeight}px`
    }
  }
}

useEventListener(el, 'resize', () => {
  if (props.mustCalculateHeight && !isMobile) calculateHeight(height.value)
})

onMounted(() => {
  membersStore.tryRefresh()
  el.value = window
  originalHeight.value = element.value?.clientHeight ?? 0
  if (props.mustCalculateHeight && !isMobile) calculateHeight(height.value)
})

const DateRangeX = defineAsyncComponent(() =>
  import('@/components/form/DateRange.vue'),
)
</script>

<template>
  <div ref="element" class="roundedscrollbar space-y-4 overflow-y-auto" :style="{ height: fixedHeight ?? '' }">
    <div v-if="showSearch" class="group flex items-center gap-4 rounded-xl bg-slate-200/70 px-4 ring-blue-500 focus-within:ring-2 dark:bg-dark-2">
      <Icon name="uil:search" class="ml-1 h-5 w-5 shrink-0" />
      <input
        id="search_shortcut"
        v-model="search"
        :aria-label="$t('search')"
        :placeholder="`${$t('search')}...`"
        type="text"
        class="w-full bg-transparent py-3 outline-hidden"
        @keyup.enter="() => { if (isEnabled) apply() }"
      >
      <button v-if="search != null && search !== ''" type="button" aria-label="Clear" class="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white group-focus-within:flex group-hover:flex" @click="clearSearch">
        <Icon name="ic:round-close" class="h-full w-full p-1" />
      </button>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1 font-semibold">
        <Icon name="ph:caret-circle-right" />
        <span class="text-base">{{ $t("sort.title") }}</span>
      </div>
      <button type="button" aria-label="Sorting Type" class="group h-8 w-8 overflow-hidden rounded-md bg-slate-200/70 dark:bg-dark-2" @click="setOrder((temp.order ?? query.order ?? defaultQuery.order) > 0 ? -1 : 1)">
        <span class="flex h-full w-full items-center justify-center group-hover:bg-second-2/90 group-hover:text-white">
          <Icon v-if="(temp.order ?? query.order ?? -1) > 0" name="ph:sort-ascending-bold" />
          <Icon v-else name="ph:sort-descending-bold" />
        </span>
      </button>
    </div>

    <ul
      class="max-h-62.5 overflow-y-auto rounded-xl bg-slate-200/70 dark:bg-dark-2"
    >
      <li v-for="item in SortList" :key="item.id">
        <button
          type="button"
          class="w-full cursor-pointer px-4 py-2 font-bold hover:bg-second-2/20 lg:py-3"
          :class="{
            'bg-second-2/90! text-white': item.id === (temp.sort ?? query.sort),
          }"
          @click="setSort(item.id)"
        >
          {{ $t(item.title.btn) }}
        </button>
      </li>
    </ul>
    <div class="flex items-center gap-1 font-semibold">
      <Icon name="ic:baseline-filter-alt" />
      <span class="text-base">{{ $t("filter") }}</span>
    </div>

    <Suspense>
      <template #fallback>
        <div class="bg-slate-200/70 dark:bg-dark-2 rounded-xl h-[42.19px] w-full animate-pulse" />
      </template>
      <template #default>
        <DateRangeX v-model="date" />
      </template>
    </Suspense>
    <div
      class="flex space-x-1 overflow-hidden rounded-xl bg-slate-200/70 dark:bg-dark-2 *:cursor-pointer [&>button]:flex-1 [&>button]:p-2 hover:[&>button]:bg-second-2/20 lg:[&>button]:p-2 [&>div]:flex-1"
    >
      <button
        type="button"
        :class="{
          'bg-second-2/90! text-white': isType('showroom'),
        }"
        @click="setType('showroom')"
      >
        Showroom
      </button>
      <button
        type="button"
        :class="{
          'bg-second-2/90! text-white': isType('idn'),
        }"
        @click="setType('idn')"
      >
        IDN Live
      </button>
    </div>
    <div
      class="flex space-x-1 overflow-hidden rounded-xl bg-slate-200/70 dark:bg-dark-2 *:cursor-pointer [&>button]:flex-1 [&>button]:p-2 hover:[&>button]:bg-second-2/20 lg:[&>button]:p-2 [&>div]:flex-1"
    >
      <button
        type="button"
        :class="{
          'bg-second-2/90! text-white': isActive(false),
        }"
        @click="setGraduated(false)"
      >
        Active
      </button>
      <button
        type="button"
        :class="{
          'bg-second-2/90! text-white': isActive(true),
        }"
        @click="setGraduated(true)"
      >
        Graduated
      </button>
    </div>
    <div v-if="generation.length" class="space-y-2">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-sm font-semibold transition-colors"
          :class="allGenerationSelected ? 'bg-second-2/90 text-white' : 'bg-slate-200/70 dark:bg-dark-2'"
          @click="setGenerationSelection([...generationKeys])"
        >
          {{ $t('sorter.all_generation') }}
        </button>
        <button
          v-for="gen in generation"
          :key="gen.key"
          type="button"
          class="rounded-full px-3 py-1 text-sm font-semibold transition-colors"
          :class="selectedGenerationKeys.includes(gen.key) ? 'bg-second-2/90 text-white' : 'bg-slate-200/70 dark:bg-dark-2'"
          @click="toggleGeneration(gen.key)"
        >
          {{ parseGeneration(gen.key, true) || gen.short_title || gen.key }}wew
        </button>
      </div>
    </div>
    <button
      type="button"
      :disabled="!isEnabled"
      class="hover w-full select-none rounded-xl bg-second-2/80 p-2 text-center font-bold text-white transition-transform hover:bg-second-2 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 dark:disabled:text-gray-500 lg:p-3"
      @click="apply"
    >
      {{ $t("sort.apply") }}
    </button>
  </div>
</template>
