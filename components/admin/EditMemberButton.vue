<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  roomId: number
}>()

const { user } = useAuth()

const openDialog = ref(false)
const pending = ref(true)
const editMember = ref()
const stage48members = ref()
const jkt48members = ref()
const { addNotif } = useNotifications()

async function getData() {
  pending.value = true
  try {
    const res = await $apiFetch<Admin.ApiMemberEditData>('/api/admin/member/data', {
      query: {
        room_id: props.roomId,
      },
    })
    editMember.value = res.member
    stage48members.value = res.stage48members
    jkt48members.value = res.jkt48members
  }
  catch (e) {
    openDialog.value = false
    addNotif({
      message: 'Failed to get data!',
      type: 'danger',
    })
  }
  pending.value = false
}

function editRequest() {
  openDialog.value = true
  getData()
}

function onDismiss() {
  stage48members.value = null
  jkt48members.value = null
  editMember.value = null
  openDialog.value = false
}
</script>

<template>
  <div v-if="user?.is_admin">
    <Transition name="fade">
      <MemberEdit
        v-if="openDialog"
        :pending="pending"
        :member="editMember"
        :stage48members="(stage48members as any) ?? []"
        :jkt48members="(jkt48members as any) ?? []"
        @on-dismiss="onDismiss"
      />
    </Transition>
    <button v-ripple type="button" class="bg-blue-500 rounded-full h-full aspect-square flex items-center justify-center" @click="editRequest">
      <Icon name="heroicons:pencil-solid" class="w-full h-full p-2" />
    </button>
  </div>
</template>
