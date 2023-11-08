<script lang="ts" setup>
const { data, pending: pendingJiko, error: errorJiko, refresh } = await useLazyFetch('/api/admin/showroom/missing_jikosokai')

const missingJiko = ref<MissingJiko[]>([])
watch(data, (val) => {
  missingJiko.value = val ?? []
})
function onUpdate(roomId: number) {
  missingJiko.value = missingJiko.value.filter(i => i.room_id !== roomId)
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl pt-3">
    <div class="flex items-center gap-2 text-xl">
      <Icon name="carbon:phrase-sentiment" class="text-pink-500" size="1.8rem" />
      <span>Missing Jikoshoukai</span>
    </div>
    <div v-if="errorJiko" class="flex aspect-[15/6] flex-col items-center justify-center gap-5">
      <img class="mx-auto aspect-square w-72 max-w-[65%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pendingJiko" class="flex aspect-[15/6] items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else class="flex flex-col gap-6">
      <AdminMissingJikoForm v-for="member in missingJiko" :key="member.room_id" :member="member" @on-update="onUpdate" />
      <!-- <div v-for="member in missingJiko" :key="member.room_id" class="bg-container flex gap-3 rounded-xl p-3 lg:p-4">
        <LazyImage :src="member.img" :alt="`${member.name} picture`" class="aspect-video h-32 overflow-hidden rounded-xl border-2 dark:border-none" />
        <div class="flex flex-1 flex-col gap-1">
          <div class="text-lg">
            {{ member.name }}
          </div>
          <div class="flex gap-3">
            <textarea class="bg-container-2 flex-1 rounded-lg p-3" placeholder="Jikosokai..." />
            <button class=": w-20 self-start rounded-full bg-blue-500 py-2 text-white">
              Update
            </button>
          </div>
        </div>
      </div> -->
    </div>
    <div />
  </div>
</template>
