<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'
import { LazyImage } from '#components'

const props = withDefaults(defineProps<{
  member?: Admin.IShowroomMember
  stage48members?: IdolMember[]
  jkt48members?: JKT48.Member[]
  pending?: boolean
}>(), {
  pending: () => false,
})

const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdateShowroom', data: Admin.IShowroomMember): void
  (e: 'onUpdateMember', data: Admin.IdolMemberWithID): void
}>()

const router = useRouter()
const route = useRoute()
const hashDialog = '#formdialog'
onMounted(() => {
  router.push({
    path: route.fullPath,
    hash: '#formdialog',
  })
})

watch(() => route.hash, (hash, oldhash) => {
  if (oldhash === hashDialog && !hash) emit('onDismiss')
})

const { addNotif } = useNotifications()
const member = ref<Admin.IShowroomMember | undefined>(props.member)
const stage48members = ref(props.stage48members?.filter(i => i.group === member.value?.group))
const editDialog = ref()
const config = useAppConfig()
const memberDataId = ref((member.value?.member_data as any)?._id)

watch(() => props.member, (m) => {
  memberDataId.value = m?.member_data?._id
  member.value = m
})

watch(() => props.stage48members, (val) => {
  stage48members.value = val?.filter(i => i.group === member.value?.group)
})

onClickOutside(editDialog, () => {
  emit('onDismiss')
})

async function toggleGraduate(value: boolean) {
  await $apiFetch('/api/admin/set_graduate', {
    method: 'POST',
    query: {
      id: (props.member?.member_data as any)?._id,
      value,
    },
    onResponse(ctx) {
      if (ctx.response.status === 200) {
        if (member.value?.member_data) {
          member.value.member_data.info.is_graduate = value
        }
      }
    },
  }).catch((e) => {
    addNotif({ message: 'Failed Set Graduate', type: 'danger', duration: 1500 })
    console.log(e)
  })
}

const applyProgress = ref(false)

async function applyMemberData() {
  applyProgress.value = true
  await $apiFetch('/api/admin/set_member_data', {
    method: 'POST',
    query: {
      room_id: props.member?.room_id,
      memberDataId: memberDataId.value,
    },
    onResponse(ctx) {
      if (ctx.response.status) {
        addNotif({ message: 'Success', type: 'success', duration: 1500 })
        const data = props.stage48members?.find(i => (i as any)._id === memberDataId.value) as IdolMember & { _id: string } || null
        if (member.value?.member_data) {
          member.value.member_data = data
        }
        emit('onDismiss')
      }
    },
  }).catch((e) => {
    console.log(e)
    addNotif({ message: 'Failed', type: 'danger', duration: 1500 })
  })

  applyProgress.value = false
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
    <div ref="editDialog" class="bg-container absolute left-1/2 top-1/2 -translate-x-1/2 overflow-y-auto overscroll-contain -translate-y-1/2 md:rounded-xl max-md:w-full max-md:h-full max-h-full max-w-full md:max-h-[95vh] md:max-w-[95vw]">
      <div v-if="!pending && member" class="roundedscrollbar py-4 md:py-6 px-3 md:px-5 lg:px-8">
        <div class="flex flex-col gap-1.5 w-full">
          <div class="flex h-20 md:h-32 xl:h-36 items-center gap-3 md:gap-5 overflow-x-auto">
            <div class="aspect-video h-full shrink-0 overflow-hidden rounded-xl border-2 dark:border-dark-2">
              <LazyImage class="h-full w-full object-cover" :src="$fixCloudinary(member?.img || config.errorPicture)" :alt="member.name" />
            </div>
            <MemberFormImage
              v-if="member?.member_data?._id != null"
              post-url="/api/admin/member/image"
              :is-potrait="true"
              :member-data-id="member?.member_data?._id"
              form-id="image"
              class="aspect-square h-full shrink-0 overflow-hidden rounded-full border-2 dark:border-dark-2"
              image-class="h-full w-full object-cover"
              :src="member?.member_data?.info?.img" :alt="member.name"
              @uploaded="(url) => {
                if (member?.member_data)
                  member.member_data.info.img = url
              }"
            />
            <div
              v-else
              class="bg-container-2 flex aspect-square h-full shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-center dark:border-dark-2"
            >
              <div>Member data is not defined!</div>
            </div>
            <MemberFormImage
              v-if="member?.member_data?._id != null"
              form-id="banner"
              post-url="/api/admin/member/banner"
              :member-data-id="member?.member_data?._id"
              class="aspect-[15/5] h-full shrink-0 overflow-hidden rounded-xl border-2 dark:border-dark-2"
              image-class="h-full w-full object-cover bg-container-2" :src="member?.member_data?.info.banner"
              @uploaded="(url) => {
                if (member?.member_data)
                  member.member_data.info.banner = url
              }"
            />
            <div
              v-else
              class="bg-container-2 flex aspect-[15/5] h-full shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 text-center dark:border-dark-2"
            >
              <div>Member data is not defined!</div>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex justify-between">
              <div>
                <div class="pt-2 text-base md:text-xl xl:text-2xl font-bold">
                  {{ member.name }}
                </div>
                <div class="pb-2 text-xs md:text-base opacity-75">
                  {{ member.url }}
                </div>
              </div>
              <button type="button" class="" @click="toggleGraduate(member?.member_data?.info.is_graduate !== true)">
                <div class="flex items-center gap-1 text-xl">
                  <div class="text-sm md:text-base" :class="member.is_group ? 'text-blue-500' : (member?.member_data?.info.is_graduate ? 'text-red-500' : 'text-green-500')">
                    {{ member.is_group ? "Official" : (member?.member_data?.info.is_graduate ? "Graduated" : "Active") }}
                  </div>
                  <Icon name="humbleicons:exchange-horizontal" size="1.2rem" />
                </div>
              </button>
            </div>
            <div class="flex items-center gap-3">
              <div class="whitespace-nowrap text-sm md:text-base">
                Member Data :
              </div>
              <FormSelect
                v-if="stage48members != null"
                v-model="memberDataId"
                form-id="memberDataId"
                input-class="bg-container-2 text-sm md:text-base"
                class="min-w-0 flex-1"
                :data="stage48members.map(i => { return { title: i.name, value: (i as any)._id } })"
              />
              <div v-else>
                Loading...
              </div>
              <button
                :disabled="memberDataId === (member.member_data as any)?._id || applyProgress"
                type="button"
                class="rounded-full bg-blue-500 px-4 md:px-5 py-1.5 md:py-2 text-white hover:brightness-75 disabled:brightness-50 text-sm md:text-base"
                @click="applyMemberData"
              >
                Save
              </button>
            </div>
            <div class="mt-4">
              <div class="flex items-stretch overflow-hidden rounded-full border-2 border-slate-200 text-center text-sm md:text-lg hover:[&>div]:bg-container-2 dark:border-dark-3 [&>div]:h-8 [&>div]:md:h-10">
                <div v-for="tab in tabList" :key="tab.key" class="flex-1 cursor-pointer leading-8 md:leading-10" :class="{ 'bg-container-2': tabState === tab.key }" @click="tabState = tab.key">
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
                    :jkt48members="jkt48members || []"
                    @on-update="(data) => $emit('onUpdateMember', data)"
                    @on-dismiss="$emit('onDismiss')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-5 text-xl text-center pb-7 flex items-center justify-center h-full">
        <div class="space-y-3">
          <div>
            Loading...
          </div>
          <Icon name="heroicons:arrow-path" class="animate-spin" size="2rem" />
        </div>
      </div>
    </div>
  </div>
</template>
