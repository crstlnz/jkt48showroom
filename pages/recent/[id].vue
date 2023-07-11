<script lang="ts" setup>
import c from '~~/app.config'
import timeFormat from '~/library/plugins/timeFormat'
import { LazyImage } from '#components'
import { useUser } from '~/store/user'
import { useNotifications } from '~/store/notifications'
import { useSettings } from '~~/store/settings'

const route = useRoute()
const settings = useSettings()
const { getTitle } = useAppConfig()
const { data, error, pending } = useFetch(`/api/showroom/recent/${route.params.id}`)
const liked = ref(false)

watch(data, (val) => {
  liked.value = val?.liked || false
})
const { locale } = useI18n()
const duration = computed(() => {
  return timeFormat.detailDuration(new Date(data.value?.live_info.date.end ?? 0), new Date(data.value?.live_info.date.start ?? 0), locale.value as any, Number.POSITIVE_INFINITY)
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
    liked.value = !liked.value

    $fetch('/api/user/liked', {
      method: 'POST',
      body: {
        delete: !liked.value,
        user_id: user.id,
        type: 2,
        liked_id: data.value.data_id,
      },
    }).catch(() => {
      addNotif({ message: 'Like failed!', type: 'danger' })
    })
  }
}

const title = computed(() => {
  return (!pending.value && (data.value || !error.value)) ? `${data.value?.room_info?.name} Log` : getTitle(settings.group)
})

useHead({
  title,
})
</script>

