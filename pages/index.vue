<template>
  <div v-if="pending">
    <PulseHome />
  </div>
  <div v-else-if="error">
    <Error message="Something error :(" img-src="/svg/error.svg" />
  </div>
  <div v-else class="flex flex-col gap-5 pt-4 md:pt-6 xl:pt-8">
    <HomeBanner class="rounded-xl overflow-hidden shadow-sm aspect-[38/9] lg:aspect-[95/9]" />
    <HomeLiveNow />
    <div class="flex justify-between items-center xl:mt-2">
      <div class="flex gap-1">
        <Icon name="ph:presentation-chart-bold" class="text-xl sm:text-2xl self-center" />
        <h2 class="text-xl sm:text-2xl font-bold">
          {{ data?.data.type === "weekly" ? $t("weeklystats") : $t("monthlystats") }}
        </h2>
      </div>
      <div class="text-xs md:text-sm opacity-60">
        {{ new Date(data?.data.date.from ?? 0).toLocaleDateString() }} -
        {{ new Date(data?.data.date.to ?? 0).toLocaleDateString() }}
      </div>
    </div>
    <div v-if="data?.data && data?.data.stats.length > 3">
      <div class="flex md:flex-row flex-col gap-3 xl:gap-4 flex-wrap">
        <div
          v-for="stat in data?.data.stats.slice(0, 4)"
          :key="stat.key ?? stat.title"
          class="bg-white dark:bg-dark-1 p-5 rounded-lg items-center gap-2 lg:gap-3 flex-1 flex w-full md:w-0 first:hidden md:first:block shadow-sm md:max-lg:basis-1/3"
        >
          <div class="flex-1 min-w-0 space-y-1 lg:space-y-2">
            <div class="opacity-60 text-xs lg:text-sm">
              {{ stat.key ? $t(stat.key) : stat.title }}
            </div>
            <div class="text-lg xl:text-xl font-bold truncate">
              {{ stat.value }}
            </div>
          </div>
          <div
            v-if="stat.img"
            class="group rounded-full overflow-hidden h-12 w-12 lg:h-16 lg:w-16"
            :title="stat.img.title"
          >
            <LazyImage
              lazy="false"
              class="group-hover:brightness-50 brightness-100 relative aspect-square cursor-pointer transition-all duration-200 max-w-16 max-h-16"
              :alt="stat.img.title"
              :src="$fixCloudinary(stat.img.src)"
            />
          </div>
        </div>
      </div>
    </div>
    <HomeFans v-if="data?.data?.ranks?.fans?.length" :data="data?.data.ranks.fans" />
    <!-- <div class="bg-white dark:bg-dark-1 rounded-xl p-3 md:p-4 space-y-1 shadow-sm">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">Top Fans</h2>
        <button class="hover:text-second-2" href="#" @click="openRankFans">More</button>
      </div>
      <div class="whitespace-nowrap py-1 flex flex-1">
        <button
          v-for="fans in data?.data.ranks.fans.slice(0, 13)"
          :key="fans.id"
          :title="fans.name"
          class="rounded-sm w-20 md:w-32 aspect-square text-center space-y-1 min-w-0 px-1 lg:px-2 cursor-pointer hidden [&:not(:nth-of-type(1n+6))]:inline-block md:[&:not(:nth-of-type(1n+8))]:inline-block lg:[&:not(:nth-of-type(1n+11))]:inline-block xl:[&:not(:nth-of-type(1n+13))]:inline-block flex-1"
        >
          <LazyImage
            :transparent="true"
            lazy="false"
            class="bg-transparent mx-auto hover:bg-slate-300/50 dark:hover:bg-dark-3/50 transition-colors rounded-xl p-2 w-full aspect-square"
            :alt="fans.name"
            :src="$avatarURL(fans.avatar_id)"
          />
          <div class="truncate text-xs">{{ fans.name }}</div>
        </button>
      </div>
    </div> -->

    <div class="flex justify-between items-center xl:mt-2">
      <div class="flex gap-1">
        <Icon name="ph:info-bold" class="text-xl sm:text-2xl self-center" />
        <h2 class="text-xl sm:text-2xl font-bold">{{ $t("moreinfo") }}</h2>
      </div>
      <div class="text-xs md:text-sm opacity-60"></div>
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

      <HomeContainer :title="$t('recentlive')" icon-class="bg-blue-500" more="/recent" :more-text="$t('more')">
        <HomeRecents :data="data?.recents" />
      </HomeContainer>

      <div
        class="col-span-2 col-start-1 row-start-1 bg-white dark:bg-dark-1 rounded-xl p-4 flex justify-center items-center"
      >
        <div class="text-center space-y-10 py-5 aspect-square flex justify-center flex-col">
          <img
            class="mx-auto w-[400px] h-[400px] max-w-[90%]"
            alt="Under Construction"
            src="/svg/under_construction.svg"
          />
          <div>🚧 Under Construction 🚧</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
const config = useRuntimeConfig();
const { data, pending, error } = useFetch("/api/home", {
  baseURL: config.public.baseURL,
});
</script>
