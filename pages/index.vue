<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const search = ref('')
const { group } = useSettings()
function applySearch() {
  if (search.value) {
    navigateTo(`/member?s=${search.value}`)
  }
}

function clearSearch() {
  search.value = ''
}
const { greaterOrEqual } = useResponsive()
const isXL = greaterOrEqual('xl')
const searchInput = ref()
</script>

<template>
  <LayoutRow title="Home">
    <template #actionSection>
      <ClientOnly>
        <div v-if="!isXL" class="pointer-events-none inset-x-0 max-sm:absolute xl:hidden">
          <div class="bg-container pointer-events-auto float-right flex items-center rounded-2xl p-1.5 text-sm ring-blue-500 focus-within:ring-2 max-sm:mx-3 max-sm:focus-within:w-[calc(100%_-_24px)] max-sm:focus-within:pl-3" :class="{ 'pl-3 max-sm:w-[calc(100%_-_24px)]': search.length !== 0 }">
            <input ref="searchInput" v-model="search" class="flex-1 truncate bg-transparent outline-none focus-visible:!outline-none max-sm:w-0 sm:ml-3" placeholder="Search..." @keyup.enter="applySearch">
            <button v-if="search.length === 0" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="searchInput?.focus()">
              <Icon name="uil:search" class="h-full w-full text-slate-800  dark:text-white/50 dark:group-hover:text-white" />
            </button>
            <button v-else class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="search = ''">
              <Icon name="ic:round-close" class="h-full w-full text-neutral-400/80 group-hover:text-white dark:text-slate-100" />
            </button>
          </div>
        </div>
      </ClientOnly>
    </template>
    <template #default>
      <HomeBanner />
      <div class="flex flex-col gap-3 md:gap-4">
        <HomeLiveNow />
        <HomeRecentGrids v-if="group === 'jkt48'" />
        <HomeStats />
        <div class="mx-3 flex items-center justify-between md:mx-4 xl:mt-2">
          <div class="flex gap-1">
            <Icon name="ph:info-bold" class="self-center text-xl sm:text-2xl" />
            <h2 class="text-xl font-bold leading-10 sm:text-2xl">
              {{ $t("moreinfo") }}
            </h2>
          </div>
          <div class="text-xs opacity-60 md:text-sm" />
        </div>
        <MemberBirthday class="mx-3 md:mx-4" />
        <div class="mx-3 space-y-3 md:mx-4 xl:grid xl:grid-cols-5 xl:grid-rows-1 xl:gap-4 xl:space-y-0">
          <HomeContainer
            class="col-span-2"
            :title="$t('nextlive')"
            icon-class="bg-orange-500"
            more="https://campaign.showroom-live.com/akb48_sr/#/"
            :more-text="$t('showonshowroom')"
            :more-ext-link="true"
          >
            <HomeNextLive />
          </HomeContainer>
          <Records class="col-span-3 col-start-1 row-start-1" />
        </div>
      </div>
    </template>
    <template #sidebar>
      <div class="max-xl:hidden group bg-container flex items-center gap-4 rounded-full px-4 ring-blue-500 focus-within:ring-2 xl:mt-4">
        <Icon name="uil:search" class="ml-1 h-5 w-5 shrink-0" />
        <input
          id="search"
          v-model="search"
          :aria-label="$t('search')"
          :placeholder="`${$t('search')}...`"
          type="text"
          class="w-full bg-transparent py-3 outline-none"
          @keyup.enter="applySearch"
        >
        <button v-if="search != null && search !== ''" type="button" aria-label="Clear" class="hidden h-6 w-6 shrink-0 rounded-full bg-blue-500 text-white group-focus-within:block group-hover:block" @click="clearSearch">
          <Icon name="ic:round-close" class="h-full w-full p-1" />
        </button>
      </div>
      <!-- <HomeContainer v-if="group === 'jkt48'" :title="$t('schedule')" icon-class="bg-blue-500" more="/schedule" more-label="More schedule" :more-text="$t('more')">

      </HomeContainer> -->
      <HomeSchedule v-if="group === 'jkt48'" />
      <HomeNews v-if="group === 'jkt48'" />
      <HomeRecents v-if="group !== 'jkt48'" />
    </template>
  </LayoutRow>
</template>
