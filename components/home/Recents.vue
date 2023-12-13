<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const settings = useSettings()
const { data, pending, refresh, tryRefresh, date } = useCachedFetch<IApiRecents>('/api/recent', {
  params: {
    group: settings.group,
  },
  expireIn: 600000,
})

const { onFocus } = useUserFocus({
  time: 30000,
  idleTime: 30000,
})

onFocus(() => {
  tryRefresh()
})

const dayjs = useDayjs()
const { locale } = useI18n()
</script>

<template>
  <HomeContainer :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-screen-reader-only="Recent Data" class="relative" :more-text="$t('more')">
    <div v-if="(pending && !data)" class="divide-y-2 divide-neutral-200 overflow-hidden dark:divide-zinc-700/50 pb-2">
      <PulseRecentCard v-for="key in 8" :key="key" />
    </div>
    <div v-else class="pb-2">
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
            :src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`"
            alt="Empty"
            class="mx-auto aspect-square w-[50%] max-w-[400px] dark:brightness-110"
          >
          <div class="text-xs">
            Sorry, but there is no recents right now :(
          </div>
        </div>
      </div>
    </div>
    <button v-if="date" type="button" class="absolute right-0 bottom-0 text-xs font-light float-right px-3 pt-1 pb-3 truncate" @click="refresh">
      {{ pending ? 'Loading' : dayjs(date).locale(locale).fromNow() }}
      <Icon v-if="!pending" name="ic:outline-refresh" />
      <Icon v-else name="svg-spinners:ring-resize" />
    </button>
  </HomeContainer>
</template>
