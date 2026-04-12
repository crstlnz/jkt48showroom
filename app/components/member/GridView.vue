<script lang="ts" setup>
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import jkt48TeamColor from '~/utils/teamColor'

const props = defineProps<{
  error: Error | null
  pending: boolean
  keyId: number
  members: IMember[]
  perpage: number
}>()

const keyId = computed(() => props.keyId)

const members = computed(() => {
  return props.members
})

const gridRef = ref<HTMLElement | null>(null)
const scrollMargin = ref(0)
const { width: windowWidth } = useWindowSize()
const { width: gridWidth } = useElementSize(gridRef)

const GAP = 16

const minCardWidth = computed(() => {
  if (windowWidth.value >= 1280) {
    return 180
  }
  if (windowWidth.value >= 1024) {
    return 160
  }
  if (windowWidth.value >= 768) {
    return 140
  }
  return 120
})

const columns = computed(() => {
  if (!gridWidth.value) {
    return 1
  }
  return Math.max(1, Math.floor((gridWidth.value + GAP) / (minCardWidth.value + GAP)))
})

const cardWidth = computed(() => {
  if (!gridWidth.value) {
    return minCardWidth.value
  }
  return (gridWidth.value - ((columns.value - 1) * GAP)) / columns.value
})

const cardAspectHeightRatio = computed(() => {
  return windowWidth.value >= 768 ? (16 / 12) : (14 / 10)
})

const rowHeight = computed(() => {
  return cardWidth.value * cardAspectHeightRatio.value
})

const TEAM_FALLBACK = 'No Team'
const HEADER_HEIGHT = 48

function getTeamSortRank(team: string) {
  const normalized = team.trim().toLowerCase()
  if (normalized.includes('traine')) {
    return 2
  }
  if (normalized === TEAM_FALLBACK.toLowerCase()) {
    return 1
  }
  return 0
}

interface VirtualRowData {
  type: 'header' | 'members'
  team: string
  key: string
  items?: IMember[]
}

const teamGroups = computed(() => {
  const groups = new Map<string, IMember[]>()

  for (const member of members.value) {
    const team = member.team?.trim() || TEAM_FALLBACK
    const list = groups.get(team)
    if (list) {
      list.push(member)
    }
    else {
      groups.set(team, [member])
    }
  }

  return Array.from(groups.entries())
    .map(([team, list]) => ({
      team,
      list,
    }))
    .sort((a, b) => {
      const rankA = getTeamSortRank(a.team)
      const rankB = getTeamSortRank(b.team)
      if (rankA !== rankB) {
        return rankA - rankB
      }
      return a.team.localeCompare(b.team, undefined, { numeric: true, sensitivity: 'base' })
    })
})

const hasAnyTeam = computed(() => {
  return members.value.some(member => Boolean(member.team?.trim()))
})

const virtualRowsData = computed<VirtualRowData[]>(() => {
  const rows: VirtualRowData[] = []

  if (!hasAnyTeam.value) {
    const plainRowCount = Math.ceil(members.value.length / columns.value)
    for (let rowIndex = 0; rowIndex < plainRowCount; rowIndex++) {
      const start = rowIndex * columns.value
      rows.push({
        type: 'members',
        team: '',
        key: `members-plain-${rowIndex}`,
        items: members.value.slice(start, start + columns.value),
      })
    }
    return rows
  }

  for (const group of teamGroups.value) {
    rows.push({
      type: 'header',
      team: group.team,
      key: `header-${group.team}`,
    })

    const groupRowCount = Math.ceil(group.list.length / columns.value)
    for (let rowIndex = 0; rowIndex < groupRowCount; rowIndex++) {
      const start = rowIndex * columns.value
      rows.push({
        type: 'members',
        team: group.team,
        key: `members-${group.team}-${rowIndex}`,
        items: group.list.slice(start, start + columns.value),
      })
    }
  }

  return rows
})

const virtualizerOptions = computed(() => {
  return {
    count: virtualRowsData.value.length,
    estimateSize: (index: number) => {
      const row = virtualRowsData.value[index]
      if (row?.type === 'header') {
        return HEADER_HEIGHT
      }
      return rowHeight.value + GAP
    },
    overscan: 5,
    scrollMargin: scrollMargin.value,
  }
})

const rowVirtualizer = useWindowVirtualizer(virtualizerOptions)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

function isHeaderRow(index: number) {
  return virtualRowsData.value[index]?.type === 'header'
}

function getHeaderTeam(index: number) {
  const row = virtualRowsData.value[index]
  if (row?.type !== 'header') {
    return ''
  }
  return row.team
}

