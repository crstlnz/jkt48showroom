<script lang="ts" setup>
const { data, error, pending } = useApiFetch<any>('/api/stats')

const { t } = useI18n()
const dayjs = useDayjs()
const statsTitle = computed(() => dayjs(data.value?.date?.from).format('MMMM YYYY'))
const title = computed(() => {
  if (data.value) {
    return `${t('menu.stats')} - ${statsTitle.value}`
  }
  else {
    return t('menu.stats')
  }
})

useHead({
  title,
})
</script>

<template>
  <LayoutSingleRow :title="title">
    <Error v-if="error && error.statusCode === 404" class="mx-5" message="Data not found :(" :img-src="`${$imgCDN}/assets/svg/web/no_data.svg`" />
    <Error v-else-if="error" class="mx-5" message="An error occured!" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" />
    <div v-else-if="pending">
      Loading
    </div>
    <div v-else>
      <!-- <div class="mx-3 md:mx-4 text-2xl font-bold mb-3">
        Data Statistik {{ statsTitle }}
      </div> -->
      <div class="mx-3 md:mx-4 flex flex-col xl:flex-row gap-3 md:gap-4">
        <div class="flex-1 flex flex-col gap-3 md:gap-4">
          <div class="flex max-lg:flex-col gap-2 md:gap-4 max-md:bg-container max-sm:p-3 max-md:p-4 max-md:rounded-xl">
            <div class="md:bg-container rounded-xl md:p-5 flex-1 flex md:flex-col gap-2 max-md:justify-between max-md:items-start">
              <div class="flex items-center gap-2 text-base md:text-lg">
                <Icon name="material-symbols:videocam-rounded" class="text-red-500" />
                <span>Total Live</span>
              </div>
              <div class="md:flex-1 flex flex-col justify-end max-md:items-end">
                <div class="md:font-semibold flex items-center gap-2 text-base lg:text-xl xl:text-2xl text-center">
                  {{ $t('live_count', data.live_info.total.all) }}
                </div>
                <div class="text-xs md:text-sm">
                  {{ $t('by_member', data.data.length) }}
                </div>
              </div>
            </div>
            <div class="md:bg-container rounded-xl md:p-5 flex-1 flex md:flex-col gap-2 max-md:justify-between max-md:items-start">
              <div class="flex items-center gap-2 text-base md:text-lg">
                <Icon name="material-symbols:clock-loader-60" class="text-green-500" />
                <span>{{ $t('avg_duration') }}</span>
              </div>
              <div class="md:font-semibold flex items-end gap-2 text-base lg:text-xl xl:text-2xl md:flex-1">
                {{ formatDuration(data.data.reduce((a : any, b : any) => a + b.longest_live, 0) / data.data?.length) }}
              </div>
            </div>
            <div class="md:bg-container rounded-xl md:p-5 flex-1 flex flex-col gap-2">
              <div class="flex items-center gap-2 text-base md:text-lg">
                <Icon name="tdesign:control-platform" class="text-yellow-500" />
                <span>Platform</span>
              </div>
              <div class="flex gap-2 text-lg flex-1 flex-col">
                <div class="h-1.5 md:h-2 bg-yellow-400 rounded-full overflow-hidden w-full">
                  <div
                    class="bg-red-400 h-full text-base" :style="{
                      width: `${data.live_info.total.idn / data.live_info.total.all * 100}%`,
                    }"
                  />
                </div>
                <div class="space-y-0.5 md:space-y-1 md:pt-1">
                  <div class="text-red-400 flex gap-1.5 items-center">
                    <div class="w-2 h-2 rounded-full bg-red-400" />
                    <div class="text-xs md:text-sm">
                      IDN Live  ({{ Math.round(data.live_info.total.idn / data.live_info.total.all * 100) }}%)
                    </div>
                  </div>
                  <div class="text-yellow-400 flex gap-1.5 items-center">
                    <div class="w-2 h-2 rounded-full bg-yellow-400" />
                    <div class="text-xs md:text-sm">
                      Showroom ({{ Math.round(data.live_info.total.showroom / data.live_info.total.all * 100) }}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-container rounded-xl p-3 flex-1 aspect-video">
            <div class="font-semibold flex items-center gap-2 text-lg">
              <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
              <span>Member Stats</span>
            </div>
            <div class="space-y-3 py-3">
              <div v-for="[i, member] in data.data.slice(0, 5).entries()" :key="member.member_data?.id" class="bg-container-2 dark:bg-black/20 rounded-xl p-4 flex items-center text-xl gap-4">
                <div>{{ i + 1 }}</div>
                <img :src="member.member_data.img_alt" alt="" class="rounded-md h-20">
                <div>{{ member.member_data?.name }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-container rounded-xl min-w-[350px] 2xl:min-w-[400px] p-3 md:p-4 space-y-3 col-span-2 row-span-7 col-start-5 row-start-1">
          <div class="flex justify-between items-center gap-5">
            <div class="font-semibold flex items-center gap-2 text-lg">
              <Icon name="heroicons:gift-20-solid" class="text-red-500" />
              <span>Top Gifter</span>
            </div>
            <div class="text-sm">
              Selengkapnya
            </div>
          </div>
          <div class="space-y-3 md:space-y-4">
            <div v-for="fans in data.top_gifter.slice(0, 7)" :key="fans.user_id || (Math.random() * 1000)" class="flex gap-3 md:gap-4">
              <img class="w-20 h-20 rounded-md" :src="fans.avatar_url || $avatarURL(fans.avatar_id)">
              <div class="space-y-1 flex-1">
                <div>
                  {{ fans.name }}
                </div>
                <div class="text-sm">
                  {{ $n(fans.total_gift, 'currency', 'id') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutSingleRow>
</template>
