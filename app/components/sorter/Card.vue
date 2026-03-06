<script lang="ts" setup>
import { DeferImage } from '#components'
import { useSettings } from '~/store/settings'

const props = defineProps<{
  member?: ISortMember | null
  rank?: number
  flip?: boolean
  tag?: string
}>()
defineEmits(['click'])
const SHIMMER_DURATION_MS = 2700
const isHovering = ref(false)
const isFinishingShimmer = ref(false)
const shimmerStartedAt = ref<number | null>(null)
let stopShimmerTimeout: ReturnType<typeof setTimeout> | null = null

const isFlipped = computed(() => {
  return !props.member
})

const { group } = useSettings()

const cardTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'ring-2 ring-amber-300/80 bg-gradient-to-b from-amber-200/60 via-amber-100/25 to-amber-400/30'
  if (props.rank === 2) return 'ring-2 ring-slate-300/80 bg-gradient-to-b from-slate-200/60 via-slate-100/25 to-slate-400/30'
  if (props.rank === 3) return 'ring-2 ring-orange-300/80 bg-gradient-to-b from-orange-200/60 via-orange-100/25 to-orange-400/30'
  return ''
})

const imageTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'ring-2 ring-amber-200/75'
  if (props.rank === 2) return 'ring-2 ring-slate-200/75'
  if (props.rank === 3) return 'ring-2 ring-orange-200/75'
  return ''
})

const cardBackTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'bg-gradient-to-b from-amber-200 to-amber-400'
  if (props.rank === 2) return 'bg-gradient-to-b from-slate-200 to-slate-400'
  if (props.rank === 3) return 'bg-gradient-to-b from-orange-200 to-orange-400'
  return ''
})

const hasRareShimmer = computed(() => {
  return !!props.rank && props.rank <= 3
})

const shimmerActive = computed(() => {
  return hasRareShimmer.value && (isHovering.value || isFinishingShimmer.value)
})

function clearStopShimmerTimeout() {
  if (stopShimmerTimeout) {
    clearTimeout(stopShimmerTimeout)
    stopShimmerTimeout = null
  }
}

function onCardMouseEnter() {
  if (!hasRareShimmer.value) return
  isHovering.value = true
  isFinishingShimmer.value = false
  clearStopShimmerTimeout()
  if (!shimmerStartedAt.value) shimmerStartedAt.value = Date.now()
}

function onCardMouseLeave() {
  if (!hasRareShimmer.value) return
  isHovering.value = false
  isFinishingShimmer.value = true
  const startedAt = shimmerStartedAt.value ?? Date.now()
  const elapsed = Date.now() - startedAt
  const remaining = SHIMMER_DURATION_MS - (elapsed % SHIMMER_DURATION_MS)
  clearStopShimmerTimeout()
  stopShimmerTimeout = setTimeout(() => {
    if (!isHovering.value) {
      isFinishingShimmer.value = false
      shimmerStartedAt.value = null
    }
  }, remaining)
}

onBeforeUnmount(() => {
  clearStopShimmerTimeout()
})
</script>

