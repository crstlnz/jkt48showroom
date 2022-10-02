<template>
  <div v-if="pending">
    <PulseHome />
  </div>
  <div v-else-if="error"><Error message="Something error :(" img-src="/svg/error.svg" /></div>
  <div v-else class="flex flex-col gap-5 pt-4 md:pt-6 xl:pt-8">
    <HomeBanner class="rounded-xl overflow-hidden shadow-sm aspect-[38/9] lg:aspect-[95/9]" />
    <div class="flex justify-between items-center mt-2 xl:mt-3">
      <div class="flex gap-1">
        <div class="w-6 relative aspect-square">
          <ClientOnly>
            <div
              v-if="!lives.data?.length"
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-4 bg-gray-500"
            >
              <div class="w-full aspect-square rounded-full" />
            </div>
            <div v-else class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-3 bg-red-500">
              <div class="w-full aspect-square rounded-full" />
              <div class="absolute top-0 w-full aspect-square rounded-full bg-red-500 animate-ping" />
            </div>
            <template #fallback>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-4 bg-gray-500">
                <div class="w-full aspect-square rounded-full" />
              </div>
            </template>
          </ClientOnly>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold relative">
          Live Now
          <!-- <div v-if="lives.pending" class="absolute right-[-30px] top-1/2 -translate-y-1/2" key="loading-spinner">
            <svg
              aria-hidden="true"
              class="w-5 h-5 animate-spin text-gray-300 dark:text-gray-500 fill-blue-500"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div> -->
        </h2>
      </div>
      <ClientOnly>
        <div v-if="lives.pending && lives === null" key="loading">
          <div class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
        </div>
        <div v-else key="data" class="text-xs md:text-sm opacity-60">{{ lives.data?.length }} Members</div>
        <template #fallback key="server">
          <div class="h-4 md:h-5 w-20 rounded-xl animate-pulse pulse-color" />
        </template>
      </ClientOnly>
    </div>
    <HomeLiveNow />
    <div class="flex justify-between items-center xl:mt-2">
      <div class="flex gap-1">
        <i class="i ph:presentation-chart-bold text-xl sm:text-2xl" />
        <h1 class="text-xl sm:text-2xl font-bold">
          {{ data.data.type === "weekly" ? "Weekly Stats" : "Monthly Stats" }}
        </h1>
      </div>
      <div class="text-xs md:text-sm opacity-60">
        {{ new Date(data.data.date.from).toLocaleDateString() }} -
        {{ new Date(data.data.date.to).toLocaleDateString() }}
      </div>
    </div>
    <div v-if="data.data && data.data.stats.length > 3">
      <div class="flex md:flex-row flex-col gap-3 xl:gap-4">
        <div
          v-for="stat in data.data.stats.slice(0, 4)"
          :key="stat.title"
          class="bg-white dark:bg-dark-1 p-5 rounded-lg items-center gap-2 lg:gap-3 flex-1 flex w-full md:w-0 first:hidden md:first:block shadow-sm"
        >
          <div class="flex-1 min-w-0 space-y-1 lg:space-y-2">
            <div class="opacity-60 text-xs lg:text-sm">
              {{ stat.title }}
            </div>
            <div class="md:text-lg lg:text-xl font-bold truncate">
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
              class="group-hover:brightness-50 brightness-100 relative aspect-square cursor-pointer transition-all duration-200"
              :alt="stat.img.title"
              :src="$fixCloudinary(stat.img.src)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white dark:bg-dark-1 rounded-xl p-3 md:p-4 space-y-1 shadow-sm">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold">Top Fans</h3>
        <button class="hover:text-second-2" href="#" @click="openRankFans">More</button>
      </div>
      <div class="whitespace-nowrap py-1 flex flex-1">
        <button
          v-for="fans in data.data.ranks.fans.slice(0, 13)"
          :key="fans.id"
          :title="fans.name"
          class="rounded-sm w-20 md:w-32 text-center space-y-1 min-w-0 px-1 lg:px-2 cursor-pointer hidden [&:not(:nth-of-type(1n+6))]:inline-block md:[&:not(:nth-of-type(1n+8))]:inline-block lg:[&:not(:nth-of-type(1n+11))]:inline-block xl:[&:not(:nth-of-type(1n+13))]:inline-block flex-1"
        >
          <LazyImage
            :transparent="true"
            lazy="false"
            class="bg-transparent mx-auto hover:bg-slate-300/50 dark:hover:bg-dark-3/50 transition-colors rounded-xl p-2 aspect-square"
            :alt="fans.name"
            :src="$avatarURL(fans.avatar_id)"
          />
          <div class="truncate text-xs">{{ fans.name }}</div>
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center xl:mt-2">
      <div class="flex gap-1">
        <i class="i ph:info-bold text-xl sm:text-2xl" />
        <h2 class="text-xl sm:text-2xl font-bold">More Info</h2>
      </div>
      <div class="text-xs md:text-sm opacity-60"></div>
    </div>
    <div class="space-y-4 xl:space-y-0 xl:grid xl:grid-cols-4 xl:gap-4 xl:grid-rows-1">
      <HomeContainer
        title="Next Live"
        icon-class="bg-orange-500"
        more="https://campaign.showroom-live.com/akb48_sr/#/"
        more-text="Show on Showroom"
        :more-ext-link="true"
      >
        <HomeNextLive />
      </HomeContainer>

      <HomeContainer title="Recent Live" icon-class="bg-blue-500" more="/recent">
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

    <BottomSheet ref="bottomSheet" title="Fans Ranking" :items="data.data.ranks.fans">
      <template #default="{ item, index }">
        <div
          class="flex justify-start items-center gap-4 py-1 h-[120px] px-6 hover:bg-slate-300/30 dark:hover:bg-dark-3/30"
        >
          <div class="truncate font-semibold">{{ index + 1 }}</div>
          <img
            lazy="false"
            class="bg-transparent transition-colors rounded-xl p-2 w-28 h-28 cursor-pointer"
            :alt="item.name"
            :src="$avatarURL(item.avatar_id)"
          />
          <div class="flex-1 w-0">
            <a :href="$fansProfileURL(item.id)" target="_blank" class="truncate font-semibold">
              {{ item.name }}
            </a>
          </div>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script lang="ts" setup>
import { LazyImage } from "#components";
import { useOnLives } from "~/store/onLives";
const onlives = useOnLives();
const { lives } = storeToRefs(onlives);
const config = useRuntimeConfig();
const { data, pending, error } = useFetch("/api/home", { baseURL: config.public.baseURL, initialCache: false });

const bottomSheet = ref(null);
function openRankFans() {
  bottomSheet.value?.open();
}
</script>
