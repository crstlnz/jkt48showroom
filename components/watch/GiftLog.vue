<script lang="ts" setup>
const props = defineProps<{
  giftLog: ShowroomAPI.GiftLogItem[]
}>()

const sortedGift = computed(() => {
  return Array.from(props.giftLog).sort((a, b) => {
    return b.created_at - a.created_at
  })
})
</script>

<template>
  <div class="roundedscrollbar relative h-full overflow-y-scroll">
    <div class="sticky inset-x-0 top-0 z-10 border-b-2 border-slate-100/60 bg-white/90 p-3 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5">
      <div class="flex items-center gap-2">
        <Icon name="noto:wrapped-gift" class="text-yellow-500" size="1.4rem" />
        <span>{{ $t('tabview.gift_log') }}</span>
      </div>
    </div>

    <div v-if="sortedGift.length" class="space-y-2 p-3 md:p-4">
      <div v-for="item in sortedGift" :key="`${item.gift_id}${item.user_id}${item.created_at}`" class="bg-background flex items-center gap-4 rounded-xl px-3 py-2">
        <div class="h-14 w-14 shrink-0">
          <img :src="item.avatar_url" alt="User avatar" class="h-full w-full object-contain">
        </div>
        <div class="flex-1 space-y-1">
          <div class="truncate">
            {{ item.name }}
          </div>
          <div class="flex items-center gap-1.5">
            <div class="h-8 w-8 shrink-0">
              <img :src="item.image" alt="User avatar" class="h-full w-full object-contain">
            </div>
            <div>
              x{{ $n(item.num) }}
            </div>
          </div>
          <!-- {{ item.user.name }} -->
        </div>
      </div>
    </div>
    <div v-else>
      <!-- kosong -->
    </div>
    <!-- <div v-else-if="pending" class="flex items-center justify-center py-10">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error">
      <div class="pb-5 pt-2 text-center">
        <img class="mx-auto aspect-square w-72 max-w-[65%]" src="/svg/error.svg">
        <span>{{ $t("data.failed") }}</span>
      </div>
    </div> -->
  </div>
</template>
