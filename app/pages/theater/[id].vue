<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const route = useRoute()
const { data, status, error } = await useApiFetch<IApiTheaterDetailList>(`/api/theater/${route.params.id}`)

const title = computed(() => {
  const shows = data.value?.shows
  if (shows?.length) {
    if (shows.length > 1) {
      const same = shows.every(i => i.title === shows[0]?.title)
      return same ? shows[0]?.title : 'Theater Detail'
    }
    else {
      return shows[0]?.title
    }
  }
  return ''
})

const { imgCDN } = useAppConfig()
const pic = `${imgCDN}/assets/img/default-anime-avatar_ms7sea.webp`
const config = useAppConfig()

const description = computed(() => {
  let str = data.value?.shows?.[0]?.setlist?.description ?? 'Tidak ada deskripsi.'
  if (str.split(' ').length > 25) {
    str = `${str.split(' ').slice(0, 25).join(' ')}...`
  }
  return str
})

const poster = computed(() => {
  return data.value?.shows[0]?.setlist?.banner || data.value?.shows[0]?.setlist?.poster || undefined
})

useSeoMeta({
  title,
  ogTitle: title,
  twitterTitle: title,
  description,
  ogImage: poster,
  twitterImage: poster,
  twitterDescription: description,
  ogDescription: description,
})

const { locale } = useI18n()
const dayjs = useDayjs()

function getTheaterDateLabel(date: string | Date) {
  return dayjs(date).locale(locale.value).format('DD MMMM YYYY')
}

