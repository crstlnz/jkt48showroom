<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'
import { LazyImage } from '#components'

const props = defineProps<{
  member: Admin.IShowroomMember
  stage48members: Database.I48Member[]
  jkt48members: JKT48.Member[]
}>()
const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdateShowroom', data: Admin.IShowroomMember): void
  (e: 'onUpdateMember', data: Admin.I48Member): void
}>()
const { addNotif } = useNotifications()
const member = ref<Admin.IShowroomMember>(props.member)
const stage48members = ref(props.stage48members.filter(i => i.group === member.value.group))
const editDialog = ref()
const config = useAppConfig()
const memberDataId = ref((member.value.member_data as any)?._id)

watch(() => props.member, (m) => {
  memberDataId.value = m.member_data?._id
  member.value = m
})

watch(() => props.stage48members, (val) => {
  stage48members.value = val.filter(i => i.group === member.value.group)
})

onClickOutside(editDialog, () => {
  emit('onDismiss')
})

async function toggleGraduate(value: boolean) {
  const result = await $fetch('/api/admin/showroom/set_graduate', {
    method: 'POST',
    query: {
      id: (props.member?.member_data as any)?._id,
      value,
    },
  }).catch((e) => {
    console.log(e)
  })

  if (result?.code === 200) {
    if (member.value.member_data) {
      member.value.member_data.isGraduate = value
    }
  }
}

const applyProgress = ref(false)

async function applyMemberData() {
  applyProgress.value = true
  const result = await $fetch('/api/admin/showroom/set_member_data', {
    method: 'POST',
    query: {
      room_id: props.member.room_id,
      memberDataId: memberDataId.value,
    },
  }).catch((e) => {
    console.log(e)
    addNotif({ message: 'Failed', type: 'danger', duration: 1500 })
  })

  applyProgress.value = false
  if (result?.code === 200) {
    addNotif({ message: 'Success', type: 'success', duration: 1500 })
    const data = props.stage48members.find(i => (i as any)._id === memberDataId.value) as Database.I48Member & { _id: string } || null
    if (member.value.member_data) {
      member.value.member_data = data
    }
    emit('onDismiss')
  }
}

const tabState = ref(0)
const tabList = ref([
  {
    title: 'Showroom',
    key: 0,
  },
  {
    title: 'Member Data',
    key: 1,
  },
])
</script>

