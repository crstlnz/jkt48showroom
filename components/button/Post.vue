<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  url: string
}>()

const { addNotif } = useNotifications()
const error = ref(false)
const isLoading = ref(false)
async function post() {
  isLoading.value = true
  error.value = false
  try {
    await $apiFetch(props.url, { method: 'POST' })
    addNotif({
      message: 'Sukses!',
      duration: 1500,
      type: 'success',
    })
  }
  catch (e) {
    error.value = true
    addNotif({
      message: 'Error!',
      duration: 1500,
      type: 'danger',
    })
  }
  isLoading.value = false
}
</script>

<template>
  <button
    v-ripple
    class="relative overflow-hidden text-center transition-[transform] active:scale-95 disabled:pointer-events-none disabled:opacity-70"
    :disabled="isLoading"
    @click="post"
  >
    <div v-if="isLoading" name="loading" class="flex items-center justify-center gap-1">
      <Icon name="svg-spinners:ring-resize" />
      <span>Loading</span>
    </div>
    <slot v-else name="default" />
  </button>
</template>