<template>
  <div v-if="pending" class="relative min-h-[100vh] w-full">
    <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
  </div>
  <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? '/svg/404.svg' : '/svg/error.svg'" />
  <LayoutRow v-else :title="title">
    <template #default>
      <div class="flex flex-col items-stretch gap-4 xl:gap-5 xl:px-6">
        <div class="flex gap-4 max-2xl:flex-col xl:gap-5">
          <div class="bg-container w-full overflow-hidden pb-8 shadow-sm  sm:rounded-xl 2xl:w-[400px]">
            <div class="aspect-[15/5]">
              <div class="h-full w-full" :style="{ backgroundColor: data.colorBg || '#f5efdf' }" />
            </div>
            <div class="flex justify-between gap-3 px-5 pt-3">
              <div class="bg-container relative mt-[-50px] w-[5.5rem] shrink-0 rounded-full md:mt-[-10.8%] md:w-[18%] 2xl:mt-[-18%] 2xl:w-[30%]">
                <div class="p-1.5 md:p-2.5">
                  <LazyImage
                    class="aspect-square h-full overflow-hidden rounded-full"
                    :src="$fixCloudinary(data.room_info?.img_alt ?? data.room_info?.img ?? '')"
                    :alt="`${data.room_info.name} Display Picture`"
                  />
                </div>
              </div>

              <div
                class="aspect-[24/10] h-8 select-none overflow-hidden rounded-3xl text-center text-sm font-semibold leading-8 text-white md:h-9 md:text-base md:leading-9 [&>div]:h-full"
              >
                <div v-if="data.room_info.is_group" class="bg-sky-400">
                  Official
                </div>
                <div v-else-if="data.room_info.is_graduate" class="bg-red-500">
                  Graduated
                </div>
                <div v-else class="bg-green-500">
                  Active
                </div>
              </div>
            </div>
            <div class="px-5">
              <div class="pt-1 md:pt-2 lg:pt-3">
                <h2 class="flex-1 truncate text-xl font-bold lg:text-2xl">
                  {{ data.room_info.name }}
                </h2>
              </div>
            </div>
          </div>
          <div class="bg-container flex flex-1 flex-col gap-5 p-5 sm:rounded-2xl">
            <ShowroomTimeline :date-start="data.live_info?.date?.start" :date-end="data.live_info?.date?.end" />
            <div class="flex flex-col">
              <div
                class="flex flex-1 flex-wrap gap-4 [&>*]:min-w-[230px] [&>div]:flex-[100%] lg:[&>div]:flex-[40%]"
              >
                <ShowroomStat>
                  <template #title>
                    <Icon name="ph:timer-fill" />{{ $t("duration") }}
                  </template>
                  <template #value>
                    {{ duration }}
                  </template>
                </ShowroomStat>

                <ShowroomStat v-if="data.live_info?.viewer?.peak">
                  <template #title>
                    <Icon name="ph:users-fill" /> {{ $t("viewer") }}
                  </template>
                  <template #value>
                    {{ $n(data.live_info?.viewer?.peak) }}
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
                    <span :title="`${data.live_info.comments.num} ${$t('totalcomments')}`">
                      {{ data.live_info?.comments.num }}
                    </span>
                    (<span class="inline-flex items-center justify-center gap-0.5" :title="`${data.live_info.comments.users} ${$t('user', data.live_info.comments.users)}`">
                      {{ data.live_info.comments.users }}
                      <Icon title="Users" name="carbon:user-avatar-filled" class="h-6" />)
                    </span>
                  </template>
                </ShowroomStat>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="dark:bg-dark-1 overflow-hidden bg-white pb-8 shadow-sm sm:rounded-xl md:pb-10 lg:pb-12">
          <div class="aspect-[15/5]">
            <div class="h-full w-full" :style="{ backgroundColor: data.colorBg }" />
          </div>
          <div class="flex justify-between gap-3 px-5 pt-3">
            <div class="dark:bg-dark-1 relative mt-[-50px] w-[5.5rem] shrink-0 rounded-full bg-white md:mt-[-12%] md:w-[20%]">
              <div class="p-1.5 md:p-2.5">
                <LazyImage
                  class="aspect-square h-full overflow-hidden rounded-full"
                  :src="data.room_info?.img_alt ?? data.room_info?.img ?? ''"
                  :alt="`${data.room_info.name} Display Picture`"
                />
              </div>
            </div>

            <div
              class="aspect-[24/10] h-8 select-none overflow-hidden rounded-3xl text-center text-sm font-semibold leading-8 text-white md:h-9 md:text-base md:leading-9 [&>div]:h-full"
            >
              <div v-if="data.room_info.is_group" class="bg-sky-400">
                Official
              </div>
              <div v-else-if="data.room_info.is_graduate" class="bg-red-500">
                Graduated
              </div>
              <div v-else class="bg-green-500">
                Active
              </div>
            </div>
          </div>

          <div class="px-5">
            <div class="pt-1 md:pt-2 lg:pt-3">
              <h2 class="flex-1 truncate text-2xl font-bold lg:text-3xl">
                {{ data.room_info.name }}
              </h2>
            </div>

            <div class="mt-4 flex flex-col items-start justify-start md:flex-row md:gap-5">
              <div
                class="flex flex-1 flex-wrap gap-4 [&>div]:flex-[100%] lg:[&>div]:flex-[40%]"
              >
                <ShowroomStat>
                  <template #title>
                    <Icon name="ph:timer-fill" />{{ $t("duration") }}
                  </template>
                  <template #value>
                    {{ duration }}
                  </template>
                </ShowroomStat>

                <ShowroomStat v-if="data.live_info?.viewer?.peak">
                  <template #title>
                    <Icon name="ph:users-fill" /> {{ $t("viewer") }}
                  </template>
                  <template #value>
                    {{ $n(data.live_info?.viewer?.peak) }}
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
                    <span :title="`${data.live_info.comments.num} ${$t('totalcomments')}`">
                      {{ data.live_info?.comments.num }}
                    </span>
                    (<span class="inline-flex items-center justify-center gap-0.5" :title="`${data.live_info.comments.users} ${$t('user', data.live_info.comments.users)}`">
                      {{ data.live_info.comments.users }}
                      <Icon title="Users" name="carbon:user-avatar-filled" class="h-6" />)
                    </span>
                  </template>
                </ShowroomStat>
              </div>
              <div class="max-lg:min-w-0 max-lg:flex-1 lg:min-w-[300px]">
                <ShowroomTimeline :date-start="data.live_info?.date?.start" :date-end="data.live_info?.date?.end" />
              </div>
            </div>
          </div>
        </div> -->

        <HomeFans v-if="data.fans?.length" :data="data.fans" class="sm:rounded-xl" />
        <ShowroomGiftList :gifts="data.live_info.gift.list" />

        <div
          class="pulse-color col-span-2 aspect-[16/13] flex-1 overflow-hidden shadow-sm sm:rounded-xl md:aspect-[16/10] lg:w-auto 2xl:aspect-[16/9]"
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
        <div class="sticky col-span-2 w-full overflow-hidden bg-white shadow-sm dark:bg-dark-1 sm:rounded-xl">
          <ShowroomGiftScroll :gifts="calculatedGift" :page-mode="true" />
        </div>
      </div>
    </template>

    <template #sidebar>
      <HomeLiveNowSide class="mt-4" />
      <HomeContainer :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
        <HomeRecents />
      </HomeContainer>
    </template>

    <template #actionSection>
      <button @click="setLike">
        <Icon name="ic:round-favorite" class="rounded-full p-1.5 pt-2.5 hover:bg-hover" :class="liked ? 'text-red-400' : 'text-slate-500'" size="2.8rem" />
      </button>
    </template>
  </LayoutRow>
</template>
