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
  <div class="space-y-4 rounded-xl bg-white p-4 shadow-sm dark:bg-dark-1 md:p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">
        {{ $t("topfans") }}
      </h2>
      <button v-if="(data.length > 4)" class="hover:text-second-2" href="#" type="button" @click="openRankFans">
        {{ $t("more") }}
      </button>
    </div>
    <div class="fade-right space-x-2 overflow-hidden whitespace-nowrap leading-[0px] md:space-x-3 lg:space-x-4">
      <a
        v-for="fans in data.slice(0, 12)"
        :key="fans.id"
        :href="$fansProfileURL(fans.id)"
        aria-label="View fans profile"
        target="_blank"
        :title="fans.name"
        class="inline-block w-16 sm:w-20 md:w-24 lg:w-28"
      >
        <img
          lazy="false"
          class="aspect-square w-full rounded-xl bg-slate-200/50 object-cover p-2 hover:bg-slate-300/50 dark:bg-dark-3/30 dark:hover:bg-dark-3/50 lg:rounded-2xl lg:p-4"
          :alt="fans.name"
          :src="$avatarURL(fans.avatar_id)"
        >
        <div class="mt-2 truncate text-center text-xs">{{ fans.name }}</div>
      </a>
    </div>
    <BottomSheet ref="bottomSheet" :title="$t('fansranking')" :items="data" size-dependencies="name">
      <template #default="{ item, index }">
        <div
          :key="item.id"
          class="flex min-h-[120px] items-center justify-start gap-4 border-r border-slate-100/60 py-1 px-6 hover:bg-slate-300/30 dark:border-dark-2/80 dark:hover:bg-dark-3/30"
        >
          <div class="font-semibold">
            {{ index + 1 }}
          </div>
          <img
            lazy="false"
            class="h-28 w-28 cursor-pointer rounded-xl bg-transparent p-2 transition-colors"
            :alt="item.name"
            :src="$avatarURL(item.avatar_id)"
          >
          <div class="w-0 flex-1">
            <a :href="$fansProfileURL(item.id)" target="_blank" class="font-semibold">
              {{ item.name }}
            </a>
          </div>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>
