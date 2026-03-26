<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useMembers } from '~/store/members'
import { useSettings } from '~/store/settings'

import { deepCompare } from '~/utils'

const { t: $t } = useI18n()
const { group } = useSettings()
// const { data: raw, pending, error } = await useApiFetch<IMember[]>('/api/member', { query: { group: settings.group }, key: `member-${settings.group}` })
const memberStore = useMembers()
const { pending, error, members: raw } = storeToRefs(memberStore)
const route = useRoute()
const router = useRouter()

onMounted(() => {
  memberStore.tryRefresh()
})
// let filterOptions: Ref< {
//   generation: string[]
//   graduate: boolean
//   active: boolean
// }> = useSessionStorage('filter-member', () => {
//   return {
//     generation: [],
//     graduate: false,
//     active: true,
//   }
// })
const defaultFilter = {
  generation: [],
  graduate: false,
  active: true,
}

interface FilterOptions {
  generation: string[]
  graduate: boolean
  active: boolean
}

const filterOptions = ref<FilterOptions>(getFilterFromQuery())

function getFilterFromQuery() {
  const query = route.query
  const generation = !query.gen ? [] : String(query.gen || '')?.split(',').map(i => `${i}-${group}`)
  const graduate = !query.graduate ? defaultFilter.graduate : String(query.graduate) === 'true'
  const active = !query.active ? defaultFilter.active : String(query.active) === 'true'

  return {
    generation: generation || [],
    graduate,
    active,
  }
}

function generateRouteQuery(opts: FilterOptions) {
  const generation = opts.generation?.map(i => i.split('-')?.[0]?.trim())?.join(',') || ''
  const graduate = opts.graduate
  const active = opts.active

  return {
    gen: generation,
    graduate: String(graduate),
    active: String(active),
  }
}

const search: Ref<string> = ref(route.query?.s ? String(route.query?.s) : '')
watch(filterOptions, (opts) => {
  const defaultquery = generateRouteQuery(defaultFilter)
  const generated = generateRouteQuery(opts)
  for (const key of Object.keys(defaultquery) as (keyof typeof defaultquery)[]) {
    if (defaultquery[key] === generated[key]) {
      delete generated[key]
    }
  }
  router.push({
    query: {
      ...generated,
      s: route.query.s,
    },
  })
}, { deep: true })

watch(search, (s) => {
  router.push({
    query: {
      ...route.query,
      s: s || undefined,
    },
  })
})

watch(search, () => {
  if (route.query.s) {
    router.replace({ query: {} })
  }
})

const generations = computed(() => {
  const fallbackGeneration = generateGen()[group] ?? []
  const dynamicGenerationKeys = Array.from(
    new Set(
      (raw.value ?? [])
        .map(member => member.generation)
        .filter((generation): generation is string => Boolean(generation)),
    ),
  ).sort((a, b) => {
    const numA = Number.parseInt(a.match(/gen(\d+)/i)?.[1] || '0', 10)
    const numB = Number.parseInt(b.match(/gen(\d+)/i)?.[1] || '0', 10)
    if (numA !== numB) return numA - numB
    return a.localeCompare(b)
  })

  const generationMap = new Map<string, { key: string, num: number, short_title: string, title: string }>()

  for (const item of fallbackGeneration) {
    generationMap.set(item.key, {
      key: item.key,
      num: item.num,
      short_title: item.short_title || parseGeneration(item.key, true) || item.key,
      title: item.title || parseGeneration(item.key) || item.key,
    })
  }

  for (const key of dynamicGenerationKeys) {
    const generationNumber = Number.parseInt(key.match(/gen(\d+)/i)?.[1] || '0', 10)
    generationMap.set(key, {
      key,
      num: generationNumber,
      short_title: parseGeneration(key, true) || key,
      title: parseGeneration(key) || key,
    })
  }

  return Array.from(generationMap.values()).sort((a, b) => {
    if (a.num !== b.num) return a.num - b.num
    return a.key.localeCompare(b.key)
  })
})

const { isMobile } = useResponsive()
const data = computed(() => {
  let members = raw.value
  if (!members) return []
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
  <LayoutSingleRow
    :title="title" :search="search" :enable-search="true" @search="(v) => search = v"
  >
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
            <div class="bg-container flex min-w-70 flex-col items-stretch py-3 text-lg max-sm:mx-2 max-sm:mt-2 max-sm:py-5">
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
