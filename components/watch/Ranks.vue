<script lang="ts" setup>
const { roomId } = defineProps<{
  roomId: number
}>()
const { data, pending, error, refresh } = await useApiFetch<Watch.StageList>('/api/showroom/stage_user_list', { params: { room_id: roomId } })
useIntervalFn(() => {
  refresh()
}, 60000, { immediate: true, immediateCallback: false })
</script>

<template>
  <div class="roundedscrollbar relative h-full overflow-y-scroll">
    <div class="sticky inset-x-0 top-0 z-10 border-b-2 border-slate-100/60 bg-white/90 p-3 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5">
      <div class="flex items-center gap-2">
        <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" size="1.4rem" />
        <span>{{ $t('tabview.ranks') }}</span>
      </div>
    </div>

    <div v-if="data" class="space-y-2 p-3 md:p-4">
      <div v-for="item in data?.stage_user_list" :key="item.order_no" class="bg-background flex items-center gap-4 rounded-xl px-3 py-2">
        <div>
          {{ item.rank }}
        </div>
        <div class="h-12 w-12 shrink-0">
          <img :src="item.user.avatar_url" alt="User avatar" class="h-full w-full object-contain">
        </div>
        <div class="truncate">
          {{ item.user.name }}
        </div>
      </div>
    </div>
    <div v-else-if="pending" class="flex items-center justify-center py-10">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error">
      <div class="pb-5 pt-2 text-center">
        <img class="mx-auto aspect-square w-72 max-w-[65%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
        <span>{{ $t("data.failed") }}</span>
      </div>
    </div>
  </div>
</template>
