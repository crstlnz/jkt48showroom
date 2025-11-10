<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useMembers } from '~/store/members'
import { useOnLives } from '~/store/onLives'

const route = useRoute()
// const { data, pending, error } = await useApiFetch<IDNLivesDetail>(`/api/watch/${route.params.id}/idn`)
const onLives = useOnLives()
const { data: lives, pending: pendingSocket } = storeToRefs(onLives)
const { members, tryRefresh: tryRefreshMember } = useMembers()
const { data, pending, error, status, refresh } = useAsyncData<IDNLivesDetail>(
  `idn-${route.params.id}`,
  async () => {
    await until(pendingSocket).toMatch(v => v === false)
    await tryRefreshMember()
    const live = lives.value?.find(i => i.type === 'idn' && i.url_key === route.params.id) as INowLive | undefined
    const member = members?.find(i => i.idn_username === route.params.id)
    const member_info = member
      ? {
          name: member.name,
          img: member.img_alt || member.img,
          room_id: member.room_id,
          key: member.url,
        }
      : undefined

    // const sousenkyoData = member ? await $apiFetch<SousenkyoMember>(`/api/sousenkyo/member/${member?.room_id}/room_id`).catch(() => undefined) : undefined

    if (live) {
      return {
        ...live,
        is_live: true,
        member_info,
        // sousenkyo: sousenkyoData,
      }
    }
    else {
      return {
        is_live: false,
        member_info,
        // sousenkyo: sousenkyoData,
      }
    }
  },
  { server: false, lazy: true },
)

watch(lives, () => {
  refresh()
})

const title = computed(() => {
  const name = data.value?.name
  return name ? `${name} - IDN Live` : ''
})

const { width, height } = useWindowSize()

const isLandscape = computed(() => {
  return width.value >= height.value
})

const streamURLs = computed(() => {
  if (!data.value?.streaming_url_list) return []
  return [
    {
      is_default: true,
      url: `${data.value.streaming_url_list?.[0]?.url}`,
      type: 'hls',
      id: 1,
      label: 'Original',
      quality: 1,
    },
  ]
})

useHead({
  title: () => title.value,
})

// const videoIsLandscape = ref(true)
const { isMobile } = useDevice()

// function setVideoLandscape(val: boolean) {
//   videoIsLandscape.value = val
// }

const enableComment = useLocalStorage('enable-idn-comment', true)
</script>

<template>
  <div class="h-full">
    <div v-if="status !== 'success' || pending" class="flex justify-center items-center w-full aspect-4/5 sm:aspect-video">
      <div class="aspect-video w-20 max-w-[40%]">
        <Icon name="svg-spinners:ring-resize" class="w-full h-full" />
      </div>
    </div>
    <div v-else-if="error">
      <Error
        :message="error.statusMessage || ''" :img-src="error.statusCode === 404
          ? `${$cloudinaryURL}/assets/svg/web/404.svg`
          : `${$cloudinaryURL}/assets/svg/web/error.svg`
        "
      />
    </div>
    <div v-else-if="!data?.is_live" class="flex flex-col gap-6">
      <div class="flex flex-col gap-5 items-center flex-1 bg-container py-7 md:py-16 px-10">
        <NuxtImg
          :src="`${$cloudinaryURL}/assets/svg/web/video_files.svg`"
          class="mx-auto w-[450px] max-w-[70%] dark:brightness-90" alt=""
        />
        <div>{{ $t('streamoffline') }}</div>
      </div>
      <div class="flex gap-3 mx-6">
        <NuxtLink :to="`/member/${data?.member_info?.key}`" class="w-28 md:w-36 max-w-[40%]">
          <NuxtImg
            :src="data?.member_info?.img || $errorPicture" size="64px"
            class="w-full aspect-5/6 object-cover rounded-xl"
          />
        </NuxtLink>
        <div>
          <div class="text-xl font-semibold">
            {{ data?.member_info?.name }}
          </div>
          <NuxtLink :to="`/member/${data?.member_info?.key}`" class="text-red-500">
            Open profile
          </NuxtLink>
        </div>
      </div>
    </div>
    <ClientOnly v-else>
      <div
        class="flex items-start relative"
        :class="{
          'h-[calc(100vh-62px)]': isMobile,
          'h-[95vh]': !isMobile,
        }"
      >
        <div
          class="flex-1 relative flex flex-col overflow-hidden transition-all duration-300 h-full"
        >
          <Suspense>
            <template #fallback>
              <div
                class="max-h-screen bg-black/50 flex-1 bg-container"
              />
            </template>
            <VidstackPlayer
              class="bg-container flex justify-center flex-col flex-1 idnvideoplayer"
              :class="{ 'landscape-screen': isLandscape }"
              :title="data.name ?? ''"
              :thumbnails="data?.img ?? ''" :src="streamURLs[0]?.url ?? ''"
            />
          </Suspense>
          <div v-if="!isLandscape" class="p-2">
            <NuxtLink class="text-sm h-7 flex items-center justify-center text-white px-3 py-2 text-center font-bold rounded-md bg-red-500" :to="$idnLiveUrl(data?.url_key || '', data?.slug || '')" external>
              {{ $t('watch_on') }} IDN
            </NuxtLink>
          </div>
        </div>
        <div v-if="isLandscape" class="max-md:absolute max-md:inset-x-0 md:bg-container rounded-r-md flex-1 flex flex-col min-h-[500px] h-[95vh]">
          <div class="px-4 pt-4 pb-3 flex justify-between border-b dark:border-white/5">
            <div class="flex flex-col">
              <h1 class="text-xl leading-5">
                {{ data.name }}
              </h1>
              <div class="text-sm opacity-75">
                IDN Live
              </div>
            </div>
            <div class="flex gap-2 items-center">
              <button v-ripple type="button" class="size-10 rounded-full" @click="() => enableComment = !enableComment">
                <Icon v-if="enableComment" name="tabler:message-circle" class="size-full p-2" />
                <Icon v-else name="tabler:message-circle-off" class="size-full p-2" />
              </button>
              <NuxtLink
                target="_blank" :to="$idnLiveUrl(data?.url_key || '', data?.slug || '')"
                class="text-sm h-7 flex items-center text-white px-3 py-1 rounded-md bg-red-500"
              >
                {{ $t('watch_on') }} IDN
              </NuxtLink>
            </div>
          </div>
          <WatchIDNComment v-if="enableComment" class="flex-1" :idn-data="data" />
          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-xl mb-5">
              {{ $t('comment_disabled') }}
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
#comment-section {
  --mask: linear-gradient(to top,
      rgba(0, 0, 0, 1) 0,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0) 100%) 100% 50% / 100% 100% repeat-x;
  -webkit-mask: var(--mask);
  mask: var(--mask);

  &::-webkit-scrollbar {
    display: none;
  }
}

.landscape-screen {
  media-player[data-fullscreen] {
    video  {
      object-fit: contain !important;
    }
  }
}

.idnvideoplayer {
  media-player {
    &.potrait {
      video {
        object-fit: cover;
      }
    }

    &.landscape {
      video {
        object-fit: contain;
      }
    }
  }
}
</style>
