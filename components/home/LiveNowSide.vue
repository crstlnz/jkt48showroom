<script lang="ts" setup>
import { useIDNLives } from '~/store/idnLives'
import { useOnLives } from '~/store/onLives'

const onLives = useOnLives()
const { data, pending, hasLives, error } = storeToRefs(onLives)

const idnLives = useIDNLives()
const { data: idnData, pending: idnPending, hasLives: idnHasLive } = storeToRefs(idnLives)
</script>

<template>
  <HomeContainer title="Now Live" icon-class="bg-red-500">
    <div v-if="(pending && idnPending) && (data == null && idnData == null)">
      <div class="flex aspect-square w-full items-center justify-center">
        <Icon name="svg-spinners:90-ring-with-bg" size="2.5rem" />
      </div>
    </div>
    <div v-else-if="hasLives || idnHasLive" class="flex flex-col gap-3">
      <MemberSideLiveCard
        v-for="live in idnData" :key="live.user.id" :live="{
          img: live.image,
          started_at: new Date(live.live_at),
          is_premium: false,
          name: live.user.name,
          url: `${live.user.username}/idn`,
        }"
      />
      <MemberSideLiveCard
        v-for="live in data" :key="live.room_id" :live="{
          img: live.img,
          started_at: new Date(live.started_at),
          is_premium: live.is_premium || false,
          name: live.name,
          url: live.url,
        }"
      />
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
