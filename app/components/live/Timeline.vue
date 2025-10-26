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
  <div class="px-5 max-lg:pt-5">
    <div class="flex h-full justify-around gap-4 border-gray-300 pt-4 dark:border-dark-3 max-lg:border-t-4 lg:w-[250px] lg:flex-col lg:border-l-4 lg:p-5">
      <div class="text-center lg:text-left">
        <div class="relative font-bold">
          <div class="absolute h-4 w-4 rounded-full bg-gray-300 dark:bg-dark-3 max-lg:left-1/2 max-lg:top-[-26px] max-lg:-translate-x-1/2 lg:left-[-30px] lg:top-1/2 lg:-translate-y-1/2">
            <div class="h-full w-full rounded-full border-4 border-gray-300 bg-white  p-1 dark:border-dark-3 dark:bg-dark-1" />
          </div>
          {{ $t('date.start') }}
        </div>
        <div>{{ startClock }}</div>
        <div>{{ start }}</div>
      </div>
      <div class="text-center lg:text-left">
        <div class="relative font-bold">
          <div class="absolute h-4 w-4 rounded-full bg-gray-300 dark:bg-dark-3 max-lg:left-1/2 max-lg:top-[-26px] max-lg:-translate-x-1/2 lg:left-[-30px] lg:top-1/2 lg:-translate-y-1/2" />
          {{ $t('date.end') }}
        </div>
        <div>{{ endClock }}</div>
        <div>{{ end }}</div>
      </div>
    </div>
  </div>
  <!-- <div class="px-5 pt-5">
    <div class="flex justify-around gap-4 border-t-4 border-gray-300 pt-4 dark:border-dark-3">
      <div class="text-center">
        <div class="relative font-bold">
          <div class="absolute left-1/2 top-[-26px] h-4 w-4 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-dark-3">
            <div class="h-full w-full rounded-full border-4 border-gray-300 bg-white  p-1 dark:border-dark-3 dark:bg-dark-1" />
          </div>
          {{ $t('date.start') }}
        </div>
        <div>{{ startClock }}</div>
        <div>{{ start }}</div>
      </div>
      <div class="text-center">
        <div class="relative font-bold">
          <div class="absolute left-1/2 top-[-26px] h-4 w-4 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-dark-3" />
          {{ $t('date.end') }}
        </div>
        <div>{{ endClock }}</div>
        <div>{{ end }}</div>
      </div>
    </div>
  </div> -->
</template>
