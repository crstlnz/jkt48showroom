<template>
  <div v-if="data?.length" class="bg-white dark:bg-dark-1 overflow-hidden divide-y-2 divide-gray-50 dark:divide-dark-2">
    <MemberRecent v-for="recent in data.slice(0, 5)" :key="recent.data_id" :recent="recent" />
  </div>
  <div v-else class="bg-white dark:bg-dark-1 overflow-hidden">
    <div
      class="text-center space-y-6 md:space-y-8 xl:space-y-10 aspect-square flex flex-col items-center justify-center"
    >
      <img src="/svg/no_data.svg" alt="Empty" class="max-w-[400px] w-[50%] aspect-square mx-auto dark:brightness-110" />
      <div class="text-xs">Sorry, but there is no recents right now :(</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    data: IRecent[];
  }>(),
  {
    data() {
      return [];
    },
  }
);
</script>
