<script lang="ts" setup>
import { useUser } from '~~/store/user'
import { useNotifications } from '~~/store/notifications'
import { useSettings } from '~~/store/settings'

const props = defineProps<{
  liveId?: number
  roomId?: number
  isLive: boolean
}>()
const userRegistered = ref(false)
const { session } = useSettings()
const { addNotif } = useNotifications()
const { authenticated } = useUser()
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
  return !loading.value && liveId != null && session?.csrf_token != null && props.isLive
})

function submit() {
  if (!validForSubmit.value) return
  if (comment.value === '') {
    formError.value = true
    return
  }

  sendComment()
}

const { t } = useI18n()
async function sendComment() {
  loading.value = true
  try {
    const res = await $fetch('/api/showroom/comment', {
      method: 'POST',
      body: {
        csrf_token: session?.csrf_token,
        comment: comment.value,
        is_delay: 0,
        live_id: liveId.value,
      },
    })
    if (res?.ok !== 1) throw new Error('Failed!')
    loading.value = false
    comment.value = ''
  }
  catch (e) {
    loading.value = false
    addNotif({
      message: t(userRegistered.value ? 'form.error.comment' : 'form.error.commentretry'),
      duration: 4500,
      type: 'danger',
    })
  }
}

async function registerUserToRoom() {
  if (!authenticated) return
  await $fetch('/api/showroom/current_user', { params: { room_id: props.roomId || 0, _: new Date().getTime() }, headers: { cookie: session?.cookie || '' } })
}

onMounted(async () => {
  if (authenticated) {
    await registerUserToRoom().catch(_ => null)
    userRegistered.value = true
  }
})
</script>

<template>
  <div>
    <slot />
    <NuxtLink v-if="!authenticated" to="/login" class="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
      Please login to comment!
    </NuxtLink>
    <div class="w-full rounded-lg bg-black/5 px-2 py-1.5 dark:bg-black/10 md:px-2.5" :class="{ 'opacity-5': !authenticated, 'ring-2 ring-red-500': formError }">
      <input v-model="comment" :disabled="!validForSubmit" type="text" class="h-full w-full truncate bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-25" placeholder="Comment..." @keyup.enter="submit">
    </div>
    <button type="button" :disabled="!validForSubmit" class="rounded-md px-2.5 py-1 transition-[background-color,color,transition] hover:bg-blue-500 hover:text-white/90 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50" :class="{ 'opacity-5': !authenticated }" @click="submit">
      <Icon v-if="!loading" name="iconamoon:send-duotone" size="1.5rem" />
      <Icon v-else name="svg-spinners:ring-resize" size="1.5rem" />
    </button>
  </div>
</template>
