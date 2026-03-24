<script lang="ts" setup>
const { data, pending, error } = useShowroomCompetitionDetail<ShowroomCompetitionAPI>()

const sortedRanking = computed(() => {
  return [...(data.value?.rankings ?? [])]
    .sort((a, b) => a.rank - b.rank)
})

const topThreeRanking = computed(() => sortedRanking.value.slice(0, 3))

const route = useRoute()

const isDetailPage = computed(() => route.path.startsWith('/jkt48showroom_competition'))
</script>

<template>
  <HomeContainer :title="isDetailPage ? 'Top 3' : $t('competition.title_full')" icon="hugeicons:ranking" icon-color="bg-yellow-500/15 text-yellow-500" title-class="text-base!" no-padding>
    <template #right>
      <MoreButton v-if="!isDetailPage" to="/jkt48showroom_competition" :text="$t('more')" />
    </template>

    <template #subtitle>
      Top 3
    </template>

    <div class="px-3 pb-3 md:px-4 md:pb-4">
      <!-- <p v-if="!isDetailPage" class="mb-2 text-[11px] opacity-60 md:text-xs">
        Top 3
      </p> -->

      <div v-if="pending && !data" class="grid grid-cols-3 gap-2">
        <div
          v-for="num in 3"
          :key="num"
          class="bg-container-2 border border-color-2 rounded-xl p-3"
        >
          <div class="flex animate-pulse flex-col items-center gap-2">
            <div class="pulse-color size-14 rounded-full" />
            <div class="pulse-color h-3 w-4/5 rounded-[3px]" />
            <div class="pulse-color h-3 w-2/3 rounded-[3px]" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="flex flex-col items-center py-2">
        <Image :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" class="w-45 max-w-[80%]" />
        {{ $t("error.unknown") }}
      </div>

      <div v-else-if="!topThreeRanking.length" class="flex flex-col items-center py-2">
        <Image :src="`${$imgCDN}/assets/img/web/empty-box.png`" alt="" class="w-45 h-34 mb-2 object-contain" />
        {{ $t("data.nodata") }}
      </div>

      <div v-else class="grid grid-cols-1 gap-2 md:grid-cols-3">
        <HomeJKT48ShowroomCompetitionTopCard
          v-for="entry in topThreeRanking"
          :key="`top-${entry.room.room_id}-${entry.rank}`"
          :entry="entry"
        />
      </div>
    </div>
  </HomeContainer>
</template>
