<script lang="ts" setup>
const config = useRuntimeConfig()
const { data, pending, error } = useLazyFetch('/api/home', {
  baseURL: config.public.baseURL,
  server: false

})
</script>

<template>
  <div class="home">
    <div class="flex flex-col gap-5 pt-4 md:pt-6 xl:pt-8">
      <HomeBanner class="rounded-xl overflow-hidden shadow-sm aspect-[38/9] lg:aspect-[95/9]" />
      <HomeLiveNow />
      <HomeStats />
      <div class="flex justify-between items-center xl:mt-2">
        <div class="flex gap-1">
          <Icon name="ph:info-bold" class="text-xl sm:text-2xl self-center" />
          <h2 class="text-xl sm:text-2xl font-bold">
            {{ $t("moreinfo") }}
          </h2>
        </div>
        <div class="text-xs md:text-sm opacity-60" />
      </div>
      <div class="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-4 xl:gap-4 xl:grid-rows-1">
        <HomeContainer
          :title="$t('nextlive')"
          icon-class="bg-orange-500"
          more="https://campaign.showroom-live.com/akb48_sr/#/"
          :more-text="$t('showonshowroom')"
          :more-ext-link="true"
        >
          <HomeNextLive />
        </HomeContainer>
        <HomeContainer :title="$t('recentlive')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
          <HomeRecents />
        </HomeContainer>
        <div
          class="col-span-2 col-start-1 row-start-1 bg-white dark:bg-dark-1 rounded-xl p-4 flex justify-center items-center"
        >
          <div class="text-center space-y-10 py-5 aspect-square flex justify-center flex-col">
            <img
              class="mx-auto w-[400px] h-[400px] max-w-[90%]"
              alt="Under Construction"
              src="/svg/under_construction.svg"
            >
            <div>🚧 Under Construction 🚧</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
