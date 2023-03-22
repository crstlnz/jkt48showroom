<script lang="ts" setup>
defineProps<{ gifts: IFansGift[]; pageMode?: boolean }>()
function getNumColor (num: number) {
  if (num < 10) {
    return 'text-blue-500 dark:text-blue-400'
  } else if (num < 50) {
    return 'text-green-500 dark:text-green-400'
  } else if (num < 100) {
    return 'text-teal-500 dark:text-teal-400'
  } else if (num < 1000) {
    return 'text-violet-500 dark:text-violet-400'
  } else {
    return 'text-red-500 dark:text-red-400'
  }
}
</script>

<template>
  <DynamicScroller
    :class="{ 'roundedscrollbar h-full w-full': pageMode !== null || pageMode !== false }"
    :min-item-size="182"
    :prerender="5"
    :items="gifts"
    key-field="id"
    :buffer="600"
    :page-mode="pageMode"
  >
    <template #before>
      <div
        class="-z-10 border-b-2 border-slate-100/60 bg-white/90 p-4 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5"
      >
        {{ $t("fansgift") }}
      </div>
    </template>

    <template #default="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
        <div :key="item.id" class="space-y-2 border-b-2 border-slate-100/60 p-3 dark:border-dark-2/60 md:p-4">
          <div class="truncate text-lg font-bold" :title="item.name">
            {{ item.name }}
          </div>
          <div class="flex gap-2.5 md:gap-3.5">
            <img
              class="h-[70px] w-[70px] rounded-lg bg-slate-100/90 p-2 hover:bg-slate-200 dark:bg-slate-100/5 hover:dark:bg-slate-300/10 lg:h-20 lg:w-20"
              :src="$avatarURL(item.avatar_id)"
              :alt="`${item.name} Avatar`"
            >
            <div class="w-0 flex-1">
              <div class="flex flex-wrap gap-2 pb-[8px] md:gap-2.5">
                <div v-for="gift in item.gifts" :key="gift.id" class="relative" :title="$currency(gift.point)">
                  <div class="max-h-[45px] max-w-[45px]">
                    <img :src="gift.img" alt="Gift" class="aspect-square">
                    <div
                      v-if="gift.num > 1"
                      :class="getNumColor(gift.num)"
                      class="text-stroke absolute bottom-[-10px] right-0 aspect-square w-6 rounded-full text-right text-sm font-extrabold leading-6"
                    >
                      x{{ gift.num >= 1000 ? (gift.num / 1000).toFixed(0) + "k" : gift.num }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-right text-base font-semibold">
            {{ $currency(item.total) }}
          </div>
        </div>
      </DynamicScrollerItem>
    </template>

    <template v-if="!gifts.length" #empty>
      <div class="flex aspect-[9/8] items-center justify-center">
        <div class="flex flex-col">
          <img class="mx-auto h-auto w-[300px] max-w-[90%]" :alt="$t('giftempty')" src="/img/empty-box.png">
          <div class="mt-3 text-center font-bold">
            {{ $t("giftempty") }}
          </div>
        </div>
      </div>
    </template>
  </DynamicScroller>
</template>
