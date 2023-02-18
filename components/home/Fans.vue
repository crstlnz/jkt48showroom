<script lang="ts" setup>
import { BottomSheet } from '#components'
defineProps<{
  data: IStatFans[];
}>()
const bottomSheet = ref<typeof BottomSheet | null>(null)
function openRankFans (evt: any) {
  if (!bottomSheet.value?.isOpen) { return bottomSheet.value?.open(evt.target) }
  bottomSheet.value?.close()
}
</script>

<template>
  <div class="bg-white dark:bg-dark-1 rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-bold">
        {{ $t("topfans") }}
      </h2>
      <button v-if="(data.length > 4)" class="hover:text-second-2" href="#" type="button" @click="openRankFans">
        {{ $t("more") }}
      </button>
    </div>
    <div class="whitespace-nowrap space-x-2 md:space-x-3 lg:space-x-4 fade-right overflow-hidden leading-[0px]">
      <a
        v-for="fans in data.slice(0, 12)"
        :key="fans.id"
        :href="$fansProfileURL(fans.id)"
        aria-label="View fans profile"
        target="_blank"
        :title="fans.name"
        class="w-16 sm:w-20 md:w-24 lg:w-28 inline-block"
      >
        <img
          lazy="false"
          class="w-full aspect-square bg-slate-200/50 dark:bg-dark-3/30 hover:bg-slate-300/50 dark:hover:bg-dark-3/50 rounded-xl lg:rounded-2xl p-2 lg:p-4 object-cover"
          :alt="fans.name"
          :src="$avatarURL(fans.avatar_id)"
        >
        <div class="truncate text-xs text-center mt-2">{{ fans.name }}</div>
      </a>
    </div>
    <BottomSheet ref="bottomSheet" :title="$t('fansranking')" :items="data" size-dependencies="name">
      <template #default="{ item, index }">
        <div
          :key="item.id"
          class="flex justify-start items-center gap-4 py-1 min-h-[120px] px-6 hover:bg-slate-300/30 dark:hover:bg-dark-3/30 border-r border-slate-100/60 dark:border-dark-2/80"
        >
          <div class="font-semibold">
            {{ index + 1 }}
          </div>
          <img
            lazy="false"
            class="bg-transparent transition-colors rounded-xl p-2 w-28 h-28 cursor-pointer"
            :alt="item.name"
            :src="$avatarURL(item.avatar_id)"
          >
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
