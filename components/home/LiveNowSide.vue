<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

const onLives = useOnLives()
const { data, pending, error } = storeToRefs(onLives)
</script>

<template>
  <HomeContainer title="Now Live" icon-class="bg-red-500">
    <div v-if="pending && data == null">
      <div class="flex aspect-square w-full items-center justify-center">
        <Icon name="svg-spinners:90-ring-with-bg" size="2.5rem" />
      </div>
    </div>
    <div
      v-else-if="error"
      class="aspect-[10/9]"
    >
      <div class="pt-2 text-center">
        <NuxtImg class="aspect-square w-72 mx-auto max-w-[65%] object-contain" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
        <span>{{ $t("data.failed") }}</span>
      </div>
    </div>
    <div v-else-if="data?.length" class="flex flex-col gap-3">
      <MemberSideLiveCard v-for="live in data" :key="live.room_id" :live="live" />
    </div>
    <div
      v-else
      class="aspect-[10/9]"
    >
      <div class="pt-2 text-center">
        <NuxtImg class="mx-auto aspect-square w-72 max-w-[65%] object-contain" alt="No member onlive" :src="`${$cloudinaryURL}/assets/svg/web/space_copy.svg`" sizes="320px" fit="fill" />
        <span>{{ $t("nolive") }}</span>
      </div>
    </div>
  </HomeContainer>
</template>
