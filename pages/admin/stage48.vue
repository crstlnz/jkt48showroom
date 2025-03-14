<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFuse } from '@vueuse/integrations/useFuse'
import { useSettings } from '~~/store/settings'

definePageMeta({ middleware: 'admin' })

const { data: stage48members, pending } = await useApiFetch<Admin.IdolMemberWithID[]>('/api/admin/stage48')
const { data: jkt48members } = await useApiFetch<JKT48.Member[]>('/api/admin/jkt48member')

const membersRaw = shallowRef<Admin.IdolMemberWithID[]>([])

watch(stage48members, (val) => {
  membersRaw.value = val as unknown as Admin.IdolMemberWithID[]
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

const search = useSessionStorage('admin-memberListStage48', '')

const el = ref<HTMLElement | null>(null)
const editMember = ref<Admin.IdolMemberWithID>()

onMounted(() => {
  el.value = document.body
})

const dataFiltered = computed(() => {
  let members: Admin.IdolMemberWithID[] = (membersRaw.value ?? [])
  if (filterOptions.value.generation?.length) {
    members = members.filter(i => filterOptions.value.generation.includes(i.info?.generation ?? ''))
  }

  if (filterOptions.value.active === filterOptions.value.graduate) {
    return members
  }
  return members.filter(i => i.info?.is_graduate === !filterOptions.value.active)
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

const members = computed<Admin.IdolMemberWithID[]>(() => {
  return search.value === '' ? dataFiltered.value : results.value.map(i => i.item)
})

const editDialog = ref()
onClickOutside(editDialog, () => {
  editMember.value = undefined
})

function onDismiss() {
  editMember.value = undefined
}

function onUpdate(data: Admin.IdolMemberWithID) {
  // editMember.value = data
  const keys = Array.from(Object.keys(data)).filter(i => i !== 'undefined')
  if (editMember.value) {
    if (!membersRaw.value?.length) return
    membersRaw.value = membersRaw.value.map((i) => {
      if (i._id === data._id) {
        const newdata = { ...i }
        for (const key of keys) {
          (newdata as any)[key] = (data as any)[key]
        }
        return newdata
      }
      else {
        return i
      }
    })
  }
}

const { group } = useSettings()
const generations = computed(() => {
  const gen = generateGen()
  return gen[group]
})

function toggleGen(key: string) {
  if (filterOptions.value.generation.includes(key)) {
    filterOptions.value.generation = filterOptions.value.generation.filter(i => i !== key)
  }
  else {
    filterOptions.value.generation.push(key)
  }
}
</script>

<template>
  <LayoutSingleRow title="Member" :enable-search="true" :search="search" @search="(v) => search = v">
    <template #default>
      <Transition name="fade">
        <AdminStage48Edit
          v-if="editMember"
          :stage48member="editMember"
          :jkt48members="jkt48members ?? []"
          @on-update-member="onUpdate"
          @on-dismiss="onDismiss"
        />
      </Transition>
      <div class="space-y-5 px-3 md:px-4">
        <div v-if="pending" class="flex flex-col">
          <div v-for="num in 10" :key="num" class="pulse-color mb-3 h-[116px] animate-pulse rounded-xl" />
        </div>
        <div v-else>
          <ClientOnly>
            <template #fallback>
              <div class="flex flex-col">
                <div v-for="num in 10" :key="num" class="pulse-color mb-3 h-[116px] animate-pulse rounded-xl" />
              </div>
            </template>
            <DynamicScroller
              key="loaded"
              :prerender="10"
              :min-item-size="104"
              :items="members"
              key-field="_id"
              page-mode
            >
              <template #default="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" :data-index="index">
                  <div class="pb-3">
                    <div class="bg-container flex gap-3 rounded-xl p-3">
                      <NuxtLink :to="`/member/${item.slug}`" class="h-20 w-20 overflow-hidden rounded-full">
                        <!-- <img :key="item._id" class="h-full w-full object-cover" :src="$fixCloudinary(item.member_data?.img || item.img || config.errorPicture)" alt="Profile picture"> -->
                        <NuxtImg
                          :key="item.room_id"
                          sizes="80px"
                          :placeholder="[45, 10, 55, 70]"
                          :modifiers="{
                            aspectRatio: 1,
                            gravity: 'faceCenter',
                          }"
                          fit="fill"
                          format="webp"
                          :alt="item.room_name"
                          class="w-full h-full flex-1 object-cover rounded-xl"
                          :src="item?.info?.img || item.img || $errorPicture"
                        />
                      </NuxtLink>
                      <div class="flex flex-1 flex-col">
                        <NuxtLink :to="`/member/${item.url}`">
                          {{ item.name }}
                        </NuxtLink>

                        <div class="flex flex-1 justify-between">
                          <div class="text-base" :class="item.is_group ? 'text-blue-500' : (item?.info?.is_graduate ? 'text-red-500' : 'text-green-500')">
                            {{ item.is_group ? "Official" : (item?.info?.is_graduate ? "Graduated" : "Active") }}
                          </div>
                        </div>
                        <div class="flex gap-4 self-end text-base text-slate-700 dark:text-slate-400">
                          <NuxtLink :to="$liveURL(item.url)" target="_blank">
                            <Icon name="ic:round-videocam" size="1.6rem" />
                          </NuxtLink>
                          <NuxtLink :to="$profileURL(item.room_id)" target="_blank">
                            <Icon name="ic:round-person" size="1.6rem" />
                          </NuxtLink>
                          <button type="button" @click="editMember = item">
                            <Icon name="material-symbols:edit-rounded" size="1.6rem" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DynamicScrollerItem>
              </template>
            </DynamicScroller>
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
</template>
