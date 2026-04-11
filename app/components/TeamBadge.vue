<script lang="ts" setup>
import jkt48TeamColor from '~/utils/teamColor'

const props = withDefaults(defineProps<{
  team?: string
  compact?: boolean
  type?: 'badge' | 'text'
}>(), {
  type: 'badge',
  compact: false,
})

const teamKey = computed(() => props.team?.toLowerCase())
const _team = computed(() => {
  if (!teamKey.value) {
    return ''
  }
  return teamKey.value.charAt(0).toUpperCase() + teamKey.value.slice(1)
})
const teamColor = computed(() => jkt48TeamColor(props.team ?? ''))
</script>

<template>
  <div v-if="!['jkt48'].includes(teamKey ?? '')" class="flex gap-1.5">
    <div v-if="type !== 'text' && teamColor.icon" class="bg-white size-6 flex items-center justify-center rounded-md" :style="{ border: `2px solid ${teamColor.bg}` }">
      <Image :src="teamColor.icon" sizes="16px" />
    </div>
    <span
      :style="{
        'background-color': type === 'badge' ? teamColor.bg : 'transparent',
        'color': teamColor.text,
      }"
      :class="{
        'px-1.5 rounded-md h-6': type === 'badge',
      }"
      class="self-start text-xs font-extrabold font-sans! flex items-center gap-1"
    >
      <span v-if="!compact && teamKey !== 'trainee'" class="font-sans! pb-0.5">Team</span>
      <span class="capitalize font-sans! pb-0.5">{{ _team }}</span>
    </span>
  </div>
</template>
