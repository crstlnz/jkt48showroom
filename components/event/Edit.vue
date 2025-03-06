<script setup lang="ts">
import { EventEditForm } from '#components'

defineProps<{
  event?: JKT48.Event | null
  jkt48members?: JKT48.MemberWithNickname[] | null
  pending: boolean
}>()
const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const editDialog = ref()

onClickOutside(editDialog, () => {
  emit('dismiss')
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 z-aboveNav">
    <div ref="editDialog" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-container rounded-xl p-5 w-[650px] max-w-[95%]">
      <div v-if="pending">
        <Spinner />
      </div>
      <EventEditForm v-else-if="event" :event="event" :jkt48members="jkt48members ?? []" @dismiss="$emit('dismiss')" />
      <div v-else>
        Tidak ada data!
      </div>
    </div>
  </div>
</template>
