<script lang="ts" setup>
import { LazyImage } from '#components'
import c from '~~/app.config'
import { useUser } from '~/store/user'
import { useNotifications } from '~/store/notifications'
import { useSettings } from '~~/store/settings'

const route = useRoute()
const settings = useSettings()
const { getTitle } = useAppConfig()
const { data, error, pending } = useFetch(`/api/showroom/recent/${route.params.id}`)
const { data: likeData, error: likeError, pending: likePending } = useFetch('/api/user/like', { query: { id: route.params.id } })
const liked = ref(false)

watch(likeData, (val) => {
  liked.value = val?.is_liked || false
})

const users = computed<Map<number, IFansCompact>>(() => {
  const users = new Map<number, IFansCompact>()
  if (!data?.value?.users) return users
  const u = data?.value?.users
  for (const user of u) {
    users.set(user.id, user)
  }
  return users
})

const gifts = computed<Map<number, IGiftImg>>(() => {
  const gifts = new Map<number, IGiftImg>()
  if (!data?.value?.live_info?.gift) return gifts
  const g = data?.value?.live_info.gift.list
  for (const gift of g) {
    gifts.set(gift.id, {
      id: gift.id,
      free: gift.free,
      point: gift.point,
      img: c.giftUrl(gift?.id ?? 0),
    })
  }
  return gifts
})

const calculatedGift = computed<IFansGift[]>(() => {
  try {
    if (!data?.value?.live_info?.gift?.log) return []
    const log = data?.value.live_info.gift.log
    const mapped = log.map<IFansGift>((i) => {
      const user = users.value.get(i.user_id)
      const giftMap = new Map<number, IGifts>()
      for (const gift of i.gifts) {
        if (giftMap.has(gift.id)) {
          const g = giftMap.get(gift.id)
          if (g) g.num += gift.num
        }
        else {
          const g = gifts.value.get(gift.id)
          if (!g) continue
          giftMap.set(gift.id, {
            num: gift.num,
            id: g.id,
            free: g.free,
            point: g.point,
            img: g.img,
            date: gift.date,
          })
        }
      }
      return {
        name: user?.name ?? 'User not Found!',
        id: user?.id ?? i.user_id ?? (Math.floor(Math.random() * 500) + Math.floor(Math.random() * 10) + 1),
        avatar: c.avatarURL(user?.avatar_id ?? 1),
        avatar_id: user?.avatar_id ?? 1,
        total: i.total,
        gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
      }
    })
    return mapped
  }
  catch (e) {
    return []
  }
})

const { status, user } = useUser()
const { addNotif } = useNotifications()
function setLike() {
  if (status === 'unauthenticated') {
    navigateTo('/login')
  }
  else {
    if (!data.value) return
    $fetch('/api/user/like', {
      method: liked.value ? 'DELETE' : 'PUT',
      body: {
        user_id: user.id,
        type: 2,
        liked_id: data.value.data_id,
      },
    }).then(() => {
      liked.value = !liked.value
    }).catch(() => {
      addNotif({ message: 'Like failed!', type: 'danger' })
    })
  }
}

const title = computed(() => {
  return (!pending.value && (data.value || !error.value)) ? `${data.value?.room_info?.name} Log` : getTitle(settings.group)
})

const { getGroupTitle } = useAppConfig()
const { group } = useSettings()
const { $fixCloudinary } = useNuxtApp()

useSeoMeta({
  ogTitle: () => `${data.value?.room_info?.name} Log` || `${getGroupTitle(group)} Showroom Log`,
  ogImage: () => data.value?.room_info?.img || '',
  twitterTitle: () => `${data.value?.room_info?.name} Log` || `${getGroupTitle(group)} Showroom Log`,
  twitterImage: () => $fixCloudinary(data.value?.room_info?.img_alt || data.value?.room_info?.img || ''),
  twitterCard: 'summary',
})

useHead({
  title,
})
</script>

