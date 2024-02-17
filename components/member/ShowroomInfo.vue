<script lang="ts" setup>
const props = defineProps<{
  roomId: string | number
}>()
const emit = defineEmits<{ (e: 'data', data: IMiniRoomProfile): void }>()
const { authenticated } = useAuth()
const profile = ref<IMiniRoomProfile | null>()
const pending = ref(true)

onMounted(() => {
  fetchProfile()
})

async function fetchProfile() {
  pending.value = true
  try {
    profile.value = await $apiFetch<IMiniRoomProfile>(`/api/profile`, {
      query: {
        room_id: props.roomId,
      },
    })

    emit('data', profile.value)
  }
  catch (e) {

  }
  pending.value = false
}
</script>

<template>
  <div v-if="pending" class="bg-container rounded-xl mx-3 md:mx-4 p-3 md:p-4 text-center py-4 animate-pulse">
    <div class="h-[42px] md:h-[54px]" />
  </div>
  <div v-else class="flex-1 flex gap-3 bg-container rounded-xl p-3 md:p-4 text-center py-4 mx-3 md:mx-4">
    <div class="flex flex-1 flex-col gap-0.5 md:gap-1.5">
      <div class="text-xs md:text-sm">
        {{ $t("watch_count") }}
      </div>
      <div v-tooltip="authenticated ? $t('watch_count_info', { count: profile?.visit_count || 0 }) : undefined" class="flex justify-center items-center gap-1.5 text-base md:text-lg font-semibold">
        <Icon name="material-symbols:auto-read-play" class="text-red-500" />
        <span v-if="authenticated"> {{ $n(profile?.visit_count || 0) }} {{ profile?.visit_count ? $t("times") : '' }}</span>
        <span v-else> {{ $t('pleaselogin') }}</span>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-0.5 md:gap-1.5">
      <div class="text-xs md:text-sm">
        {{ $t("follower") }}
      </div>
      <div class="flex justify-center items-center gap-1.5 text-base md:text-lg font-semibold">
        <Icon name="heroicons:user-plus-solid" class="text-pink-400" />
        <span> {{ $n(profile?.follower || 0) }}</span>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-0.5 md:gap-1.5">
      <div class="text-xs md:text-sm">
        {{ $t("room_level") }}
      </div>
      <div class="flex justify-center items-center gap-1.5 text-base md:text-lg font-semibold">
        <Icon name="icon-park-solid:ranking-list" class="text-blue-500" />
        <span> {{ $n(profile?.room_level || 0) }}</span>
      </div>
    </div>
  </div>
</template>
