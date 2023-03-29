<template>
  <div class="home">
    <div class="flex flex-col gap-5 px-3 pt-4 md:pt-6 xl:pt-8">
      <HomeBanner class="aspect-[38/9] overflow-hidden rounded-xl shadow-sm lg:aspect-[95/9]" />
      <HomeLiveNow />
      <HomeStats />
      <div class="flex items-center justify-between xl:mt-2">
        <div class="flex gap-1">
          <Icon name="ph:info-bold" class="self-center text-xl sm:text-2xl" />
          <h2 class="text-xl font-bold sm:text-2xl">
            {{ $t("moreinfo") }}
          </h2>
        </div>
        <div class="text-xs opacity-60 md:text-sm" />
      </div>
      <div class="space-y-4 xl:grid xl:grid-cols-4 xl:grid-rows-1 xl:gap-4 xl:space-y-0">
        <HomeContainer
          :title="$t('nextlive')"
          icon-class="bg-orange-500"
          more="https://campaign.showroom-live.com/akb48_sr/#/"
          :more-text="$t('showonshowroom')"
          :more-ext-link="true"
        >
          <HomeNextLive />
        </HomeContainer>
        <HomeContainer :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
          <HomeRecents />
        </HomeContainer>
        <div
          class="col-span-2 col-start-1 row-start-1 flex items-center justify-center rounded-xl bg-white p-4 dark:bg-dark-1"
        >
          <div class="flex aspect-square flex-col justify-center space-y-10 py-5 text-center">
            <img
              class="mx-auto h-[400px] w-[400px] max-w-[90%]"
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
