<script setup lang="ts">
import { useSettings } from '~~/store/settings'

const { group } = useSettings()
const { data, pending, error } = useFetch('/api/member/birthday', { params: { group } })
</script>

<template>
  <div class="bg-container rounded-xl p-3 md:p-4">
    <div class="flex items-center gap-2 text-2xl font-bold">
      <Icon name="twemoji:birthday-cake" size="1.5rem" />
      <span>{{ $t('birthday.thismonth') }}</span>
    </div>
    <div v-if="error" class="flex flex-col items-center justify-center gap-5 py-8">
      <img class="mx-auto w-72 max-w-[65%]" src="/svg/error.svg">
      <span>{{ $t("data.failed") }}</span>
    </div>
    <div v-else-if="pending" class="flex h-[196px] items-center justify-center md:h-[212px] lg:h-[232px]">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <div v-else-if="!data" class="flex flex-col items-center justify-center gap-2 py-8">
      <img class="mx-auto w-72 max-w-[80%]" src="/svg/empty-box.svg">
      <span>{{ $t("birthday.empty") }}</span>
    </div>
    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] py-4 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:py-6">
      <MemberBirthdayCard v-for="member in data" :key="member.room_id || member.name" :member="member" />
    </div>
  </div>
</template>
