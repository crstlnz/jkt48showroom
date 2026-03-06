<script lang="ts" setup>
interface CompetitionRoom {
  room_id: number
  image: string
  image_square: string
  image_alt: string
  name: string
  nickname: string
  slug?: string
}

interface CompetitionRanking {
  rank: number
  point: number
  room: CompetitionRoom
}

interface Event {
  event_name: string
  event_type: string
  show_ranking: number
  started_at: number
  ended_at: number
  image: string
  event_url: string
}

interface ShowroomCompetitionAPI {
  event: Event
  date: string
  rankings: CompetitionRanking[]
}

const { data, pending, error } = useCachedFetch<ShowroomCompetitionAPI>('/api/showroom_competition', {
  expireIn: 1000 * 60 * 10,
})
const { locale } = useI18n()

const sortedRanking = computed(() => {
  return [...(data.value?.rankings ?? [])]
    .sort((a, b) => a.rank - b.rank)
})

const topRanking = computed(() => {
  return sortedRanking.value
    .slice(0, 6)
})

interface CompetitionRankingEntry {
  item: CompetitionRanking
}

const rankingEntries = computed<CompetitionRankingEntry[]>(() => {
  const rows = topRanking.value
  return rows.map(item => ({ item }))
})

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

function formatPoint(point: number): string {
  return point.toLocaleString(locale.value === 'id' ? 'id-ID' : 'en-US')
}

function getMemberUrl(room: CompetitionRoom): string | null {
  if (!room.slug) return null
  return `/member/${room.slug}`
}
</script>

<template>
  <HomeContainer :title="$t('competition.title')" title-class="text-base!" class="relative" :more-text="$t('more')" more="/jkt48showroom_competition">
    <template #icon>
      <Icon name="hugeicons:ranking" class="text-yellow-500 size-5 mb-1.5" />
    </template>
    <div class="overflow-visible rounded-xl">
      <div v-if="pending && !data" class="space-y-2">
        <div
          v-for="num in 6"
          :key="num"
          class="bg-container border-none! py-2"
        >
          <div class="flex animate-pulse items-center gap-2.5">
            <div class="pulse-color size-9 rounded-full" />
            <div class="pulse-color size-11 rounded-full" />
            <div class="flex-1 min-w-0 space-y-1.5">
              <div class="pulse-color h-4 w-4/5 rounded-[3px]" />
              <div class="pulse-color h-3 w-16 rounded-[3px]" />
            </div>
            <div class="shrink-0 w-20 space-y-1.5">
              <div class="pulse-color ml-auto h-3 w-10 rounded-[3px]" />
              <div class="pulse-color ml-auto h-4 w-18 rounded-[3px]" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center pb-4">
        <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" class="w-45 max-w-[80%]" />
        {{ $t("error.unknown") }}
      </div>

      <div v-else-if="!topRanking.length" class="flex flex-col items-center pb-4">
        <Image :src="`${$imgCDN}/assets/img/web/empty-box.png`" alt="" class="w-45 h-34 mb-2 object-contain" />
        {{ $t("data.nodata") }}
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in rankingEntries"
          :key="`${entry.item.room.room_id}-${entry.item.rank}`"
          class="bg-container border-none! py-2"
          :class="{ 'border-amber-500/35 dark:border-amber-500/35': entry.item.rank === 1 }"
        >
          <div class="flex items-center gap-2.5">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold" :class="entry.item.rank === 1 ? 'border-amber-500/40 bg-amber-500/15 text-amber-500' : getRankClass(entry.item.rank)">
              <Icon v-if="getRankIcon(entry.item.rank)" :name="getRankIcon(entry.item.rank) || ''" class="size-4.5" />
              <span v-else>{{ entry.item.rank }}</span>
            </span>

            <NuxtLink
              v-if="getMemberUrl(entry.item.room)"
              :to="getMemberUrl(entry.item.room) || ''"
              :class="{ 'ring-2 ring-amber-500/70': entry.item.rank === 1 }"
              class="size-11 shrink-0 rounded-full object-cover overflow-hidden"
            >
              <Image
                :src="entry.item.room.image_alt || entry.item.room.image_square"
                :alt="entry.item.room.nickname"
                loading="lazy"
                fit="cover"
                :modifiers="{
                  aspectRatio: 1,
                  gravity: 'faceCenter',
                }"
                sizes="44"
                format="webp"
              />
            </NuxtLink>
            <div
              v-else
              :class="{ 'ring-2 ring-amber-500/70': entry.item.rank === 1 }"
              class="size-11 shrink-0 rounded-full object-cover overflow-hidden"
            >
              <Image
                :src="entry.item.room.image_alt || entry.item.room.image_square"
                :alt="entry.item.room.nickname"
                loading="lazy"
                fit="cover"
                :modifiers="{
                  aspectRatio: 1,
                  gravity: 'faceCenter',
                }"
                sizes="44"
                format="webp"
              />
            </div>

            <div class="flex-1">
              <NuxtLink
                v-if="getMemberUrl(entry.item.room)"
                :to="getMemberUrl(entry.item.room) || ''"
                class="truncate text-sm font-semibold"
              >
                {{ entry.item.room.nickname }}
              </NuxtLink>
              <div v-else class="truncate text-sm font-semibold">
                {{ entry.item.room.nickname }}
              </div>
              <div class="truncate text-xs opacity-60">
                {{ $t('competition.rank_label', { rank: entry.item.rank }) }}
              </div>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-[11px] leading-3 opacity-60">
                {{ $t('competition.total_points') }}
              </p>
              <p class="text-sm leading-4.5 font-semibold" :class="{ 'text-amber-500': entry.item.rank === 1 }">
                {{ formatPoint(entry.item.point) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </HomeContainer>
</template>
