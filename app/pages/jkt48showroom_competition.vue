<script lang="ts" setup>
import { useOnLives } from '~/store/onLives'

interface CompetitionEvent {
  event_name: string
  event_type: string
  show_ranking: number
  started_at: number
  ended_at: number
  image: string
  event_url: string
}

interface CompetitionRoom {
  room_id: number
  image: string
  image_square: string
  image_alt?: string
  name: string
  nickname?: string
  slug?: string
  key?: string
}

interface CompetitionLiveStats {
  live_count: number
  active_days: number
  total_gift: number
  total_comments: number
  total_duration: number
  avg_duration: number
  avg_gift_per_live: number
  avg_comments_per_live: number
  avg_viewer_peak: number
  max_viewer_peak: number
  total_viewer_peak: number
  point_per_live: number
  point_per_hour: number
  first_live_at: string | Date | null
  last_live_at: string | Date | null
}

interface CompetitionRankingDetail {
  rank: number
  point: number
  gap_above: number | null
  gap_below: number | null
  trend?: {
    rank_diff: number | null
    point_diff: number | null
  }
  room: CompetitionRoom
  live: CompetitionLiveStats
}

interface CompetitionSummary {
  ranked_members: number
  active_members: number
  total_points: number
  total_lives: number
  total_gift: number
  total_comments: number
  total_duration: number
  total_active_days: number
  total_viewer_peak: number
  max_viewer_peak: number
  avg_points_per_live: number
  avg_gift_per_live: number
  avg_comments_per_live: number
  avg_duration_per_live: number
  avg_peak_viewers: number
  total_live_hours: number
  active_ratio: number
  last_updated: string
}

interface CompetitionSnapshot {
  snapshot_hour: string | Date | null
  scraped_at: string | Date | null
  comparison_snapshot_hour?: string | Date | null
}

interface CompetitionDetailResponse {
  event: CompetitionEvent
  summary: CompetitionSummary
  date: string
  snapshot?: CompetitionSnapshot | null
  rankings: CompetitionRankingDetail[]
}

const { data, pending, error, refresh } = await useApiFetch<CompetitionDetailResponse>('/api/showroom_competition_detail')
const { t, locale } = useI18n()
const dayjs = useDayjs()
const onLives = useOnLives()
const { data: onLivesData, pending: onLivesPending, error: onLivesError } = storeToRefs(onLives)
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const numberLocale = computed(() => {
  if (locale.value === 'id') return 'id-ID'
  if (locale.value === 'ja') return 'ja-JP'
  return 'en-US'
})

const sortedRankings = computed(() => {
  return [...(data.value?.rankings ?? [])].sort((a, b) => a.rank - b.rank)
})

const showroomLives = computed<INowLive[]>(() => {
  return (onLivesData.value ?? []).filter(live => live.type === 'showroom') as any
})

const showroomLiveRoomIdSet = computed(() => {
  return new Set(showroomLives.value.map(live => Number(live.room_id)))
})

const topThreeRankings = computed(() => sortedRankings.value.slice(0, 3))

const leadingPoint = computed(() => {
  const point = Number(sortedRankings.value[0]?.point || 0)
  return Number.isFinite(point) && point > 0 ? point : 1
})

const eventEndAtMs = computed(() => {
  const endedAt = Number(data.value?.event?.ended_at)
  if (!Number.isFinite(endedAt) || endedAt <= 0) return null
  return endedAt * 1000
})

const eventDurationSeconds = computed(() => {
  const startedAt = Number(data.value?.event?.started_at)
  const endedAt = Number(data.value?.event?.ended_at)
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return null
  if (startedAt <= 0 || endedAt <= startedAt) return null
  return Math.floor(endedAt - startedAt)
})

const remainingMs = computed(() => {
  if (!eventEndAtMs.value) return null
  return eventEndAtMs.value - now.value
})

