<template>
  <div class="bg-white dark:bg-dark-1 rounded-xl p-4 md:p-5 space-y-1 shadow-sm">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold">{{ $t("topfans") }}</h2>
      <button class="hover:text-second-2" href="#" type="button" @click="openRankFans">
        {{ $t("more") }}
      </button>
    </div>
    <div class="whitespace-nowrap pt-1.5 md:pt-2 lg:pt-2.5 flex flex-1 gap-3 md:gap-4">
      <a
        v-for="fans in data.slice(0, 13)"
        :key="fans.id"
        :href="$fansProfileURL(fans.id)"
        aria-label="View fans profile"
        target="_blank"
        :title="fans.name"
        class="rounded-sm w-20 md:w-32 aspect-square text-center space-y-1.5 md:space-y-2 min-w-0 cursor-pointer hidden [&:not(:nth-of-type(1n+5))]:inline-block min-[460px]:[&:not(:nth-of-type(1n+6))]:inline-block md:[&:not(:nth-of-type(1n+8))]:inline-block lg:[&:not(:nth-of-type(1n+11))]:inline-block xl:[&:not(:nth-of-type(1n+13))]:inline-block flex-1"
      >
        <LazyImage
          :transparent="true"
          lazy="false"
          class="bg-slate-200/50 dark:bg-dark-3/30 mx-auto hover:bg-slate-300/50 dark:hover:bg-dark-3/50 transition-colors rounded-xl lg:rounded-2xl p-2 lg:p-4 w-full aspect-square"
          :alt="fans.name"
          :src="$avatarURL(fans.avatar_id)"
        />
        <div class="truncate text-xs">{{ fans.name }}</div>
      </a>
    </div>
    <BottomSheet ref="bottomSheet" :title="$t('fansranking')" :items="data" size-dependencies="name">
      <template #default="{ item, index }">
        <div
          class="flex justify-start items-center gap-4 py-1 min-h-[120px] px-6 hover:bg-slate-300/30 dark:hover:bg-dark-3/30 border-r border-slate-100/60 dark:border-dark-2/80"
        >
          <div class="font-semibold">{{ index + 1 }}</div>
          <img
            lazy="false"
            class="bg-transparent transition-colors rounded-xl p-2 w-28 h-28 cursor-pointer"
            :alt="item.name"
            :src="$avatarURL(item.avatar_id)"
          />
          <div class="flex-1 w-0">
            <a :href="$fansProfileURL(item.id)" target="_blank" class="font-semibold">
              {{ item.name }}
            </a>
          </div>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage, BottomSheet } from "#components";
defineProps<{
  data: IStatFans[];
}>();
// const openRankFans = ref(false);
const bottomSheet = ref<typeof BottomSheet | null>(null);
function openRankFans(evt: any) {
  if (!bottomSheet.value?.isOpen) return bottomSheet.value?.open(evt.target);
  bottomSheet.value?.close();
}
</script>
