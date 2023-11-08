<script lang="ts" setup>
import { useSelectedUser } from '~/store/selectedUser'

const props = defineProps<{
  roomId?: number | null
}>()
const { userClick } = useSelectedUser()
const roomId = computed(() => {
  return props.roomId || null
})

const { data: rankings, pending: rankingPending, refresh: refreshRanking, error: rankingError } = await useLazyFetch('/api/showroom/user_ranking', { params: { room_id: roomId }, immediate: true, server: false })

watch(() => props.roomId, (roomId) => {
  if (roomId && rankingPending.value) refreshRanking()
})
</script>

<template>
<div class="bg-container flex flex-col gap-4 rounded-xl p-4">
    <div class="flex items-center gap-2 text-2xl">
      <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
      <span>Summary Ranking</span>
    </div>
    <div v-if="rankingError" class="flex aspect-square flex-col items-center justify-center gap-5">
      <img class="aspect-square w-72 mx-auto max-w-[65%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="rankingPending" class="flex aspect-square items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else-if="!rankings" class="flex aspect-square flex-col items-center justify-center gap-2">
      <img class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`">
      <span>{{ $t("data.nodata") }}</span>
    </div>
    <div v-else class="flex flex-col gap-3">
      <button v-for="rank in rankings.ranking" :key="rank.user_id" :aria-label="`Open ${rank.name} profile`" type="button" class="relative flex cursor-pointer gap-3 rounded-xl bg-slate-100 px-2.5 py-3.5 dark:bg-slate-400/5" @click="(e) => userClick(e, rank.user_id)">
        <div class="absolute left-[-5px] top-[-5px] aspect-square w-6 rounded-full bg-blue-500 text-center font-bold leading-6 text-white">
          {{ rank.rank }}
        </div>
        <div class="h-12 w-12">
          <img :src="rank.avatar_url" :alt="`${rank.name} avatar`" class="object-fit h-full w-full">
        </div>
        <div class="flex-1 space-y-1">
          <div class="text-left font-bold">
            {{ rank.name }}
          </div>
          <div class="flex justify-between">
            <div class="text-black/75 dark:text-white/50">
              {{ $n(rank.point || 0) }} Pt
            </div>
            <div class="text-black/75 dark:text-white/50">
              Visit : {{ rank.visit_count }}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
