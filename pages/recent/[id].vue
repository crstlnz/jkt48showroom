<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { useNotifications } from '~/store/notifications'

const route = useRoute()
const settings = useSettings()
const { getTitle } = useAppConfig()
const { data, error, pending } = await useApiFetch<LogDetail.Live>(`/api/recent/${route.params.id}`)
const { status, user } = useAuth()
const { data: likeData } = await useApiFetch<Database.IsLike>('/api/user/like', { query: { data_id: route.params.id }, immediate: status.value === 'authenticated' })
const liked = ref(false)

watch(likeData, (val) => {
  liked.value = val?.is_liked || false
}, { immediate: true })

const { addNotif } = useNotifications()

function setLike() {
  if (status.value === 'unauthenticated') {
    navigateTo('/login')
  }
  else {
    if (!data.value) return
    createGtagEvent('bookmark', {
      set: !liked.value,
    })

    $apiFetch('/api/user/like', {
      method: liked.value ? 'DELETE' : 'PUT',
      query: {
        user_id: user.value?.id,
        type: 2,
        liked_id: data.value.data_id,
      },
    }).then(() => {
      liked.value = !liked.value
    }).catch(() => {
      addNotif({ message: 'Bookmark failed!', type: 'danger' })
    })
  }
}

const dayjs = useDayjs()
const { n } = useI18n()

const title = computed(() => {
  const t = (!pending.value && (data.value || !error.value)) ? `${data.value?.room_info?.fullname ?? data.value?.room_info?.nickname ?? data.value?.room_info?.name}` : getTitle(settings.group)
  return t.split('-')[0]
})

// const { $fixCloudinary } = useNuxtApp()
const name = computed(() => data.value?.room_info?.nickname || data.value?.room_info?.fullname || data.value?.room_info?.name)
const description = computed(() => {
  // return t('recent_detail_description', { name: data.value?.room_info.nickname || data.value?.room_info.fullname || data.value?.room_info?.name, date: date.value })
  return `${name.value} mendapatkan gift sebanyak ± ${n((data.value?.total_gifts || 0) * (data.value?.gift_rate || 0), 'currency', 'id')} pada live ini!`
})

const titleSeo = computed(() => `${data.value?.type === 'showroom' ? 'Live Showroom' : 'Live IDN'} ${title.value} - ${dayjs(data.value?.live_info?.date?.start || data.value?.created_at).format('DD MMM YYYY')}`)
useSeoMeta({
  title: () => titleSeo.value,
  ogTitle: () => titleSeo.value,
  twitterTitle: () => titleSeo.value,
  description,
  ogDescription: description,
  twitterDescription: description,
  twitterSite: '@crstlnz',
  ogImage: () => data.value?.room_info?.img || '',
  twitterImage: () => data.value?.room_info?.img || '',
  twitterCard: 'summary_large_image',
})
useHead({
  title: () => titleSeo.value,
})

const { greaterOrEqual } = useResponsive()
const isXL = greaterOrEqual('xl')
</script>

<template>
  <div>
    <div v-if="pending" key="loading" class="relative min-h-[100vh] w-full">
      <Spinner class="size-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <Error v-else-if="error || !data" key="error" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    <LayoutRow v-else key="data" :title="title" :sub-title="`${data.type === 'idn' ? 'IDN' : 'Showroom'} Live - ${$dayjs(data.live_info?.date?.start).format('DD MMMM YYYY')}`">
      <template #default>
        <RecentShowroom v-if="data.type === 'showroom'" :data="data" />
        <RecentIDN v-else-if="data.type === 'idn'" :data="data" />
        <div v-else>
          Error type data!
        </div>
      </template>

      <template #sidebar>
        <ClientOnly>
          <template #fallback>
            <div class="bg-container w-full aspect-4/5 rounded-xl animate-pulse xl:mt-4" />
            <div class="bg-container w-full aspect-4/12 rounded-xl animate-pulse" />
          </template>
          <div v-if="isXL" class="flex flex-col gap-3 md:gap-4">
            <HomeLiveNowSide class="xl:mt-4" />
            <HomeRecents />
          </div>
        </ClientOnly>
      </template>

      <template #actionSection>
        <button v-ripple type="button" aria-label="Like" class="h-10 w-10 rounded-full" @click="setLike">
          <Icon :name="liked ? 'heroicons:bookmark-20-solid' : 'heroicons:bookmark'" class="rounded-full hover:bg-hover w-full h-full p-2" :class="liked ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 bg:text-slate-400'" />
        </button>
      </template>
    </LayoutRow>
  </div>
</template>
