<script lang="ts" setup>
import { getSign } from 'horoscope'
import { useNotifications } from '~/store/notifications'
import { useSettings } from '~/store/settings'

const route = useRoute()
const { addNotif } = useNotifications()
const { data, pending, error } = await useApiFetch<IMemberProfileAPI>(`/api/member/${route.params.id}`)
const { status } = useAuth()
const isFollow = ref(false)

const isShowroomExists = computed(() => {
  return data?.value?.showroom_exists ?? false
})

const { t, locale } = useI18n()

async function follow() {
  try {
    const form = new FormData()
    form.set('room_id', String(data.value?.showroom_id))
    form.set('flag', String(isFollow.value ? 0 : 1))
    await $apiFetch('/api/user/follow', {
      method: 'POST',
      body: form,
    })
    isFollow.value = !isFollow.value
    addNotif({
      type: 'success',
      message: t(isFollow.value ? 'follow.following' : 'follow.unfollow', { name: data.value?.name }),
      duration: 2500,
    })
  }
  catch (e) {
    console.error(e)
    addNotif({
      type: 'danger',
      message: t('follow.failed'),
      duration: 2500,
    })
  }
}

// watch(() => data.value, async (d) => {
//   if (process.client && d) {
//     fetchProfile(String(d.room_id))
//   }
// }, { immediate: true })

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
const { getGroup } = useAppConfig()
const { group } = useSettings()
const description = computed(() => {
  if (data.value?.jikosokai) return data.value.jikosokai
  const name = data.value?.nickname || data.value?.fullname || data.value?.name
  return `Berikut profile lengkap dari ${name} ${getGroup(group)}`
})
useSeoMeta({
  description,
  title: () => `${data.value?.fullname || member.value?.name} Profile` || 'Member Profile',
  twitterTitle: () => `${member.value?.name} Profile` || 'Member Profile',
  twitterDescription: description,
  twitterImage: () => $fixCloudinary(member.value?.img_alt || member.value?.img || ''),
  twitterCard: 'summary',
  ogTitle: () => `${data.value?.fullname || member.value?.name} Profile` || 'Member Profile',
  ogImage: () => member.value?.img || '',
  ogDescription: description,
  ogType: 'profile',
})

useHead({
  title: () => data.value?.fullname || member.value?.name || 'Member Profile',
})
</script>

