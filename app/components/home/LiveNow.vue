<script lang="ts" setup>
import { LazyMemberIDNLiveCard, LazyMemberLiveCard } from '#components'
import { useOnLives } from '~/store/onLives'

const onLives = useOnLives()
const { data, pending, liveCount, error } = storeToRefs(onLives)
</script>

<template>
  <div class="mt-3 flex items-center justify-between px-3 md:px-4">
    <div class="flex gap-1">
      <div class="relative aspect-square w-6">
        <ClientOnly>
          <template #fallback>
            <div
              class="absolute left-1/2 top-1/2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500"
            >
              <div class="aspect-square w-full rounded-full" />
            </div>
          </template>
          <div
            v-if="!data?.length"
            class="absolute left-1/2 top-1/2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500"
          >
            <div class="aspect-square w-full rounded-full" />
          </div>
          <div v-else class="absolute left-1/2 top-1/2 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500">
            <div class="aspect-square w-full rounded-full" />
            <div class="absolute top-0 aspect-square w-full animate-ping rounded-full bg-red-500" />
          </div>
        </ClientOnly>
      </div>
      <h2 class="relative text-xl font-bold leading-10 sm:text-2xl">
        Live
      </h2>
    </div>
    <ClientOnly>
      <template #fallback>
        <div class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5" />
      </template>
      <div
        v-if="pending && data == null"
        key="loading"
      >
        <div class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5" />
      </div>
      <div v-else key="data" class="text-xs opacity-60 md:text-sm">
        {{ liveCount }}
        {{ $t("member", liveCount) }}
      </div>
    </ClientOnly>
  </div>
  <div class="px-3 md:px-4">
    <ClientOnly>
      <template #fallback>
        <div
          class="bg-container grid-live-now gap-4 rounded-xl p-4"
        >
          <PulseLiveCard />
        </div>
      </template>
      <div
        v-if="error"
        class="bg-container flex w-full flex-col items-center justify-center gap-2 rounded-xl pb-5 text-xs shadow-2xs md:gap-3 md:text-sm xl:gap-5 xl:pb-8 xl:pt-2"
      >
        <NuxtImg class="aspect-square w-72 max-w-[70%]" :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
        {{ $t("data.failed") }}
      </div>
      <div
        v-else-if="pending"
        class="bg-container grid-live-now gap-4 rounded-xl p-4"
      >
        <PulseLiveCard />
      </div>
      <div
        v-else-if="data?.length"
        class="bg-container grid-live-now gap-4 rounded-xl p-4"
      >
        <ClientOnly>
          <template #fallback>
            <PulseLiveCard />
          </template>
          <Suspense v-for="live in data" :key="live.type === 'youtube' ? live.etag : live.room_id">
            <component
              :is="live.type === 'showroom' ? LazyMemberLiveCard : LazyMemberIDNLiveCard"
              v-if="live.type !== 'youtube'"
              :key="live.room_id || live.url_key || live.slug"
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
        class="bg-container relative grid-live-now gap-4 rounded-xl p-4"
      >
        <div class="aspect-20/28 md:aspect-20/26 opacity-0" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[245.5px] flex-col items-center justify-center gap-2 text-center text-xs max-sm:aspect-square sm:h-[230.88px] md:h-[250px] md:gap-3 md:text-sm lg:h-[270.55px] xl:h-[349.2px] 2xl:h-[318px]">
          <NuxtImg class="mx-auto w-64 lg:w-72 max-w-[70%] md:max-w-[80%] aspect-5/4 object-contain" alt="No member onlive" :src="`${$cloudinaryURL}/assets/svg/web/space_copy.svg`" sizes="320px" fit="fill" />
          <span class="mt-4 md:mt-5">{{ $t("nolive") }}</span>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