const summaryCards = computed(() => {
  const summary = data.value?.summary
  if (!summary) return []

  return [
    {
      key: 'total_points',
      icon: 'hugeicons:ranking',
      label: t('competition.total_points'),
      value: formatNumber(summary.total_points),
    },
    {
      key: 'total_gold',
      icon: 'mdi:gift',
      label: t('competition.total_lives'),
      value: formatGiftGold(summary.total_gift),
    },
    {
      key: 'active_members',
      icon: 'ph:users-three-fill',
      label: t('competition.active_members'),
      value: `${formatNumber(summary.active_members)} / ${formatNumber(summary.ranked_members)}`,
    },
    {
      key: 'avg_points_per_live',
      icon: 'ph:chart-line-up-bold',
      label: t('competition.avg_points_per_live'),
      value: formatNumber(summary.avg_points_per_live),
    },
    {
      key: 'avg_gift_per_live',
      icon: 'mdi:gift',
      label: t('competition.avg_gift_per_live'),
      value: formatGiftGold(summary.avg_gift_per_live),
    },
    {
      key: 'avg_peak_viewers',
      icon: 'ph:eye-fill',
      label: t('competition.avg_peak_viewers'),
      value: formatNumber(summary.avg_peak_viewers),
    },
  ]
})

function formatNumber(value: number | string | null | undefined) {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num.toLocaleString(numberLocale.value) : '0'
}

function formatGiftGold(value: number | string | null | undefined) {
  return `${formatNumber(value)}G`
}

function getMemberUrl(room: CompetitionRoom): string | null {
  if (!room.slug) return null
  if (isLive(room.room_id)) {
    return `/watch/${room.key}`
  }
  return `/member/${room.slug}`
}

function getDeltaClass(value: number | null | undefined) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return 'text-foreground/70'
  return num > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
}

function getRankShiftIcon(value: number | null | undefined) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return 'mdi:minus'
  return num > 0 ? 'mdi:arrow-up-bold' : 'mdi:arrow-down-bold'
}

function formatRankShiftCount(value: number | null | undefined) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  return `${formatNumber(Math.abs(num))}`
}

function hasRankShift(entry: CompetitionRankingDetail) {
  const rankDiff = Number(entry.trend?.rank_diff)
  if (!Number.isFinite(rankDiff) || rankDiff === 0) return false
  return Number(entry.point || 0) > 0
}

function hasLiveStats(live: CompetitionLiveStats | null | undefined) {
  const liveCount = Number(live?.live_count || 0)
  return Number.isFinite(liveCount) && liveCount > 0
}

function getTotalLiveCountTooltip(entry: CompetitionRankingDetail) {
  if (!isLive(entry.room.room_id)) return null
  return t('competition.total_lives_live_hint')
}

function isLive(roomId: number | null | undefined) {
  const id = Number(roomId)
  if (!Number.isFinite(id)) return false
  return showroomLiveRoomIdSet.value.has(id)
}

function formatGap(value: number | null | undefined) {
  if (value == null) return '-'
  return formatNumber(value)
}

function formatDurationSeconds(seconds: number | null | undefined, withSecond = false) {
  if (!seconds || seconds <= 0) return '-'
  const totalSeconds = Math.floor(seconds)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const dayUnit = t('units.day_short')
  const hourUnit = t('units.hour_short')
  const minuteUnit = t('units.minute_short')
  const secondUnit = t('units.second_short')

  if (days > 0) return `${days}${dayUnit} ${hours}${hourUnit}`
  if (hours > 0) return `${hours}${hourUnit} ${minutes}${minuteUnit}`
  if (minutes > 0) return withSecond ? `${minutes}${minuteUnit} ${secs}${secondUnit}` : `${minutes}${minuteUnit}`
  return `${secs}${secondUnit}`
}

function formatRemainingTime(ms: number | null) {
  if (ms == null) return '-'
  if (ms <= 0) return t('competition.event_ended')
  return formatDurationSeconds(Math.floor(ms / 1000), true)
}

function formatRemainingTimeFull(ms: number | null) {
  if (ms == null) return '-'
  if (ms <= 0) return t('competition.event_ended')

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const dayUnit = t('units.day_full')
  const hourUnit = t('units.hour_full')
  const minuteUnit = t('units.minute_full')
  const secondUnit = t('units.second_full')

  if (days > 0) return `${days} ${dayUnit} ${hours} ${hourUnit}`
  if (hours > 0) return `${hours} ${hourUnit} ${minutes} ${minuteUnit}`
  if (minutes > 0) return `${minutes} ${minuteUnit} ${secs} ${secondUnit}`
  return `${secs} ${secondUnit}`
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '-'
  return dayjs(value).locale(locale.value).format('DD MMM YYYY HH:mm')
}

