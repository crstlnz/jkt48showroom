<script lang="ts" setup>
interface MemberProfileVideo {
  name: string
  nickname?: string | null
  birthdate?: string | null
  img?: string | null
  video?: string | null
  slug?: string | null
}

const { data, pending, error } = useCachedFetch<MemberProfileVideo[]>('/api/member_profile_videos', {
  expireIn: 1000 * 60 * 10,
})

const videos = computed(() => {
  return (data.value ?? []).filter(item => item.video)
})

const selectedIndex = ref(0)
const selectedVideo = computed(() => videos.value[selectedIndex.value]?.video ?? '')
const selectedMember = computed(() => videos.value[selectedIndex.value] ?? null)
const { d } = useI18n()
const videoPlayer = ref<{ play?: () => Promise<void>, pause?: () => Promise<void> } | null>(null)
const currentPlayerState = ref<number | null>(null)
const memberButtonRefs = ref<HTMLElement[]>([])
const selectedBirthdate = computed(() => {
  const birthdate = selectedMember.value?.birthdate
  if (!birthdate) return null
  const parsedDate = new Date(birthdate)
  if (Number.isNaN(parsedDate.getTime())) return null
  return d(parsedDate, 'birthdate')
})

function selectVideoByIndex(index: number) {
  if (index < 0 || index >= videos.value.length) return
  selectedIndex.value = index
}

async function handleSelectMember(index: number) {
  if (index === selectedIndex.value) {
    if (currentPlayerState.value === 1) {
      await videoPlayer.value?.pause?.()
    }
    else {
      await videoPlayer.value?.play?.()
    }
    return
  }
  selectVideoByIndex(index)
}

function handlePlayerStateChange(state: number) {
  currentPlayerState.value = state
}

function playNextVideo() {
  const length = videos.value.length
  if (!length) return
  selectedIndex.value = (selectedIndex.value + 1) % length
}

function setMemberButtonRef(el: Element | null, index: number) {
  if (!el) return
  memberButtonRefs.value[index] = el as HTMLElement
}

function scrollToSelectedMember(smooth = true) {
  const target = memberButtonRefs.value[selectedIndex.value]
  if (!target) return
  target.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'nearest',
    inline: 'nearest',
  })
}

watch(videos, (list) => {
  memberButtonRefs.value = []
  if (!list.length) {
    selectedIndex.value = 0
    currentPlayerState.value = null
    return
  }
  if (selectedIndex.value >= list.length || selectedIndex.value < 0) {
    selectedIndex.value = 0
  }
}, { immediate: true })

watch(selectedVideo, () => {
  currentPlayerState.value = null
})

watch(selectedIndex, async () => {
  await nextTick()
  scrollToSelectedMember(true)
})
</script>

