<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const settings = useSettings()
const { data, pending, refresh } = useFetch('/api/showroom/recent', {
  query: {
    group: settings.group,
  },
  server: false,
})

const { onFocus } = useUserFocus({
  time: 30000,
  idleTime: 30000,
})

onFocus(() => {
  refresh()
})
</script>

<template>
  <div v-if="(pending && !data)" class="divide-y-2 divide-neutral-200 overflow-hidden dark:divide-zinc-700/50">
    <PulseRecentCard v-for="key in 8" :key="key" />
  </div>
  <div v-else>
    <div
      v-if="data?.recents"
      class="divide-y-2 divide-neutral-200 overflow-hidden dark:divide-zinc-700/50"
    >
      <MemberRecent
        v-for="recent in data.recents.slice(0, 6)"
        :key="recent.data_id"
        :recent="recent"
      />
    </div>
    <div v-else class="overflow-hidden dark:bg-dark-1">
      <div
        class="flex aspect-square flex-col items-center justify-center space-y-6 text-center md:space-y-8 xl:space-y-10"
      >
        <img
          src="/svg/no_data.svg"
          alt="Empty"
          class="mx-auto aspect-square w-[50%] max-w-[400px] dark:brightness-110"
        >
        <div class="text-xs">
          Sorry, but there is no recents right now :(
        </div>
      </div>
    </div>
  </div>
</template>
