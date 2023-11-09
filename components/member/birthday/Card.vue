<script lang="ts" setup>
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
      <NuxtImg
        class="h-full w-full overflow-hidden rounded-full object-cover"
        :src="member.img"
        :alt="`${member.name} Profile Picture`"
        loading="lazy"
        fit="fill"
        :modifiers="{
          aspectRatio: 1,
          gravity: 'faceCenter',
        }"
        sizes="80px md:96px lg:112px"
        :placeholder="[10, 10, 75, 5]"
        format="webp"
      />
      <div v-if="isToday" class="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-red-500 px-3 text-sm font-bold">
        Hari ini
      </div>
    </NuxtLink>
    <NuxtLink :to="`/member/${member.url_key}`" class="w-[130px] max-w-full rounded-xl bg-blue-400/25 px-3 py-1 text-center text-sm font-bold opacity-80 dark:bg-blue-400/20 md:text-base lg:text-lg">
      {{ member.name }}
    </NuxtLink>
  </div>
</template>
