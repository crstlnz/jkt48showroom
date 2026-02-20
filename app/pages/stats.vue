<script lang="ts" setup>
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import { useSettings } from '~/store/settings'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
)

interface StatsMonthItem {
  month: string
}

interface LeaderboardItem {
  room_id: number
  value: number
  member?: {
    name?: string
    nickname?: string
    img?: string
    img_alt?: string
  }
}

interface HighlightItem {
  key: string
  title: string
  value: {
    viewers?: number
    duration?: number
    gift?: number
    comments?: number
  }
  member?: {
    name?: string
    nickname?: string
    img?: string
    img_alt?: string
  }
}

interface StatsData {
  meta: {
    month: string
  }
  summary: {
    total_members: number
    total_lives: number
    total_showroom_lives: number
    total_idn_lives: number
    platform_share: {
      showroom_pct: number
      idn_pct: number
    }
    total_gift: number
    avg_gift_per_live: number
    avg_duration: number
    avg_viewer: number
    unique_gifters: number
    active_days: number
  }
  content: {
    leaderboards: {
      by_total_gift: LeaderboardItem[]
      by_live_count: LeaderboardItem[]
      by_engagement: LeaderboardItem[]
    }
    highlights: HighlightItem[]
    weekday_breakdown: {
      day: number
      label: string
      live_count: number
      total_gift: number
      avg_viewer: number
    }[]
    prime_hours: {
      hour: number
      live_count: number
      total_gift: number
    }[]
  }
  top_gifters: {
    user_id: string | number
    name: string
    avatar_id?: number
    avatar_url?: string
    total_gift: number
    total_lives_supported: number
  }[]
  timeline: {
    date: string
    live_count: number
    total_gift: number
    avg_viewer: number
  }[]
}

interface StatsMonthResponse {
  months: StatsMonthItem[]
}

const settings = useSettings()
const selectedMonth = ref('last')
const TOP_FANS_LIMIT = 100

const monthQuery = computed(() => ({ group: settings.group }))
const { data: monthsData } = useApiFetch<StatsMonthResponse>('/api/stats/months', {
  key: computed(() => `stats-months-${settings.group}`),
  query: monthQuery,
})

const monthList = computed(() => monthsData.value?.months ?? [])
watch(monthList, (list) => {
  if (!list.length) {
    selectedMonth.value = 'last'
    return
  }

  const exists = list.some(i => i.month === selectedMonth.value)
  if (!exists) selectedMonth.value = list[0]!.month
}, { immediate: true })

const statsQuery = computed(() => ({
  group: settings.group,
  month: selectedMonth.value || 'last',
  top_fans: TOP_FANS_LIMIT,
}))

const {
  data,
  error,
  pending,
} = useApiFetch<StatsData>('/api/stats', {
  key: computed(() => `stats-${settings.group}-${selectedMonth.value || 'last'}-${TOP_FANS_LIMIT}`),
  query: statsQuery,
})

const { t, locale } = useI18n()
const dayjs = useDayjs()
const titleMonth = computed(() => {
  const month = data.value?.meta?.month
  if (!month) return ''
  return dayjs(`${month}-01`).format('MMMM YYYY')
})

const pageTitle = computed(() => {
  if (titleMonth.value) return `${t('menu.stats')} - ${titleMonth.value}`
  return t('menu.stats')
})

const chartResizeKey = ref(0)
function onChartResize() {
  chartResizeKey.value += 1
}

onMounted(() => {
  window.addEventListener('resize', onChartResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onChartResize)
})

const topGiftMembers = computed(() => data.value?.content?.leaderboards?.by_total_gift?.slice(0, 5) ?? [])
const mostLiveMembers = computed(() => data.value?.content?.leaderboards?.by_live_count?.slice(0, 5) ?? [])
const engagementMembers = computed(() => data.value?.content?.leaderboards?.by_engagement?.slice(0, 5) ?? [])
const highlights = computed(() => data.value?.content?.highlights ?? [])
const numberLocale = computed(() => (locale.value === 'ja' ? 'ja-JP' : locale.value === 'id' ? 'id-ID' : 'en-US'))
const compactNumberFormatter = computed(() => new Intl.NumberFormat(numberLocale.value, {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
}))

