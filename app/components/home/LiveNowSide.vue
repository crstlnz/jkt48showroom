<script lang="ts" setup>
import { MemberSideLiveCard } from '#components'
import { useOnLives } from '~/store/onLives'

const onLives = useOnLives()
const { data, pending, hasLives } = storeToRefs(onLives)
</script>

<template>
  <HomeContainer title="Now Live" icon-class="bg-red-500">
    <div v-if="pending && data == null">
      <div class="flex aspect-square w-full items-center justify-center">
        <Icon name="svg-spinners:90-ring-with-bg" size="2.5rem" />
      </div>
    </div>
    <div v-else-if="hasLives && data" class="flex flex-col gap-3">
      <MemberSideLiveCard
        v-for="[i, live] in data.entries()" :key="live.type === 'youtube' ? live.etag : live.room_id + i" :live="{
          img: live.type === 'youtube' ? live.thumbnails.medium.url : live.img,
          started_at: live.type === 'youtube' ? null : new Date(live.started_at),
          is_premium: live.type === 'youtube' ? false : live.is_premium || false,
          name: live.type === 'youtube' ? live.title : live.name,
          type: live.type,
          url: live.type === 'youtube' ? live.url : (live.type === 'showroom' ? (live.url_key ?? '0') : `${live.url_key}/idn`) }"
      />
    </div>
    <div
      v-else
      class="aspect-10/9"
    >
      <div class="pt-2 text-center">
        <Image class="mx-auto aspect-square w-72 max-w-[65%] object-contain" alt="No member onlive" :src="`${$imgCDN}/assets/svg/web/space_copy.svg`" sizes="320px" fit="fill" />
        <span>{{ $t("nolive") }}</span>
      </div>
    </div>
  </HomeContainer>
</template>
