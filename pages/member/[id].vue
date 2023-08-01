<script lang="ts" setup>
import { getSign } from 'horoscope'
import { LazyImage } from '#components'
import { useOnLives } from '~~/store/onLives'

const route = useRoute()

const { data, pending, error } = useFetch('/api/showroom/profile', { params: { room_url_key: route.params.id } })
watch(data, (val) => {
  if (!val) throw createError({ statusMessage: 'Page not found!', statusCode: 404 })
})

const member = computed(() => {
  return data.value
})

const birth = computed(() => {
  const date = member.value?.birthdate ? new Date(member.value.birthdate) : null
  return date
    ? {
        date,
        horoscope: getSign({ month: date.getMonth() + 1, day: date.getDate() }),
      }
    : null
})

const { greaterOrEqual } = useResponsive()
const isXL = greaterOrEqual('xl')
const { isLive: checkLive } = useOnLives()

const isLive = computed(() => {
  return member.value?.room_id ? checkLive(member.value?.room_id || 0) : false
})

const { $fixCloudinary } = useNuxtApp()

useSeoMeta({
  ogTitle: () => `${member.value?.name} Profile` || 'Member Profile',
  ogDescription: () => member.value?.jikosokai || undefined,
  ogImage: () => member.value?.img || '',
  twitterTitle: () => `${member.value?.name} Profile` || 'Member Profile',
  twitterDescription: () => member.value?.jikosokai || undefined,
  twitterImage: () => $fixCloudinary(member.value?.img_alt || member.value?.img || ''),
  twitterCard: 'summary',
})

useHead({
  title: () => member.value?.name || 'Member Profile',
})
</script>

