<script lang="ts" setup>
import dayjs from 'dayjs'
import { NuxtLink } from '#components'

const props = defineProps<{
  member: IMemberBirthDay
}>()

const { locale } = useI18n()
</script>

<template>
  <div class="flex max-sm:flex-col gap-1.5 md:gap-3">
    <component :is="member.url_key ? NuxtLink : 'div'" :to="member.url_key ? `/member/${member.url_key}` : undefined" class="relative inline-block h-20 w-20 lg:h-24 lg:w-24">
      <NuxtImg
        class="h-full w-full overflow-hidden rounded-xl md:rounded-full object-cover"
        :src="member.img"
        :alt="`${member.name} Profile Picture`"
        loading="lazy"
        fit="fill"
        :modifiers="{
          aspectRatio: 1,
          gravity: 'faceCenter',
        }"
        sizes="96px lg:112px"
        :placeholder="[10, 10, 75, 5]"
        format="webp"
      />
    </component>
    <div class="flex flex-col">
      <component :is="member.url_key ? NuxtLink : 'div'" :to="member.url_key ? `/member/${member.url_key}` : undefined" class="w-[105px] max-w-full  font-bold opacity-90 text-lg">
        {{ member.name }}
      </component>
      <div class="text-base opacity-80 mb-1.5">
        {{ $dayjs(member.birthdate).locale(locale).format("DD MMMM YYYY") }}
      </div>
      <div v-if="$dayjs(props.member.birthdate).year(dayjs().year()).isToday()" class="self-start whitespace-nowrap rounded-xl bg-red-500 px-1.5 md:px-3 text-sm font-bold text-white">
        {{ $t('today') }}
      </div>
      <div v-else-if="$dayjs(props.member.birthdate).year(dayjs().year()).isTomorrow()" class="self-start whitespace-nowrap rounded-xl bg-red-500 px-1.5 md:px-3 text-sm font-bold text-white">
        {{ $t('tomorrow') }}
      </div>
    </div>
  </div>
</template>