function formatCompactNumber(value: number) {
  return compactNumberFormatter.value.format(value || 0)
}

function formatCompactCurrency(value: number) {
  return `${t('stats_page.currency_prefix')} ${compactNumberFormatter.value.format(value || 0)}`
}

function getWeekdayShortLabel(label: string) {
  const key = label.slice(0, 3).toLowerCase()
  if (!['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(key)) {
    return label.slice(0, 3)
  }
  return t(`stats_page.chart.weekday_short.${key}`)
}

const idnPercent = computed(() => {
  const val = data.value?.summary?.platform_share?.idn_pct ?? 0
  return Math.max(0, Math.min(100, val))
})

const showroomPercent = computed(() => {
  const val = data.value?.summary?.platform_share?.showroom_pct ?? 0
  return Math.max(0, Math.min(100, val))
})

const timelineChartData = computed<any>(() => {
  const timeline = data.value?.timeline ?? []
  return {
    labels: timeline.map(item => dayjs(item.date).format('DD MMM')),
    datasets: [
      {
        label: t('stats_page.chart.live_count'),
        data: timeline.map(item => item.live_count),
        borderColor: 'rgba(114, 137, 218, 1)',
        backgroundColor: 'rgba(114, 137, 218, 0.2)',
        fill: true,
        tension: 0.25,
        pointRadius: 2,
      },
      {
        label: t('stats_page.chart.avg_viewers'),
        data: timeline.map(item => item.avg_viewer),
        borderColor: 'rgba(70, 152, 235, 1)',
        backgroundColor: 'rgba(70, 152, 235, 0.15)',
        fill: false,
        tension: 0.25,
        pointRadius: 2,
        yAxisID: 'y1',
      },
    ],
  }
})

const timelineChartOptions = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 150,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(128,128,128,0.15)',
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(128,128,128,0.2)',
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.live'),
      },
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.viewers'),
      },
    },
  },
}))

const weekdayChartData = computed<any>(() => {
  const rows = data.value?.content?.weekday_breakdown ?? []
  return {
    labels: rows.map(row => getWeekdayShortLabel(row.label)),
    datasets: [
      {
        type: 'bar',
        label: t('stats_page.chart.live_count'),
        data: rows.map(row => row.live_count),
        borderRadius: 6,
        backgroundColor: 'rgba(114, 137, 218, 0.85)',
      },
      {
        type: 'line',
        label: t('stats_page.chart.avg_viewers'),
        data: rows.map(row => row.avg_viewer),
        borderColor: 'rgba(70, 152, 235, 1)',
        backgroundColor: 'rgba(70, 152, 235, 0.2)',
        tension: 0.25,
        pointRadius: 2,
        yAxisID: 'y1',
      },
    ],
  }
})

const weekdayChartOptions = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 150,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(128,128,128,0.2)',
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.live'),
      },
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.viewers'),
      },
    },
  },
}))

const primeHourChartData = computed<any>(() => {
  const rows = data.value?.content?.prime_hours ?? []
  return {
    labels: rows.map(row => `${String(row.hour).padStart(2, '0')}:00`),
    datasets: [
      {
        type: 'bar',
        label: t('stats_page.chart.live_count'),
        data: rows.map(row => row.live_count),
        borderRadius: 6,
        backgroundColor: 'rgba(114, 137, 218, 0.85)',
      },
      {
        type: 'line',
        label: t('stats_page.chart.total_gift_idr'),
        data: rows.map(row => row.total_gift),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.25,
        pointRadius: 2,
        yAxisID: 'y1',
      },
    ],
  }
})

const primeHourChartOptions = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 150,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(128,128,128,0.2)',
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.live'),
      },
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: t('stats_page.chart.axis.gift_idr'),
      },
    },
  },
}))

useHead({
  title: pageTitle,
})
</script>