function formatFromNow(value: string | Date | null | undefined) {
  if (!value) return '-'
  return dayjs(value).locale(locale.value).fromNow()
}

function getRankIcon(rank: number): string | null {
  if (rank === 1) return 'ph:crown-simple-fill'
  if (rank === 2) return 'ph:medal-fill'
  if (rank === 3) return 'ph:medal'
  return null
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'border-amber-500/40 bg-amber-500/15 text-amber-500'
  if (rank === 2) return 'border-slate-500/40 bg-slate-500/15 text-slate-500'
  if (rank === 3) return 'border-orange-500/40 bg-orange-500/15 text-orange-500'
  return 'border-black/15 bg-black/5 text-foreground/80 dark:border-white/20 dark:bg-white/5'
}

function getPointProgress(point: number | null | undefined) {
  const value = Number(point || 0)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(100, Math.max(0, (value / leadingPoint.value) * 100))
}
</script>

<template>
  <LayoutRow :title="$t('competition.title_full')">
    <div class="mx-3 space-y-2.5 pb-2 md:mx-4 md:space-y-3.5">
      <div v-if="pending && !data" class="space-y-3 md:space-y-4">
        <div class="bg-container animate-pulse rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4">
          <div class="grid grid-cols-1 gap-3.5 md:grid-cols-[220px_minmax(0,1fr)]">
            <div class="pulse-color aspect-video w-full rounded-xl" />
            <div class="space-y-2.5">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1 space-y-2">
                  <div class="pulse-color h-5 w-3/4 rounded-md" />
                  <div class="flex flex-wrap gap-1.5">
                    <div class="pulse-color h-6 w-24 rounded-lg" />
                    <div class="pulse-color h-6 w-36 rounded-lg" />
                    <div class="pulse-color h-6 w-28 rounded-lg" />
                  </div>
                </div>
                <div class="pulse-color h-8 w-24 rounded-lg" />
              </div>
              <div class="pulse-color h-9 w-full rounded-md" />
              <div class="pulse-color h-9 w-2/3 rounded-md" />
              <div class="pulse-color h-4 w-full rounded-md" />
              <div class="pulse-color h-4 w-11/12 rounded-md" />
              <div class="pulse-color h-8 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 animate-pulse">
          <div v-for="num in 6" :key="num" class="bg-container rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="pulse-color h-3.5 w-3/5 rounded-md" />
              <div class="pulse-color size-7 rounded-lg" />
            </div>
            <div class="mt-1.5 pulse-color h-6 w-2/3 rounded-md" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 animate-pulse">
          <div v-for="num in 3" :key="`top-skel-${num}`" class="bg-container rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4">
            <div class="flex items-center justify-between">
              <div class="pulse-color h-3 w-16 rounded-md" />
              <div class="pulse-color h-8 w-14 rounded-md" />
            </div>
            <div class="mt-3 flex items-center gap-3">
              <div class="pulse-color h-24 w-18 rounded-lg" />
              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="pulse-color h-4 w-4/5 rounded-md" />
                <div class="pulse-color h-3 w-1/2 rounded-md" />
              </div>
            </div>
            <div class="mt-3 pulse-color h-1.5 w-full rounded-full" />
          </div>
        </div>

        <div class="space-y-2 md:space-y-3 animate-pulse">
          <div v-for="num in 8" :key="`rank-skel-${num}`" class="bg-container rounded-lg border border-black/10 p-3 dark:border-white/10">
            <div class="flex items-center gap-3">
              <div class="pulse-color size-10 rounded-full shrink-0" />
              <div class="pulse-color size-12 rounded-full shrink-0" />
              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="pulse-color h-4 w-1/2 rounded-md" />
                <div class="pulse-color h-3 w-1/3 rounded-md" />
              </div>
              <div class="w-22 shrink-0 space-y-1.5">
                <div class="pulse-color h-3 w-14 ml-auto rounded-md" />
                <div class="pulse-color h-4 w-20 ml-auto rounded-md" />
              </div>
            </div>
            <div class="mt-2 pulse-color h-1 w-full rounded-full" />
            <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
              <div v-for="box in 6" :key="`rank-skel-box-${num}-${box}`" class="pulse-color h-11 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="flex justify-center items-center pb-4 aspect-video">
        <div class="flex flex-col items-center">
          <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" alt="" class="p-5" />
          {{ $t("error.unknown") }}
        </div>
      </div>

      <div v-else-if="!sortedRankings.length" class="flex flex-col items-center justify-center pb-6 pt-4">
        <Image :src="`${$imgCDN}/assets/img/web/empty-box.png`" alt="" class="w-45 h-34 mb-2 object-contain" />
        {{ $t("data.nodata") }}
      </div>

      <template v-else>
        <div class="bg-container rounded-xl border border-black/10 p-3.5 dark:border-white/10 md:p-4.5">
          <div class="grid grid-cols-1 gap-3.5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
            <Image
              :src="data?.event.image.replace(`_s`, `_m`) || `${$imgCDN}/assets/img/web/empty-box.png`"
              :alt="data?.event.event_name || 'Showroom competition'"
              class="aspect-video w-full shrink-0 rounded-xl bg-black/10 object-cover"
              loading="lazy"
              fit="cover"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="line-clamp-2 text-base leading-snug font-bold md:text-xl">
                    {{ $t("competition.title_full") }}
                  </h2>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <a
                    v-if="data?.event?.event_url"
                    :href="data.event.event_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-black px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-black/85 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90 md:text-xs"
                  >
                    <Icon name="solar:link-round-bold" class="size-3.5" />
                    {{ $t('openshowroom') }}
                  </a>
                  <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                    @click="() => refresh()"
                  >
                    <Icon v-if="pending" name="svg-spinners:ring-resize" />
                    <Icon v-else name="ic:outline-refresh" />
                  </button>
                </div>
              </div>
              <div class="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs">
                <span
                  v-tooltip="formatRemainingTimeFull(remainingMs)"
                  class="inline-flex items-center rounded-lg px-2 py-1 font-semibold"
                  :class="(remainingMs ?? 0) <= 1000 * 60 * 60 * 6
                    ? 'bg-red-500/12 text-red-500 dark:text-red-400'
                    : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'"
                >
                  {{ formatRemainingTime(remainingMs) }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 dark:border-white/10">
                  <span class="opacity-65">{{ $t('competition.ends_at') }}:</span>
                  <b>{{ formatDateTime(eventEndAtMs ? new Date(eventEndAtMs) : null) }}</b>
                </span>
                <span
                  v-if="data?.snapshot?.scraped_at && data?.snapshot?.snapshot_hour"
                  class="group inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 dark:border-white/10"
                >
                  <span class="opacity-65 group-hover:hidden">{{ $t('competition.snapshot_taken') }}:</span>
                  <span class="hidden opacity-65 group-hover:inline">{{ $t('competition.snapshot_hour') }}:</span>
                  <b class="group-hover:hidden">{{ formatFromNow(data?.snapshot?.scraped_at) }}</b>
                  <b class="hidden group-hover:inline">{{ formatDateTime(data?.snapshot?.snapshot_hour) }}</b>
                </span>
                <span
                  v-else-if="data?.snapshot?.scraped_at"
                  class="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 dark:border-white/10"
                >
                  <span class="opacity-65">{{ $t('competition.snapshot_taken') }}:</span>
                  <b>{{ formatFromNow(data?.snapshot?.scraped_at) }}</b>
                </span>
                <span
                  v-else-if="data?.snapshot?.snapshot_hour"
                  class="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 dark:border-white/10"
                >
                  <span class="opacity-65">{{ $t('competition.snapshot_hour') }}:</span>
                  <b>{{ formatDateTime(data?.snapshot?.snapshot_hour) }}</b>
                </span>
              </div>
              <p class="mt-2 text-xs leading-relaxed opacity-80 md:text-sm">
                Kolaborasi spesial antara JKT48 dan SHOWROOM! Ini adalah audisi spesial dengan kesempatan melakukan
                syuting perjalanan di Okinawa, resor tropis terkenal di Jepang, serta tampil secara langsung di televisi Jepang.
              </p>
            </div>
          </div>
        </div>
        <div v-if="!onLivesPending && showroomLives.length && (data.event.ended_at * 1000) > Date.now()" class="space-y-2 md:space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base md:text-lg font-bold">
              Showroom Live
            </h3>
            <p class="text-xs opacity-70">
              {{ formatNumber(showroomLives.length) }} {{ $t("member", showroomLives.length) }}
            </p>
          </div>

          <div v-if="onLivesError" key="lives-error" class="bg-container flex w-full flex-col items-center justify-center gap-2 rounded-xl p-4 text-xs md:text-sm">
            <Image class="aspect-square w-32 max-w-[45%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="200px" fit="fill" />
            {{ $t("data.failed") }}
          </div>

          <div v-else-if="onLivesPending" key="lives-pending" class="bg-container grid-live-now gap-4 rounded-xl p-4">
            <PulseLiveCard />wew
          </div>

          <div v-else-if="showroomLives.length" key="onlives" class="bg-container rounded-xl p-2.5 md:p-3">
            <div key="live-list" class="grid grid-cols-1 gap-2 md:grid-cols-2">
              <SRCompetitionLiveMiniCard
                v-for="[i, live] in showroomLives.entries()"
                :key="live.room_id + i"
                :live="live"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
          <div
            v-for="card in summaryCards"
            :key="card.key"
            class="bg-container rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-[11px] opacity-70 md:text-xs">
                {{ card.label }}
              </p>
              <span class="inline-flex size-7 items-center justify-center rounded-lg border border-black/10 dark:border-white/10">
                <Icon :name="card.icon" class="text-sm opacity-80" />
              </span>
            </div>
            <div class="mt-1.5 text-base leading-tight font-semibold md:text-lg">
              {{ card.value }}
            </div>
          </div>
        </div>

        <div v-if="topThreeRankings.length" class="space-y-2 md:space-y-3">
          <div class="flex items-end justify-between">
            <h3 class="text-base md:text-lg font-bold">
              {{ $t('competition.top_ranking') }}
            </h3>
            <p class="text-xs opacity-70">
              #1 - #3
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <article
              v-for="entry in topThreeRankings"
              :key="`top-${entry.room.room_id}-${entry.rank}`"
              class="bg-container rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4"
              :class="{ 'border-amber-500/35 dark:border-amber-500/35': entry.rank === 1 }"
            >
              <div class="flex items-center justify-between gap-3">
                <NuxtLink v-if="getMemberUrl(entry.room)" :to="getMemberUrl(entry.room) || ''" class="relative shrink-0">
                  <Image
                    :src="entry.room.image_alt || entry.room.image_square"
                    :alt="entry.room.nickname || entry.room.name"
                    class="h-24 w-18 rounded-lg bg-black/5 object-cover"
                    loading="lazy"
                    fit="cover"
                    format="webp"
                    :modifiers="{
                      aspectRatio: 3 / 4,
                      gravity: 'faceCenter',
                    }"
                    sizes="72"
                  />
                  <span
                    v-if="isLive(entry.room.room_id)"
                    class="absolute right-0 translate-0.5 bottom-0 z-10 inline-flex size-3 items-center justify-center rounded-full bg-red-500"
                  >
                    <span class="size-full bg-red-500 rounded-full animate-ping" />
                  </span>
                </NuxtLink>
                <div v-else class="relative shrink-0">
                  <Image
                    :src="entry.room.image_alt || entry.room.image_square"
                    :alt="entry.room.nickname || entry.room.name"
                    class="h-24 w-18 rounded-lg bg-black/5 object-cover ring-2"
                    :class="isLive(entry.room.room_id) ? 'ring-red-500/70' : 'ring-black/10 dark:ring-white/10'"
                    loading="lazy"
                    fit="cover"
                    format="webp"
                    :modifiers="{
                      aspectRatio: 3 / 4,
                      gravity: 'faceCenter',
                    }"
                    sizes="72"
                  />
                  <span
                    v-if="isLive(entry.room.room_id)"
                    class="absolute right-0 translate-0.5 bottom-0 z-10 inline-flex size-3 items-center justify-center rounded-full bg-red-500"
                  >
                    <span class="size-full bg-red-500 rounded-full animate-ping" />
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <NuxtLink
                    v-if="getMemberUrl(entry.room)"
                    :to="getMemberUrl(entry.room) || ''"
                    class="truncate font-semibold block"
                  >
                    {{ entry.room.nickname || entry.room.name }}
                  </NuxtLink>
                  <p v-else class="truncate font-semibold">
                    {{ entry.room.nickname || entry.room.name }}
                  </p>
                  <p class="text-xs opacity-65">
                    {{ $t('competition.rank_label', { rank: entry.rank }) }}
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="ml-auto inline-flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold" :class="getRankClass(entry.rank)">
                    <Icon v-if="getRankIcon(entry.rank)" :name="getRankIcon(entry.rank) || ''" class="size-3.5" />
                    <span v-else>{{ entry.rank }}</span>
                  </span>
                  <p class="text-[10px] opacity-65">
                    {{ $t('competition.total_points') }}
                  </p>
                  <p class="text-sm font-semibold md:text-base" :class="{ 'text-amber-500': entry.rank === 1 }">
                    {{ hasLiveStats(entry.live) ? formatNumber(entry.point) : '-' }}
                  </p>
                </div>
              </div>

              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-black/7 dark:bg-white/10">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="entry.rank === 1 ? 'bg-amber-500/90' : entry.rank === 2 ? 'bg-slate-500/90' : 'bg-orange-500/90'"
                  :style="{ width: `${getPointProgress(entry.point)}%` }"
                />
              </div>
            </article>
          </div>
        </div>

        <div class="space-y-2 md:space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base md:text-lg font-bold">
              {{ $t('competition.ranking_list') }}
            </h3>
            <p class="text-xs opacity-70">
              {{ $t('total_member') }}: {{ formatNumber(sortedRankings.length) }}
            </p>
          </div>

          <article
            v-for="entry in sortedRankings"
            :key="`${entry.room.room_id}-${entry.rank}`"
            class="bg-container rounded-lg border border-black/10 p-3 dark:border-white/10"
            :class="{ 'border-amber-500/35 dark:border-amber-500/35': entry.rank === 1 }"
          >
            <div class="flex items-center gap-3">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold" :class="getRankClass(entry.rank)">
                <Icon v-if="getRankIcon(entry.rank)" :name="getRankIcon(entry.rank) || ''" class="size-5" />
                <span v-else>{{ entry.rank }}</span>
              </span>

              <NuxtLink v-if="getMemberUrl(entry.room)" :to="getMemberUrl(entry.room) || ''">
                <SRCompetitionLiveAvatar
                  :src="entry.room.image_alt || entry.room.image_square"
                  :alt="entry.room.nickname || entry.room.name"
                  :is-live="isLive(entry.room.room_id)"
                  size="sm"
                />
              </NuxtLink>
              <SRCompetitionLiveAvatar
                v-else
                :src="entry.room.image_alt || entry.room.image_square"
                :alt="entry.room.nickname || entry.room.name"
                :is-live="isLive(entry.room.room_id)"
                size="sm"
              />

              <div class="min-w-0">
                <NuxtLink
                  v-if="getMemberUrl(entry.room)"
                  :to="getMemberUrl(entry.room) || ''"
                  class="truncate text-sm md:text-base font-semibold block"
                >
                  {{ entry.room.nickname || entry.room.name }}
                </NuxtLink>
                <p v-else class="truncate text-sm md:text-base font-semibold">
                  {{ entry.room.nickname || entry.room.name }}
                </p>
                <p class="text-xs opacity-65">
                  {{ $t('competition.rank_label', { rank: entry.rank }) }}
                </p>
                <p class="group text-[11px] opacity-60">
                  <span v-if="isLive(entry.room.room_id)" class="text-red-500 dark:text-red-400">
                    {{ $t('competition.last_live') }}: {{ $t('competition.live_now_status') }}
                  </span>
                  <template v-else>
                    <span class="group-hover:hidden">
                      {{ $t('competition.last_live') }}: {{ formatFromNow(entry.live.last_live_at) }}
                    </span>
                    <span class="hidden group-hover:inline">
                      {{ $t('competition.last_live') }}: {{ formatDateTime(entry.live.last_live_at) }}
                    </span>
                  </template>
                </p>
              </div>

              <div class="flex-1 text-right shrink-0">
                <p class="text-sm md:text-base font-semibold" :class="{ 'text-amber-500': entry.rank === 1 }">
                  {{ hasLiveStats(entry.live) ? formatNumber(entry.point) : '-' }}
                </p>
                <p class="text-[10px] opacity-65">
                  {{ $t('competition.total_points') }}
                </p>
                <div class="mt-1 flex flex-wrap items-center justify-end gap-1.5 text-[10px]">
                  <span v-tooltip="$t('competition.gap_above_hint')" class="inline-flex items-center gap-1 rounded-md border border-black/10 px-1.5 py-0.5 text-red-500 dark:border-white/10 dark:text-red-400">
                    <Icon name="mdi:triangle" class="size-2" />
                    {{ formatGap(entry.gap_above) }}
                  </span>
                  <span v-tooltip="$t('competition.gap_below_hint')" class="inline-flex items-center gap-1 rounded-md border border-black/10 px-1.5 py-0.5 text-emerald-600 dark:border-white/10 dark:text-emerald-400">
                    <Icon name="mdi:triangle" class="size-2 rotate-180" />
                    {{ formatGap(entry.gap_below) }}
                  </span>
                  <span v-if="hasRankShift(entry)" v-tooltip="$t('competition.rank_shift_hint')" class="inline-flex items-center rounded-md border border-black/10 px-1.5 py-0.5 dark:border-white/10">
                    <Icon :name="getRankShiftIcon(entry.trend?.rank_diff)" class="size-3.5" :class="getDeltaClass(entry.trend?.rank_diff)" />
                    <b class="ml-1 text-[11px]" :class="getDeltaClass(entry.trend?.rank_diff)">
                      {{ formatRankShiftCount(entry.trend?.rank_diff) }}
                    </b>
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-2 h-1 overflow-hidden rounded-full bg-black/7 dark:bg-white/10">
              <div
                class="h-full rounded-full bg-blue-500/85 transition-all duration-500"
                :style="{ width: `${getPointProgress(entry.point)}%` }"
              />
            </div>

            <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px] md:text-xs">
              <SRCompetitionStatCard
                :label="$t('competition.total_live_count')"
                variant="soft"
              >
                <template #value>
                  <span v-if="!isLive(entry.room.room_id)" v-tooltip="getTotalLiveCountTooltip(entry)">
                    {{ entry.live.live_count }}
                  </span>
                  <span v-else v-tooltip="getTotalLiveCountTooltip(entry)" class="inline-flex items-center gap-1">
                    <span class="text-white">{{ formatNumber(entry.live.live_count) }}</span>
                    <span class="text-emerald-500 dark:text-emerald-400">(+1)</span>
                  </span>
                </template>
              </SRCompetitionStatCard>
              <SRCompetitionStatCard
                :label="$t('competition.total_live_duration')"
                :value="hasLiveStats(entry.live) ? formatDurationSeconds(entry.live.total_duration / 1000) : '-'"
                variant="soft"
              />
              <SRCompetitionStatCard
                :label="$t('competition.avg_duration_per_live')"
                :value="hasLiveStats(entry.live) ? formatDurationSeconds(entry.live.avg_duration / 1000) : '-'"
                variant="soft"
              />
              <SRCompetitionStatCard
                :label="$t('competition.total_lives')"
                variant="soft"
              >
                <template #value>
                  <span>{{ hasLiveStats(entry.live) ? formatGiftGold(entry.live.total_gift) : '-' }}</span>
                </template>
              </SRCompetitionStatCard>
              <SRCompetitionStatCard
                :label="$t('competition.active_days')"
                :value="hasLiveStats(entry.live) ? formatNumber(entry.live.active_days) : '-'"
                variant="soft"
              />
              <SRCompetitionStatCard
                :label="$t('competition.avg_peak_viewers')"
                :value="hasLiveStats(entry.live) ? formatNumber(entry.live.avg_viewer_peak) : '-'"
                variant="soft"
              />
              <SRCompetitionStatCard
                :label="$t('competition.avg_gift_per_live')"
                :value="hasLiveStats(entry.live) ? formatGiftGold(entry.live.avg_gift_per_live) : '-'"
                variant="soft"
              />
              <SRCompetitionStatCard
                :label="$t('competition.point_per_live')"
                :value="hasLiveStats(entry.live) ? formatNumber(entry.live.point_per_live) : '-'"
                variant="soft"
              />
            </div>
          </article>
        </div>
      </template>
    </div>
    <template #sidebar>
      <div class="xl:mt-4">
        <HomeRecents />
      </div>
    </template>
  </LayoutRow>
</template>
