<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  icon: string
  color: string
  defaultTitle?: string
  notif: NotifData
}>()

defineEmits<{ (e: 'close'): void }>()
const { deleteNotif } = useNotifications()
const notif = ref<NotifData>(props.notif)
const lastTime = ref(0)
const { pause, resume } = useRafFn(() => {
  const now = Date.now()
  notif.value.remainingTime -= now - lastTime.value
  lastTime.value = now
  if (notif.value.remainingTime <= 0) {
    pause()
    deleteNotif(props.notif.id)
  }
})

const focused = useWindowFocus()

const container = ref()
const { isOutside } = useMouseInElement(container)

function setState() {
  if (!isOutside.value || !focused.value) {
    pause()
  }
  else {
    lastTime.value = Date.now()
    resume()
  }
}

watch(isOutside, () => {
  setState()
})

watch(focused, () => {
  setState()
}, { immediate: false })

onMounted(() => {
  lastTime.value = Date.now()
  if (focused.value) {
    resume()
  }
})
</script>

<template>
  <div ref="container" class="dark:bg-dark-3 pointer-events-auto rounded-sm bg-slate-50 shadow-md ">
    <div class="flex items-stretch justify-between gap-3 overflow-hidden pr-4 lg:gap-4">
      <span class="w-1.5" :class="color" />
      <Icon :name="icon" class="h-6 w-6 self-center rounded-full p-1.5 text-white md:h-7 md:w-7 lg:h-8 lg:w-8" :class="color" />
      <div class="flex min-w-0 flex-1 flex-col py-2 sm:py-3 md:py-4 lg:py-5">
        <div class="text-base font-bold md:text-lg">
          {{ notif.title ?? defaultTitle ?? "Notification" }}
        </div>
        <div :title="notif.message" class="line-clamp-2 min-h-0 w-full text-sm text-slate-700 dark:text-slate-300 md:text-base">
          {{ notif.message }}
        </div>
      </div>
      <button aria-label="Close notif" type="button" class="self-center" @click="() => $emit('close')">
        <Icon name="ic:round-close" class="h-5 w-5 self-center md:h-6 md:w-6 lg:h-7 lg:w-7" />
      </button>
    </div>
    <div v-if="notif.duration != null && notif.remainingTime != null" :class="color" :style="{ width: `${(notif.remainingTime / notif.duration) * 100}%` }" class="h-1 w-[50%] border-slate-100 opacity-60 transition-[width] duration-300 ease-out" />
  </div>
</template>
