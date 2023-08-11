<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useMembers } from '~~/store/members'
import { useSettings } from '~~/store/settings'
import { generateGen, parseGeneration } from '~~/library/utils/stage48'

const { t: $t } = useI18n()
const memberState = useMembers()
const { members: raw, pending, error } = storeToRefs(memberState)
const route = useRoute()
let filterOptions: Ref< {
  generation: string[]
  graduate: boolean
  active: boolean
}>
let search: Ref<string>
if (route.query?.gen) {
  filterOptions = ref<{
    generation: string[]
    graduate: boolean
    active: boolean
  }>({
    generation: [String(route.query.gen)],
    graduate: false,
    active: true,
  })
  search = ref('')
}
else {
  filterOptions = useSessionStorage<{
    generation: string[]
    graduate: boolean
    active: boolean
  }>('filterOption', {
    generation: [],
    graduate: false,
    active: true,
  })
  search = useSessionStorage('member-page-search', () => '')
}

const { group } = useSettings()
const generations = computed(() => {
  const gen = generateGen()
  return gen[group]
})

const { smallerOrEqual } = useResponsive()
const isMobile = smallerOrEqual('sm')
const data = computed(() => {
  let members = raw.value
  if (filterOptions.value.generation?.length) {
    members = members.filter(i => filterOptions.value.generation.includes(i.generation ?? ''))
  }

  if (filterOptions.value.active === filterOptions.value.graduate) {
    return members
  }
  return members.filter(i => i.is_graduate === !filterOptions.value.active)
})

const perpage = 8
const { results } = useFuse(search, data, {
  fuseOptions: {
    threshold: 0.35,
    includeScore: true,
    includeMatches: true,
    keys: [
      {
        name: 'name',
        weight: 0.4,
      },
      {
        name: 'description',
        weight: 0.1,
      },
      {
        name: 'nicknames',
        weight: 0.4,
      },
      {
        name: 'url',
        weight: 0.1,
      },
    ],
  },
})

const members = computed(() => {
  return search.value === '' ? data.value : results.value.map(i => i.item)
})

const id = ref(0)

function deepCompare(obj1: any, obj2: any): boolean {
  try {
    if (!obj1 || !obj2) return false
    if (typeof obj1 !== typeof obj2) {
      return false
    }

    // Compare arrays recursively
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        return false
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!deepCompare(obj1[i], obj2[i])) {
          return false
        }
      }
      return true
    }

    // Compare objects recursively
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)

      if (keys1.length !== keys2.length) {
        return false
      }

      for (const key of keys1) {
        if (!deepCompare(obj1[key], obj2[key])) {
          return false
        }
      }

      return true
    }

    // Compare primitive types
    return obj1 === obj2
  }
  catch (e) {
    console.log(e)
    return false
  }
}

watch(members, (v, old) => {
  if (!deepCompare(v, old)) {
    id.value++
  }
})

function toggleGen(key: string) {
  if (filterOptions.value.generation.includes(key)) {
    filterOptions.value.generation = filterOptions.value.generation.filter(i => i !== key)
  }
  else {
    filterOptions.value.generation.push(key)
  }
}
const title = computed(() => {
  if (route.query?.gen) {
    return parseGeneration(String(route.query.gen)) || $t('page.title.member')
  }
  else {
    return $t('page.title.member')
  }
})
useHead({
  title,
})
</script>

<template>
  <LayoutSingleRow :title="title" :search="search" :enable-search="true" @search="(v) => search = v">
    <template #default>
      <MemberListView v-if="isMobile" :pending="pending" :error="error" :members="members" />
      <MemberGridView v-else :key-id="id" :pending="pending" :error="error" :members="members" :perpage="perpage" />
    </template>
    <template #actionSection>
      <div class="flex items-center gap-3">
        <LayoutPopupButton class="bg-container flex aspect-square h-10 w-10 items-center justify-center rounded-2xl transition-colors sm:hover:bg-blue-500 sm:hover:text-slate-100">
          <template #default>
            <Icon name="mi:filter" />
          </template>
          <template #panel>
            <div class="bg-container flex min-w-[280px] flex-col items-stretch py-3 text-lg max-sm:mx-2 max-sm:mt-2 max-sm:py-5">
              <h3 class="px-4 text-xl font-bold max-sm:text-2xl sm:pt-2">
                Filter
              </h3>
              <div class="flex flex-wrap gap-3 p-4">
                <div
                  v-for="gen in generations" :key="gen.key"
                  class="cursor-pointer rounded-full px-2 py-1 text-sm"
                  :class="filterOptions.generation.includes(gen.key) ? 'bg-blue-500 text-white' : 'dark:bg-blue-400/5 bg-blue-400/10 hover:bg-blue-400/50  dark:hover:bg-blue-400/50'"
                  @click="() => toggleGen(gen.key)"
                >
                  {{ gen.short_title }}
                </div>
              </div>
              <SwitchGroup>
                <div role="button" class="flex sm:hover:bg-gray-300/25">
                  <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-5 py-2.5 max-sm:px-6">
                    Active
                    <Switch
                      v-model="filterOptions.active"
                      :class="filterOptions.active ? 'bg-blue-600' : 'bg-gray-200'"
                      class="relative inline-flex h-6 w-11 items-center rounded-full"
                    >
                      <span class="sr-only">Active Member</span>
                      <span
                        :class="filterOptions.active ? 'translate-x-6' : 'translate-x-1'"
                        class="inline-block h-4 w-4 rounded-full bg-white transition"
                      />
                    </Switch>
                  </SwitchLabel>
                </div>
              </SwitchGroup>
              <SwitchGroup>
                <div role="button" class="flex sm:hover:bg-gray-300/25">
                  <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-5 py-2.5 max-sm:px-6">
                    Graduate
                    <Switch
                      v-model="filterOptions.graduate"
                      :class="filterOptions.graduate ? 'bg-blue-600' : 'bg-gray-200'"
                      class="relative inline-flex h-6 w-11 items-center rounded-full"
                    >
                      <span class="sr-only">Graduate Member</span>
                      <span
                        :class="filterOptions.graduate ? 'translate-x-6' : 'translate-x-1'"
                        class="inline-block h-4 w-4 rounded-full bg-white transition"
                      />
                    </Switch>
                  </SwitchLabel>
                </div>
              </SwitchGroup>
            </div>
          </template>
        </LayoutPopupButton>
      </div>
    </template>
  </LayoutSingleRow>
</template>
