<script lang="ts" setup>
import { useDialogs } from '~/store/dialog'

definePageMeta({
  middleware: 'admin',
})

const roomId = ref()
const liveId = ref()
const excitement = ref()
const penontonAktif = ref()
const dateStart = ref()
const dateEnd = ref()
const comments = ref()
const commentsBy = ref()

const formFields = ref<HTMLFormElement>()
const gifts = ref()

const { showDialog, deleteDialog } = useDialogs()
async function submit() {
  const id = showDialog({
    type: 'loading',
    title: 'Submit',
  })

  const formData = new FormData()
  formData.append('roomId', roomId.value ?? '')
  formData.append('liveId', liveId.value ?? '')
  formData.append('excitement', excitement.value ?? '')
  formData.append('penontonAktif', penontonAktif.value ?? '')
  formData.append('dateStart', dateStart.value ?? '')
  formData.append('dateEnd', dateEnd.value ?? '')
  formData.append('comments', comments.value ?? '')
  formData.append('commentsBy', commentsBy.value ?? '')

  const gifts = (formFields.value?.elements as any).gifts
  formData.append('gifts', gifts.files[0])
  try {
    const res = await $apiFetch<{ data_id: string, status: number }>('/api/admin/input/showroom_log', {
      method: 'post',
      body: formData,
    })

    setTimeout(() => {
      location.reload()
    }, 3000)
    showDialog({
      type: 'alert',
      title: 'Success',
      duration: 3000,
      message: `Data berhasil ditambah : ${res?.data_id}`,
    })
    deleteDialog(id)
    // if (error.value) {
    //   showDialog({
    //     type: 'alert',
    //     title: 'Error',
    //     message: String(error.value),
    //   })
    // }
    // else {

    // }
  }
  catch (e: any) {
    deleteDialog(id)
    showDialog({
      type: 'alert',
      title: 'Error',
      message: e.message,
    })
  }
}
</script>

<template>
  <LayoutSingleRow title="URL Data Input">
    <template #default>
      <form ref="formFields" class="flex flex-col gap-3 p-4" enctype="multipart/form-data" method="post">
        <FormNumber v-model="roomId" form-id="roomid" label="Room id" placeholder="Room Id" />
        <FormNumber v-model="liveId" form-id="liveid" label="Live id" placeholder="Live Id" />
        <FormNumber v-model="excitement" form-id="excitement" label="Excitement" placeholder="Excitement" />
        <FormNumber v-model="penontonAktif" form-id="penontonAktif" label="Penonton" placeholder="Penonton Aktif" />
        <div class="space-y-1">
          <div class="pl-2.5">
            Comments
          </div>
          <div class="flex gap-3 *:flex-1">
            <FormNumber v-model="comments" form-id="commentcount" placeholder="Count" />
            <FormNumber v-model="commentsBy" form-id="commentusers" placeholder="By" />
          </div>
        </div>
        <div class="space-y-1">
          <div class="pl-2.5">
            Date
          </div>
          <div class="flex gap-3 *:flex-1">
            <FormText v-model="dateStart" form-id="start" placeholder="Date Start" />
            <FormText v-model="dateEnd" form-id="end" placeholder="Date End" />
          </div>
        </div>
        <FormFile ref="gifts" form-id="gifts" label="Gift Log JSON" />
        <button type="button" class="rounded-md bg-blue-500 p-2" @click="submit">
          Sumbit
        </button>
      </form>
    </template>
  </LayoutSingleRow>
</template>
