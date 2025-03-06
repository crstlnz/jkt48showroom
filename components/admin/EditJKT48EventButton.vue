<script lang="ts" setup>
import { EventEdit } from '#components'
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  event: IApiJKT48EventDetail
}>()

const { user } = useAuth()

const openDialog = ref(false)
const pending = ref(true)
const eventData = ref<JKT48.Event | null>()
const jkt48members = ref<JKT48.MemberWithNickname[] | null>()
const { addNotif } = useNotifications()

async function getData() {
  pending.value = true
  try {
    eventData.value = await $apiFetch<JKT48.Event>(`/api/admin/event/${props.event.id}`)
    jkt48members.value = await $apiFetch<JKT48.MemberWithNickname[]>(`/api/admin/jkt48member`)
  }
  catch {
    openDialog.value = false
    addNotif({
      message: 'Failed to get data!',
      type: 'danger',
    })
  }
  pending.value = false
}

function edit() {
  openDialog.value = true
  getData()
}

function onDismiss() {
  openDialog.value = false
}
</script>

<template>
  <div v-if="user?.is_admin">
    <Transition name="fade">
      <EventEdit
        v-if="openDialog"
        :pending="pending"
        :event="eventData"
        :jkt48members="jkt48members"
        @dismiss="onDismiss"
      />
    </Transition>
    <button v-ripple type="button" class="bg-blue-500 rounded-xl px-3 py-0.5 text-sm flex items-center justify-center text-blue-50" @click="edit">
      Edit Event
    </button>
  </div>
</template>
