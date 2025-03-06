<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

type JKT48EventDetailWithId = JKT48.EventDetail & { _id: string }
const { data, error, pending, refresh } = await useApiFetch<(JKT48EventDetailWithId)[]>('/api/admin/event')
const config = useAppConfig()
const showForm = ref(false)

const { addNotif } = useNotifications()

function onDismiss() {
  refresh()
  showForm.value = false
}

const editData = ref<JKT48EventDetailWithId | null>(null)

function addNewSetlist() {
  editData.value = null
  showForm.value = true
}

function openEdit(data: JKT48EventDetailWithId) {
  editData.value = data
  showForm.value = true
}

const deleteData = ref<JKT48EventDetailWithId | null>(null)
async function deleteEvent(data: JKT48EventDetailWithId) {
  try {
    await $apiFetch(`/api/admin/event/${data._id}`, {
      method: 'DELETE',
    })
    addNotif({ message: `Berhasil menghapus ${data.title}`, type: 'success' })
  }
  catch (e) {
    console.error(e)
    addNotif({ message: `Gagal menghapus ${data.title}`, type: 'danger' })
  }
  finally {
    deleteData.value = null
    onDismiss()
  }
}
</script>

<template>
  <LayoutRow title="Event">
    <template #default>
      <Transition name="fade">
        <div v-if="deleteData" class="bg-black/50 fixed inset-0 z-aboveNav" @click="deleteData = null" />
      </Transition>
      <Transition name="fade">
        <div v-if="deleteData" class="bg-container fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-aboveNav p-4 rounded-md">
          Delete <b>{{ deleteData.title }}</b> ?
          <div class="flex gap-3 justify-end mt-3">
            <button type="button" class="bg-blue-500 px-3 py-1 text-sm rounded-md" @click="deleteData = null">
              Cancel
            </button>
            <button type="button" class="bg-red-500 px-3 py-1 text-sm rounded-md" @click="() => deleteEvent(deleteData as JKT48EventDetailWithId)">
              Delete
            </button>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <EventForm v-if="showForm" :event="editData" @on-dismiss="onDismiss" />
      </Transition>
      <div class="p-3 md:p-4">
        <div v-if="error">
          Error
        </div>
        <div v-else-if="pending" />
        <div v-else-if="!data?.length">
          Kosong
        </div>
        <div v-else class="space-y-3 md:space-y-4">
          <div v-for="eventDetail in data" :key="eventDetail.id" class="bg-container flex gap-3 rounded-xl p-3 md:gap-4 md:p-4">
            <img :src="eventDetail.poster ?? config.errorPicture" alt="Theater Poster" class="aspect-[9/12] w-40 rounded-xl object-cover">
            <div class="flex flex-1 flex-col gap-2">
              <div class="flex gap-3 text-xl">
                <span>{{ eventDetail.title }}</span>
                <span v-if="eventDetail.title_alt">
                  ( {{ eventDetail.title_alt }} )
                </span>
              </div>
              <div class="flex-1 space-y-2">
                <div>
                  {{ eventDetail.description ?? "No description" }}
                </div>
                <div class="flex gap-3">
                  <!-- <div class="flex items-center gap-1.5 text-xl text-yellow-400">
                    <Icon name="ph:music-notes-duotone" />
                    <span>{{ eventDetail.songs?.length ?? 0 }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xl text-sky-500">
                    <Icon name="solar:gallery-wide-bold-duotone" />
                    <span>{{ eventDetail.gallery?.length ?? 0 }}</span>
                  </div> -->
                </div>
              </div>
              <div class="text-right">
                <button type="button" class="p-2 text-red-500" @click="() => deleteData = eventDetail">
                  <Icon name="ic:baseline-delete" size="1.5rem" />
                </button>
                <button type="button" class="p-2" @click="() => openEdit(eventDetail)">
                  <Icon name="material-symbols:edit-rounded" size="1.5rem" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #actionSection>
      <div>
        <button class="rounded-xl bg-blue-500 px-3 py-1 text-base" @click="addNewSetlist">
          Add
        </button>
      </div>
    </template>
  </LayoutRow>
</template>
