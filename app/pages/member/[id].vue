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

const { t, locale, n } = useI18n()
const dayjs = useDayjs()

async function follow() {
  try {
    const form = new FormData()
    form.set('room_id', String(data.value?.showroom_id))
    form.set('flag', String(isFollow.value ? 0 : 1))
    await $apiFetch('/api/user/follow', {
      method: 'POST',
      credentials: 'include',
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

const member = computed(() => {
  return data.value
})
const memberSocials = computed(() => {
  return getAllowedSocials(member.value?.socials ?? [])
})

const PATH_PREFIXES = ref(new Set(['channel', 'c', 'user', 'r', 's']))

function getSocialUsername(social: SocialNetwork): string {
  try {
    const url = new URL(social.url)

    if (url.hostname.includes('click.idn.media')) {
      const redirect = url.searchParams.get('af_web_dp')
      if (redirect) return getSocialUsername({ ...social, url: redirect })
    }

    const paths = url.pathname.split('/').filter(Boolean)
    const username = PATH_PREFIXES.value.has(paths[0] ?? '') ? paths[1] : paths[0]

    if (!username) return social.title

    return ['tiktok.com', 'twitter.com', 'x.com'].some(h => url.hostname.includes(h)) && !username.startsWith('@')
      ? `@${username}`
      : username
  }
  catch {
    return social.title
  }
}

const memberStatCards = computed(() => {
  const stats = data.value?.stats
  if (!stats) return []

  const totalShowroom = (stats.total_live?.showroom || 0) + (stats.missing?.showroom || 0)
  const totalIdn = (stats.total_live?.idn || 0) + (stats.missing?.idn || 0)
  const mostGiftLink = stats.most_gift?.id ? `/recent/${stats.most_gift.id}` : undefined
  const longestLiveLink = stats.longest_live?.id ? `/recent/${stats.longest_live.id}` : undefined
  const lastLiveLink = stats.last_live?.id ? `/recent/${stats.last_live.id}` : undefined
  const lastLiveEnd = stats.last_live?.date?.end
  const lastLiveValue = !lastLiveEnd
    ? t('data.nodata')
    : dayjs(lastLiveEnd).diff(dayjs(), 'week') > 1
      ? dayjs(lastLiveEnd).locale(locale.value).format('DD MMM YYYY')
      : dayjs(lastLiveEnd).locale(locale.value).fromNow()

  return [
    {
      key: 'total_live',
      label: 'Total Live',
      icon: 'solar:folder-with-files-bold-duotone',
      iconClass: 'text-blue-500',
      tooltip: t('data_disclaimer'),
      rows: [
        { label: 'Showroom', value: totalShowroom || t('data.nodata') },
        { label: 'IDN Live', value: totalIdn || t('data.nodata') },
      ],
    },
    {
      key: 'most_gift',
      label: t('mostgifts'),
      icon: 'solar:gift-bold-duotone',
      iconClass: 'text-yellow-500',
      value: stats.most_gift?.gift ? n(stats.most_gift.gift, 'currency', 'id') : t('data.nodata'),
      headerTo: mostGiftLink,
      valueTo: mostGiftLink,
    },
    {
      key: 'longest_live',
      label: t('longestlive'),
      icon: 'material-symbols:clock-loader-60',
      iconClass: 'text-green-500',
      value: stats.longest_live?.duration ? formatDuration(stats.longest_live.duration, { second: false }) : t('data.nodata'),
      headerTo: longestLiveLink,
      valueTo: longestLiveLink,
    },
    {
      key: 'last_live',
      label: t('last_live'),
      icon: 'material-symbols:videocam-rounded',
      iconClass: 'text-red-500',
      value: lastLiveValue,
      headerTo: lastLiveLink,
      valueTo: lastLiveLink,
    },
  ]
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
    <div v-if="pending" class="flex min-h-screen w-full flex-1 items-center justify-center">
      <Icon name="svg-spinners:ring-resize" size="2.5rem" />
    </div>
    <Error v-else-if="error || !member" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!member || error?.statusCode === 404 ? `${$imgCDN}/assets/svg/web/404.svg` : `${$imgCDN}/assets/svg/web/error.svg`" />
    <LayoutRow v-else :title="member?.fullname ?? member?.name ?? ''">
      <template #default>
        <div>
          <div v-if="!member" class="flex aspect-video w-full flex-col items-center justify-center">
            <Image class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
            <span>{{ $t("data.nodata") }}</span>
          </div>
          <div v-else class="flex flex-col gap-3 md:gap-4">
            <MemberProfileBanner :sousenkyo="data?.sousenkyo" :member="member" :room-id="member.showroom_id" />
            <MemberShowroomInfo v-if="isShowroomExists" :room-id="member.showroom_id" @data="(data) => isFollow = data.is_follow" />
            <MemberProfileVideo v-if="data?.profile_video" :url="data.profile_video" />
            <div v-if="memberStatCards.length" class="max-md:p-3 max-md:bg-container max-md:rounded-xl mx-3 md:mx-4">
              <SummaryCards :cards="memberStatCards" grid-class="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" />
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
              <MemberProfileInfoCard class="flex-1" :title="`${$t('description')} Showroom`" icon="solar:clipboard-list-bold-duotone" icon-class="text-yellow-500">
                <div class="rounded-lg bg-container-2/60 px-2 py-1.5">
                  <ClientOnly>
                    <template #fallback>
                      <div>
                        <div v-for="num in 7" :key="num" class="mb-2.5 h-4 w-[30%] flex-1 animate-pulse rounded-xl bg-container" />
                      </div>
                    </template>
                    <div class="preformat text-sm md:text-base">
                      {{ member.description || $t("nodescription") }}
                    </div>
                  </ClientOnly>
                </div>
              </MemberProfileInfoCard>
              <div v-if="birth || member.bloodType || member.height || memberSocials.length" class="flex flex-col gap-2 sm:grid sm:grid-cols-2 xl:flex xl:flex-row">
                <MemberProfileInfoCard v-if="birth || member.bloodType || member.height" class="min-w-55" title="Info" icon="solar:user-id-bold-duotone" icon-class="text-blue-500">
                  <div class="flex flex-col gap-3 pb-2">
                    <div v-if="birth" class="flex items-center gap-2.5 rounded-lg bg-container-2/60 px-1.5">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-pink-500/10">
                        <Icon name="twemoji:birthday-cake" class="text-base" />
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs opacity-75">
                          {{ $t("birthdate") }}
                        </div>
                        <div class="truncate text-sm font-semibold md:text-base">
                          {{ $d(birth.date, 'birthdate') }}
                        </div>
                      </div>
                    </div>
                    <div v-if="birth && !member.is_group" class="flex items-center gap-2.5 rounded-lg bg-container-2/60 px-1.5">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10">
                        <Icon :name="`emojione:${birth.horoscope.toLowerCase()}`" class="text-base" />
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs opacity-75">
                          {{ $t("horoscope.title") }}
                        </div>
                        <div class="truncate text-sm font-semibold md:text-base">
                          {{ $t(`horoscope.${birth.horoscope.toLowerCase()}`) }}
                        </div>
                      </div>
                    </div>
                    <div v-if="member.bloodType" class="flex items-center gap-2.5 rounded-lg bg-container-2/60 px-1.5">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-500/10">
                        <div class="relative">
                          <Icon name="ic:sharp-bloodtype" class="text-lg text-red-500" />
                          <div class="absolute left-1/2 top-1/2 -z-10 h-2 w-2 -translate-x-1/2 bg-white" />
                        </div>
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs opacity-75">
                          {{ $t("bloodtype") }}
                        </div>
                        <div class="truncate text-sm font-semibold md:text-base">
                          {{ member.bloodType }}
                        </div>
                      </div>
                    </div>
                    <div v-if="member.height" class="flex items-center gap-2.5 rounded-lg bg-container-2/60 px-1.5 py-1">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-yellow-500/10">
                        <Icon name="solar:ruler-pen-bold" class="text-lg text-yellow-500" />
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs opacity-75">
                          {{ $t("height") }}
                        </div>
                        <div class="truncate text-sm font-semibold md:text-base">
                          {{ member.height }}
                        </div>
                      </div>
                    </div>
                  </div>
                </MemberProfileInfoCard>
                <MemberProfileInfoCard v-if="memberSocials.length" class="min-w-48" :title="$t('socialmedia')" icon="solar:share-circle-bold-duotone" icon-class="text-blue-500">
                  <div class="flex flex-col gap-1">
                    <div v-for="social in memberSocials" :key="social.url" class="rounded-lg bg-container-2/60 px-1.5 py-0.5">
                      <div class="group flex w-full min-w-0 items-center gap-2">
                        <SocialIcon :social="social" class="size-7 shrink-0 rounded-md transition-colors group-hover:bg-hover" />
                        <NuxtLink :to="social.url" target="_blank" external class="min-w-0 flex-1 truncate text-sm opacity-75 group-hover:opacity-100 transition-opacity font-semibold leading-7">
                          {{ getSocialUsername(social) }}
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </MemberProfileInfoCard>
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
                    <Image class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
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
            <div class="bg-container w-full aspect-4/5 rounded-xl animate-pulse xl:mt-4" />
            <div class="bg-container w-full aspect-4/12 rounded-xl animate-pulse" />
          </template>
          <HomeLiveNowSide v-if="isXL" class="xl:mt-5" />
          <div v-if="isXL && isShowroomExists">
            <div v-if="!member?.showroom_id" class="bg-container flex aspect-video w-full flex-col items-center justify-center rounded-xl p-4">
              <div class="flex items-center gap-2 self-start text-2xl">
                <Icon name="solar:ranking-bold-duotone" class="text-yellow-500" />
                <span>Summary Ranking</span>
              </div>
              <Image class="mx-auto aspect-square w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
              <span>{{ $t("data.nodata") }}</span>
            </div>
            <SummaryRanking v-else :room-id="member?.showroom_id" />
          </div>
        </ClientOnly>
      </template>
    </LayoutRow>
  </div>
</template>
