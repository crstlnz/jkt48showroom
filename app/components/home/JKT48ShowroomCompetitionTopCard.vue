<script lang="ts" setup>
import { NuxtLink } from '#components'

interface CompetitionRoom {
  room_id: number
  image: string
  image_square: string
  image_alt?: string
  name: string
  nickname?: string
  slug?: string
}

interface CompetitionRanking {
  rank: number
  point: number
  gap_above: number | null
  gap_below: number | null
  trend?: {
    rank_diff: number | null
    point_diff: number | null
  }
  room: CompetitionRoom
  live: {
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
}

const props = defineProps<{
  entry: CompetitionRanking
}>()

const SHIMMER_DURATION_MS = 2700
const MIN_SHIMMER_DELAY_MS = 500
const MAX_SHIMMER_DELAY_MS = 15000

const { locale } = useI18n()
const shimmerActive = ref(false)
let shimmerStartTimeout: ReturnType<typeof setTimeout> | null = null
let shimmerStopTimeout: ReturnType<typeof setTimeout> | null = null

function getRankIcon(rank: number): string | null {
  if (rank === 1) return 'ph:crown-simple-fill'
  if (rank === 2) return 'ph:medal-fill'
  if (rank === 3) return 'ph:medal'
  return null
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

function getCardClass(rank: number): string {
  if (rank === 1) return 'border-amber-500/40 from-amber-500/15 to-amber-500/5'
  if (rank === 2) return 'border-slate-500/40 from-slate-500/15 to-slate-500/5'
  if (rank === 3) return 'border-orange-500/40 from-orange-500/15 to-orange-500/5'
  return 'border-color-2'
}

function getAvatarRingClass(rank: number): string {
  if (rank === 1) return 'ring-2 ring-amber-500/70'
  if (rank === 2) return 'ring-2 ring-slate-500/70'
  if (rank === 3) return 'ring-2 ring-orange-500/70'
  return ''
}

function formatPoint(point: number): string {
  return point.toLocaleString(locale.value === 'id' ? 'id-ID' : 'en-US')
}

function formatStat(value: number | null | undefined) {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString(locale.value === 'id' ? 'id-ID' : 'en-US')
}

function getMemberUrl(room: CompetitionRoom): string | null {
  if (!room.slug) return null
  return `/member/${room.slug}`
}

function getRandomShimmerDelay() {
  return Math.floor(Math.random() * (MAX_SHIMMER_DELAY_MS - MIN_SHIMMER_DELAY_MS + 1)) + MIN_SHIMMER_DELAY_MS
}

function clearShimmerTimers() {
  if (shimmerStartTimeout) {
    clearTimeout(shimmerStartTimeout)
    shimmerStartTimeout = null
  }
  if (shimmerStopTimeout) {
    clearTimeout(shimmerStopTimeout)
    shimmerStopTimeout = null
  }
  shimmerActive.value = false
}

function scheduleNextShimmer() {
  shimmerStartTimeout = setTimeout(() => {
    shimmerActive.value = true
    shimmerStopTimeout = setTimeout(() => {
      shimmerActive.value = false
      scheduleNextShimmer()
    }, SHIMMER_DURATION_MS)
  }, getRandomShimmerDelay())
}

watch(() => props.entry.rank, () => {
  clearShimmerTimers()
  scheduleNextShimmer()
}, { immediate: true })

onBeforeUnmount(() => {
  clearShimmerTimers()
})

const open = ref(false)
</script>

<template>
  <HomeTopCardContainer
    :card-class="getCardClass(entry.rank)"
    :background-image="entry.room.image_alt || entry.room.image_square"
    :background-alt="entry.room.nickname"
    :image-class="{
      'h-full w-full scale-115 object-cover saturate-120 transition-all duration-500': true,
      'opacity-15 blur-[2px]': !open,
      'opacity-40 blur-[5px]': open,
    }"
    :image-modifiers="{
      aspectRatio: 3 / 2,
      gravity: 'faceCenter',
    }"
    image-sizes="640"
    image-format="webp"
    overlay-class="bg-linear-to-b from-black/0 via-black/18 to-black/45 dark:via-black/20 dark:to-black/55"
  >
    <template #before-content>
      <div
        class="pointer-events-none absolute -right-8 -top-8 z-1 size-24 rounded-full blur-xl md:size-28"
        :class="{
          'bg-amber-400/22': entry.rank === 1,
          'bg-slate-300/22': entry.rank === 2,
          'bg-orange-400/22': entry.rank === 3,
        }"
      />
      <div
        class="pointer-events-none absolute -left-8 bottom-3 z-1 size-20 rounded-full blur-xl md:hidden"
        :class="{
          'bg-amber-300/18': entry.rank === 1,
          'bg-slate-200/18': entry.rank === 2,
          'bg-orange-300/18': entry.rank === 3,
        }"
      />
    </template>
    <template #more>
      <button
        type="button"
        class="inline-flex size-5 items-center justify-center rounded-full border border-black/25 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.18)] backdrop-blur-[2px] transition-colors duration-200 hover:ring-1 hover:ring-black/15 dark:border-white/25 bg-dark-2/60 dark:text-slate-100 hover:bg-dark-2/75 hover:text-white dark:hover:ring-white/15 md:size-5.5"
        aria-label="More options"
        @click="open = !open"
      >
        <Icon v-if="!open" name="solar:menu-dots-bold" class="size-3.25 md:size-3.5" />
        <Icon v-else name="material-symbols:close-rounded" class="size-3.25 md:size-3.5" />
      </button>
    </template>
    <div
      class="absolute inset-0 z-30 transition-all duration-500 bg-black/20 backdrop-blur-xs" :class="{
        'opacity-100 scale-100 pointer-events-auto': open,
        'opacity-0 scale-105 pointer-events-none': !open,
      }"
    >
      <div
        class="size-full"
        :class="{
          'bg-linear-to-b from-amber-500/15 via-amber-400/15 to-amber-300/15': entry.rank === 1,
          'bg-linear-to-b from-slate-500/15 via-slate-400/15 to-slate-300/15': entry.rank === 2,
          'bg-linear-to-b from-orange-500/15 via-orange-400/15 to-orange-300/15': entry.rank === 3,
        }"
      >
        <div class="flex size-full flex-col gap-1 px-4 pb-2 text-[10px] text-white/90 md:text-[11px] justify-center items-center">
          <div class="flex gap-1.5 flex-col w-full">
            <div class="text-center text-base font-bold md:text-lg">
              {{ entry.room.nickname }}
            </div>
            <div class="grid grid-cols-2 gap-1">
              <div class="rounded-md bg-black/20 px-1.5 py-1">
                <div class="opacity-80">
                  {{ $t('competition.total_live_count') }}
                </div>
                <div class="font-semibold">
                  {{ formatStat(entry.live?.live_count) }}
                </div>
              </div>
              <div class="rounded-md bg-black/20 px-1.5 py-1">
                <div class="opacity-80">
                  {{ $t('competition.avg_peak_viewers') }}
                </div>
                <div class="font-semibold">
                  {{ formatStat(entry.live?.avg_viewer_peak) }}
                </div>
              </div>
              <div class="rounded-md bg-black/20 px-1.5 py-1">
                <div class="opacity-80">
                  {{ $t('competition.point_per_live') }}
                </div>
                <div class="font-semibold">
                  {{ formatStat(entry.live?.point_per_live) }}
                </div>
              </div>
              <div class="rounded-md bg-black/20 px-1.5 py-1">
                <div class="opacity-80">
                  {{ $t('competition.total_lives') }}
                </div>
                <div class="font-semibold">
                  {{ formatStat(entry.live?.total_gift) }}G
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="rare-shimmer pointer-events-none absolute inset-1 z-20 rounded-xl"
      :class="[
        { 'rare-shimmer-active': shimmerActive },
        {
          'rare-shimmer-gold': entry.rank === 1,
          'rare-shimmer-silver': entry.rank === 2,
          'rare-shimmer-bronze': entry.rank === 3,
        },
      ]"
    />
    <div
      class="pointer-events-none absolute inset-1 z-0 rounded-xl"
      :class="{
        'bg-linear-to-b from-amber-300/55 via-amber-100/20 to-transparent': entry.rank === 1,
        'bg-linear-to-b from-slate-300/55 via-slate-100/20 to-transparent': entry.rank === 2,
        'bg-linear-to-b from-orange-300/55 via-orange-100/20 to-transparent': entry.rank === 3,
      }"
    />
    <div

      class="transition-opacity duration-300 pointer-events-none absolute bottom-1 right-3 z-1 select-none text-3xl font-black tracking-tight opacity-30 md:text-4xl"
      :class="{
        'text-amber-600 dark:text-amber-300': entry.rank === 1,
        'text-slate-700 dark:text-slate-300': entry.rank === 2,
        'text-orange-700 dark:text-orange-300': entry.rank === 3,
      }"
    >
      {{ getRankLabel(entry.rank) }}
    </div>
    <div class="absolute left-2 top-2 z-20">
      <span
        class="inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-1 text-[11px] font-bold md:h-8 md:min-w-8 md:text-xs"
        :class="{
          'border-amber-300 bg-amber-300 text-amber-950 shadow-[0_2px_10px_rgba(251,191,36,0.35)]': entry.rank === 1,
          'border-slate-300 bg-slate-300 text-slate-800 shadow-[0_2px_10px_rgba(148,163,184,0.35)]': entry.rank === 2,
          'border-orange-300 bg-orange-300 text-orange-950 shadow-[0_2px_10px_rgba(251,146,60,0.35)]': entry.rank === 3,
        }"
      >
        <Icon v-if="getRankIcon(entry.rank)" :name="getRankIcon(entry.rank) || ''" class="size-3.5" />
        <span v-else>{{ entry.rank }}</span>
      </span>
    </div>
    <div :class="{ 'opacity-0': open, 'opacity-100': !open }" class="transition-opacity duration-300 relative z-10 flex flex-col items-center pt-1 text-center">
      <component
        :is="getMemberUrl(entry.room) ? NuxtLink : 'div'"
        :to="getMemberUrl(entry.room)"
        :class="getAvatarRingClass(entry.rank)"
        class="size-14 overflow-hidden rounded-full object-cover md:size-16"
      >
        <Image
          :src="entry.room.image_alt || entry.room.image_square"
          :alt="entry.room.nickname"
          loading="lazy"
          fit="cover"
          :modifiers="{
            aspectRatio: 1,
            gravity: 'faceCenter',
          }"
          sizes="64"
          format="webp"
        />
      </component>
      <component
        :is="getMemberUrl(entry.room) ? NuxtLink : 'span'"
        :to="getMemberUrl(entry.room)"
        class="mt-2 w-full truncate text-xs font-semibold md:text-sm"
      >
        {{ entry.room.nickname }}
      </component>
      <p class="mt-1 text-[10px] leading-3 opacity-60 md:text-[11px]">
        {{ $t('competition.total_points') }}
      </p>
      <p class="text-xs font-bold md:text-sm" :class="{ 'text-amber-500': entry.rank === 1 }">
        {{ formatPoint(entry.point) }}
      </p>
    </div>
  </HomeTopCardContainer>
</template>
