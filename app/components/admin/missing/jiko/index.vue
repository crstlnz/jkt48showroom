<script lang="ts" setup>
const { data, pending: pendingJiko, error: errorJiko } = await useApiFetch<MissingJiko[]>('/api/admin/missing_jikosokai')

const missingJiko = ref<MissingJiko[]>([])
watch(data, (val) => {
  missingJiko.value = val ?? []
}, { immediate: true })
function onUpdate(roomId: number) {
  missingJiko.value = missingJiko.value.filter(i => i.room_id !== roomId)
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl pt-3">
    <div class="mb-5 flex flex-col gap-3">
      <AdminBannerSetting />
    </div>
    <div class="flex items-center gap-2 text-xl">
      <Icon name="carbon:phrase-sentiment" class="text-pink-500" size="1.8rem" />
      <span>Missing Jikoshoukai</span>
    </div>
    <div v-if="errorJiko" class="flex aspect-15/6 flex-col items-center justify-center gap-5">
      <NuxtImg class="mx-auto aspect-square w-72 max-w-[65%] object-contain" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pendingJiko" class="flex aspect-15/6 items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else class="flex flex-col gap-6">
      <AdminMissingJikoForm v-for="member in missingJiko" :key="member.room_id" :member="member" @on-update="onUpdate" />
    </div>
    <div />
  </div>
</template>
