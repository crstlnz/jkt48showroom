<template>
  <div class="bg-white dark:bg-dark-1 rounded-xl p-3 md:p-4 space-y-1 shadow-sm">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold">Top Fans</h3>
      <!-- <button class="hover:text-second-2" href="#" @click="openRankFans">More</button> -->
    </div>
    <div class="whitespace-nowrap py-1 flex flex-1">
      <a
        :href="$fansProfileURL(fans.id)"
        target="_blank"
        v-for="fans in data.slice(0, 13)"
        :key="fans.id"
        :title="fans.name"
        class="rounded-sm w-20 md:w-32 aspect-square text-center space-y-1 min-w-0 px-1 lg:px-2 cursor-pointer hidden [&:not(:nth-of-type(1n+6))]:inline-block md:[&:not(:nth-of-type(1n+8))]:inline-block lg:[&:not(:nth-of-type(1n+11))]:inline-block xl:[&:not(:nth-of-type(1n+13))]:inline-block flex-1"
      >
        <LazyImage
          :transparent="true"
          lazy="false"
          class="bg-transparent mx-auto hover:bg-slate-300/50 dark:hover:bg-dark-3/50 transition-colors rounded-xl p-2 w-full aspect-square"
          :alt="fans.name"
          :src="$avatarURL(fans.avatar_id)"
        />
        <div class="truncate text-xs">{{ fans.name }}</div>
      </a>
    </div>
    <!-- <BottomSheet ref="bottomSheet" title="Fans Ranking" :items="data">
      <template #default="{ item, index }">
        <div
          class="flex justify-start items-center gap-4 py-1 h-[120px] px-6 hover:bg-slate-300/30 dark:hover:bg-dark-3/30 border-r border-slate-100/60 dark:border-dark-2/80"
        >
          <div class="truncate font-semibold">{{ index + 1 }}</div>
          <img
            lazy="false"
            class="bg-transparent transition-colors rounded-xl p-2 w-28 h-28 cursor-pointer"
            :alt="item.name"
            :src="$avatarURL(item.avatar_id)"
          />
          <div class="flex-1 w-0">
            <a :href="$fansProfileURL(item.id)" target="_blank" class="truncate font-semibold">
              {{ item.name }}
            </a>
          </div>
        </div>
      </template>
    </BottomSheet> -->
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
defineProps<{
  data: IStatFans[];
}>();
// const openRankFans = ref(false);
// const bottomSheet = ref(null);
// function openRankFans() {
//   bottomSheet.value?.open();
// }
</script>
