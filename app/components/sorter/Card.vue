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

const isFlipped = computed(() => {
  return !props.member
})

const { group } = useSettings()

const cardTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'ring-2 ring-amber-300 bg-gradient-to-b from-amber-300/65 via-yellow-200/25 to-amber-600/35'
  if (props.rank === 2) return 'ring-2 ring-slate-200 bg-gradient-to-b from-slate-200/65 via-slate-100/25 to-slate-500/35'
  if (props.rank === 3) return 'ring-2 ring-orange-400 bg-gradient-to-b from-orange-400/65 via-orange-200/25 to-orange-700/35'
  return ''
})

const imageTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'ring-2 ring-amber-200/80'
  if (props.rank === 2) return 'ring-2 ring-slate-100/80'
  if (props.rank === 3) return 'ring-2 ring-orange-200/80'
  return ''
})

const cardBackTone = computed(() => {
  if (!props.rank) return ''
  if (props.rank === 1) return 'bg-gradient-to-b from-amber-300 to-amber-500'
  if (props.rank === 2) return 'bg-gradient-to-b from-slate-200 to-slate-400'
  if (props.rank === 3) return 'bg-gradient-to-b from-orange-400 to-orange-600'
  return ''
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
    @click="$emit('click')"
  >
    <div class="card-inner bg-container relative gap-1 rounded-2xl px-2 pt-2 shadow-2xs md:w-60 md:gap-2 md:px-3 md:pt-3 pb-0.5 md:pb-1" :class="cardTone">
      <div data-section="card-front" class="h-full w-full">
        <div
          v-if="rank && rank <= 3"
          class="pointer-events-none absolute inset-1 rounded-xl"
          :class="{
            'bg-linear-to-b from-amber-300/70 via-yellow-200/25 to-transparent': rank === 1,
            'bg-linear-to-b from-slate-200/70 via-slate-100/25 to-transparent': rank === 2,
            'bg-linear-to-b from-orange-400/70 via-orange-200/25 to-transparent': rank === 3,
          }"
        />
        <div
          v-if="rank"
          class="absolute left-1 top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold md:left-2 md:top-2"
          :class="{
            'bg-amber-300 text-black': rank === 1,
            'bg-slate-200 text-black': rank === 2,
            'bg-orange-500 text-white': rank === 3,
            'bg-red-500 text-white/80': rank > 3,
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
