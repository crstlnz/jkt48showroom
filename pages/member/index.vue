<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useStorage } from '@vueuse/core'
import { useMembers } from '~~/store/members'

const { t: $t } = useI18n()
const memberState = useMembers()
const { members: raw, pending, error } = storeToRefs(memberState)
const filterOptions = useStorage('filterOption', {
  graduate: true,
  active: true,
})

const { smallerOrEqual } = useResponsive()
const isMobile = smallerOrEqual('sm')
const data = computed(() => {
  if (filterOptions.value.active === filterOptions.value.graduate) {
    return raw.value
  }
  return raw.value.filter(i => i.is_graduate === !filterOptions.value.active)
})

const perpage = 8
const search = ref('')
const { results } = useFuse(search, data, {
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
        name: 'description',
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
const { start } = useTimeoutFn(() => {
  id.value++
}, 150, { immediate: false })

function deepCompare(obj1: any, obj2: any): boolean {
  // Compare object types
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

watch(members, (v, old) => {
  if (!deepCompare(v, old)) {
    start()
  }
})

async function getPage(pageNumber: number, pageSize: number) {
  const num = pageNumber * pageSize
  return [...(members.value ?? []).slice(num, num + pageSize)]
}

useHead({ title: computed(() => $t('page.title.member')) })
</script>

<template>
  <LayoutSingleRow title="Member List" :enable-search="true" @search="(v) => search = v">
    <template #default>
      <MemberListView v-if="isMobile" :pending="pending" :error="error" :members="members" :get-page="getPage" :perpage="perpage" />
      <MemberGridView v-else :key="id" :pending="pending" :error="error" :members="members" :get-page="getPage" :perpage="perpage" />
    </template>
    <template #actionSection>
      <div class="flex items-center gap-3">
        <LayoutPopupButton class="bg-container flex aspect-square h-10 w-10 items-center justify-center rounded-2xl transition-colors sm:hover:bg-blue-500 sm:hover:text-slate-100">
          <template #default>
            <Icon name="mi:filter" />
          </template>
          <template #panel>
            <div class="bg-container flex min-w-[250px] flex-col items-stretch py-3 text-lg max-sm:py-5">
              <SwitchGroup>
                <div role="button" class="flex sm:hover:bg-gray-300/25">
                  <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-4 py-2.5 max-sm:px-6">
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
                  <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-4 py-2.5 max-sm:px-6">
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
