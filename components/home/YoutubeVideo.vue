<script lang="ts" setup>
const { locale } = useI18n()
const { data, pending } = useCachedFetch<API.JKT48Video[]>('/api/jkt48_youtube', {
  expireIn: 600000,
})
</script>

<template>
  <div class="space-y-3 sm:px-3 md:px-4 pb-5 max-sm:pb-8 max-sm:border-b border-black/5 dark:border-white/5">
    <div class="flex gap-1.5 items-center max-sm:px-3">
      <Icon name="logos:youtube-icon" class="self-center text-lg sm:text-xl" />
      <h2 class="flex-1 text-xl font-bold leading-10 sm:text-2xl">
        {{ $t("page.title.jkt48youtube") }}
      </h2>
      <NuxtLink to="https://www.youtube.com/@JKT48TV/videos" external target="_blank">
        {{ $t("more") }}
      </NuxtLink>
    </div>
    <div
      v-if="(pending && !data)" key="loading"
      class="grid grid-rows-1 gap-x-4 gap-y-5 sm:gap-y-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-pulse"
    >
      <div v-for="key in 6" :key="key" class="flex flex-col gap-3 rounded-xl">
        <div class="bg-container sm:rounded-xl aspect-video w-full" />
        <div class="flex gap-3 max-sm:px-3">
          <div
            class="bg-container aspect-square relative group overflow-hidden rounded-full w-9 shrink-0 self-start"
          />
          <div class="flex flex-1 flex-col gap-1">
            <div class="flex flex-1 gap-y-2 flex-wrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div class="w-full bg-container rounded-md h-5" />
              <div class="max-sm:hidden w-full bg-container rounded-md h-5" />
            </div>
            <div class="flex flex-1 flex-col gap-1.5 mt-0.5 sm:mt-2.5">
              <div class="max-sm:hidden w-1/4 bg-container rounded-md h-3 sm:h-4" />
              <div class="w-3/4 bg-container rounded-md h-3 sm:h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="data?.length" key="hasdata"
      class="grid grid-rows-1 gap-x-4 gap-y-5 sm:gap-y-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="video in data.slice(0, 6)" :key="video.etag" class="flex flex-col gap-3 rounded-xl">
        <NuxtLink
          :to="video.url" target="_blank" external
          class="aspect-video w-full relative group overflow-hidden sm:rounded-xl"
        >
          <DeferImage
            :src="video.thumbnails?.medium?.url ?? $errorPicture" :alt="`${video.channelTitle} profile picture`"
            class="size-full -z-10 object-cover transition-transform duration-500"
          />
        </NuxtLink>
        <div class="flex gap-3 max-sm:px-3">
          <NuxtLink
            :to="`https://www.youtube.com/${video.channelUrl}`" target="_blank" external
            class="aspect-square relative group overflow-hidden rounded-full w-9 shrink-0 self-start"
          >
            <DeferImage
              :src="video.profilePict?.medium?.url ?? $errorPicture" error-image="https://res.cloudinary.com/haymzm4wp/image/upload/s--GIdv3Qf1--/t_media_lib_thumb/uploads/mbcry7wbt4pwk1ejf2rs" :alt="`${video.channelTitle} profile picture`"
              class="size-full -z-10 object-cover transition-transform duration-500"
            />
          </NuxtLink>
          <div class="flex flex-col gap-1">
            <a :href="video.url" target="_blank" class="line-clamp-2 text-base md:text-lg font-bold leading-5">
              {{ video.title }}
            </a>
            <div class="flex gap-x-1 flex-wrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <a :href="`https://youtube.com/${video.channelUrl}`" target="_blank" class="sm:w-full">{{ video.channelTitle }}</a>
              <div class="sm:hidden">
                •
              </div>
              <div class="">
                {{ youtubeViewsFormat(video.statistics?.viewCount,
                                      locale) }}
              </div>
              <div>•</div>
              <div>{{ useDayjs()(video.date).locale(locale).fromNow() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else key="nodata" class="bg-container rounded-xl p-3 md:p-4 w-full">
      <div class="space-y-4 overflow-hidden py-4 text-center dark:bg-dark-1">
        <NuxtImg
          :src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`" alt="Empty"
          class="mx-auto aspect-square w-[200px] max-w-[80%] dark:brightness-110"
        />
        <div class="text-base">
          Sorry, but there is no recents right now :(
        </div>
      </div>
    </div>
  </div>
</template>
