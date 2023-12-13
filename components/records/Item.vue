<script lang="ts" setup>
const props = defineProps<{
  rekor: ShowroomRecord
}>()

const isNew = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return new Date(props.rekor.date) > oneMonthAgo
})
</script>

<template>
  <div class="relative flex items-center justify-between gap-3 sm:gap-5">
    <div v-if="isNew" class="absolute right-0 top-0 z-10 flex items-center gap-1 rounded-sm text-sm">
      <Icon name="solar:medal-ribbons-star-bold-duotone" class="text-yellow-500" size="1.5rem" />
      <span class="font-bold">New Record</span>
    </div>
    <NuxtLink :title="rekor.name" :to="rekor.url" class="h-16 w-16 shrink-0 overflow-hidden rounded-full md:h-20 md:w-20">
      <NuxtImg
        class="h-full w-full"
        :src="rekor.img"
        :alt="rekor.name"
        loading="lazy"
        fit="fill"
        :modifiers="{
          aspectRatio: 1,
          gravity: 'faceCenter',
        }"
        sizes="64px md:80px"
        :placeholder="[10, 10, 75, 5]"
        format="webp"
      />
    </NuxtLink>
    <div class="w-full sm:space-y-2">
      <NuxtLink :to="`/recent/${rekor.data_id}`" class="text-sm opacity-50 sm:text-base">
        {{ $t(rekor.key) }}
      </NuxtLink>
      <div class="flex items-center justify-between gap-3">
        <NuxtLink :title="rekor.name" :to="rekor.url" class="text-lg font-bold sm:text-xl">
          {{ rekor.name }}
        </NuxtLink>
        <NuxtLink :to="`/recent/${rekor.data_id}`" class="text-right text-xs opacity-50 sm:text-base">
          <Parser :parse-type="rekor.parser" :value="rekor.value" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