<template>
  <div>
    <div v-if="pending" class="flex min-h-[100vh] w-full flex-1 items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <Error v-else-if="error || !member" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!member || error?.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    <LayoutRow v-else :title="member?.fullname ?? member?.name ?? ''">
      <template #default>
        <div>
          <div v-if="!member" class="flex aspect-video w-full flex-col items-center justify-center">
            <NuxtImg class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <div v-else class="flex flex-col gap-3 md:gap-4">
            <MemberProfileBanner :sousenkyo="data?.sousenkyo" :member="member" :room-id="member.showroom_id" />
            <MemberShowroomInfo v-if="isShowroomExists" :room-id="member.showroom_id" @data="(data) => isFollow = data.is_follow" />
            <Sousenkyo2024 v-if="data?.sousenkyo" id="sousenkyo" :data="data?.sousenkyo" class="scroll-mt-20" />
            <div v-if="data?.stats" class="max-md:p-3 max-md:bg-container max-md:rounded-xl mx-3 md:mx-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
              <div class="md:bg-container md:rounded-xl md:p-4 flex flex-col md:items-center gap-1.5 md:gap-2 relative">
                <Icon v-tooltip="$t('data_disclaimer')" name="heroicons:information-circle" class="absolute right-0 top-0.5 md:right-3 md:top-3 text-lg outline-none" />
                <div class="flex items-center gap-1.5 md:gap-2 md:text-xl">
                  <Icon name="solar:folder-with-files-bold-duotone" class="text-blue-500" />
                  <span>Total Live</span>
                </div>
                <div class="max-md:bg-container-2 max-md:p-3 max-md:rounded-xl w-full md:space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span>Showroom</span>
                    <span>{{ ((data?.stats?.total_live?.showroom || 0) + (data?.stats?.missing?.showroom || 0)) || $t('data.nodata') }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>IDN Live</span>
                    <span>{{ ((data?.stats?.total_live?.idn || 0) + (data?.stats?.missing?.idn || 0)) || $t('data.nodata') }}</span>
                  </div>
                </div>
              </div>
              <div class="md:bg-container md:rounded-xl md:p-4 flex md:flex-col max-md:justify-between gap-1.5 md:gap-3 items-center">
                <NuxtLink :to="`/recent/${data?.stats?.most_gift?.id}`" class="flex items-center gap-1.5 md:gap-2 md:text-xl">
                  <Icon name="solar:gift-bold-duotone" class="text-yellow-500" />
                  <span>{{ $t('mostgifts') }}</span>
                </NuxtLink>
                <NuxtLink :to="`/recent/${data?.stats?.most_gift?.id}`" class="space-y-2 text-sm md:text-base md:flex-1 md:flex md:items-center md:justify-center">
                  {{ data?.stats?.most_gift?.gift ? $n(data?.stats?.most_gift?.gift ?? 0, 'currency', 'id-ID') : $t('data.nodata') }}
                </NuxtLink>
              </div>
              <div class="md:bg-container md:rounded-xl md:p-4 flex md:flex-col max-md:justify-between gap-1.5 md:gap-3 items-center">
                <NuxtLink :to="`/recent/${data?.stats?.longest_live?.id}`" class="flex items-center gap-1.5 md:gap-2 md:text-xl">
                  <Icon name="material-symbols:clock-loader-60" class="text-green-500" />
                  <span>{{ $t('longestlive') }}</span>
                </NuxtLink>
                <NuxtLink :to="`/recent/${data?.stats?.longest_live?.id}`" class="space-y-2 text-sm md:text-base md:flex-1 md:flex md:items-center md:justify-center">
                  {{ data?.stats?.longest_live?.duration ? formatDuration(data?.stats?.longest_live?.duration ?? 0, { second: false }) : $t('data.nodata') }}
                </NuxtLink>
              </div>
              <div class="md:bg-container md:rounded-xl md:p-4 flex md:flex-col max-md:justify-between gap-1.5 md:gap-3 items-center">
                <NuxtLink :to="`/recent/${data?.stats?.longest_live?.id}`" class="flex items-center gap-1.5 md:gap-2 md:text-xl">
                  <Icon name="material-symbols:videocam-rounded" class="text-red-500" />
                  <span>{{ $t('last_live') }}</span>
                </NuxtLink>
                <NuxtLink :to="`/recent/${data?.stats?.last_live?.id}`" class="space-y-2 text-sm md:text-base md:flex-1 md:flex md:items-center md:justify-center">
                  {{
                    data?.stats?.last_live?.date?.end
                      ? $dayjs(data?.stats?.last_live?.date?.end ?? '').diff($dayjs(), 'week') > 1 ? $d(new Date(data?.stats?.last_live?.date?.end ?? ''), 'short') : $dayjs(data?.stats?.last_live?.date?.end ?? '').locale(locale).fromNow()
                      : $t('data.nodata')
                  }}
                </NuxtLink>
              </div>
            </div>
            <div v-if="member.jikosokai" class="bg-container mx-3 flex flex-col gap-2 rounded-xl p-4 md:mx-4">
              <div class="flex items-center gap-2 text-lg xl:text-xl font-semibold">
                <Icon name="carbon:phrase-sentiment" class="text-pink-500" size="1.8rem" />
                <span>Jikoshoukai</span>
              </div>
              <div class="preformat">
                {{ member.jikosokai }}
              </div>
            </div>
            <div class="flex flex-col-reverse xl:flex-row gap-3 md:gap-4 mx-3 md:mx-4">
              <div class="flex flex-col bg-container rounded-xl p-3 md:p-4 flex-1">
                <div class="flex items-center gap-2 pb-3 text-lg font-semibold">
                  <Icon name="solar:clipboard-list-bold-duotone" class="text-yellow-500" size="1.8rem" />
                  <span>{{ $t("description") }} & {{ $t("socialmedia") }}</span>
                </div>
                <ClientOnly>
                  <template #fallback>
                    <div v-for="num in 7" :key="num" class="flex-1 h-5 w-[30%] bg-container-2 mb-2 rounded-xl animate-pulse" />
                  </template>
                  <div class="flex-1 preformat text-sm md:text-base">
                    {{ member.description || $t("nodescription") }}
                  </div>
                </ClientOnly>
                <div v-if="member.socials?.length" class="mt-7 flex flex-wrap gap-4">
                  <a v-for="social in member.socials" :key="social.url" class="flex items-center gap-1.5 text-blue-500 hover:text-blue-300" target="_blank" :href="social.url">
                    <Icon v-if="$getSocialColorIcon(social.url)" :name="$getSocialColorIcon(social.url) || ''" />
                    <span>{{ social.title }}</span>
                  </a>
                </div>
              </div>
              <div v-if="birth || member.bloodType || member.height" class="flex xl:flex-col flex-wrap bg-container rounded-xl p-1 min-w-[300px]">
                <div v-if="birth" class="flex flex-col gap-1 px-4 py-3 md:gap-2 max-xl:flex-[40%]">
                  <div class="flex items-center gap-1.5 text-xs md:text-sm">
                    <Icon name="twemoji:birthday-cake" />
                    <span>{{ $t("birthdate") }}</span>
                  </div>
                  <div class="text-sm md:text-base font-semibold">
                    {{ $d(birth.date, 'birthdate') }}
                  </div>
                </div>
                <div v-if="birth && !member.is_group" class="flex flex-col gap-1 px-4 py-3 md:gap-2 max-xl:flex-[40%]">
                  <div class="flex items-center gap-1.5 text-xs md:text-sm">
                    <Icon :name="`emojione:${birth.horoscope.toLowerCase()}`" />
                    <span>{{ $t("horoscope.title") }}</span>
                  </div>
                  <div class="text-sm md:text-base font-semibold">
                    {{ $t(`horoscope.${birth.horoscope.toLowerCase()}`) }}
                  </div>
                </div>
                <div v-if="member.bloodType" class="flex flex-col gap-1 px-4 py-3 md:gap-2 max-xl:flex-[40%]">
                  <div class="flex items-center gap-1.5 text-xs md:text-sm ">
                    <div class="relative">
                      <Icon name="ic:sharp-bloodtype" class="text-red-500" />
                      <div class="absolute left-1/2 top-1/2 -z-10 h-2 w-2 -translate-x-1/2 bg-white" />
                    </div>
                    <span>{{ $t("bloodtype") }}</span>
                  </div>
                  <div class="text-sm md:text-base font-semibold">
                    {{ member.bloodType }}
                  </div>
                </div>
                <div v-if="member.height" class="flex flex-col gap-1 px-4 py-3 md:gap-2 max-xl:flex-[40%]">
                  <div class="flex items-center gap-1.5 text-xs md:text-sm">
                    <Icon name="solar:ruler-pen-bold" class="text-yellow-500" />
                    <span>{{ $t("height") }}</span>
                  </div>
                  <div class="text-sm md:text-base font-semibold">
                    {{ member.height }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3 md:gap-4">
              <div v-if="member.upcomingTheater?.length" class="p-3 md:p-4 bg-container rounded-xl mx-3 md:mx-4">
                <div class="flex gap-1 mb-1">
                  <Icon name="icon-park-twotone:theater" class="self-center text-lg xl:text-xl" />
                  <h2 class="text-lg xl:text-xl font-bold leading-10">
                    {{ $t(`upcoming_theater`) }}
                  </h2>
                </div>
                <div class="md:pt-1 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                  <TheaterCard v-for="theater in member.upcomingTheater" :key="theater.url" :theater="theater" />
                </div>
              </div>
              <div v-if="member.recentTheater?.length" class="p-3 md:p-4 bg-container rounded-xl mx-3 md:mx-4">
                <div class="flex gap-1 mb-1">
                  <Icon name="icon-park-twotone:theater" class="self-center text-lg xl:text-xl" />
                  <h2 class="text-lg xl:text-xl font-bold leading-10">
                    {{ $t(`recent_theater`) }}
                  </h2>
                </div>
                <div class="md:pt-1 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                  <TheaterCard v-for="theater in member.recentTheater" :key="theater.url" :theater="theater" />
                </div>
              </div>
              <!-- <HomeStats v-if="member?.showroom_id" :room-id="member?.showroom_id" /> -->
              <ClientOnly>
                <div v-if="!isXL && isShowroomExists" class="px-3 md:px-4">
                  <div v-if="!member?.showroom_id" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl p-4 xl:mt-5">
                    <div class="flex items-center gap-2 self-start text-2xl">
                      <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
                      <span>Summary Ranking</span>
                    </div>
                    <NuxtImg class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
                    <span>{{ $t("data.nodata") }}</span>
                  </div>
                  <SummaryRanking v-else-if="member.showroom_id" :room-id="member?.showroom_id" class="xl:mt-5" />
                </div>
              </ClientOnly>
              <MemberInfiniteScroll v-if="member?.showroom_id" :room-id="member?.showroom_id" />
            </div>
          </div>
        </div>
      </template>
      <template #actionSection>
        <div v-if="status === 'authenticated' && isShowroomExists" class="flex gap-1.5 text-xl md:text-base items-center max-md:h-8 max-md:w-8 md:py-1 md:px-3 justify-center rounded-full" :class="{ 'bg-pink-400': isFollow, 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-400 dark:hover:bg-gray-500': !isFollow }" @click="follow">
          <Icon :name="isFollow ? 'heroicons:user-minus-20-solid' : 'heroicons:user-plus-20-solid'" />
          <div class="hidden md:block">
            {{ isFollow ? 'Unfollow' : 'Follow' }}
          </div>
        </div>
      </template>
      <template #sidebar>
        <ClientOnly>
          <template #fallback>
            <div class="bg-container w-full aspect-[4/5] rounded-xl animate-pulse xl:mt-4" />
            <div class="bg-container w-full aspect-[4/12] rounded-xl animate-pulse" />
          </template>
          <HomeLiveNowSide v-if="isXL" class="xl:mt-5" />
          <div v-if="isXL && isShowroomExists">
            <div v-if="!member?.showroom_id" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl p-4">
              <div class="flex items-center gap-2 self-start text-2xl">
                <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
                <span>Summary Ranking</span>
              </div>
              <NuxtImg class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$cloudinaryURL}/assets/svg/web/empty-box.svg`" />
              <span>{{ $t("data.nodata") }}</span>
            </div>
            <SummaryRanking v-else :room-id="member?.showroom_id" />
          </div>
        </ClientOnly>
      </template>
    </LayoutRow>
  </div>
</template>
