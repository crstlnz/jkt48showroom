<script lang="ts" setup>
const { data, error, pending } = useApiFetch<any>('/api/stats')

const { t } = useI18n()
const dayjs = useDayjs()
const title = computed(() => {
  if (data.value) {
    return `${t('menu.stats')} - ${dayjs(data.value?.date?.from).format('MMMM YYYY')}`
  }
  else {
    return t('menu.stats')
  }
})
</script>

<template>
  <LayoutSingleRow :title="title">
    <Error v-if="error && error.statusCode === 404" class="mx-5" message="Data not found :(" :img-src="`${$cloudinaryURL}/assets/svg/web/no_data.svg`" />
    <Error v-else-if="error" class="mx-5" message="An error occured!" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" />
    <div v-else class="mx-3 md:mx-4 grid grid-cols-5 grid-rows-5 gap-3 md:gap-4">
      <div class="bg-container rounded-xl p-3 flex-1 aspect-video col-span-1">
        <div class="font-semibold flex items-center gap-2 text-lg">
          <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
          <span>Member Stats</span>
        </div>
      </div>
      <div class="bg-container rounded-xl p-3 flex-1 aspect-video col-span-1">
        <div class="font-semibold flex items-center gap-2 text-lg">
          <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
          <span>Member Stats</span>
        </div>
      </div>
      <div class="bg-container rounded-xl p-3 flex-1 aspect-video col-span-1">
        <div class="font-semibold flex items-center gap-2 text-lg">
          <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
          <span>Member Stats</span>
        </div>
      </div>
      <div class="col-span-3 row-span-2 col-start-1 row-start-2 bg-container rounded-xl p-3 flex-1 aspect-video">
        <div class="font-semibold flex items-center gap-2 text-lg">
          <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
          <span>Member Stats</span>
        </div>
      </div>
      <div class="bg-container col-span-3 row-span-2 row-start-4">
        11
      </div>
      <div class="bg-container col-span-3 row-span-2 row-start-6">
        12
      </div>
      <div class="bg-container rounded-xl p-3 md:p-4 space-y-3 col-span-2 row-span-7 col-start-4 row-start-1">
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
          <div v-for="fans in data.top_gifter.slice(0, 5)" :key="fans.user_id || (Math.random() * 1000)" class="flex gap-3 md:gap-4">
            <img class="w-28 h-28 rounded-md" :src="fans.avatar_url || $avatarURL(fans.avatar_id)">
            <div class="space-y-1 flex-1">
              <div>
                {{ fans.name }}
              </div>
              <div class="text-sm">
                {{ $n(fans.total_gift, 'currency', 'id-ID') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutSingleRow>
</template>