<template>
  <LayoutSingleRow :title="pageTitle">
    <Error v-if="error && error.statusCode === 404" class="mx-5" :message="$t('data.notfound')" :img-src="`${$imgCDN}/assets/svg/web/no_data.svg`" />
    <Error v-else-if="error" class="mx-5" :message="$t('error.unknown')" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" />
    <div v-else class="mx-3 space-y-3 md:mx-4 md:space-y-4">
      <div class="bg-container rounded-xl p-3 md:p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-1 lg:min-w-65">
            <div class="text-xs opacity-60 md:text-sm">
              {{ $t('stats_page.month_label') }}
            </div>
            <select v-model="selectedMonth" class="bg-container-2 border-color-1 w-full rounded-xl border px-3 py-2 text-sm outline-hidden ring-blue-500 focus:ring-2">
              <option v-if="!monthList.length" value="last">
                {{ $t('stats_page.last_month') }}
              </option>
              <option v-for="month in monthList" :key="month.month" :value="month.month">
                {{ dayjs(`${month.month}-01`).format('MMMM YYYY') }}
              </option>
            </select>
          </div>

          <div class="bg-container-2 border-color-1 rounded-xl border px-3 py-2 lg:min-w-55">
            <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-60">
              <Icon name="material-symbols:calendar-month" />
              <span>{{ $t('stats_page.data_range') }}</span>
            </div>
            <div class="text-sm font-semibold">
              {{ pending ? $t('stats_page.loading') : (titleMonth || '-') }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="pending" class="grid gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
        <div v-for="num in 8" :key="num" class="bg-container rounded-xl p-4 md:p-5">
          <div class="pulse-color mb-4 h-4 w-1/3 animate-pulse rounded-xl" />
          <div class="pulse-color h-8 w-2/3 animate-pulse rounded-xl" />
        </div>
      </div>

      <template v-else-if="data">
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
          <div class="bg-container rounded-xl p-4 md:p-5">
            <div class="flex items-center gap-2 text-sm opacity-70">
              <Icon name="material-symbols:videocam-rounded" class="text-red-500" />
              <span>{{ $t('stats_page.summary.total_live') }}</span>
            </div>
            <div class="pt-2 text-2xl font-semibold">
              {{ $t('stats_page.summary.live_count', { count: data.summary.total_lives.toLocaleString(numberLocale) }) }}
            </div>
            <div class="pt-1 text-xs opacity-60">
              {{ $t('stats_page.summary.by_member', { count: data.summary.total_members.toLocaleString(numberLocale) }) }}
            </div>
          </div>
          <div class="bg-container rounded-xl p-4 md:p-5">
            <div class="flex items-center gap-2 text-sm opacity-70">
              <Icon name="solar:gift-bold-duotone" class="text-yellow-500" />
              <span>{{ $t('stats_page.summary.total_gift') }}</span>
            </div>
            <div class="pt-2 text-2xl font-semibold">
              {{ $n(data.summary.total_gift, 'currency', 'id') }}
            </div>
            <div class="pt-1 text-xs opacity-60">
              {{ $t('stats_page.summary.avg_gift_per_live', { value: $n(data.summary.avg_gift_per_live, 'currency', 'id') }) }}
            </div>
          </div>
          <div class="bg-container rounded-xl p-4 md:p-5">
            <div class="flex items-center gap-2 text-sm opacity-70">
              <Icon name="material-symbols:clock-loader-60" class="text-green-500" />
              <span>{{ $t('stats_page.summary.avg_duration') }}</span>
            </div>
            <div class="pt-2 text-2xl font-semibold">
              {{ formatDuration(data.summary.avg_duration, { second: false }) }}
            </div>
            <div class="pt-1 text-xs opacity-60">
              {{ $t('stats_page.summary.active_days', { count: data.summary.active_days }) }}
            </div>
          </div>
          <div class="bg-container rounded-xl p-4 md:p-5">
            <div class="flex items-center gap-2 text-sm opacity-70">
              <Icon name="mdi:account-eye" class="text-blue-500" />
              <span>{{ $t('stats_page.summary.avg_viewers') }}</span>
            </div>
            <div class="pt-2 text-2xl font-semibold">
              {{ data.summary.avg_viewer.toLocaleString(numberLocale) }}
            </div>
            <div class="pt-1 text-xs opacity-60">
              {{ $t('stats_page.summary.unique_gifters', { count: data.summary.unique_gifters.toLocaleString(numberLocale) }) }}
            </div>
          </div>
        </div>

        <div class="grid gap-3 xl:grid-cols-5 md:gap-4">
          <div class="bg-container rounded-xl p-3 md:p-4 xl:col-span-3">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="icon-park-outline:chart-line" class="text-blue-500" />
              <span>{{ $t('stats_page.section.timeline_daily') }}</span>
            </div>
            <div class="bg-container-2 relative mt-3 h-56 w-full rounded-xl p-2 sm:h-64 md:h-70 md:p-3">
              <ClientOnly>
                <Line :key="`timeline-${chartResizeKey}`" class="h-full w-full" :data="timelineChartData" :options="timelineChartOptions" />
                <template #fallback>
                  <div class="pulse-color h-full w-full animate-pulse rounded-xl" />
                </template>
              </ClientOnly>
            </div>
          </div>

          <div class="bg-container rounded-xl p-3 md:p-4 xl:col-span-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 text-lg font-semibold">
                <Icon name="heroicons:bookmark-20-solid" class="text-orange-500" />
                <span>{{ $t('stats_page.section.highlights') }}</span>
              </div>
              <div class="bg-container-2 rounded-full px-2 py-1 text-[11px] font-medium opacity-70">
                {{ $t('stats_page.highlights.items', { count: highlights.length }) }}
              </div>
            </div>
            <div class="space-y-2.5 pt-3">
              <div v-for="item in highlights" :key="item.key" class="bg-container-2 border-color-1 relative overflow-hidden rounded-xl border p-2.5 text-sm">
                <div
                  class="absolute inset-y-0 left-0 w-1"
                  :class="item.key === 'longest_live'
                    ? 'bg-green-500'
                    : item.key === 'biggest_gift_live'
                      ? 'bg-yellow-500'
                      : item.key === 'most_comments_live'
                        ? 'bg-pink-500'
                        : 'bg-blue-500'"
                />
                <div class="flex items-center gap-2.5">
                  <div class="bg-black/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon
                      :name="item.key === 'longest_live'
                        ? 'material-symbols:clock-loader-60'
                        : item.key === 'biggest_gift_live'
                          ? 'heroicons:gift-20-solid'
                          : item.key === 'most_comments_live'
                            ? 'mdi:comment-text'
                            : 'mdi:account-eye'"
                      :class="item.key === 'longest_live'
                        ? 'text-green-500'
                        : item.key === 'biggest_gift_live'
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : item.key === 'most_comments_live'
                            ? 'text-pink-500'
                            : 'text-blue-500'"
                    />
                  </div>
                  <Image
                    :src="item.member?.img_alt || item.member?.img || $errorPicture" alt="" sizes="56" fit="fill" :modifiers="{
                      aspectRatio: 1,
                      gravity: 'faceCenter',
                    }" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold">
                      {{ item.title }}
                    </div>
                    <div class="truncate text-xs opacity-70">
                      {{ item.member?.nickname || item.member?.name || '-' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div v-if="item.key === 'longest_live'" class="text-sm font-semibold leading-tight">
                      {{ formatDuration(item.value?.duration || 0, { second: false }) }}
                    </div>
                    <div v-else-if="item.key === 'biggest_gift_live'" class="text-sm font-semibold leading-tight">
                      {{ $n(item.value?.gift || 0, 'currency', 'id') }}
                    </div>
                    <div v-else-if="item.key === 'most_comments_live'" class="text-sm font-semibold leading-tight">
                      {{ (item.value?.comments || 0).toLocaleString(numberLocale) }}
                    </div>
                    <div v-else class="text-sm font-semibold leading-tight">
                      {{ (item.value?.viewers || 0).toLocaleString(numberLocale) }}
                    </div>
                    <div class="pt-0.5">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                        :class="item.key === 'longest_live'
                          ? 'bg-green-500/15 text-green-500'
                          : item.key === 'biggest_gift_live'
                            ? 'bg-yellow-500/15 text-yellow-500 dark:text-yellow-400'
                            : item.key === 'most_comments_live'
                              ? 'bg-pink-500/15 text-pink-500'
                              : 'bg-blue-500/15 text-blue-500'"
                      >
                        <span v-if="item.key === 'most_comments_live'">{{ $t('stats_page.highlights.metric.comments') }}</span>
                        <span v-else-if="item.key === 'longest_live'">{{ $t('stats_page.highlights.metric.duration') }}</span>
                        <span v-else-if="item.key === 'biggest_gift_live'">{{ $t('stats_page.highlights.metric.gift') }}</span>
                        <span v-else>{{ $t('stats_page.highlights.metric.viewers') }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!highlights.length" class="bg-container-2 border-color-1 rounded-xl border p-4 text-center text-sm opacity-70">
                {{ $t('stats_page.highlights.no_data') }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-container rounded-xl p-3 md:p-4 space-y-2">
          <div class="flex items-center gap-2 text-lg font-semibold">
            <Icon name="tdesign:control-platform" class="text-yellow-500" />
            <span>{{ $t('stats_page.section.platform_share') }}</span>
          </div>
          <div class="bg-yellow-400 h-2 rounded-full overflow-hidden">
            <div class="bg-red-400 h-full" :style="{ width: `${idnPercent}%` }" />
          </div>
          <div class="space-y-1 text-sm pt-1">
            <div class="text-red-400 flex gap-1.5 items-center">
              <Icon name="heroicons:video-camera-20-solid" />
              <div class="text-sm">
                {{ $t('stats_page.platform.idn_live', { percent: Math.round(idnPercent) }) }}
              </div>
            </div>
            <div class="text-yellow-500 dark:text-yellow-400 flex gap-1.5 items-center">
              <Icon name="material-symbols:videocam-rounded" />
              <div class="text-sm">
                {{ $t('stats_page.platform.showroom', { percent: Math.round(showroomPercent) }) }}
              </div>
            </div>
          </div>
        </div>

        <div class="max-lg:space-y-4 lg:grid items-stretch gap-3 lg:grid-cols-3 xl:grid-cols-5 md:gap-4">
          <div class="bg-container rounded-xl p-3 md:p-4">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
              <span>{{ $t('stats_page.section.top_gift_member') }}</span>
            </div>
            <div class="space-y-2.5 pt-3">
              <div
                v-for="[i, item] in topGiftMembers.entries()"
                :key="`${item.room_id}-gift`"
                class="bg-container-2 rounded-xl px-2.5 py-2"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                    :class="i === 0 ? 'bg-yellow-500/20 text-yellow-500 dark:text-yellow-400' : 'bg-black/15 text-white/65'"
                  >
                    {{ i + 1 }}
                  </div>
                  <Image
                    :src="item.member?.img_alt || item.member?.img || $errorPicture" alt="" sizes="56" fit="fill" :modifiers="{
                      aspectRatio: 1,
                      gravity: 'faceCenter',
                    }" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold leading-tight">
                      {{ item.member?.nickname || item.member?.name }}
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <div class="text-sm font-semibold leading-tight text-yellow-500 dark:text-yellow-400">
                      {{ formatCompactCurrency(item.value || 0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-container rounded-xl p-3 md:p-4">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="heroicons:video-camera-20-solid" class="text-red-500" />
              <span>{{ $t('stats_page.section.most_live') }}</span>
            </div>
            <div class="space-y-2.5 pt-3">
              <div
                v-for="[i, item] in mostLiveMembers.entries()"
                :key="`${item.room_id}-live`"
                class="bg-container-2 rounded-xl px-2.5 py-2"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                    :class="i === 0 ? 'bg-red-500/20 text-red-500' : 'bg-black/15 text-white/65'"
                  >
                    {{ i + 1 }}
                  </div>
                  <Image
                    :src="item.member?.img_alt || item.member?.img || $errorPicture" alt="" sizes="56" fit="fill" :modifiers="{
                      aspectRatio: 1,
                      gravity: 'faceCenter',
                    }" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold leading-tight">
                      {{ item.member?.nickname || item.member?.name }}
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <div class="text-sm font-semibold leading-tight text-red-500">
                      {{ item.value?.toLocaleString(numberLocale) }}
                    </div>
                    <div class="text-[11px] leading-tight opacity-60">
                      {{ $t('stats_page.leaderboard.lives') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-container rounded-xl p-3 md:p-4">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="solar:cup-star-bold-duotone" class="text-purple-500" />
              <span>{{ $t('stats_page.section.engagement') }}</span>
            </div>
            <div class="space-y-2.5 pt-3">
              <div
                v-for="[i, item] in engagementMembers.entries()"
                :key="`${item.room_id}-engagement`"
                class="bg-container-2 rounded-xl px-2.5 py-2"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                    :class="i === 0 ? 'bg-purple-500/20 text-purple-500' : 'bg-black/15 text-white/65'"
                  >
                    {{ i + 1 }}
                  </div>
                  <Image
                    :src="item.member?.img_alt || item.member?.img || $errorPicture" alt="" sizes="56" fit="fill" :modifiers="{
                      aspectRatio: 1,
                      gravity: 'faceCenter',
                    }" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold leading-tight">
                      {{ item.member?.nickname || item.member?.name }}
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <div class="text-sm font-semibold leading-tight text-purple-500">
                      {{ formatCompactNumber(item.value || 0) }}
                    </div>
                    <div class="text-[11px] leading-tight opacity-60">
                      {{ $t('stats_page.leaderboard.score') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-container flex h-full flex-col rounded-xl p-3 md:p-4 col-span-3 xl:col-span-2">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="heroicons:gift-20-solid" class="text-red-500" />
              <span>{{ $t('stats_page.section.top_gifter') }}</span>
            </div>
            <div class="roundedscrollbar mt-3 flex-1 space-y-2 overflow-y-auto pr-1 relative min-h-100 xl:min-h-52">
              <div class="absolute space-y-2 size-full">
                <div v-for="fan in data.top_gifters" :key="fan.user_id" class="bg-container-2 flex items-center gap-2 rounded-xl p-2.5">
                  <img :src="fan.avatar_url || $avatarURL(fan.avatar_id || 1)" alt="" class="h-10 w-10 rounded-lg object-cover">
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold">
                      {{ fan.name }}
                    </div>
                    <div class="text-xs opacity-70">
                      {{ $n(fan.total_gift, 'currency', 'id') }} • {{ $t('stats_page.leaderboard.live_count', { count: fan.total_lives_supported }) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-3 md:gap-4 xl:grid-cols-2">
          <div class="bg-container rounded-xl p-3 md:p-4">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="solar:calendar-mark-bold-duotone" class="text-blue-500" />
              <span>{{ $t('stats_page.section.weekday_breakdown') }}</span>
            </div>
            <div class="bg-container-2 relative mt-3 h-52 w-full rounded-xl p-2 sm:h-60 md:h-70 md:p-3">
              <ClientOnly>
                <Bar :key="`weekday-${chartResizeKey}`" class="h-full w-full" :data="weekdayChartData" :options="weekdayChartOptions" />
                <template #fallback>
                  <div class="pulse-color h-full w-full animate-pulse rounded-xl" />
                </template>
              </ClientOnly>
            </div>
          </div>

          <div class="bg-container rounded-xl p-3 md:p-4">
            <div class="flex items-center gap-2 text-lg font-semibold">
              <Icon name="material-symbols:nest-clock-farsight-analog-outline" class="text-green-500" />
              <span>{{ $t('stats_page.section.prime_hours') }}</span>
            </div>
            <div class="bg-container-2 relative mt-3 h-52 w-full rounded-xl p-2 sm:h-60 md:h-70 md:p-3">
              <ClientOnly>
                <Bar :key="`primehour-${chartResizeKey}`" class="h-full w-full" :data="primeHourChartData" :options="primeHourChartOptions" />
                <template #fallback>
                  <div class="pulse-color h-full w-full animate-pulse rounded-xl" />
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </template>
    </div>
  </LayoutSingleRow>
</template>
