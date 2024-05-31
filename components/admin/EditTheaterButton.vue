<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  theaterData: IApiTheaterDetail
}>()

const { user } = useAuth()

const openDialog = ref(false)
const pending = ref(true)
const theaterData = ref<JKT48.Theater | null>()
const jkt48members = ref<JKT48.Member[] | null>()
const { addNotif } = useNotifications()

async function getData() {
  pending.value = true
  try {
    theaterData.value = await $apiFetch<JKT48.Theater>(`/api/admin/theater/${props.theaterData.id}`)
    jkt48members.value = await $apiFetch<JKT48.Member[]>(`/api/admin/jkt48member`)
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
      <TheaterEdit
        v-if="openDialog"
        :pending="pending"
        :theater="theaterData"
        :jkt48members="jkt48members"
        @dismiss="onDismiss"
      />
    </Transition>
    <button v-ripple type="button" class="bg-blue-500 rounded-xl px-3 py-0.5 text-sm flex items-center justify-center text-blue-50" @click="edit">
      Edit Theater
    </button>
  </div>
</template>
