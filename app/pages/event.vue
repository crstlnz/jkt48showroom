<script lang="ts" setup>
import { NuxtLink } from '#components'
import getScheduleUrl from '~/utils/schedule'

const { data, pending, error } = await useApiFetch<IApiEvent>('/api/event', { server: true })
const { locale } = useI18n()
const forceLoading = ref(false)
</script>

<template>
  <LayoutRow :title="$t('menu.event')">
    <div class="mx-3 md:mx-4">
      <HomeSectionContainer :title="$t('upcoming_theater')" icon="mdi:calendar-clock" icon-color="bg-blue-500/15 text-blue-500" root-class="!space-y-2 !pb-0 !border-0" header-class="!px-0" title-class="" without-padding>
        <div v-if="error" key="error" class="flex justify-center items-center pb-4 aspect-video">
          <div class="flex flex-col items-center">
            <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" alt="" class="p-5" />
            {{ $t("error.unknown") }}
          </div>
        </div>
        <template v-else>
          <div v-if="pending || forceLoading" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 animate-pulse">
            <div v-for="num in 4" :key="`upcoming-theater-skeleton-${num}`" class="bg-container w-full aspect-[5/1.65] sm:aspect-[5/2.2] lg:aspect-5/2 rounded-xl" />
          </div>
          <div v-else-if="data?.theater?.upcoming?.length" key="upcoming" class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <TheaterUpcomingCard v-for="theater in data?.theater?.upcoming" :key="theater.id" :theater="theater" />
          </div>
          <div v-else class="aspect-12/5 sm:aspect-12/4 md:aspect-12/3 xl:aspect-12/2.5 flex items-center justify-center bg-container rounded-xl">
            {{ $t('no_upcoming_theater') }}
          </div>
        </template>
      </HomeSectionContainer>

      <template v-if="!error">
        <HomeSectionContainer :title="$t('recent_theater')" icon="icon-park-twotone:theater" icon-color="bg-red-500/15 text-red-500" root-class="!space-y-2 !pb-0 !border-0 mt-5" header-class="!px-0" without-padding>
          <template #right>
            <MoreButton to="/theater" />
          </template>
          <div v-if="pending" class="pt-1.5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 animate-pulse">
            <div
              v-for="(num, index) in 5"
              :key="`recent-theater-skeleton-${num}`"
              class="bg-container w-full aspect-3/4 rounded-xl"
              :class="{
                'md:hidden lg:block': index === 3,
                'hidden xl:block': index === 4,
              }"
            />
          </div>
          <div v-else class="pt-1.5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            <TheaterCard
              v-for="(theater, index) in data.theater.recent.slice(0, 5)" :key="theater.url" :theater=" theater" :class="{
                'md:hidden lg:block': index === 3,
                'hidden xl:block': index === 4,
                'hidden': index >= 5,
              }"
            />
          </div>
        </HomeSectionContainer>

        <HomeSectionContainer :title="$t('other_schedule')" icon="ant-design:schedule-filled" icon-color="bg-yellow-500/15 text-yellow-500" root-class="!space-y-2 !pb-0 !border-0 mt-5" header-class="!px-0" without-padding>
          <div v-if="pending" class="space-y-3 md:space-y-4">
            <div v-for="num in 4" :key="`other-schedule-skeleton-${num}`" class="bg-container w-full h-20 rounded-xl" />
          </div>
          <div v-else-if="data.other_schedule.length" class="flex flex-col gap-3 md:gap-4">
            <component :is="getScheduleUrl(event) != null ? NuxtLink : 'div'" v-for="event in data.other_schedule" :key="event.id" :to="getScheduleUrl(event)" class="bg-container rounded-xl p-3 md:p-4 space-y-1">
              <div class="flex items-center gap-2">
                <Image
                  v-if="event.label"
                  class="aspect-56/19 w-14 object-cover self-center"
                  :src="`${$imgCDN}/assets/jkt48${event.label}`"
                  alt="Label"
                  loading="lazy"
                  quality="100"
                  fit="fill"
                  width="56px"
                  format="webp"
                />
                <NewsCategoryBadge v-else-if="event.category" :category="event.category" variant="soft" />
                <div class="text-sm">
                  {{ $dayjs(event.date).locale(locale).format("DD MMMM YYYY") }}
                </div>
              </div>
              <div>{{ event.title }}</div>
            </component>
          </div>
          <div v-else class="bg-container rounded-xl p-6 md:p-10 2xl:p-12 flex flex-col items-center justify-center text-center border border-black/10 dark:border-white/10">
            <Image
              :src="`${$imgCDN}/assets/img/web/empty-box.png`"
              alt=""
              class="w-32 h-24 object-contain mb-2 opacity-85"
            />
            <div class="text-sm md:text-base font-medium">
              {{ $t("data.nodata") }}
            </div>
            <div class="text-xs md:text-sm opacity-70 mt-1">
              {{ $t("data.other_schedule_empty") }}
            </div>
          </div>
        </HomeSectionContainer>
      </template>
      <div v-if="!error" class="mt-10 mb-7 h-px bg-black/10 dark:bg-white/10 w-full" />
    </div>

    <template #sidebar>
      <div class="xl:mt-4">
        <HomeLiveNowSide />
      </div>
    </template>
  </LayoutRow>
</template>
