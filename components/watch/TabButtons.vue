<script lang="ts" setup>
defineProps<{
  tabView: Watch.TabView
}>()
const emit = defineEmits<{ (e: 'setView', view: Watch.TabView): void }>()
function setView(view: Watch.TabView) {
  emit('setView', view)
}
</script>

<template>
  <div id="info-button" class="flex justify-end gap-2 rounded-xl lg:bg-container md:gap-3 lg:px-2.5 lg:py-2">
    <button
      v-tooltip="$t('tabview.comment')"
      type="button"
      :class="{ 'ring-2 ring-blue-200': tabView === 'comment' }"
      class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-1.5 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-1.5 lg:px-2.5"
      @click="setView('comment')"
    >
      <Icon name="iconamoon:comment-dots-duotone" size="1.1rem" />
    </button>
    <button
      v-tooltip="$t('tabview.ranks')"
      type="button"
      :class="{ 'ring-2 ring-blue-200': tabView === 'ranks' }"
      class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-1.5 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-1.5 lg:px-2.5"
      @click="setView('ranks')"
    >
      <Icon name="solar:ranking-bold-duotone" size="1.2rem" />
    </button>
    <button
      v-tooltip="$t('tabview.gift_list')"
      type="button"
      :class="{ 'ring-2 ring-blue-200': tabView === 'gift-list' }"
      class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-1.5 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-1.5 lg:px-2.5"
      @click="setView('gift-list')"
    >
      <Icon name="mdi:gift-outline" size="1.1rem" />
    </button>
    <button
      v-tooltip="$t('tabview.gift_log')"
      type="button"
      :class="{ 'ring-2 ring-blue-200': tabView === 'gift-log' }"
      class="flex select-none items-center justify-center rounded-lg bg-blue-500/80 p-1 px-1.5 text-center text-sm font-bold text-white transition-transform hover:bg-blue-500 active:scale-95 disabled:bg-blue-500/40 disabled:text-gray-400 disabled:active:scale-100 disabled:dark:text-gray-500 lg:p-1.5 lg:px-2.5"
      @click="setView('gift-log')"
    >
      <Icon name="fa6-solid:gifts" size="1.2rem" />
    </button>
  </div>
</template>
