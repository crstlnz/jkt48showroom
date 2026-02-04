<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFuse } from '@vueuse/integrations/useFuse'

const { data, pending } = await useApiFetch<Admin.ApiMissingJKT48ID>('/api/admin/missing_jkt48id')

const missingMembers = ref<Admin.MissingJKT48ID[]>([])

watch(data, (d) => {
  if (d?.members) {
    missingMembers.value = d.members
  }
}, { immediate: true })

const filterOptions = useSessionStorage<{
  generation: string[]
  graduate: boolean
  active: boolean
}>('filterOptionAdmin', {
  generation: [],
  graduate: true,
  active: true,
})

const search = useSessionStorage('admin-missingsearchjkt48id', '')

const dataFiltered = computed(() => {
  let members: Admin.MissingJKT48ID[] = (missingMembers.value ?? [])
  if (filterOptions.value.generation?.length) {
    members = members.filter(i => filterOptions.value.generation.includes(i.generation ?? ''))
  }

  if (filterOptions.value.active === filterOptions.value.graduate) {
    return members
  }
  return members.filter(i => i.isGraduate === !filterOptions.value.active)
})

const { results } = useFuse(search, dataFiltered, {
  fuseOptions: {
    threshold: 0.35,
    includeScore: true,
    includeMatches: true,
    keys: [
      {
        name: 'name',
        weight: 0.5,
      },
      {
        name: 'jikosokai',
        weight: 0.3,
      },
      {
        name: 'url',
        weight: 0.2,
      },
    ],
  },
})

const members = computed(() => {
  return search.value === '' ? dataFiltered.value : results.value.map(i => i.item)
})

const generations = computed(() => {
  const gen = generateGen()
  return gen.jkt48
})

function remove(id: string) {
  missingMembers.value = missingMembers.value.filter(i => i._id !== id)
}

function toggleGen(key: string) {
  if (filterOptions.value.generation.includes(key)) {
    filterOptions.value.generation = filterOptions.value.generation.filter(i => i !== key)
  }
  else {
    filterOptions.value.generation.push(key)
  }
}

const editMember = ref<Admin.MissingJKT48ID | null>()
</script>

<template>
  <LayoutSingleRow title="Missing JKT48 ID" :enable-search="true" :search="search" @search="(v) => search = v">
    <template #default>
      <Transition name="fade">
        <AdminMissingJkt48idForm v-if="editMember" :member="editMember" :jkt48members="data?.jkt48members || []" @dismiss="editMember = null" @update-member="(id) => remove(id)" />
      </Transition>
      <div class="space-y-5 px-3 md:px-4">
        <div v-if="pending" class="flex flex-col">
          <div v-for="num in 10" :key="num" class="pulse-color mb-3 h-[116px] animate-pulse rounded-xl" />
        </div>
        <div v-else>
          <ClientOnly>
            <template #fallback>
              <div class="flex flex-col">
                <div v-for="num in 10" :key="num" class="pulse-color mb-3 h-[128px] animate-pulse rounded-xl" />
              </div>
            </template>
            <RecycleScroller
              key="loaded"
              v-slot="{ item }"
              :prerender="10"
              :item-size="140"
              :items="members"
              key-field="_id"
              page-mode
            >
              <div class="mb-3 w-full px-3 md:x-4">
                <button type="button" class="w-full focus-within:outline-hidden group rounded-xl" @click="editMember = item">
                  <AdminMissingJkt48id :key="item._id" :member="item" class="group-focus-within:bg-container-2" />
                </button>
              </div>
            </RecycleScroller>
          </ClientOnly>
        </div>
      </div>
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
                  class="cursor-pointer rounded-full px-2 py-1 text-sm "
                  :class=" filterOptions.generation.includes(gen.key) ? 'bg-blue-500 text-white' : 'dark:bg-blue-400/5 bg-blue-400/10 hover:bg-blue-400/50  dark:hover:bg-blue-400/50'"
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
  <!-- <LayoutSingleRow title="Missing JKT48 ID">
    <div v-if="pending" class="flex justify-center items-center aspect-video">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error " class="flex justify-center aspect-video">
      <Error message="Error pak!" img-src="/svg/error.svg" url="/admin" />
    </div>
    <div v-else-if="!data || !data?.members?.length" class="flex justify-center aspect-video">
      <Error message="Tidak ada yang missing :)" :img-src="`${$imgCDN}/assets/svg/web/no_data.svg`" url="/admin" />
    </div>
    <div v-else class="space-y-3 md:space-y-4">
      <AdminMissingJkt48id v-for="member in missingMembers" :key="member._id" :member="member" :jkt48members="data.jkt48members" @added="remove(member._id)" />
    </div>
  </LayoutSingleRow> -->
</template>