function getHeaderTeamColor(index: number): ReturnType<typeof jkt48TeamColor> | null {
  const team = virtualRowsData.value[index]?.team
  if (!team || team === TEAM_FALLBACK) {
    return null
  }

  return jkt48TeamColor(team)
}

function getHeaderTextStyle(index: number) {
  const color = getHeaderTeamColor(index)
  if (!color) {
    return undefined
  }
  return {
    color: color.text,
  }
}

function getHeaderTeamIcon(index: number) {
  return getHeaderTeamColor(index)?.icon
}

function getHeaderIconBorderStyle(index: number) {
  const color = getHeaderTeamColor(index)
  if (!color) {
    return undefined
  }
  return {
    border: `1px solid ${color.bg}`,
  }
}

function getDividerStyle(index: number) {
  const color = getHeaderTeamColor(index)
  if (!color) {
    return undefined
  }
  return {
    borderColor: color.bg,
  }
}

function getMemberRowItems(index: number) {
  const row = virtualRowsData.value[index]
  if (row?.type !== 'members') {
    return []
  }
  return row.items ?? []
}

function getMemberKey(member: IMember, index: number) {
  return member.room_id ?? member.url ?? member.name ?? index
}

function onResize() {
  scrollMargin.value = gridRef.value?.offsetTop ?? 0
  nextTick(() => {
    requestAnimationFrame(() => {
      rowVirtualizer.value.measure()
    })
  })
}

watch(virtualizerOptions, () => {
  rowVirtualizer.value.measure()
})

watch(keyId, () => {
  nextTick(() => {
    rowVirtualizer.value.measure()
  })
})

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  resizeObserver = new ResizeObserver(onResize)
  if (gridRef.value) {
    resizeObserver.observe(gridRef.value)
  }
  resizeObserver.observe(document.documentElement)
  onResize()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="memberList px-3 md:px-4 min-h-screen">
    <div v-if="error">
      <Error message="Something error :(" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" />
    </div>
    <div
      v-else-if="pending"
      class="grid w-full gap-4 animate-pulse grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
    >
      <div
        v-for="i in 18"
        :key="`pending-card-${i}`"
        class="rounded-2xl pulse-color aspect-10/14 md:aspect-12/16"
      />
    </div>
    <div v-else-if="!members?.length">
      <Error message="Data not found :(" :img-src="`${$imgCDN}/assets/svg/web/no_data.svg`" />
    </div>

    <ClientOnly v-else>
      <template #fallback>
        <div class="grid w-full gap-4 animate-pulse grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
          <div
            v-for="i in 18"
            :key="`fallback-card-${i}`"
            class="rounded-2xl pulse-color aspect-10/14 md:aspect-12/16"
          />
        </div>
      </template>
      <div ref="gridRef" class="w-full">
        <div
          class="relative"
          :style="{ height: `${totalSize}px` }"
        >
          <div
            v-for="virtualRow in virtualRows"
            :key="String(virtualRow.key)"
            class="absolute top-0 left-0 w-full"
            :style="{
              transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
            }"
          >
            <div
              v-if="isHeaderRow(virtualRow.index)"
              class="mb-2 flex h-10 items-center gap-3 pb-2"
            >
              <div class="inline-flex items-center gap-2">
                <div
                  v-if="getHeaderTeamIcon(virtualRow.index)"
                  class="bg-white size-7 shrink-0 rounded-md p-0.5"
                  :style="getHeaderIconBorderStyle(virtualRow.index)"
                >
                  <Image :src="getHeaderTeamIcon(virtualRow.index) || ''" sizes="16px" class="size-full object-contain" />
                </div>
                <div class="text-xl whitespace-nowrap font-extrabold tracking-wide capitalize" :style="getHeaderTextStyle(virtualRow.index)">
                  <teamplate v-if="getHeaderTeamColor(virtualRow.index)?.icon">
                    Team
                  </teamplate>{{ getHeaderTeam(virtualRow.index) }}
                </div>
              </div>
              <div
                class="mt-1 w-full border-t-2 opacity-25 border-black/20 dark:border-white/20"
                :style="getDividerStyle(virtualRow.index)"
              />
            </div>
            <div v-else class="flex w-full gap-4">
              <Suspense
                v-for="(item, index) in getMemberRowItems(virtualRow.index)"
                :key="getMemberKey(item, (virtualRow.index * columns) + index)"
              >
                <LazyMemberCard
                  :data-id="item.name"
                  class="shadow-2xs"
                  :style="{ width: `${cardWidth}px`, height: `${rowHeight}px` }"
                  :member="item"
                />
                <template #fallback>
                  <div
                    :style="{ width: `${cardWidth}px`, height: `${rowHeight}px` }"
                    class="rounded-2xl bg-gray-300 dark:bg-dark-3 animate-pulse"
                  />
                </template>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
