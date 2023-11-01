<script lang="ts" setup>
const { data, pending, error } = useFetch('/api/jkt48/next_schedule', { key: 'next_schedule', lazy: true, deep: false })
const dayjs = useDayjs()
const groupedSchedule = computed<{ today: boolean; date: string; events: JKT48.Schedule[] }[]>(() => {
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
      <h3 class="flex-1 text-xl font-bold lg:text-2xl">
        {{ $t('schedule') }}
      </h3>
      <!-- <NuxtLink
        class="text-xs hover:text-second-2 lg:text-sm"
        to="/schedule"
        aria-label="More"
      >
        {{ $t("more") }}
      </NuxtLink> -->
    </div>
    <div v-if="pending" class="aspect-[4/2] flex items-center justify-center mb-5">
      <Icon name="svg-spinners:ring-resize" size="2rem" />
    </div>
    <div v-else-if="error" class="aspect-[4/2] flex items-center justify-center mb-7 pt-5 flex-col gap-5">
      <img :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" class="w-[220px] max-w-[80%]">
      <div>{{ $t("error.unknown") }}</div>
    </div>
    <table v-else class="w-full border-t-2 border-black/5 dark:border-white/5 [&_*]:border-black/10 dark:[&_*]:border-white/10">
      <tr v-for="(schedule, index) in groupedSchedule" :key="schedule.date" class="text-sm" :class="{ 'border-b-2': index !== groupedSchedule.length - 1 }">
        <td class="border-r-2 p-3 text-center align-top">
          <div v-if="schedule.today" class="whitespace-nowrap leading-10">
            {{ $t("today") }}
          </div>
          <div v-else>
            <div class="whitespace-nowrap">
              {{ dayjs(schedule.date, "DD-MM-YYYY").format("DD MMM") }}
            </div>
            <div>
              {{ dayjs(schedule.date, "DD-MM-YYYY").locale(locale).format(locale === 'id' ? "dddd" : "ddd") }}
            </div>
          </div>
        </td>
        <td class="w-full p-3">
          <NuxtLink v-for="event in schedule.events" :key="event.id" :to="event.url.startsWith('/theater/schedule/id/') ? `/theater/${$getTheaterId(event.url)}` ?? undefined : undefined" class="flex gap-2">
            <img :src="`https://jkt48.com${event.label}`" alt="Label" class="aspect-[58/18] h-4 self-center"> <span>{{ event.title }}</span>
          </NuxtLink>
        </td>
      </tr>
    </table>
  </div>
</template>