<template>
  <div>
    <div v-if="pending" class="flex min-h-[100vh] w-full flex-1 items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <Error v-else-if="error || !member" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!member || error?.statusCode === 404 ? '/svg/404.svg' : '/svg/error.svg'" />
    <LayoutRow v-else :title="member?.name ?? ''">
      <template #actionSection>
        <NuxtLink target="_blank" :to="$liveURL(member.url)" class="rounded-full bg-blue-500 px-4 py-1.5 text-sm text-white">
          Showroom
        </NuxtLink>
      </template>
      <template #default>
        <div>
          <div v-if="!member" class="flex aspect-video w-full flex-col items-center justify-center">
            <img class="mx-auto aspect-square w-72 max-w-[80%]" src="/svg/empty-box.svg">
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <div v-else class="flex flex-col gap-3 md:gap-4">
            <div class="bg-container aspect-[15/5] w-full md:aspect-[15/3]">
              <LazyImage :src="member.banner || $getDefaultBanner(member.group)" :alt="`${member.name} banner`" class="h-full w-full" />
            </div>
            <div class="-mt-3 flex flex-col gap-3 px-3 md:-mt-4 lg:px-4">
              <div class="flex">
                <div class="bg-background relative mt-[-45px] h-[5.3rem] w-[5.3rem] shrink-0 rounded-full 2xl:mt-[-8%] 2xl:h-[15%] 2xl:w-[15%]">
                  <div class="relative m-1 md:m-1.5">
                    <div v-if="isLive" class="absolute bottom-[14.5%] right-[14.5%] z-10 h-[15%] w-[15%] translate-x-1/2 translate-y-1/2">
                      <div class="absolute inset-0 z-10 rounded-full bg-red-500" />
                      <div class="absolute inset-0 -z-10 animate-ping rounded-full bg-red-500" />
                    </div>
                    <LazyImage
                      :title="isLive ? 'Now Live!' : undefined"
                      class="aspect-square h-full overflow-hidden rounded-full"
                      :src="$fixCloudinary(member.img_alt ?? member.img ?? '')"
                      :alt="`${member.name} Display Picture`"
                    />
                  </div>
                <!-- {{ $d(new Date(member?.birthdate ?? ''), 'birthdate') }} -->
                </div>
                <div class="flex w-0 flex-1 items-start justify-end gap-2 pt-2 md:gap-3 md:pt-3">
                  <NuxtLink v-if="member.generation" :to="`/${member.generation}`" class="select-none rounded-full bg-gray-500 px-3 py-1.5 text-sm text-white dark:bg-dark-3">
                    {{ $parseGeneration(member.generation) || member.generation }}
                  </NuxtLink>
                  <div
                    class="select-none overflow-hidden rounded-full text-center text-sm text-white"
                  >
                    <div v-if="member.is_group" class="bg-sky-400 px-3 py-1.5">
                      Official
                    </div>
                    <div v-else-if="member.is_graduate" class="bg-red-500 px-3 py-1.5">
                      Graduated
                    </div>
                    <div v-else class="bg-green-500 px-3 py-1.5">
                      Active
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-2xl font-semibold lg:text-3xl">
                {{ member.name }}
              </div>
            </div>
            <div v-if="birth" class="flex gap-3 px-3 md:px-4">
              <div class="bg-container flex flex-col gap-2 rounded-xl px-4 py-3 max-sm:flex-1">
                <div class="flex items-center gap-2">
                  <Icon name="twemoji:birthday-cake" size="1.2rem" />
                  <span class="text-sm font-semibold">{{ $t("birthdate") }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span>{{ $d(birth.date, 'birthdate') }}</span>
                </div>
              </div>
              <div class="bg-container flex flex-col gap-2 rounded-xl px-4 py-3 max-sm:flex-1">
                <div class="flex items-center gap-2">
                  <Icon :name="`emojione:${birth.horoscope.toLowerCase()}`" size="1.2rem" />
                  <span class="text-sm font-semibold">{{ $t("horoscope.title") }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span> {{ $t(`horoscope.${birth.horoscope.toLowerCase()}`) }}</span>
                </div>
              </div>
            <!-- <div class="bg-container flex items-center gap-2 rounded-full px-4 py-3">
              <Icon :name="`emojione:${getSign({ month: birthdate.getMonth() + 1, day: birthdate.getDate() }).toLowerCase()}`" size="1.3rem" />
              <span> {{ getSign({ month: birthdate.getMonth() + 1, day: birthdate.getDate() }) }}</span>
            </div> -->
            </div>
            <div v-if="member.jikosokai" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-4 md:mx-4">
              <div class="flex items-center gap-2 text-lg font-semibold">
                <Icon name="carbon:phrase-sentiment" class="text-pink-500" size="1.8rem" />
                <span>Jikoshoukai</span>
              </div>
              <div class="preformat">
                {{ member.jikosokai }}
              </div>
            </div>
            <div class="preformat bg-container mx-3 rounded-xl p-4 md:mx-4">
              <div class="flex items-center gap-2 pb-3 text-lg font-semibold">
                <Icon name="solar:clipboard-list-bold-duotone" class="text-yellow-500" size="1.8rem" />
                <span>{{ $t("description") }} & {{ $t("socialmedia") }}</span>
              </div>
              <div class="text-sm md:text-base">
                {{ member.description || $t("nodescription") }}
              </div>
              <div v-if="member.socials?.length" class="mt-7 flex flex-wrap gap-4">
                <a v-for="social in member.socials" :key="social.url" class="flex items-center gap-1.5 text-blue-500 hover:text-blue-300" target="_blank" :href="social.url">
                  <Icon v-if="$getLinkIconName(social.url)" :name="$getLinkIconName(social.url) || ''" />
                  <span>{{ social.title }}</span>
                </a>
              </div>
            </div>
            <div class="flex flex-col gap-3 md:gap-4">
              <HomeStats v-if="member?.room_id" :room-id="member?.room_id" />
              <div v-if="!isXL" class="px-3 md:px-4">
                <div v-if=" !member?.room_id" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl p-4 xl:mt-5">
                  <div class="flex items-center gap-2 self-start text-2xl">
                    <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
                    <span>Summary Ranking</span>
                  </div>
                  <img class="mx-auto aspect-square w-72 max-w-[80%]" src="/svg/empty-box.svg">
                  <span>{{ $t("data.nodata") }}</span>
                </div>
                <SummaryRanking v-else :room-id="member?.room_id" class="xl:mt-5" />
              </div>
              <MemberInfiniteScroll v-if="member?.room_id" :room-id="member?.room_id" />
            </div>
          </div>
        </div>
      </template>
      <template #sidebar>
        <HomeLiveNowSide v-if="isXL" class="xl:mt-5" />
        <div v-if="isXL">
          <div v-if="!member?.room_id" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl p-4">
            <div class="flex items-center gap-2 self-start text-2xl">
              <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
              <span>Summary Ranking</span>
            </div>
            <img class="mx-auto aspect-square w-72 max-w-[80%]" src="/svg/empty-box.svg">
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <SummaryRanking v-else :room-id="member?.room_id" />
        </div>
      </template>
    </LayoutRow>
  </div>
</template>
