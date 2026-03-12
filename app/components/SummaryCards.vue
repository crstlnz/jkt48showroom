<script lang="ts" setup>
interface SummaryCardRow {
  label: string
  value: string | number
}

interface SummaryCard {
  key: string
  label: string
  value?: string | number
  icon?: string
  iconClass?: string
  tooltip?: string
  headerTo?: string
  valueTo?: string
  rows?: SummaryCardRow[]
  cardClass?: string
  labelClass?: string
  valueClass?: string
}

withDefaults(defineProps<{
  cards: SummaryCard[]
  gridClass?: string
  cardClass?: string
}>(), {
  gridClass: 'grid-cols-2 xl:grid-cols-3',
  cardClass: '',
})
</script>

<template>
  <div class="grid gap-2 md:gap-3" :class="gridClass">
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-container rounded-xl border border-black/10 p-3 dark:border-white/10 md:p-4 flex flex-col h-full"
      :class="[cardClass, card.cardClass]"
    >
      <div class="flex items-start justify-between gap-1.5">
        <div class="inline-flex items-center gap-1 min-w-0">
          <Icon
            v-if="card.tooltip"
            v-tooltip="card.tooltip"
            name="heroicons:information-circle"
            class="text-base opacity-80 outline-hidden shrink-0"
          />
          <NuxtLink
            v-if="card.headerTo"
            :to="card.headerTo"
            class="text-[11px] opacity-70 md:text-xs"
            :class="card.labelClass"
          >
            {{ card.label }}
          </NuxtLink>
          <p
            v-else
            class="text-[11px] opacity-70 md:text-xs"
            :class="card.labelClass"
          >
            {{ card.label }}
          </p>
        </div>
        <div class="inline-flex items-center gap-1">
          <span
            v-if="card.icon"
            class="inline-flex size-7 items-center justify-center rounded-lg border border-black/10 dark:border-white/10"
          >
            <Icon :name="card.icon" class="text-sm opacity-80" :class="card.iconClass" />
          </span>
        </div>
      </div>

      <div v-if="card.rows?.length" class="mt-auto pt-1.5 space-y-0.5 text-[10px] md:text-xs">
        <div v-for="row in card.rows" :key="`${card.key}-${row.label}`" class="flex justify-between gap-2">
          <span class="opacity-80">{{ row.label }}</span>
          <span class="font-medium">{{ row.value }}</span>
        </div>
      </div>

      <NuxtLink
        v-else-if="card.valueTo"
        :to="card.valueTo"
        class="mt-auto pt-1.5 block text-base leading-tight font-semibold md:text-lg"
        :class="card.valueClass"
      >
        {{ card.value }}
      </NuxtLink>
      <div
        v-else
        class="mt-auto pt-1.5 text-base leading-tight font-semibold md:text-lg"
        :class="card.valueClass"
      >
        {{ card.value }}
      </div>
    </div>
  </div>
</template>
