<template>
  <DynamicScroller
    :class="{ 'h-full w-full roundedscrollbar': pageMode !== null || pageMode !== false }"
    :min-item-size="182"
    :prerender="5"
    :items="gifts"
    key-field="id"
    :buffer="600"
    :page-mode="pageMode"
  >
    <template #before>
      <div
        class="p-4 md:p-5 bg-white/90 dark:bg-dark-1/90 backdrop-blur-sm text-xl font-bold border-b-2 border-slate-100/60 dark:border-dark-2/60 -z-10"
      >
        {{ $t("fansgift") }}
      </div>
    </template>

    <template #default="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
        <div class="p-3 md:p-4 border-b-2 border-slate-100/60 dark:border-dark-2/60 space-y-2">
          <div class="text-lg font-bold truncate" :title="item.name">
            {{ item.name }}
          </div>
          <div class="flex gap-2.5 md:gap-3.5">
            <img
              :key="item.avatar_id + item.id"
              class="hover:bg-slate-200 bg-slate-100/90 dark:bg-slate-100/5 hover:dark:bg-slate-300/10 p-2 rounded-lg w-[70px] h-[70px] lg:w-20 lg:h-20"
              :src="$avatarURL(item.avatar_id)"
              :alt="`${item.name} Avatar`"
            />
            <div class="flex-1 w-0">
              <div class="flex flex-wrap gap-2 md:gap-2.5 pb-[8px]">
                <div v-for="gift in item.gifts" :key="gift.id" class="relative" :title="$currency(gift.point)">
                  <div class="max-w-[45px] max-h-[45px]">
                    <img :src="gift.img" alt="Gift" class="aspect-square" />
                    <div
                      v-if="gift.num > 1"
                      :class="getNumColor(gift.num)"
                      class="absolute w-6 leading-6 bottom-[-10px] right-0 font-extrabold text-sm rounded-full aspect-square text-stroke text-right"
                    >
                      x{{ gift.num >= 1000 ? (gift.num / 1000).toFixed(0) + "k" : gift.num }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-right font-semibold text-base">
            {{ $currency(item.total) }}
          </div>
        </div>
      </DynamicScrollerItem>
    </template>

    <template v-if="!gifts.length" #empty>
      <div class="aspect-[9/8] flex justify-center items-center">
        <div class="flex flex-col">
          <img class="mx-auto w-[300px] h-auto max-w-[90%]" :alt="$t('giftempty')" src="/img/empty-box.png" />
          <div class="text-center font-bold mt-3">{{ $t("giftempty") }}</div>
        </div>
      </div>
    </template>
  </DynamicScroller>
</template>

<script lang="ts" setup>
// import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
defineProps<{ gifts: IFansGift[]; pageMode?: boolean }>();
function getNumColor(num: number) {
  if (num < 10) {
    return "text-blue-500 dark:text-blue-400";
  } else if (num < 50) {
    return "text-green-500 dark:text-green-400";
  } else if (num < 100) {
    return "text-teal-500 dark:text-teal-400";
  } else if (num < 1000) {
    return "text-violet-500 dark:text-violet-400";
  } else {
    return "text-red-500 dark:text-red-400";
  }
}
</script>
