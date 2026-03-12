<script lang="ts" setup>
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

const props = defineProps<{
  rankings: CompetitionRankingDetail[]
  isLive: (roomId: number | null | undefined) => boolean
  getMemberUrl: (room: CompetitionRoom) => string | null
  openTopFansDialog: (entry: CompetitionRankingDetail) => void
}>()

const { t, locale } = useI18n()
const dayjs = useDayjs()
const statsOpened = ref<Record<string, boolean>>({})

const numberLocale = computed(() => {
  if (locale.value === 'id') return 'id-ID'
  if (locale.value === 'ja') return 'ja-JP'
  return 'en-US'
})

const leadingPoint = computed(() => {
  const point = Number(props.rankings[0]?.point || 0)
  return Number.isFinite(point) && point > 0 ? point : 1
})

function formatNumber(value: number | string | null | undefined) {
  const num = Number(value || 0)
  return Number.isFinite(num) ? num.toLocaleString(numberLocale.value) : '0'
}

function formatGiftGold(value: number | string | null | undefined) {
  return `${formatNumber(value)}G`
}

function formatGap(value: number | null | undefined) {
  if (value == null) return '-'
  return formatNumber(value)
}

function formatDurationSeconds(seconds: number | null | undefined) {
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
  if (minutes > 0) return `${minutes}${minuteUnit} ${secs}${secondUnit}`
  return `${secs}${secondUnit}`
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
  if (!props.isLive(entry.room.room_id)) return null
  return t('competition.total_lives_live_hint')
}

function getPointProgress(point: number | null | undefined) {
  const value = Number(point || 0)
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(100, Math.max(0, (value / leadingPoint.value) * 100))
}

function formatFromNow(value: string | Date | null | undefined) {
  if (!value) return '-'
  return dayjs(value).locale(locale.value).fromNow()
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '-'
  return dayjs(value).locale(locale.value).format('DD MMM YYYY HH:mm')
}

function getEntryKey(entry: CompetitionRankingDetail) {
  return `${entry.room.room_id}-${entry.rank}`
}

function isStatsOpen(entry: CompetitionRankingDetail) {
  return Boolean(statsOpened.value[getEntryKey(entry)])
}

function toggleStats(entry: CompetitionRankingDetail) {
  const key = getEntryKey(entry)
  statsOpened.value = {
    ...statsOpened.value,
    [key]: !statsOpened.value[key],
  }
}

function beforeEnter(el: Element) {
  const node = el as HTMLElement
  node.style.height = '0'
  node.style.opacity = '0'
}

function enter(el: Element, done: () => void) {
  const node = el as HTMLElement
  const targetHeight = `${node.scrollHeight}px`
  node.style.transition = 'height 260ms ease, opacity 220ms ease'
  requestAnimationFrame(() => {
    node.style.height = targetHeight
    node.style.opacity = '1'
  })
  const onEnd = (evt: TransitionEvent) => {
    if (evt.propertyName !== 'height') return
    node.style.height = 'auto'
    node.style.transition = ''
    node.removeEventListener('transitionend', onEnd)
    done()
  }
  node.addEventListener('transitionend', onEnd)
}

function beforeLeave(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.scrollHeight}px`
  node.style.opacity = '1'
}

function leave(el: Element, done: () => void) {
  const node = el as HTMLElement
  // force reflow so browser picks up starting height
  void node.offsetHeight
  node.style.transition = 'height 220ms ease, opacity 180ms ease'
  requestAnimationFrame(() => {
    node.style.height = '0'
    node.style.opacity = '0'
  })
  const onEnd = (evt: TransitionEvent) => {
    if (evt.propertyName !== 'height') return
    node.style.transition = ''
    node.removeEventListener('transitionend', onEnd)
    done()
  }
  node.addEventListener('transitionend', onEnd)
}
</script>

<template>
  <div class="space-y-2 md:space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base md:text-lg font-bold">
        {{ $t('competition.ranking_list') }}
      </h3>
      <p class="text-xs opacity-70">
        {{ $t('total_member') }}: {{ formatNumber(rankings.length) }}
      </p>
    </div>

    <div
      v-for="entry in rankings"
      :key="`${entry.room.room_id}-${entry.rank}`"
      class="group bg-container rounded-lg border border-black/10 px-3 pt-3 dark:border-white/10"
      :class="{ 'border-amber-500/35 dark:border-amber-500/35': entry.rank === 1 }"
    >
      <div class="flex items-center gap-3">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold" :class="entry.rank === 1 ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : entry.rank === 2 ? 'border-slate-500/40 bg-slate-500/15 text-slate-500' : entry.rank === 3 ? 'border-orange-500/40 bg-orange-500/15 text-orange-500' : 'border-black/15 bg-black/5 text-foreground/80 dark:border-white/20 dark:bg-white/5'">
          <Icon v-if="entry.rank === 1" name="ph:crown-simple-fill" class="size-5" />
          <Icon v-else-if="entry.rank === 2" name="ph:medal-fill" class="size-5" />
          <Icon v-else-if="entry.rank === 3" name="ph:medal" class="size-5" />
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
          <p class="group/date text-[11px] opacity-60">
            <span v-if="isLive(entry.room.room_id)" class="text-red-500 dark:text-red-400">
              {{ $t('competition.last_live') }}: {{ $t('competition.live_now_status') }}
            </span>
            <template v-else>
              <span class="group-hover/date:hidden">
                {{ $t('competition.last_live') }}: {{ formatFromNow(entry.live.last_live_at) }}
              </span>
              <span class="hidden group-hover/date:inline">
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
            <button
              type="button"
              class="mb-1 inline-flex items-center gap-1 rounded-md border border-black/10 bg-black/3 px-2 py-0.5 text-[10px] font-semibold transition-colors hover:bg-black/6 dark:border-white/10 dark:bg-white/4 dark:hover:bg-white/8"
              @click="() => openTopFansDialog(entry)"
            >
              <Icon name="ph:users-three-fill" class="size-3.5" />
              Top Fans
            </button>
          </div>
        </div>
      </div>

      <button type="button" class="pt-2 pb-3 block w-full" @click="() => toggleStats(entry)">
        <div class="relative h-1 rounded-full bg-black/7 dark:bg-white/10">
          <div
            class="h-full rounded-full bg-blue-500/85 transition-all duration-500"
            :style="{ width: `${getPointProgress(entry.point)}%` }"
          />
          <div
            type="button"
            :class="{
              'opacity-0 group-hover:opacity-100 transition-opacity': !isStatsOpen(entry),
            }"
            class="absolute  left-1/2 top-1/2 -translate-1/2 rounded-full bg-background size-5 inline-flex items-center justify-center border border-white/15"
          >
            <Icon
              name="mdi:chevron-down"
              class="size-3 text-white transition-transform duration-300 ease-out"
              :class="{ 'rotate-180': isStatsOpen(entry) }"
            />
          </div>
        </div>
      </button>
      <Transition
        @before-enter="beforeEnter"
        @enter="enter"
        @before-leave="beforeLeave"
        @leave="leave"
      >
        <div v-if="isStatsOpen(entry)" class="overflow-hidden will-change-[height,opacity]">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[11px] md:text-xs pb-3">
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
        </div>
      </Transition>
    </div>
  </div>
</template>
