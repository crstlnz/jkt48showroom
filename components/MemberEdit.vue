<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  member: IShowroomMemberCustom
  stage48members: I48Member[]

}>()
const emit = defineEmits(['onDismiss'])
const { addNotif } = useNotifications()
const member = ref<IShowroomMemberCustom>(props.member)
const stage48members = ref(props.stage48members.filter(i => i.group === member.value.group))
const editDialog = ref()
const config = useAppConfig()
const memberDataId = ref((member.value.member_data as any)?._id)

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

async function apply() {
  applyProgress.value = true
  const result = await $fetch('/api/admin/showroom/set_member_data', {
    method: 'POST',
    query: {
      room_id: props.member.room_id,
      memberDataId: memberDataId.value,
    },
  }).catch((e) => {
    console.log(e)
    addNotif({ message: 'Failed', type: 'warn', duration: 1500 })
  })

  applyProgress.value = false
  if (result?.code === 200) {
    addNotif({ message: 'Success', type: 'success', duration: 1500 })
    const data = props.stage48members.find(i => (i as any)._id === memberDataId.value) || null
    if (member.value.member_data) {
      member.value.member_data = data
    }
    emit('onDismiss')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-aboveNav bg-black/50">
    <div ref="editDialog" class="bg-container absolute left-1/2 top-1/2 min-w-[450px] max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-xl p-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-5">
          <div class="aspect-video h-36 overflow-hidden rounded-xl border-2 dark:border-dark-2 md:h-40 xl:h-44">
            <img class="h-full w-full object-cover" :src="$fixCloudinary(member?.img || config.errorPicture)" :alt="member.name">
          </div>
          <div class="relative aspect-square h-36 overflow-hidden rounded-full border-2 dark:border-dark-2 md:h-40 xl:h-44">
            <div class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <Icon name="material-symbols:edit-rounded" size="1.6rem" class="text-white" />
            </div>
            <img class="h-full w-full object-cover" :src="$fixCloudinary(member?.member_data?.img || config.errorPicture)" :alt="member.name">
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div>
            <div class="pt-2 text-3xl font-bold">
              {{ member.name }}
            </div>
            <div class="pb-2 text-lg opacity-75">
              {{ member.url }}
            </div>
          </div>
          <button type="button" class="" @click="toggleGraduate(member?.member_data?.isGraduate !== true)">
            <div class="flex items-center gap-1 text-2xl">
              <div class="text-base" :class="member.is_group ? 'text-blue-500' : (member?.member_data?.isGraduate ? 'text-red-500' : 'text-green-500')">
                {{ member.is_group ? "Official" : (member?.member_data?.isGraduate ? "Graduated" : "Active") }}
              </div>
              <Icon name="humbleicons:exchange-horizontal" size="1.2rem" />
            </div>
          </button>
          <!-- <div class="font-bold">
            {{ (member?.member_data as any)?._id }}
          </div> -->
          <div class="flex items-center gap-3">
            <div class="whitespace-nowrap text-lg">
              Member Data :
            </div>
            <select v-if="stage48members != null" id="member_data" v-model="memberDataId" class="bg-container-2 w-0 flex-1 rounded-md p-1.5">
              <option>
                No data
              </option>
              <option v-for="m in stage48members" :key="(m as any)._id" :value="(m as any)._id">
                {{ m.name }}
              </option>
            </select>
            <div v-else>
              Loading...
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-3">
            <button type="button" class="rounded-full bg-red-500 px-6 py-2.5 text-white hover:brightness-75" @click="$emit('onDismiss')">
              Close
            </button>
            <button :disabled="memberDataId === (member.member_data as any)?._id || applyProgress" type="button" class="rounded-full bg-blue-500 px-6 py-2.5 text-white hover:brightness-75 disabled:brightness-50" @click="apply">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
