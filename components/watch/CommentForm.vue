<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  liveId?: number
  roomId?: number
  isLive: boolean
}>()

const emit = defineEmits<{ (e: 'comment', comment: string): void }>()

const { addNotif } = useNotifications()
const { status } = useAuth()
const authenticated = computed(() => status.value === 'authenticated')
const formError = ref(false)
const comment = ref('')

const liveId = computed(() => {
  return props.liveId
})

watch(comment, () => {
  if (formError.value) formError.value = false
})

const loading = ref(false)
const validForSubmit = computed(() => {
  return !loading.value && liveId != null && props.isLive
})

function submit() {
  if (!validForSubmit.value) return
  if (comment.value === '') {
    formError.value = true
    return
  }

  sendComment()
}

const commentInput = ref()

const { t } = useI18n()
async function sendComment() {
  loading.value = true
  try {
    const formData = new FormData()
    formData.set('live_id', String(liveId.value))
    formData.set('comment', comment.value)
    formData.set('is_delay', '0')
    await $apiFetch<Watch.APIComment>('/api/user/comment', {
      method: 'POST',
      body: formData,
    })
    // if (res?.ok !== 1) throw new Error('Failed!')
    emit('comment', comment.value)
    loading.value = false
    comment.value = ''
    commentInput.value?.focus()
    // focused.value = true
  }
  catch (e: any) {
    loading.value = false
    if (e?.data?.status === 503) {
      addNotif({
        message: t('server_busy'),
        duration: 4500,
        type: 'danger',
      })
    }
    else if (e?.data?.status === 429) {
      addNotif({
        message: t('comment_too_many_request'),
        duration: 4500,
        type: 'danger',
      })
    }
    else {
      addNotif({
        message: t(
          e?.data?.statusMessage === 'SMS not authenticated!'
            ? 'form.error.commentsms'
            : 'form.error.commentretry',
        ),
        duration: 4500,
        type: 'danger',
      })
    }
  }
}
</script>

<template>
  <div>
    <slot />
    <NuxtLink
      v-if="!authenticated"
      to="/login"
      class="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
    >
      Please login to comment!
    </NuxtLink>
    <div
      class="w-full"
      :class="{ 'opacity-5': !authenticated, 'ring-2 ring-red-500': formError }"
    >
      <input
        ref="commentInput"
        v-model="comment"
        type="text"
        class="h-full w-full truncate rounded-lg bg-black/5 px-2 py-1.5 outline-none disabled:cursor-not-allowed disabled:opacity-25 dark:bg-black/10 md:px-2.5"
        placeholder="Comment..."
        @keyup.enter="submit"
      >
    </div>
    <button
      type="button"
      :disabled="!validForSubmit"
      class="rounded-md px-2.5 py-1 transition-[background-color,color,transition] hover:bg-blue-500 hover:text-white/90 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
      :class="{ 'opacity-5': !authenticated }"
      @click="submit"
    >
      <Icon v-if="!loading" name="iconamoon:send-duotone" size="1.5rem" />
      <Icon v-else name="svg-spinners:ring-resize" size="1.5rem" />
    </button>
  </div>
</template>
