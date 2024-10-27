<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

const props = defineProps<{ room: ShowroomAPI.RoomFollow }>()
const emit = defineEmits(['update'])
const { t } = useI18n()
const { addNotif } = useNotifications()
const isLike = ref(true)
async function reorder() {
  try {
    const form = new FormData()
    form.set('room_id', props.room.room_id)
    await $apiFetch('/api/user/follow/reorder', {
      method: 'POST',
      body: form,
    })
    emit('update')
    addNotif({
      type: 'success',
      message: t('reorder.success', { name: props.room.room_name }),
      duration: 2500,
    })
  }
  catch (e) {
    console.error(e)
    addNotif({
      type: 'danger',
      message: t('reorder.failed'),
      duration: 2500,
    })
  }
}

async function follow() {
  try {
    const form = new FormData()
    form.set('room_id', props.room.room_id)
    form.set('flag', String(isLike.value ? 0 : 1))
    await $apiFetch('/api/user/follow', {
      method: 'POST',
      body: form,
    })
    isLike.value = !isLike.value
    addNotif({
      type: 'success',
      message: t(isLike.value ? 'follow.following' : 'follow.unfollow', { name: props.room.room_name }),
      duration: 2500,
    })
  }
  catch (e) {
    console.error(e)
    addNotif({
      type: 'danger',
      message: t('follow.failed'),
      duration: 2500,
    })
  }
}
</script>

<template>
  <div class="flex gap-3 bg-container p-3 rounded-xl">
    <div class="aspect-video">
      <NuxtImg
        sizes="200px sm:250px md:300px lg:247.5px"
        :placeholder="[45, 10, 55, 70]"
        fit="fill"
        format="webp"
        :alt="room.room_name"
        class="w-full h-full flex-1 object-cover rounded-xl"
        :src="room.image_l"
      />
    </div>
    <div class="flex-1 flex flex-col gap-3 w-0">
      <div class="text-lg font-semibold whitespace-nowrap">
        <div class="truncate">
          {{ room.room_name }}
        </div>
      </div>
      <div class="line-clamp-2 flex-1 invisible md:visible">
        <ClientOnly>
          {{ room.room_description }}
        </ClientOnly>
      </div>
      <div class="place-self-end self-end flex-1 flex gap-3 md:gap-4 text-xl md:text-2xl">
        <NuxtLink :to="`/member/${room.room_url_key}`" :aria-label="`${room.room_name} Profile`" class="flex items-center">
          <Icon name="heroicons:user-20-solid" />
        </NuxtLink>
        <NuxtLink :to="`/watch/${room.room_url_key}`" type="button" :aria-label="`Watch ${room.room_name}`" no-prefetch class="flex items-center">
          <Icon name="heroicons:video-camera-20-solid" />
        </NuxtLink>
        <button type="button" class="flex items-center">
          <Icon name="heroicons:heart-20-solid" class="" :class="isLike ? 'text-red-400' : 'text-slate-500'" @click="follow" />
        </button>
        <button class="flex items-center disabled:cursor-not-allowed disabled:opacity-40" :disabled="!isLike" @click="reorder">
          <Icon name="ph:sort-descending-bold" />
        </button>
      </div>
    </div>
  </div>
</template>
