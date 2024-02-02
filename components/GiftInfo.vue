<script lang="ts" setup>
const props = defineProps<{
  gifts: LogDetail.BaseGiftInfo[]
}>()
const totalAllGifts = computed(() => {
  if (!props.gifts) return 0
  return props.gifts.reduce((a, b) => a + (b.num * b.point), 0)
})
const paidGifts = computed(() => {
  if (!props.gifts) return 0
  return props.gifts.filter(i => !i.free).reduce((a, b) => a + (b.num * b.point), 0)
})

const freeGifts = computed(() => {
  if (!props.gifts) return 0
  return props.gifts.filter(i => i.free).reduce((a, b) => a + (b.num * b.point), 0)
})
</script>

<template>
  <div class="rounded-xl mx-3 md:mx-4 bg-container p-3 md:p-4 space-y-1 md:space-y-2">
    <div class="flex gap-3 justify-between items-center">
      <div class="font-bold text-lg xl:text-xl">
        {{ $t('totalgift') }}
      </div>
      <div class="text-sm">
        {{ $n(totalAllGifts) }} pts
      </div>
    </div>
    <div class="bg-yellow-400 h-2 rounded-full overflow-hidden">
      <div
        class="bg-red-400 h-full text-base" :style="{
          width: `${paidGifts / totalAllGifts * 100}%`,
        }"
      />
    </div>
    <div class="space-y-1 text-sm pt-1">
      <div class="text-red-400 flex gap-1.5 items-center">
        <Icon name="heroicons:gift-20-solid" />
        <div class="text-sm">
          Paid gifts  ({{ Math.round(paidGifts / totalAllGifts * 100) }}%)
        </div>
      </div>
      <div class="text-yellow-400 flex gap-1.5 items-center">
        <Icon name="bi:stars" />
        <div class="text-sm">
          Free gifts ({{ Math.round(freeGifts / totalAllGifts * 100) }}%)
        </div>
      </div>
    </div>
  </div>
</template>