<template>
  <HomeContainer class="mx-3 mt-3 md:mx-4" title="Gen 14 Profile" no-padding>
    <template #icon>
      <span class="inline-flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
        <Icon name="material-symbols:person-rounded" class="size-4.5" />
      </span>
    </template>
    <template #right>
      <div
        v-if="pending && !data"
        class="pulse-color h-4 w-20 animate-pulse rounded-xl md:h-5"
      />
      <span v-else class="opacity-60">
        {{ videos.length }} {{ $t("member", videos.length) }}
      </span>
    </template>
    <div class="px-3 pb-3 md:px-4 md:pb-4">
      <div
        v-if="error"
        class="flex w-full flex-col items-center justify-center gap-2 pb-2 pt-4 text-xs md:gap-3 md:text-sm xl:gap-5"
      >
        <Image class="aspect-square w-72 max-w-[70%]" :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill" />
        {{ $t("data.failed") }}
      </div>
      <div
        v-else-if="pending"
        class="grid-live-now gap-4 pt-4"
      >
        <PulseLiveCard />
      </div>
      <div v-else-if="videos.length" class="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_92px] gap-3 pt-2 xl:items-stretch">
        <div class="space-y-2 xl:min-h-0">
          <div class="relative aspect-video w-full overflow-hidden rounded-xl border border-color-2 bg-black shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-[1.015]"
              leave-active-class="transition-all duration-200 ease-in"
              leave-to-class="opacity-0 scale-[0.99]"
            >
              <LazyVideoLiteYoutubeEmbed
                ref="videoPlayer"
                :key="selectedVideo"
                :url="selectedVideo"
                class="size-full"
                @ended="playNextVideo"
                @state-change="handlePlayerStateChange"
              />
            </Transition>
            <div class="pointer-events-none absolute inset-0 bg-black/8" />
          </div>
          <div class="rounded-xl border border-color-2 bg-container-2 p-2.5 md:p-3">
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-260 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              leave-active-class="transition-all duration-180 ease-in"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div :key="selectedMember?.slug || selectedIndex" class="flex items-center gap-2.5">
                <Image
                  sizes="72px"
                  :placeholder="[45, 10, 55, 70]"
                  :modifiers="{
                    aspectRatio: 1,
                    gravity: 'faceCenter',
                  }"
                  fit="fill"
                  format="webp"
                  :alt="selectedMember?.name ?? 'Selected member'"
                  class="object-cover rounded-full size-12 md:size-13 ring-2 ring-blue-500/60 shrink-0"
                  :src="selectedMember?.img"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] uppercase tracking-[0.14em] opacity-55">
                    Generasi 14
                  </p>
                  <p class="truncate text-sm md:text-base font-semibold">
                    {{ selectedMember?.name || '-' }}
                  </p>
                  <div class="mt-1 flex flex-wrap gap-1.5 text-[11px] md:text-xs">
                    <span class="inline-flex items-center rounded-md border border-color-2 bg-container px-2 py-0.5 opacity-80">
                      {{ selectedMember?.nickname || '-' }}
                    </span>
                    <span class="inline-flex items-center rounded-md border border-color-2 bg-container px-2 py-0.5 opacity-80">
                      {{ selectedBirthdate || '-' }}
                    </span>
                  </div>
                </div>
                <NuxtLink
                  v-if="selectedMember?.slug"
                  :to="`/member/${selectedMember.slug}`"
                  class="inline-flex shrink-0 items-center rounded-md border border-color-2 bg-container px-2 py-1 text-[11px] md:text-xs opacity-85 transition hover:opacity-100"
                >
                  Profile
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </div>
        <div class="max-h-75 pr-1 xl:h-full xl:max-h-none relative">
          <BetterScrollbar container-class="absolute inset-0">
            <div class="flex flex-col gap-3">
              <button
                v-for="[i, member] in videos.entries()"
                :key="member.slug ?? i"
                :ref="(el) => setMemberButtonRef(el as any, i)"
                type="button"
                class="group relative overflow-hidden rounded-lg border border-color-2 bg-container-2 p-1.5 text-left transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
                :class="{
                  'border-second-2/55 bg-second-2/12 shadow-[0_0_0_1px_rgba(70,152,235,0.2)]': selectedIndex === i,
                }"
                @click="handleSelectMember(i)"
              >
                <span
                  class="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full transition-all duration-200"
                  :class="selectedIndex === i ? 'bg-second-2 shadow-[0_0_10px_rgba(70,152,235,0.62)]' : 'bg-transparent'"
                />
                <Image
                  sizes="120px"
                  :placeholder="[45, 10, 55, 70]"
                  :modifiers="{
                    aspectRatio: 1,
                    gravity: 'faceCenter',
                  }"
                  fit="fill"
                  format="webp"
                  :alt="member.name"
                  class="mx-auto size-16 rounded-full object-cover ring-2 ring-transparent transition-all duration-300"
                  :class="{ 'ring-second-2/70': selectedIndex === i }"
                  :src="member.img"
                />
                <p class="mt-1 truncate text-center text-[10px] opacity-75 transition-opacity duration-300 group-hover:opacity-100">
                  {{ member.nickname || member.name }}
                </p>
              </button>
            </div>
          </BetterScrollbar>
        </div>
      </div>
      <div
        v-else
        class="relative grid-live-now gap-4 pt-4"
      >
        <div class="aspect-20/28 md:aspect-20/26 opacity-0" />
        <div class="absolute top-[calc(50%+8px)] left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[245.5px] flex-col items-center justify-center gap-2 text-center text-xs max-sm:aspect-square sm:h-[230.88px] md:h-62.5 md:gap-3 md:text-sm lg:h-[270.55px] xl:h-[349.2px] 2xl:h-79.5">
          <Image class="mx-auto w-64 lg:w-72 max-w-[70%] md:max-w-[80%] aspect-5/4 object-contain" alt="No member profile videos" :src="`${$imgCDN}/assets/svg/web/no_data.svg`" sizes="320px" fit="fill" />
          <span class="mt-4 md:mt-5">{{ $t("data.nodata") }}</span>
        </div>
      </div>
    </div>
  </HomeContainer>
</template>
