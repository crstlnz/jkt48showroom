<script lang="ts" setup>
import { NuxtLink } from '#components'

const props = defineProps<{
  member: IMemberBirthDay
}>()
const isToday = computed(() => {
  return new Date(props.member.birthdate).getDate() === new Date().getDate()
})
const isTomorrow = computed(() => {
  return (new Date(props.member.birthdate).getDate() - new Date().getDate()) === 1
})

const { locale } = useI18n()
</script>

<template>
  <div class="flex gap-3">
    <component :is="member.url_key ? NuxtLink : 'div'" :to="member.url_key ? `/member/${member.url_key}` : undefined" class="relative inline-block h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
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
    </component>
    <div class="flex flex-col">
      <component :is="member.url_key ? NuxtLink : 'div'" :to="member.url_key ? `/member/${member.url_key}` : undefined" class="w-[105px] max-w-full text-sm font-bold opacity-90 md:text-base lg:text-lg">
        {{ member.name }}
      </component>
      <div class="text-sm opacity-80 mb-1.5">
        {{ $dayjs(member.birthdate).locale(locale).format("DD MMMM YYYY") }}
      </div>
      <div v-if="isToday" class="self-start whitespace-nowrap rounded-xl bg-red-500 px-1.5 md:px-3 text-xs md:text-sm font-bold text-white">
        {{ $t('today') }}
      </div>
      <div v-if="isTomorrow" class="self-start whitespace-nowrap rounded-xl bg-red-500 px-1.5 md:px-3 text-xs md:text-sm font-bold text-white">
        {{ $t('tomorrow') }}
      </div>
    </div>
  </div>
</template>
