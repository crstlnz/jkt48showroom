<script lang="ts" setup>
import { DeferImage } from '#components'
import { useSettings } from '~~/store/settings'

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
    <div class="card-inner bg-container relative gap-1 rounded-2xl p-2 shadow-2xs md:w-60 md:gap-2 md:p-3">
      <div data-section="card-front" class="h-full w-full">
        <div v-if="rank" class="absolute left-1 top-1 z-10 h-5 w-5 rounded-full bg-red-500 text-sm text-white/80 md:left-2 md:top-2">
          {{ rank }}
        </div>
        <div v-if="member" class="flex h-full w-full flex-col gap-1">
          <DeferImage :key="member.id" :src="member.img" :alt="`${member.name} Profile Picture`" class="h-0 w-full flex-1 select-none overflow-hidden rounded-lg object-cover" :draggable="false" />
          <div class="w-full">
            <div class="w-full truncate text-left text-base font-bold md:text-lg">
              {{ member.name }}
            </div>
            <div class="w-full truncate text-left text-sm opacity-50 md:text-base">
              {{ parseGeneration(member.generation ?? "") }}
            </div>
          </div>
          <div class="flex w-full flex-wrap justify-end gap-2 md:pb-1">
            <div class="rounded-full px-2 py-0.5 text-[10px] font-bold text-white/75 md:px-3 md:text-sm" :class="member.is_graduate ? 'bg-red-500' : 'bg-green-500'">
              {{ member.is_graduate ? "Graduate" : "Active" }}
            </div>
          </div>
        </div>
        <div v-else>
          <div class="pulse-color aspect-15/16 w-full overflow-hidden rounded-lg object-cover" />
        </div>
      </div>
      <div data-section="card-back" class="card-back rotate bg-container absolute inset-0 overflow-hidden rounded-lg">
        <div class="h-full w-full p-2 md:p-3">
          <img :src="$getCardBackground(group)" alt="Card BG" class="h-full w-full rounded-lg object-cover">
        </div>
      </div>
    </div>
  </Component>
</template>
