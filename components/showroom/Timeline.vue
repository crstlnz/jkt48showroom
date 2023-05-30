<script lang="ts" setup>
const props = defineProps<{
  dateStart?: string
  dateEnd?: string
}>()

const { $day, $clock } = useNuxtApp()
const start = $day(props.dateStart)
const startClock = $clock(props.dateStart)

const end = $day(props.dateEnd)
const endClock = $clock(props.dateEnd)
</script>

<template>
  <div class="px-5 pt-5">
    <div class="dark:border-dark-3 flex justify-around gap-4 border-t-4 border-gray-300 pt-4">
      <div class="text-center">
        <div class="relative font-bold">
          <div class="dark:bg-dark-3 absolute left-1/2 top-[-26px] h-4 w-4 -translate-x-1/2 rounded-full bg-gray-300">
            <div class="dark:border-dark-3 dark:bg-dark-1 h-full w-full rounded-full border-4  border-gray-300 bg-white p-1" />
          </div>
          {{ $t('date.start') }}
        </div>
        <div>{{ startClock }}</div>
        <div>{{ start }}</div>
      </div>
      <div class="text-center">
        <div class="relative font-bold">
          <div class="dark:bg-dark-3 absolute left-1/2 top-[-26px] h-4 w-4 -translate-x-1/2 rounded-full bg-gray-300" />
          {{ $t('date.end') }}
        </div>
        <div>{{ endClock }}</div>
        <div>{{ end }}</div>
      </div>
    </div>
  </div>
</template>
