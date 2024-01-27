<script lang="ts" setup>
defineProps<{
  sortedGift: Watch.Gift[]
}>()
</script>

<template>
  <div class="roundedscrollbar relative h-full overflow-y-scroll">
    <div class="sticky inset-x-0 top-0 z-10 border-b-2 border-slate-100/60 bg-white/90 p-3 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5">
      <div class="flex items-center gap-2">
        <Icon name="noto:wrapped-gift" class="text-yellow-500" size="1.4rem" />
        <span>{{ $t('tabview.gift_list') }}</span>
      </div>
    </div>

    <div v-if="sortedGift.length" class="space-y-2 p-3 md:p-4">
      <div v-for="item in sortedGift" :key="item.id" class="bg-background flex items-center gap-4 rounded-xl px-3 py-2">
        <div class="h-12 w-12 shrink-0">
          <img :src="item.image" alt="Gift image" class="h-full w-full object-contain">
        </div>
        <div class="flex-1">
          x{{ $n(item.num) }}
        </div>
        <div class="text-right">
          <div>{{ $n(item.point) }}G</div>
          <div class="flex items-center justify-end gap-0.5">
            <span>{{ $n(item.user_count) }}</span> <Icon name="ic:round-person" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="pb-5 pt-2 text-center">
        <NuxtImg class="mx-auto aspect-[5/4] w-72 max-w-[75%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
        <span>{{ $t("data.nodata") }}</span>
      </div>
    </div>
    <!-- <div v-else-if="pending" class="flex items-center justify-center py-10">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error">
      <div class="pb-5 pt-2 text-center">
        <img class="mx-auto aspect-square w-72 max-w-[65%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`">
        <span>{{ $t("data.failed") }}</span>
      </div>
    </div> -->
  </div>
</template>
