<script setup lang="ts">
import { useSettings } from '~/store/settings'

const { group } = useSettings()
const { data, pending, error } = await useCachedFetch<IMemberBirthDay[]>('/api/next_birthday', { params: { group }, expireIn: 600000 })
</script>

<template>
  <div class="bg-container rounded-xl p-3 md:p-4">
    <div class="flex items-center gap-2 font-bold text-lg xl:text-xl">
      <Icon name="twemoji:birthday-cake" size="1.25rem" />
      <span>{{ $t('birthday.next') }}</span>
    </div>
    <div v-if="error" class="flex flex-col items-center justify-center gap-5 py-8">
      <Image class="mx-auto w-72 max-w-[65%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pending" class="flex h-[196px] items-center justify-center md:h-[212px] lg:h-[232px]">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else-if="!data" class="flex flex-col items-center justify-center gap-2 py-8">
      <Image class="mx-auto w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
      <span>{{ $t("birthday.empty") }}</span>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-3 md:py-4 gap-5 md:gap-6 max-sm:mt-2 max-sm:px-1.5">
      <MemberBirthdayCard v-for="member in data" :key="member.room_id || member.name" :member="member" class="mt-2" />
    </div>
  </div>
</template>
