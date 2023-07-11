<script lang="ts" setup>
import { useFuse } from '@vueuse/integrations/useFuse'

definePageMeta({ middleware: 'admin' })

const config = useAppConfig()
const { pending, data } = useFetch('/api/admin/members?group=all')
const { data: stage48members } = useFetch('/api/admin/stage48?group=all')

const membersRaw = ref<IShowroomMemberCustom[]>([])

watch(data, (val) => {
  membersRaw.value = val?.map((i) => {
    if (!i.member_data) {
      i.member_data = {
        description: '',
        group: '',
        isGraduate: false,
        name: '',
        img: '',
        stage48: '',
      }
    }
    return i
  }) || []
})

const search = ref('')
const { results } = useFuse(search, membersRaw, {
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

const el = ref<HTMLElement | null>(null)
// const isLocked = useScrollLock(el)
const editMember = ref<IShowroomMember>()

// watch(editMember, (val) => {
//   isLocked.value = val != null
// })

onMounted(() => {
  el.value = document.body
})

const members = computed(() => {
  if (!search.value || search.value === '') return membersRaw.value
  return results.value.map<IShowroomMemberCustom>(i => i.item)
})

const editDialog = ref()
onClickOutside(editDialog, () => {
  editMember.value = undefined
})

function onDismiss() {
  editMember.value = undefined
}
</script>

<template>
  <LayoutSingleRow title="Member" :enable-search="true" @search="(v) => search = v">
    <Transition name="fade">
      <MemberEdit v-if="editMember" :member="editMember" :stage48members="stage48members" @on-dismiss="onDismiss" />
    </Transition>
    <div class="space-y-5 px-4">
      <div v-if="pending" class="flex flex-col px-3">
        <div v-for="num in 10" :key="num" class="pulse-color mb-3 h-[116px] animate-pulse rounded-xl" />
      </div>
      <div v-else>
        <DynamicScroller
          key="loaded"
          :prerender="10"
          :min-item-size="104"
          :items="members"
          key-field="room_id"
          class="px-3"
          page-mode
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
              <div class="pb-3">
                <div class="bg-container flex gap-3 rounded-xl p-3">
                  <NuxtLink :to="`/member${item.url}`" class="h-20 w-20 overflow-hidden rounded-full">
                    <img class="h-full w-full object-cover" :src="$fixCloudinary(item.member_data?.img || item.img || config.errorPicture)" alt="Profile picture">
                  </NuxtLink>
                  <div class="flex flex-1 flex-col">
                    <NuxtLink :to="`/member${item.url}`">
                      {{ item.name }}
                    </NuxtLink>

                    <div class="flex flex-1 justify-between">
                      <div v-if="!(item.member_data)?._id && !item.is_group" class="text-base text-rose-500">
                        No member data
                      </div>
                      <div v-else class="text-base" :class="item.is_group ? 'text-blue-500' : (item?.member_data?.isGraduate ? 'text-red-500' : 'text-green-500')">
                        {{ item.is_group ? "Official" : (item?.member_data?.isGraduate ? "Graduated" : "Active") }}
                      </div>
                    </div>
                    <div class="space-x-4 self-end text-base text-slate-700 dark:text-slate-400">
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
      </div>
    </div>
  </LayoutSingleRow>
</template>
