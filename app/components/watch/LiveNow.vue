<script lang="ts" setup>
import { LazyMemberIDNLiveCard, LazyMemberLiveCard } from '#components'
import { useOnLives } from '~/store/onLives'

const { roomKey } = defineProps<{
  roomKey: string
}>()
const onLives = useOnLives()
const { data: rawData, pending, error } = storeToRefs(onLives)

const data = computed(() => {
  if (!rawData.value) return null
  return rawData.value.filter(i => i.type === 'youtube' || i.url_key !== roomKey)
})
</script>

<template>
  <div class="pt-3">
    <div class="bg-container flex h-full flex-col gap-3 px-3 pt-3 lg:rounded-xl lg:p-4 lg:pb-5">
      <div class="flex items-center gap-2 text-xl font-bold">
        <Icon name="fluent:live-20-filled" class="text-red-500" size="1.8rem" />
        <span class="pt-1">{{ $t('otherlive') }}</span>
      </div>
      <div>
        <div
          v-if="error"
          class="bg-container flex w-full flex-col items-center justify-center gap-2 rounded-xl pb-5 text-xs shadow-2xs md:gap-3 md:text-sm xl:gap-5 xl:pb-8 xl:pt-2"
        >
          <img class="aspect-square w-72 max-w-[70%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill">
          {{ $t("data.failed") }}
        </div>
        <div
          v-else-if="pending && data == null"
          class="bg-container grid-live-now gap-4 rounded-xl"
        >
          <PulseLiveCard />
        </div>
        <div
          v-else-if="data?.length"
          class="bg-container grid-live-now gap-4 rounded-xl"
        >
          <ClientOnly>
            <template #fallback>
              <PulseLiveCard />
            </template>
            <Suspense v-for="live in data" :key="live.type === 'youtube' ? live.etag : live.room_id">
              <component
                :is="live.type === 'showroom' ? LazyMemberLiveCard : LazyMemberIDNLiveCard"
                v-if="live.type !== 'youtube'"
                :key="live.room_id"
                class="bg-background"
                :live="live"
              />
              <YoutubeLiveCard v-else :key="live.etag" :live="live" class="bg-background" />
              <template #fallback>
                <PulseLiveCard />
              </template>
            </Suspense>
          </ClientOnly>
        </div>
        <div
          v-else
          class="bg-container flex w-full flex-col items-center justify-center rounded-xl shadow-2xs"
        >
          <div class="flex h-[245.5px] flex-col items-center justify-center gap-2 text-center text-xs max-sm:aspect-square sm:h-[230.88px] md:h-[250px] md:gap-3 md:text-sm lg:h-[270.55px] xl:h-[349.2px] 2xl:h-[318px]">
            <img class="mx-auto w-72 max-w-[80%]" alt="No member onlive" :src="`${$imgCDN}/assets/svg/web/space_copy.svg`" sizes="320px" fit="fill">
            <span class="mt-5">{{ $t("nolive") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
