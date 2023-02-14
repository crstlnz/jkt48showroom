<script lang="ts" setup>
import { useFocus } from '@vueuse/core'

const { $device } = useNuxtApp()
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

const search = ref(props.query.search)
const emit = defineEmits(['apply'])
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
  }
)

enum sortType {
  LATEST,
  OLDEST,
  MOST_GIFT,
  MOST_VIEWS,
}

function getSortKey (sort: sortType): string {
  switch (sort) {
    case sortType.LATEST:
      return 'sort.latest'
    case sortType.OLDEST:
      return 'sort.oldest'
    case sortType.MOST_GIFT:
      return 'sort.mostgift'
    case sortType.MOST_VIEWS:
      return 'sort.mostviews'
  }
}

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
  // if (temp.value.filter !== undefined) {
  //   if (newVal === props.query.filter) {
  //     return (temp.value.filter = undefined);
  //   } else if (newVal === temp.value.filter) {
  //     return (temp.value.filter = bool ? 'all');
  //   }
  //   return (temp.value.filter = newVal);
  // }

  // if (props.query.filter === newVal) {
  //   temp.value.filter = "all";
  // } else {
  //   temp.value.filter = newVal;
  // }
  // // temp.value.graduated = val === undefined || bool !== val ? bool : bool === props.query.graduated ? undefined : null;
}

const setSort = (key: string | number) => {
  const keyString = sortType[key]?.toLowerCase()
  if (keyString === props.query.sort) {
    return delete temp.value.sort
  }
  temp.value.sort = keyString
}

const searchinput = ref(null)
const { focused } = useFocus(searchinput)
const apply = () => {
  if ($device.isMobile) focused.value = false
  const q = { ...temp.value, search: search.value }
  for (const key of Object.keys(props.query)) {
    if (!Object.hasOwn(q, key)) {
      q[key] = props.query[key]
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
    <!-- todo -->
    <!-- <div>
      <Combobox v-model="selectedMembers" :display-value="(member) => member.name" multiple>
        <div
          class="relative flex items-center gap-2 border-2 border-transparent focus-within:border-second-2/60 ui-active:border-second-2/60 px-2 py-1 lg:p-2 rounded-xl bg-slate-100/60 dark:bg-dark-2/60 w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <ComboboxInput class="flex-1 w-0 outline-none bg-transparent border-none" @change="inputEvent" />
          <ComboboxOptions
            class="absolute shadow-md bg-white dark:bg-dark-1 right-0 left-0 top-[calc(100%_+_8px)] border-2 border-slate-300 dark:border-gray-600 overflow-x-hidden rounded-lg max-h-[400px] overflow-y-auto"
          >
            <div v-if="pending" class="px-4 py-2">Loading...</div>
            <div v-else-if="!members || !members.length || !filteredMembers.length" class="px-4 py-2">No Data.</div>
            <ComboboxOption
              v-for="member in filteredMembers"
              v-else
              :key="member.item.room_id"
              :value="member.item"
              class="cursor-pointer flex"
            >
              <div class="w-0 overflow-hidden ui-active:w-8 transition-[width] bg-blue-400" />
              <div class="px-4 py-2 flex-1 w-0 truncate text-base">
                {{ member.item?.name ?? "Member not Found!" }}
              </div>
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </Combobox>
    </div> -->
    <div class="bg-slate-100/60 dark:bg-dark-2/60 py-2 px-3 rounded-xl">
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
    <ul
      class="overflow-hidden rounded-xl bg-slate-100/60 dark:bg-dark-2/60 max-h-[250px] overflow-y-auto overflow-x-hidden"
    >
      <li
        v-for="key in Object.keys(sortType)
          .filter((v) => !isNaN(Number(v)))
          .map((i) => parseInt(i))"
        :key="key"
      >
        <button
          type="button"
          class="font-bold px-4 py-2 lg:py-3 cursor-pointer hover:bg-second-2/20 w-full"
          :class="{
            '!bg-second-2/90 text-white': key == Number(sortType[String(temp.sort ?? query.sort)?.toUpperCase()]),
          }"
          @click="setSort(key)"
        >
          {{ $t(getSortKey(key)) }}
        </button>
      </li>
    </ul>
    <div
      class="flex bg-slate-100/60 dark:bg-dark-2/60 rounded-xl hover:[&>button]:bg-second-2/20 [&>div]:flex-1 [&>button]:p-2 lg:[&>button]:p-2 [&>button]:flex-1 overflow-hidden [&>*]:cursor-pointer space-x-1"
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
      class="p-2 lg:p-3 hover bg-second-2/80 hover:bg-second-2 select-none rounded-xl w-full text-center text-white font-bold active:scale-95 transition-transform disabled:active:scale-100 disabled:bg-second-2/40 disabled:text-gray-400 disabled:dark:text-gray-500"
      @click="apply"
    >
      {{ $t("sort.apply") }}
    </button>
  </div>
</template>
