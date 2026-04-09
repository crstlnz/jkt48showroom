<script lang="ts" setup>
import jkt48TeamColor from '~/utils/teamColor'

const props = withDefaults(defineProps<{
  team?: string
  type?: 'badge' | 'text'
}>(), {
  type: 'badge',
})

const _team = computed(() => props.team?.toLowerCase())
const teamColor = computed(() => jkt48TeamColor(props.team ?? ''))
</script>

<template>
  <div>
    <span
      v-if="['passion', 'love', 'dream'].includes(_team ?? '')"
      :style="{
        'background-color': type === 'badge' ? teamColor.bg : 'transparent',
        'color': teamColor.text,
      }"
      :class="{
        'px-1.5 pt-0.5 pb-1 rounded-md': type === 'badge',
      }"
      class="self-start text-xs font-extrabold font-sans!"
    >
      Team <span class="capitalize font-sans!">{{ _team }}</span>
    </span>
  </div>
</template>
