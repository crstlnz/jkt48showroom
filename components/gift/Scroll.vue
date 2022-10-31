<template>
  <DynamicScroller
    class="h-full w-full roundedscrollbar"
    :min-item-size="182"
    :prerender="10"
    :items="gifts"
    key-field="id"
  >
    <template #before>
      <div
        class="p-3 md:p-4 bg-white/90 dark:bg-dark-1/90 backdrop-blur-sm text-xl font-bold border-b-2 border-slate-100/60 dark:border-dark-2/60 -z-10"
      >
        Gift Fans
      </div>
    </template>

    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
        <div class="p-3 md:p-4 border-b-2 border-slate-100/60 dark:border-dark-2/60 space-y-2">
          <div class="text-lg font-bold truncate" :title="item.name">
            {{ item.name }}
          </div>
          <div class="flex gap-2.5 md:gap-3.5">
            <img
              class="hover:bg-slate-200 bg-slate-100/90 dark:bg-slate-100/5 hover:dark:bg-slate-300/10 p-2 rounded-lg w-[70px] h-[70px] lg:w-20 lg:h-20"
              :key="item.avatar_id + item.id"
              :src="$avatarURL(item.avatar_id)"
              alt=""
            />
            <div class="flex-1 w-0">
              <!-- <div class="text-lg font-semibold">{{ item.name }}</div> -->
              <div class="grid grid-cols-5 gap-2 md:gap-2.5 pb-[8px]">
                <div v-for="gift in item.gifts" class="relative" :title="$currency(gift.point)">
                  <img :src="gift.img" alt="" class="aspect-square" />
                  <div
                    v-if="gift.num > 1"
                    :class="getNumColor(gift.num)"
                    class="absolute w-6 leading-6 bottom-[-6px] right-[-6px] text-white font-semibold text-[10px] rounded-full shadow-md aspect-square text-center"
                  >
                    {{ gift.num >= 1000 ? (gift.num / 1000).toFixed(0) + "k" : gift.num }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-right font-semibold text-base">{{ $currency(item.total) }}</div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script lang="ts" setup>
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
function getNumColor(num) {
  if (num < 10) {
    return "bg-blue-500";
  } else if (num < 50) {
    return "bg-green-500";
  } else if (num < 100) {
    return "bg-teal-500";
  } else if (num < 1000) {
    return "bg-violet-500";
  } else {
    return "bg-red-500";
  }
}
defineProps<{ gifts: IFansGift[] }>();
</script>
