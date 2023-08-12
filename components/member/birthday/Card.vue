<script lang="ts" setup>
import { LazyImage } from '#components'

const props = defineProps<{
  member: API.IMemberBirthDay
}>()
const isToday = computed(() => {
  return new Date(props.member.birthdate).getDate() === new Date().getDate()
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 p-3">
    <NuxtLink :to="`/member/${member.url_key}`" class="relative inline-block h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28">
      <LazyImage :src="$fixCloudinary(member.img)" :alt="member.name" class="h-full w-full overflow-hidden rounded-full object-cover" />
      <div v-if="isToday" class="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-red-500 px-3 text-sm font-bold">
        Hari ini
      </div>
    </NuxtLink>
    <NuxtLink :to="`/member/${member.url_key}`" class="w-[130px] max-w-full rounded-xl bg-blue-400/25 px-3 py-1 text-center text-sm font-bold opacity-80 dark:bg-blue-400/20 md:text-base lg:text-lg">
      {{ member.name }}
    </NuxtLink>
  </div>
</template>
