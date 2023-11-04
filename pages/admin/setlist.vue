<script lang="ts" setup>
const { data, error, pending, refresh } = useLazyFetch('/api/admin/setlist')
const config = useAppConfig()
const showForm = ref(false)

function onDismiss() {
  refresh()
  showForm.value = false
}

const editData = ref<JKT48.Setlist | null>(null)

function addNewSetlist() {
  editData.value = null
  showForm.value = true
}

function openEdit(data: JKT48.Setlist) {
  editData.value = data
  showForm.value = true
}
</script>

<template>
  <LayoutRow title="Setlist">
    <template #default>
      <Transition name="fade">
        <SetlistForm v-if="showForm" :setlist="editData" @on-dismiss="onDismiss" />
      </Transition>
      <div class="p-3 md:p-4">
        <div v-if="error">
          Error
        </div>
        <div v-else-if="pending">
          Pending
        </div>
        <div v-else-if="!data?.length">
          Kosong
        </div>
        <div v-else class="space-y-3 md:space-y-4">
          <div v-for="setlist in data" :key="setlist.id" class="bg-container flex gap-3 rounded-xl p-3 md:gap-4 md:p-4">
            <img :src="setlist.poster ?? config.errorPicture" alt="Theater Poster" class="aspect-[9/12] w-40 rounded-xl object-cover">
            <div class="flex flex-1 flex-col gap-2">
              <div class="flex gap-3 text-xl">
                <span>{{ setlist.title }}</span>
                <span v-if="setlist.title_alt">
                  ( {{ setlist.title_alt }} )
                </span>
              </div>
              <div class="flex-1 space-y-2">
                <div>
                  {{ setlist.description ?? "No description" }}
                </div>
                <div class="flex gap-3">
                  <div class="flex items-center gap-1.5 text-xl text-yellow-400">
                    <Icon name="ph:music-notes-duotone" />
                    <span>{{ setlist.songs?.length ?? 0 }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xl text-sky-500">
                    <Icon name="solar:gallery-wide-bold-duotone" />
                    <span>{{ setlist.gallery?.length ?? 0 }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <button type="button" class="p-2" @click="() => openEdit(setlist)">
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
