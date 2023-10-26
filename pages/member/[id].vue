<script lang="ts" setup>
import { getSign } from 'horoscope'
import { LazyImage, NuxtLink } from '#components'
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
    <LayoutRow v-else :title="member?.fullname ?? member?.name ?? ''">
      <!-- <template #actionSection>
        <NuxtLink target="_blank" :to="$liveURL(member.url)" class="rounded-full bg-blue-500 px-4 py-1.5 text-sm text-white">
          Showroom
        </NuxtLink>
      </template> -->
      <template #default>
        <div>
          <div v-if="!member" class="flex aspect-video w-full flex-col items-center justify-center">
            <img class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`">
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <div v-else class="flex flex-col gap-3 md:gap-4">
            <MemberProfileBanner :room-id="member.room_id" :member="member as Database.IMemberBasicData" />
            <div v-if="birth || member.bloodType || member.height" class="flex flex-wrap gap-3 px-3 md:px-4 [&>div]:flex-[40%] xl:[&>div]:flex-[20%]">
              <div v-if="birth" class="bg-container flex flex-col gap-1 rounded-xl px-4 py-3 md:gap-2">
                <div class="flex items-center gap-2">
                  <Icon name="twemoji:birthday-cake" size="1.2rem" />
                  <span class="text-sm font-semibold">{{ $t("birthdate") }}</span>
                </div>
                <div>
                  {{ $d(birth.date, 'birthdate') }}
                </div>
              </div>
              <div v-if="birth" class="bg-container flex flex-col gap-1 rounded-xl px-4 py-3 md:gap-2">
                <div class="flex items-center gap-2">
                  <Icon :name="`emojione:${birth.horoscope.toLowerCase()}`" size="1.2rem" />
                  <span class="text-sm font-semibold">{{ $t("horoscope.title") }}</span>
                </div>
                <div>
                  {{ $t(`horoscope.${birth.horoscope.toLowerCase()}`) }}
                </div>
              </div>
              <div v-if="member.bloodType" class="bg-container flex flex-col gap-1 rounded-xl px-4 py-3 md:gap-2">
                <div class="flex items-center gap-2 ">
                  <div class="relative">
                    <Icon name="ic:sharp-bloodtype" size="1.2rem" class="text-red-500" />
                    <div class="absolute left-1/2 top-1/2 -z-10 h-2 w-2 -translate-x-1/2 bg-white" />
                  </div>
                  <span class="text-sm font-semibold">{{ $t("bloodtype") }}</span>
                </div>
                <div>
                  {{ member.bloodType }}
                </div>
              </div>
              <div v-if="member.height" class="bg-container flex flex-col gap-1 rounded-xl px-4 py-3 md:gap-2">
                <div class="flex items-center gap-2">
                  <Icon name="solar:ruler-pen-bold" size="1.2rem" class="text-yellow-500" />
                  <span class="text-sm font-semibold">{{ $t("height") }}</span>
                </div>
                <div>
                  {{ member.height }}
                </div>
              </div>
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
                  <img class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`">
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
            <img class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`">
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <SummaryRanking v-else :room-id="member?.room_id" />
        </div>
      </template>
    </LayoutRow>
  </div>
</template>