<template>
  <div>
    <div v-if="pending" class="relative min-h-[100vh] w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? '/svg/404.svg' : '/svg/error.svg'" />
    <LayoutRow v-else :title="title">
      <template #default>
        <div class="flex flex-col gap-3 md:gap-4">
          <div class="bg-container aspect-[15/5] w-full md:aspect-[15/3]">
            <LazyImage :src="data.room_info.banner || $getDefaultBanner(data.room_info.group)" :alt="`${data.room_info.name} banner`" class="h-full w-full" />
          </div>
          <div class="-mt-3 flex flex-col gap-3 px-3 md:-mt-4 lg:px-4">
            <div class="flex">
              <div class="bg-background relative mt-[-45px] w-[5.3rem] shrink-0 rounded-full 2xl:mt-[-8%] 2xl:w-[15%]">
                <div class="p-1 md:p-1.5">
                  <NuxtLink :to="`/member/${data.room_info.url}`">
                    <LazyImage
                      class="aspect-square h-full overflow-hidden rounded-full"
                      :src="$fixCloudinary(data.room_info.img_alt ?? data.room_info.img ?? '')"
                      :alt="`${data.room_info.name} Display Picture`"
                    />
                  </NuxtLink>
                </div>
              </div>
              <div class="flex min-w-0 flex-1 items-start justify-end gap-2 pt-2 md:gap-3 md:pt-3">
                <NuxtLink v-if="data.room_info.generation" :to="`/member?gen=${data.room_info.generation}`" class="select-none rounded-full bg-gray-500 px-3 py-1.5 text-sm text-white dark:bg-dark-3">
                  {{ $parseGeneration(data.room_info.generation) }}
                </NuxtLink>
                <div
                  class="select-none overflow-hidden rounded-full text-center text-sm text-white"
                >
                  <div v-if="data.room_info.is_group" class="bg-sky-400 px-3 py-1.5">
                    Official
                  </div>
                  <div v-else-if="data.room_info.is_graduate" class="bg-red-500 px-3 py-1.5">
                    Graduated
                  </div>
                  <div v-else class="bg-green-500 px-3 py-1.5">
                    Active
                  </div>
                </div>
              </div>
            </div>
            <div class="text-2xl font-semibold lg:text-3xl">
              {{ data.room_info.name }}
            </div>
          </div>

          <div class="mx-3 space-y-3 md:mx-4 md:space-y-4">
            <div class="bg-container flex flex-1 flex-col gap-5 rounded-2xl p-5 lg:flex-row-reverse">
              <ShowroomTimeline :date-start="data.live_info?.date?.start" :date-end="data.live_info?.date?.end" />
              <div class="flex flex-1 flex-col">
                <div
                  class="flex flex-1 flex-wrap items-start justify-center gap-4 [&>*]:min-w-[230px] [&>div]:flex-[100%] lg:[&>div]:flex-[calc(50%_-_1rem)]"
                >
                  <ShowroomStat>
                    <template #title>
                      <Icon name="ph:timer-fill" />{{ $t("duration") }}
                    </template>
                    <template #value>
                      <Parser parse-type="duration" :value="data.live_info?.duration ?? 0" class="lowercase" />
                    </template>
                  </ShowroomStat>

                  <ShowroomStat v-if="data.live_info?.viewer">
                    <template #title>
                      <Icon name="ph:users-fill" /> {{ $t("viewer") }}
                    </template>
                    <template #value>
                      {{ $n(data.live_info?.viewer) }}
                      <span v-if="data.live_info?.active_viewer" v-tooltip="$t('tooltip.activeuser')" class="inline-flex items-center gap-0.5">
                        ( {{ $n(data.live_info?.active_viewer) }}<Icon name="ph:info-duotone" /> )
                      </span>
                    </template>
                  </ShowroomStat>

                  <ShowroomStat>
                    <template #title>
                      <Icon name="bx:bxs-gift" />{{ $t("totalgift") }}
                    </template>
                    <template #value>
                      {{ $currency(data.total_point ?? 0) }}
                    </template>
                  </ShowroomStat>

                  <ShowroomStat v-if="data.live_info?.comments">
                    <template #title>
                      <Icon name="ph:chat-circle-dots-fill" />{{ $t("totalcomments") }}
                    </template>
                    <template #value>
                      <div class="flex items-center justify-center gap-2">
                        <span :title="`${data.live_info.comments.num} ${$t('totalcomments')}`">
                          {{ $n(data.live_info?.comments.num) }}
                        </span>
                        <span v-tooltip="`${$t('tooltip.usercomment', { msg: $n(data.live_info.comments.users) })}`" class="inline-flex items-center justify-center gap-0.5">
                          ( {{ $n(data.live_info.comments.users) }}
                          <Icon title="Users" name="carbon:user-avatar-filled" class="h-6" /> )
                        </span>
                      </div>
                    </template>
                  </ShowroomStat>
                </div>
              </div>
            </div>

            <HomeFans v-if="data.fans?.length" :data="data.fans" class="rounded-xl" />
            <ShowroomGiftList :gifts="data.live_info.gift.list" />

            <div
              class="pulse-color col-span-2 aspect-[16/13] flex-1 overflow-hidden shadow-sm max-sm:-mx-3 sm:rounded-xl md:aspect-[16/10] lg:w-auto 2xl:aspect-[16/9]"
            >
              <ShowroomView
                v-if="data.live_info?.stage_list?.length"
                :member-image="data.room_info?.img"
                :date="data.live_info?.date"
                :background="
                  data.live_info?.background_image
                    ?? 'https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/default.png'
                "
                :screenshot="data.live_info?.screenshot"
                :live-info="data.live_info"
                :stage-list="data.live_info.stage_list"
                :users="users"
                :gift-data="data.live_info.gift"
              />

              <div v-else class="flex h-full w-full items-center justify-center bg-zinc-600 text-3xl font-bold text-white">
                No data
              </div>
            </div>
            <div class="sticky col-span-2 w-full overflow-hidden rounded-xl bg-white shadow-sm dark:bg-dark-1">
              <ShowroomGiftScroll :gifts="calculatedGift" :page-mode="true" />
            </div>
          </div>
        </div>
      </template>

      <template #sidebar>
        <HomeLiveNowSide class="xl:mt-4" />
        <HomeContainer :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
          <HomeRecents />
        </HomeContainer>
      </template>

      <template #actionSection>
        <button type="button" aria-label="Like" @click="setLike">
          <Icon name="ic:round-favorite" class="rounded-full p-1.5 pt-2.5 hover:bg-hover" :class="liked ? 'text-red-400' : 'text-slate-500'" size="2.8rem" />
        </button>
      </template>
    </LayoutRow>
  </div>
</template>