<template>
  <Component
    :is="tag || 'button'"
    class="card relative aspect-4/6 select-none rounded-2xl transition-[transform] duration-200 active:scale-95 disabled:cursor-not-allowed"
    :class="{
      flipped: isFlipped || flip,
    }"
    :disabled="isFlipped"
    @mouseenter="onCardMouseEnter"
    @mouseleave="onCardMouseLeave"
    @click="$emit('click')"
  >
    <div class="card-inner bg-container relative gap-1 rounded-2xl px-2 pt-2 shadow-2xs md:w-60 md:gap-2 md:px-3 md:pt-3 pb-0.5 md:pb-1" :class="cardTone">
      <div data-section="card-front" class="h-full w-full">
        <div
          v-if="rank && rank <= 3"
          class="rare-shimmer pointer-events-none absolute inset-1 rounded-xl"
          :class="[
            { 'rare-shimmer-active': shimmerActive },
            {
              'rare-shimmer-gold': rank === 1,
              'rare-shimmer-silver': rank === 2,
              'rare-shimmer-bronze': rank === 3,
            },
          ]"
        />
        <div
          v-if="rank && rank <= 3"
          class="pointer-events-none absolute inset-1 rounded-xl"
          :class="{
            'bg-linear-to-b from-amber-300/55 via-amber-100/20 to-transparent': rank === 1,
            'bg-linear-to-b from-slate-300/55 via-slate-100/20 to-transparent': rank === 2,
            'bg-linear-to-b from-orange-300/55 via-orange-100/20 to-transparent': rank === 3,
          }"
        />
        <div
          v-if="rank"
          class="absolute left-1 top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold md:left-2 md:top-2"
          :class="{
            'h-6 min-w-6 border border-amber-300 bg-amber-300 text-amber-950 shadow-[0_2px_8px_rgba(251,191,36,0.25)] md:h-7 md:min-w-7 md:text-xs': rank === 1,
            'h-6 min-w-6 border border-slate-300 bg-slate-300 text-slate-800 shadow-[0_2px_8px_rgba(148,163,184,0.25)] md:h-7 md:min-w-7 md:text-xs': rank === 2,
            'h-6 min-w-6 border border-orange-300 bg-orange-300 text-orange-950 shadow-[0_2px_8px_rgba(251,146,60,0.25)] md:h-7 md:min-w-7 md:text-xs': rank === 3,
            'h-5 min-w-5 border border-red-400 bg-red-500 text-white shadow-[0_1px_6px_rgba(244,63,94,0.22)] md:h-6 md:min-w-6 md:text-xs': rank > 3,
          }"
        >
          {{ rank }}
        </div>
        <div v-if="member" class="flex h-full w-full flex-col gap-1">
          <DeferImage :key="member.id" :src="member.img" :alt="$t('sorter.profile_picture', { name: member.name })" class="h-0 w-full flex-1 select-none overflow-hidden rounded-lg object-cover" :class="imageTone" :draggable="false" />
          <div class="w-full pt-0.5 flex-0.5">
            <div class="w-full truncate text-left text-sm font-bold md:text-base leading-5">
              {{ member.name }}
            </div>
            <div class="w-full truncate text-left text-xs opacity-50 md:text-sm leading-3 pt-0.5">
              {{ parseGeneration(member.generation ?? "") }}
            </div>
          </div>
          <div class="flex w-full flex-wrap justify-end gap-2 md:pb-1 pt-1.5">
            <div class="rounded-full text-[10px] font-bold md:text-xs" :class="[{ 'opacity-0': !member.is_graduate }, !member.is_graduate ? 'text-red-500' : 'text-green-500']">
              {{ !member.is_graduate ? $t('sorter.graduate') : $t('sorter.active') }}
            </div>
          </div>
        </div>
        <div v-else>
          <div class="pulse-color aspect-15/16 w-full overflow-hidden rounded-lg object-cover" />
        </div>
      </div>
      <div data-section="card-back" class="card-back rotate bg-container absolute inset-0 overflow-hidden rounded-lg" :class="cardBackTone">
        <div class="h-full w-full p-2 md:p-3">
          <img :src="$getCardBackground(group)" alt="Card BG" class="h-full w-full rounded-lg object-cover" :class="imageTone">
        </div>
      </div>
    </div>
  </Component>
</template>

<style scoped>
.rare-shimmer {
  overflow: hidden;
}

.rare-shimmer::before {
  content: '';
  position: absolute;
  top: -35%;
  left: -45%;
  width: 55%;
  height: 170%;
  transform: rotate(18deg);
  opacity: 0;
}

.rare-shimmer-active::before {
  animation: rare-sweep 2.7s ease-in-out infinite;
}

.rare-shimmer-gold::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
}

.rare-shimmer-silver::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.rare-shimmer-bronze::before {
  background: linear-gradient(90deg, transparent, rgba(255, 244, 230, 0.42), transparent);
}

@keyframes rare-sweep {
  0% {
    transform: translateX(0) rotate(18deg);
    opacity: 0;
  }
  25% {
    opacity: 0.55;
  }
  100% {
    transform: translateX(260%) rotate(18deg);
    opacity: 0;
  }
}
</style>
