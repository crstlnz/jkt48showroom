<script lang="ts" setup>
import { NuxtLink } from '#components'
import { imgCDN } from '~/app.config'

const { data, pending, error, date, refresh } = useCachedFetch<JKT48.Schedule[]>('/api/next_schedule', { expireIn: 1800000 })
const dayjs = useDayjs()
const groupedSchedule = computed<{ today: boolean, date: string, events: JKT48.Schedule[] }[]>(() => {
  if (!data.value) return []
  const dateGroup = new Map<string, JKT48.Schedule[]>()
  for (const schedule of data.value) {
    const date = dayjs(schedule.date).format('DD-MM-YYYY')
    if (dateGroup.has(date)) {
      dateGroup.get(date)?.push(schedule)
    }
    else {
      dateGroup.set(date, [schedule])
    }
  }

  return Array.from(dateGroup.entries()).map((i) => {
    return {
      today: dayjs(i[0], 'DD-MM-YYYY').isToday(),
      date: i[0],
      events: i[1].sort((a, b) => a.title.localeCompare(b.title)),
    }
  })
})
const { locale } = useI18n()
</script>

<template>
  <div class="bg-container overflow-hidden rounded-xl">
    <div class="flex items-center gap-2 p-3 md:px-4 md:pt-4">
      <div class="inline-block h-5 w-1 rounded-l-sm bg-blue-500" />
      <h3 class="flex-1 text-lg font-bold lg:text-xl">
        {{ $t('schedule') }}
      </h3>
    </div>
    <div v-if="pending" class="aspect-4/2 flex items-center justify-center mb-5">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error && !data" class="aspect-4/2 flex items-center justify-center mb-7 pt-5 flex-col gap-5">
      <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" class="w-55 max-w-[80%]" />
      <div>{{ $t("error.unknown") }}</div>
    </div>
    <div v-else-if="!data?.length" class="flex flex-col items-center pb-4">
      <Image :src="`${$imgCDN}/assets/img/web/empty-box.png`" alt="" class="w-52 h-40 mb-2 object-contain" />
      {{ $t("data.nodata") }}
    </div>
    <table v-else class="w-full border-t border-b border-color-1 **:border-black/10 dark:**:border-white/10">
      <tr v-for="(schedule, index) in groupedSchedule" :key="schedule.date" class="text-sm" :class="{ 'border-b': index !== groupedSchedule.length - 1 }">
        <td class="border-r p-3 text-center align-top">
          <div v-if="schedule.today" class="whitespace-nowrap leading-10">
            {{ $t("today") }}
          </div>
          <div v-else>
            <div class="whitespace-nowrap">
              {{ $dayjs(schedule.date, "DD-MM-YYYY").format("DD MMM") }}
            </div>
            <div>
              {{ $dayjs(schedule.date, "DD-MM-YYYY").locale(locale).format(locale === 'id' ? "dddd" : "ddd") }}
            </div>
          </div>
        </td>
        <td class="w-full p-3">
          <component :is="!event.url.startsWith('/calendar') ? NuxtLink : 'div'" v-for="event in schedule.events" :key="event.id" :to="event.url.startsWith('/theater/schedule/id/') ? `/theater/${$getTheaterId(event.url)}` : `${$jkt48url}${event.url}`" class="flex gap-2">
            <Image
              class="aspect-56/19 w-14 object-cover self-center shrink-0"
              :src="`${imgCDN}/assets/jkt48${event.label}`"
              alt="Label"
              loading="lazy"
              quality="100"
              fit="fill"
              width="56px"
              format="webp"
            />
            <span>{{ event.title }}</span>
          </component>
        </td>
      </tr>
    </table>
    <button v-if="date && !pending" type="button" class="flex gap-1 items-center text-xs font-light float-right px-3 pt-1.5 pb-3 truncate" @click="refresh">
      {{ $dayjs(date).locale(locale).fromNow() }}
      <Icon name="ic:outline-refresh" />
    </button>
  </div>
</template>