function getTheaterTimeRange(date: string | Date) {
  const start = dayjs(date)
  const end = start.add(3, 'hour')
  return `${start.locale(locale.value).format('HH:mm')} - ${end.locale(locale.value).format('HH:mm')}`
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const lg = breakpoints.greater('lg')

const userAgent = import.meta.client
  ? navigator.userAgent
  : useRequestHeaders(['user-agent'])['user-agent']
const headless = userAgent?.toLowerCase()?.includes('headless')

useHead({
  title,
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="relative min-h-screen w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error
      v-else-if="error || !data"
      :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')"
      :img-src="!data || error?.statusCode === 404 ? `${$imgCDN}/assets/svg/web/404.svg` : `${$imgCDN}/assets/svg/web/error.svg`"
    />
    <LayoutSingleRow v-else :title="`${title} - ${$dayjs(data?.date).locale(locale).format('DD MMMM YYYY')}`">
      <div v-if="data.shows?.length" class="px-4 md:px-5 space-y-10">
        <div
          v-for="[idx, theater] in data.shows.entries()" :key="theater.id"
          class="space-y-4 md:space-y-5"
        >
          <div class="flex flex-col gap-4 lg:flex-row md:gap-2.5">
            <ClientOnly>
              <template #fallback>
                <div class="border border-black/10 dark:border-white/10 aspect-15/9 lg:aspect-9/12 w-full shrink-0 overflow-hidden rounded-xl object-cover lg:w-72 xl:w-80  self-start bg-container animate-pulse" />
              </template>
              <template #default>
                <Image
                  :key="lg || headless ? (theater.setlist?.poster ?? theater.setlist?.banner) : (theater.setlist?.banner ?? theater.setlist?.poster) ?? config.errorPicture"
                  class="border border-black/10 dark:border-white/10 aspect-15/9 lg:aspect-9/12 w-full shrink-0 overflow-hidden rounded-xl object-cover lg:w-72 xl:w-80  self-start"
                  :src="lg || headless ? (theater.setlist?.poster ?? theater.setlist?.banner) : (theater.setlist?.banner ?? theater.setlist?.poster) ?? config.errorPicture" alt="Theater Poster" :modifiers="{
                    aspectRatio: lg ? '15/9' : '9/12',
                  }" loading="lazy" fit="fill"
                  sizes="150px xs:170px sm:500px md:192px xl:320px" format="webp"
                />
              </template>
            </ClientOnly>
            <div class="lg:px-3 md:pt-1 flex-1 flex flex-col gap-2">
              <span v-if="data.shows.length > 1" class="bg-red-500 py-0.5 px-1.5 rounded-md">
                {{ $t('theater_show_number', { number: idx + 1 }) }}
              </span>
              <div class="flex gap-3 items-center">
                <h3 class="text-xl font-semibold">
                  {{ theater.title }}
                </h3>
                <Image
                  v-if="theater.team"
                  class="self-center rounded-md" :src="`${$imgCDN}/assets/jkt48${theater.team.img}`"
                  alt="Team Label" loading="lazy" fit="fill" width="56px" format="webp"
                />
                <AdminEditTheaterButton :theater-data="theater" />
              </div>
              <div class="font-light opacity-80 text-sm md:text-base">
                {{ theater.setlist?.description && theater.setlist?.description !== '' ? theater.setlist.description : "Tidak ada deskripsi." }}
              </div>

              <div class="grid gap-2 pt-2 sm:grid-cols-3">
                <div class="rounded-xl border border-color-2 bg-container px-3 py-2.5">
                  <div class="text-[11px] md:text-xs font-medium uppercase tracking-wide opacity-60">
                    {{ $t("total_member") }}
                  </div>
                  <div class="mt-1 text-lg md:text-xl font-semibold leading-none">
                    {{ theater.members?.length || '-' }}
                  </div>
                </div>
                <div class="rounded-xl border border-color-2 bg-container px-3 py-2.5">
                  <div class="text-[11px] md:text-xs font-medium uppercase tracking-wide opacity-60">
                    {{ $t("sort.date") }}
                  </div>
                  <div class="mt-1 text-sm md:text-base font-semibold leading-tight">
                    {{ getTheaterDateLabel(theater.date) }}
                  </div>
                </div>
                <div class="rounded-xl border border-color-2 bg-container px-3 py-2.5">
                  <div class="text-[11px] md:text-xs font-medium uppercase tracking-wide opacity-60">
                    {{ $t("time") }}
                  </div>
                  <div class="mt-1 text-sm md:text-base font-semibold leading-tight">
                    {{ getTheaterTimeRange(theater.date) }}
                  </div>
                </div>
              </div>

              <div class="flex flex-1 gap-3 justify-end md:items-end flex-col md:flex-row">
                <div v-if="theater.seitansai?.length || theater.graduation?.length" class="flex-1">
                  <div v-if="theater.seitansai?.length" class="flex flex-col gap-1.5">
                    <div class="font-semibold mt-2 flex items-center gap-1.5 text-rose-400">
                      <Icon name="twemoji:birthday-cake" /> <span>Seitansai</span>
                    </div>
                    <div
                      class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:flex flex-wrap gap-4 md:gap-5"
                    >
                      <TheaterMemberCard
                        v-for="member in theater.seitansai"
                        :key="member.id"
                        :member="member"
                        :fallback-img="pic"
                        :show-name="false"
                        root-class="group"
                        image-wrapper-class="overflow-hidden rounded-xl bg-container"
                        image-class="w-25 md:w-30"
                      />
                    </div>
                    <p class="text-sm md:text-base leading-relaxed text-black/75 dark:text-white/75 flex gap-1.5 flex-wrap">
                      <i18n-t keypath="seitansai_text" tag="span">
                        <template #term>
                          <WordTooltip :tooltip="$t('seitansai_tooltip')">
                            <strong class="font-semibold">{{ $t('seitansai_term') }}</strong>
                          </WordTooltip>
                        </template>
                      </i18n-t>
                      <template v-for="[i, member] in theater.seitansai.entries()" :key="member.id">
                        <NuxtLink class="text-rose-400 font-medium hover:underline underline-offset-3" :to="member.url_key ? `/member/${member.url_key}` : undefined">
                          {{ member.name }}
                        </NuxtLink>{{ i === theater.seitansai.length - 2 ? ' dan ' : (i === theater.seitansai.length - 1 ? '' : ', ') }}
                      </template>
                    </p>
                  </div>
                  <div v-if="theater.graduation?.length" class="flex flex-col gap-1.5">
                    <div class="font-semibold mt-2 flex items-center gap-1.5 text-amber-500">
                      <Icon name="game-icons:graduate-cap" class="w-5 h-5" /><span>Graduation</span>
                    </div>
                    <div
                      class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:flex flex-wrap gap-4 md:gap-5"
                    >
                      <TheaterMemberCard
                        v-for="member in theater.graduation"
                        :key="member.id"
                        :member="member"
                        :fallback-img="pic"
                        :show-name="false"
                        root-class="group"
                        image-wrapper-class="overflow-hidden rounded-xl bg-container"
                        image-class="w-25 md:w-30"
                      />
                    </div>
                    <p class="text-sm md:text-base leading-relaxed text-black/75 dark:text-white/75">
                      <i18n-t keypath="graduation_text" tag="span">
                        <template #term>
                          <WordTooltip :tooltip="$t('graduation_show_tooltip')">
                            <strong class="font-semibold">{{ $t('graduation_show_term') }}</strong>
                          </WordTooltip>
                        </template>
                      </i18n-t>
                      <template v-for="[i, member] in theater.graduation.entries()" :key="member.id">
                        <NuxtLink class="text-amber-500 font-medium hover:underline underline-offset-3" :to="member.url_key ? `/member/${member.url_key}` : undefined">
                          {{ member.name }}
                        </NuxtLink>{{ i === theater.graduation.length - 2 ? ' dan ' : (i === theater.graduation.length - 1 ? '' : ', ') }}
                      </template>
                    </p>
                  </div>
                </div>
                <div id="ticketBox" class="flex flex-col gap-2 w-full md:w-60 lg:w-62.5 xl:w-70 max-md:border-t max-md:border-dashed max-md:border-color-1 max-md:pt-1">
                  <div class="font-semibold mt-2 flex items-center gap-2">
                    <HeaderIcon :icon="getTheaterState(theater.date) === 'ended' ? 'pepicons-pop:internet' : 'ep:ticket'" color-class="text-yellow-500 bg-yellow-500/15" />
                    <span>{{ $t(getTheaterState(theater.date) === 'ended' ? 'official_link' : 'theater_ticket')
                    }}</span>
                  </div>
                  <div class="flex flex-col gap-3">
                    <TheaterTicketButton
                      :to="theater.url"
                      :title="getTheaterState(theater.date) === 'ended' ? 'JKT48 Official Web' : $t('ticket.offline')"
                      :icon="getTheaterState(theater.date) === 'ended' ? '' : 'ep:ticket'"
                      variant="offline"
                    />
                    <TheaterTicketButton
                      v-if="theater.showroomTheater?.entrance_url && getTheaterState(theater.date) !== 'ended'"
                      :to="theater.showroomTheater.entrance_url"
                      :title="$t('ticket.online')"
                      :subtitle="`${$t('at')} Showroom`"
                      icon="ep:ticket"
                      variant="online"
                    />
                    <TheaterTicketButton
                      v-if="theater.idnTheater && getTheaterState(theater.date) !== 'ended'"
                      :to="`https://idn.app/${theater.idnTheater.username}/live/preview/${theater.idnTheater.slug}`"
                      :title="$t('ticket.online')"
                      :subtitle="`${$t('at')} IDN Live`"
                      icon="ep:ticket"
                      variant="online"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2 text-xl font-semibold">
              <HeaderIcon icon="fluent:people-12-filled" color-class="bg-blue-400/15 text-blue-400" />
              <span>{{ $t('theater_member_list') }}</span>
            </div>
            <div
              v-if="theater.members?.length"
              class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:gap-3.5"
            >
              <TheaterMemberCard
                v-for="member in theater.members"
                :key="member.id"
                :member="member"
                :fallback-img="pic"
              />
            </div>
            <div
              v-else
              class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-5"
            >
              <div v-for="num in 16" :key="num" class="relative flex flex-col space-y-2">
                <Image
                  class="bg-container block aspect-8/10 h-full w-full overflow-hidden rounded-xl object-cover opacity-60 brightness-50"
                  :src="pic" alt="Default member picture" fit="fill" :modifiers="{
                    aspectRatio: '8/10',
                    gravity: 'faceCenter',
                  }" sizes="100px md:180px" :placeholder="[8, 10, 75, 5]" format="webp"
                />
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-white">
                  ?
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-4 items-center">
            <span class="flex-1 border-b-2 border-color-1 border-dashed" />
            <span class="opacity-65 text-xs">
              Theater JKT48
            </span>
            <span class="flex-1 border-b-2 border-color-1 border-dashed" />
          </div>
        </div>
      </div>
    </LayoutSingleRow>
  </div>
</template>
