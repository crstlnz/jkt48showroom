<script lang="ts" setup>
import { NuxtLink } from '#components'

const { data, pending, error } = useApiFetch<IApiEvent>('/api/event')
const { locale } = useI18n()
</script>

<template>
  <LayoutRow :title="$t('menu.event')">
    <div v-if="pending" class="mx-3 md:mx-4">
      <div class="text-xl sm:text-2xl font-bold mb-2 flex gap-2 items-center">
        <Icon name="mdi:calendar-clock" class="text-blue-500" />
        <span>
          {{ $t('upcoming_theater') }}
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 animate-pulse">
        <div v-for="num in Array(4)" :key="num" class="bg-container w-full aspect-[5/2.5] rounded-xl" />
      </div>
      <div class="flex items-center justify-between mt-5 mb-2">
        <div class="text-xl sm:text-2xl font-bold flex gap-2 items-center">
          <Icon name="icon-park-twotone:theater" class="text-red-500" />
          <span>
            {{ $t('recent_theater') }}
          </span>
        </div>
        <NuxtLink to="/theater" class="text-sm md:text-base">
          {{ $t('more') }}
        </NuxtLink>
      </div>
      <div class="md:pt-1 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 animate-pulse">
        <div v-for="num in Array(4)" :key="num" class="bg-container w-full aspect-3/4 rounded-xl" />
      </div>
      <div class="text-xl sm:text-2xl font-bold mb-2 flex gap-2 items-center mt-5">
        <Icon name="ant-design:schedule-filled" class="text-blue-500" />
        <span>
          {{ $t('other_schedule') }}
        </span>
      </div>
      <div class="space-y-3 md:space-y-4">
        <div v-for="num in Array(4)" :key="num" class="bg-container w-full h-[80px] rounded-xl" />
      </div>
      <div class="mt-10 mb-7 h-[1px] bg-black/10 dark:bg-white/10 w-full" />
    </div>
    <!-- end of pending section -->
    <div v-else-if="error" class="flex justify-center items-center pb-4 aspect-video">
      <div class="flex flex-col items-center">
        <NuxtImg :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" sizes="320px" fit="fill" alt="" class="p-5" />
        {{ $t("error.unknown") }}
      </div>
    </div>
    <div v-else-if="data" class="mx-3 md:mx-4">
      <div class="text-xl sm:text-2xl font-bold mb-2 flex gap-2 items-center">
        <Icon name="mdi:calendar-clock" class="text-blue-500" />
        <span>
          {{ $t('upcoming_theater') }}
        </span>
      </div>
      <div v-if="data?.theater?.upcoming?.length" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <TheaterUpcomingCard v-for="theater in data?.theater?.upcoming" :key="theater.id" :theater="theater" />
      </div>
      <div v-else class="aspect-12/5 sm:aspect-12/4 md:aspect-12/3 xl:aspect-[12/2.5] flex items-center justify-center bg-container rounded-xl">
        {{ $t('no_upcoming_theater') }}
      </div>
      <div class="flex items-center justify-between mt-5 mb-2">
        <div class="text-xl sm:text-2xl font-bold flex gap-2 items-center">
          <Icon name="icon-park-twotone:theater" class="text-red-500" />
          <span>
            {{ $t('recent_theater') }}
          </span>
        </div>
        <NuxtLink to="/theater" class="text-sm md:text-base">
          {{ $t('more') }}
        </NuxtLink>
      </div>
      <div class="pt-1.5 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <TheaterCard
          v-for="theater in data.theater.recent" :key="theater.url" :theater=" {
            date: $dayjs(theater.date).toISOString(),
            id: theater.id,
            name: theater.title,
            url: theater.url,
            poster: theater.poster,
          }"
        />
      </div>
      <div class="text-xl sm:text-2xl font-bold mb-2 flex gap-2 items-center mt-5">
        <Icon name="ant-design:schedule-filled" class="text-blue-500" />
        <span>
          {{ $t('other_schedule') }}
        </span>
      </div>
      <div class="flex flex-col gap-3 md:gap-4">
        <component :is="!event.url.startsWith('/calendar') ? NuxtLink : 'div'" v-for="event in data.other_schedule" :key="event.id" :to="event.url.startsWith('/theater/schedule/id/') ? `/theater/${$getTheaterId(event.url)}` : `${$jkt48url}${event.url}`" class="bg-container rounded-xl p-3 md:p-4 space-y-1">
          <div class="flex items-center gap-2">
            <NuxtImg
              class="aspect-56/19 w-14 object-cover self-center"
              :src="`${$cloudinaryURL}/assets/jkt48${event.label}`"
              alt="Label"
              loading="lazy"
              quality="100"
              fit="fill"
              width="56px"
              format="webp"
            />
            <div class="text-sm">
              {{ $dayjs(event.date).locale(locale).format("DD MMMM YYYY") }}
            </div>
          </div>
          <div>{{ event.title }}</div>
        </component>
      </div>
      <div class="mt-10 mb-7 h-[1px] bg-black/10 dark:bg-white/10 w-full" />
    </div>

    <template #sidebar>
      <div class="xl:mt-4">
        <HomeLiveNowSide />
      </div>
    </template>
  </LayoutRow>
</template>
