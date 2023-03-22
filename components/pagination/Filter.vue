<script lang="ts" setup>
import { useFocus } from '@vueuse/core'
const $device = useDevice()
const props = defineProps({
  members: {
    type: Array,
    default () {
      return []
    }
  },
  query: {
    type: Object,
    default () {
      return {}
    }
  }
})

type SortData = {
  title : {
    asc : string,
    desc : string,
    btn : string
  },
  id : sortType,
}

const SortList : SortData[] = [
  {
    title: {
      btn: 'sort.date',
      asc: 'sort.latest',
      desc: 'sort.oldest'
    },
    id: 'date'
  },
  {
    title: {
      btn: 'sort.gift',
      asc: 'sort.mostgift',
      desc: 'sort.leastgift'
    },
    id: 'gift'
  },
  {
    title: {
      btn: 'sort.views',
      asc: 'sort.mostviewers',
      desc: 'sort.leastviewers'
    },
    id: 'views'
  },
  {
    title: {
      btn: 'sort.duration',
      asc: 'sort.longestduration',
      desc: 'sort.shortestduration'
    },
    id: 'duration'
  }
]

const search = ref(props.query.search)
const emit = defineEmits<{(e: 'apply', filter: any) : void, (e:'title', title: string):void, (e:'showDuration', show: boolean):void}>()
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
    changeTitle(newVal)
  }
)

changeTitle(props.query)

function changeTitle (query : any) {
  const sort = SortList.find(i => (query?.sort ?? 'date') === i.id) ?? SortList[0]
  emit('title', ((query?.order ?? 0) < 0 ? sort.title.asc : sort.title.desc) ?? '')
  emit('showDuration', sort.id === 'duration')
}

// enum sortType {
//   LATEST,
//   OLDEST,
//   MOST_GIFT,
//   MOST_VIEWS,
// }

// const filters

const isActive = (bool: boolean) => {
  const val = temp.value.filter ?? props.query.filter
  if ((val !== undefined && val === 'graduated') || val === 'active') {
    return (val === 'graduated') === bool
  }
  return false
}

const setGraduated = (bool: boolean) => {
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
  } else {
    temp.value.filter = newVal
  }
}

const config = useAppConfig()
const defaultQuery = config.defaultRecentQuery

const setOrder = (order : 1 | -1) => {
  if (order === parseInt((props.query.order ?? defaultQuery.order))) {
    return delete temp.value.order
  }
  temp.value.order = order
}

const setSort = (key: string) => {
  if (key === props.query.sort) {
    return delete temp.value.sort
  }
  temp.value.sort = key
}

const searchinput = ref(null)
const { focused } = useFocus(searchinput)
const apply = () => {
  if ($device.isMobile) focused.value = false
  const q = { ...temp.value, search: search.value }
  for (const key of Object.keys(props.query)) {
    if (!Object.hasOwn(q, key)) {
      q[key as keyof typeof q] = props.query[key]
    }
  }
  emit('apply', q)
}

const clearSearch = () => {
  if (!isEnabled.value) {
    search.value = ''
    apply()
  } else {
    search.value = ''
  }
}

</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl bg-slate-100/60 py-2 px-3 dark:bg-dark-2/60">
      <input
        ref="searchinput"
        v-model="search"
        :aria-label="$t('search')"
        :placeholder="`${$t('search')}...`"
        type="text"
        class="w-full bg-transparent outline-none"
        @keyup.enter="apply"
      >
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1 font-semibold">
        <Icon name="ph:caret-circle-right" /> {{ $t("sort.title") }}
      </div>
      <button type="button" aria-label="Sorting Type" class="group h-8 w-8 overflow-hidden rounded-md bg-slate-100/60 dark:bg-dark-2/60" @click="setOrder((temp.order ?? query.order ?? defaultQuery.order) > 0 ? -1 : 1)">
        <span class="flex h-full w-full items-center justify-center group-hover:bg-second-2/90 group-hover:text-white">
          <Icon v-if="(temp.order ?? query.order ?? -1) > 0" name="ph:sort-ascending-bold" />
          <Icon v-else name="ph:sort-descending-bold" />
        </span>
      </button>
    </div>
    <ul
      class="max-h-[250px] overflow-hidden overflow-y-auto rounded-xl bg-slate-100/60 dark:bg-dark-2/60"
    >
      <li v-for="item in SortList" :key="item.id">
        <button
          type="button"
          class="w-full cursor-pointer px-4 py-2 font-bold hover:bg-second-2/20 lg:py-3"
          :class="{
            '!bg-second-2/90 text-white': item.id == (temp.sort ?? query.sort),
          }"
          @click="setSort(item.id)"
        >
          {{ $t(item.title.btn) }}
        </button>
      </li>
    </ul>

    <div
      class="flex space-x-1 overflow-hidden rounded-xl bg-slate-100/60 dark:bg-dark-2/60 [&>*]:cursor-pointer [&>button]:flex-1 [&>button]:p-2 hover:[&>button]:bg-second-2/20 lg:[&>button]:p-2 [&>div]:flex-1"
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
      ref="applyBtn"
      type="button"
      :disabled="!isEnabled"
      class="hover w-full select-none rounded-xl bg-second-2/80 p-2 text-center font-bold text-white transition-transform hover:bg-second-2 active:scale-95 disabled:bg-second-2/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-3"
      @click="apply"
    >
      {{ $t("sort.apply") }}
    </button>
  </div>
</template>
