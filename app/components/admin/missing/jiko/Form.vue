<script lang="ts" setup>
import { DeferImage } from '#components'
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  member: MissingJiko
}>()

const emit = defineEmits<{
  (e: 'onUpdate', room_id: number): void
}>()

const { addNotif } = useNotifications()

const isLoading = ref(false)
const jiko = useSessionStorage(`missing-jiko-form-${props.member.room_id}`, () => '')

const hasChanges = computed(() => {
  return (jiko.value || null) != null
})

async function update() {
  try {
    isLoading.value = true
    await $apiFetch('/api/admin/member/jikosokai', {
      method: 'POST',
      query: {
        _id: props.member.member_id,
        jiko: jiko.value,
      },
    })
    addNotif({
      type: 'success',
      title: 'Success',
      duration: 3000,
      message: `Jiko ${props.member.name} berhasil di update!`,
    })
    emit('onUpdate', props.member.room_id)
  }
  catch (e: any) {
    isLoading.value = false
    addNotif({
      type: 'danger',
      title: 'Error',
      duration: 3000,
      message: e.message,
    })
  }
}
</script>

<template>
  <div :key="member.room_id" class="bg-container flex flex-col gap-3 rounded-xl p-3 md:flex-row lg:p-4">
    <DeferImage :src="member.img ?? $errorPicture" :alt="`${member.name} picture`" class="aspect-video h-32 shrink-0 overflow-hidden rounded-xl border dark:border-none" />
    <div class="flex flex-1 flex-col gap-1">
      <div class="text-lg">
        {{ member.name }}
      </div>
      <div class="flex gap-3">
        <textarea v-model="jiko" class="bg-container-2 flex-1 rounded-lg p-3" placeholder="Jikoshoukai..." />
        <button
          :disabled="!hasChanges || isLoading"
          type="button"
          class="self-start rounded-full bg-blue-500 px-4 py-2 text-sm text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75 md:px-6 md:py-2.5 md:text-base"
          @click="update"
        >
          <Icon v-if="isLoading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" name="svg-spinners:ring-resize" size="1.5rem" />
          <span :class="{ 'opacity-0': isLoading }">Update</span>
        </button>
      </div>
    </div>
  </div>
</template>