<template>
  <div class="fixed inset-0 z-aboveNav bg-black/50">
    <div ref="editDialog" class=" bg-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2">
      <div class="roundedscrollbar my-6 max-h-[90vh] max-w-[90vw] overflow-y-auto overscroll-none px-3 md:px-5 lg:px-8">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-6 overflow-x-auto">
            <div class="aspect-video h-32 shrink-0 overflow-hidden rounded-xl border-2 dark:border-dark-2 md:h-36 xl:h-40">
              <LazyImage class="h-full w-full object-cover" :src="$fixCloudinary(member?.img || config.errorPicture)" :alt="member.name" />
            </div>
            <MemberFormImage
              v-if="member?.member_data?._id != null"
              post-url="/api/admin/showroom/image_upload"
              :is-potrait="true" :member-data-id="member?.member_data?._id"
              form-id="image"
              class="aspect-square h-32 shrink-0 overflow-hidden rounded-full border-2 dark:border-dark-2 md:h-36 xl:h-40"
              image-class="h-full w-full object-cover"
              :src="member?.member_data?.img" :alt="member.name"
              @uploaded="(url) => {
                if (member.member_data)
                  member.member_data.img = url
              }"
            />
            <div
              v-else
              class="bg-container-2 flex aspect-square h-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-center dark:border-dark-2 md:h-36 xl:h-40"
            >
              <div>Member data is not defined!</div>
            </div>
            <MemberFormImage
              v-if="member?.member_data?._id != null"
              form-id="banner"
              post-url="/api/admin/showroom/banner_upload"
              :member-data-id="member?.member_data?._id"
              class="aspect-[15/5] h-32 shrink-0 overflow-hidden rounded-xl border-2 dark:border-dark-2 md:h-36 xl:h-40"
              image-class="h-full w-full object-cover bg-container-2" :src="member?.member_data?.banner"
              @uploaded="(url) => {
                if (member.member_data)
                  member.member_data.banner = url
              }"
            />
            <div
              v-else
              class="bg-container-2 flex aspect-[15/5] h-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 text-center dark:border-dark-2 md:h-36 xl:h-40"
            >
              <div>Member data is not defined!</div>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex justify-between">
              <div>
                <div class="pt-2 text-2xl font-bold">
                  {{ member.name }}
                </div>
                <div class="pb-2 text-base opacity-75">
                  {{ member.url }}
                </div>
              </div>
              <button type="button" class="" @click="toggleGraduate(member?.member_data?.isGraduate !== true)">
                <div class="flex items-center gap-1 text-xl">
                  <div class="text-base" :class="member.is_group ? 'text-blue-500' : (member?.member_data?.isGraduate ? 'text-red-500' : 'text-green-500')">
                    {{ member.is_group ? "Official" : (member?.member_data?.isGraduate ? "Graduated" : "Active") }}
                  </div>
                  <Icon name="humbleicons:exchange-horizontal" size="1.2rem" />
                </div>
              </button>
            </div>
            <div class="flex items-center gap-3">
              <div class="whitespace-nowrap text-base">
                Member Data :
              </div>
              <FormSelect
                v-if="stage48members != null"
                v-model="memberDataId"
                form-id="memberDataId"
                input-class="bg-container-2 text-base"
                class="min-w-0 flex-1"
                :data="stage48members.map(i => { return { title: i.name, value: (i as any)._id } })"
              />
              <!-- <select v-if="stage48members != null" id="member_data" v-model="memberDataId" class="bg-container-2 min-w-0 flex-1 rounded-md p-1.5 text-base">
                <option>
                  No data
                </option>
                <option v-for="m in stage48members" :key="(m as any)._id" :value="(m as any)._id">
                  {{ m.name }}
                </option>
              </select> -->
              <div v-else>
                Loading...
              </div>
              <button
                :disabled="memberDataId === (member.member_data as any)?._id || applyProgress"
                type="button"
                class="rounded-full bg-blue-500 px-4 py-2 text-white hover:brightness-75 disabled:brightness-50"
                @click="applyMemberData"
              >
                Save
              </button>
            </div>
            <!-- <div class="mt-3 w-full border-t border-black/10 dark:border-white/10" /> -->
            <div class="mt-4">
              <div class="flex items-stretch overflow-hidden rounded-full border-2 border-slate-200 text-center text-lg hover:[&>div]:bg-container-2 dark:border-dark-3 [&>div]:h-10">
                <div v-for="tab in tabList" :key="tab.key" class="flex-1 cursor-pointer leading-10" :class="{ 'bg-container-2': tabState === tab.key }" @click="tabState = tab.key">
                  {{ tab.title }}
                </div>
              </div>
              <div class="py-5">
                <MemberFormShowroom
                  v-if="tabState === 0"
                  :member="member"
                  @on-update="(data) => $emit('onUpdateShowroom', data)"
                  @on-dismiss="$emit('onDismiss')"
                />
                <div v-else-if="tabState === 1">
                  <div v-if="member.member_data?._id == null" class="flex aspect-[19/4] items-center justify-center text-center">
                    No member data
                  </div>
                  <MemberFormMemberData
                    v-else
                    :member-data="member?.member_data"
                    :jkt48members="jkt48members"
                    @on-update="(data) => $emit('onUpdateMember', data)"
                    @on-dismiss="$emit('onDismiss')"
                  />
                  <!-- <div v-else class="flex w-full flex-col gap-3">
                    <div v-for="form in formMemberData" :key="form.id" class="flex w-full gap-3">
                      <div class="w-[70px] shrink-0 truncate pt-1.5 md:w-[90px] lg:w-[120px]">
                        {{ form.title }}
                      </div>
                      <component :is="form.component ?? FormText" v-model="form.data" form-id="start" :placeholder="form.placeholder ?? form.title" input-class="bg-container-2 flex-1" class="min-w-0 flex-1" />
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
            <!-- <div class="mt-2 flex justify-end gap-3">
              <button type="button" class="rounded-full bg-red-500 px-6 py-2.5 text-white hover:brightness-75" @click="$emit('onDismiss')">
                Close
              </button>
              <button
                type="button"
                class="rounded-full bg-blue-500 px-6 py-2.5 text-white hover:brightness-75 disabled:brightness-50"
              >
                Apply
              </button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
