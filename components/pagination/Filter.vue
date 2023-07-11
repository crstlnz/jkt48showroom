<script lang="ts" setup>
const props = defineProps({
  search: String,
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
const emit = defineEmits<{ (e: 'apply', filter: any): void; (e: 'title', title: string): void; (e: 'showDuration', show: boolean): void }>()
// const $device = useDevice()
const config = useAppConfig()
const SortList: SortData[] = config.sortList

const search = ref(props.query.search)
const temp = ref<RecentsQuery>({})
const isEnabled = computed(() => {
  if (Object.keys(temp.value).length || search.value !== props.query.search) return true
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

// const searchinput = ref(null)
// const { focused } = useFocus(searchinput)
function apply() {
  // if ($device.isMobile) focused.value = false
  const q = { ...temp.value, search: search.value }
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1 font-semibold">
        <Icon name="ph:caret-circle-right" />
        <span class="text-base">{{ $t("sort.title") }}</span>
      </div>
      <button type="button" aria-label="Sorting Type" class="group h-8 w-8 overflow-hidden rounded-md bg-slate-200/70 dark:bg-dark-2/50" @click="setOrder((temp.order ?? query.order ?? defaultQuery.order) > 0 ? -1 : 1)">
        <span class="flex h-full w-full items-center justify-center group-hover:bg-second-2/90 group-hover:text-white">
          <Icon v-if="(temp.order ?? query.order ?? -1) > 0" name="ph:sort-ascending-bold" />
          <Icon v-else name="ph:sort-descending-bold" />
        </span>
      </button>
    </div>

    <ul
      class="max-h-[250px] overflow-hidden overflow-y-auto rounded-xl bg-slate-200/70 dark:bg-dark-2/50"
    >
      <li v-for="item in SortList" :key="item.id">
        <button
          type="button"
          class="w-full cursor-pointer px-4 py-2 font-bold hover:bg-second-2/20 lg:py-3"
          :class="{
            '!bg-second-2/90 text-white': item.id === (temp.sort ?? query.sort),
          }"
          @click="setSort(item.id)"
        >
          {{ $t(item.title.btn) }}
        </button>
      </li>
    </ul>

    <div
      class="flex space-x-1 overflow-hidden rounded-xl bg-slate-200/70 dark:bg-dark-2/50 [&>*]:cursor-pointer [&>button]:flex-1 [&>button]:p-2 hover:[&>button]:bg-second-2/20 lg:[&>button]:p-2 [&>div]:flex-1"
    >
      <button
        type="button"
        :class="{
          '!bg-second-2/90 text-white': isActive(false),
        }"
        @click="setGraduated(false)"
      >
        Active
      </button>
      <button
        type="button"
        :class="{
          '!bg-second-2/90 text-white': isActive(true),
        }"
        @click="setGraduated(true)"
      >
        Graduated
      </button>
    </div>
    <button
      type="button"
      :disabled="!isEnabled"
      class="hover w-full select-none rounded-xl bg-second-2/80 p-2 text-center font-bold text-white transition-transform hover:bg-second-2 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-3"
      @click="apply"
    >
      {{ $t("sort.apply") }}
    </button>
  </div>
</template>
