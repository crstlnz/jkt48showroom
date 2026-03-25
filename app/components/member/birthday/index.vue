<script setup lang="ts">
import { useSettings } from '~/store/settings'

const { group } = useSettings()
const { data, pending, error } = useCachedFetch<IMemberBirthDay[]>('/api/next_birthday', { params: { group }, expireIn: 600000 })
</script>

<template>
  <HomeContainer :title="$t('birthday.next')" icon="twemoji:birthday-cake" icon-color="bg-red-500/15 text-red-500">
    <div v-if="error" class="flex flex-col items-center justify-center gap-5 py-8">
      <Image class="mx-auto w-72 max-w-[65%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pending" class="flex h-49 items-center justify-center md:h-53 lg:h-58">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else-if="!data" class="flex flex-col items-center justify-center gap-2 py-8">
      <Image class="mx-auto w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
      <span>{{ $t("birthday.empty") }}</span>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-3 pb-3 gap-2 md:gap-3 max-sm:px-1.5">
      <MemberBirthdayCard v-for="member in data" :key="member.room_id || member.name" :member="member" class="mt-2" />
    </div>
  </HomeContainer>
</template>
