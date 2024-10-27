<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel, Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { useFullscreen, useLocalStorage, useScreenOrientation } from '@vueuse/core'
import ShowroomBackground from '~~/library/canvas/showroom/background'
import ShowroomForeground from '~~/library/canvas/showroom/foreground'
import { StageShowroom } from '~~/library/canvas/showroom/stage'
import { useSelectedUser } from '~/store/selectedUser'

const props = defineProps<{
  dataId: string
  memberImage: string
  date: ILiveDate
  background: string
  screenshot?: Live.Screenshots
  stageList: IStageList[]
  users: IFansCompact[]
  giftData: LogDetail.ShowroomGiftData
}>()
const { $avatarURL, $giftUrl } = useNuxtApp()
const stageList = ref(props.stageList)
const users = new Map<number, IFansCompact>()
const filteredUsers = props.users.filter(i => props.stageList[0]?.list?.some(a => a === i.id) || false)
for (const user of filteredUsers) {
  users.set(user.id, user)
}
const stageTime = ref({
  start: props.date?.start ? new Date(props.date.start).getTime() : null,
  end: props.date?.end ? new Date(props.date.end).getTime() : null,
})
const container = ref<HTMLElement | null>(null)
const stCanvas = ref<HTMLCanvasElement | null>(null)
const bgCanvas = ref<HTMLCanvasElement | null>(null)
const fgCanvas = ref<HTMLCanvasElement | null>(null)

const showSlider = ref(false)
const sliderVal = ref(1000)
const stage = new StageShowroom()
const showScreenshot = useLocalStorage('showScreenshot', true)
const isAnimated = useLocalStorage('enableAnimation', true)
const foreground = new ShowroomForeground()
const background = new ShowroomBackground(props.memberImage, showScreenshot.value)

const { user } = useAuth()

const { isSupported, orientation, lockOrientation, unlockOrientation } = useScreenOrientation()
const { isFullscreen, toggle } = useFullscreen(container)

watch(showScreenshot, (val) => {
  background.screenshots.setShowScreenshot(val)
})

watch(isAnimated, (val) => {
  if (val) {
    stage.start()
  }
  else {
    stage.stop()
  }
})

const stageListFetch = ref(false)

const selectedTime = computed(() => {
  const percent = Number(sliderVal.value) / 1000
  const range = (stageTime?.value?.end ?? 0) - (stageTime?.value?.start ?? 0)
  return (stageTime?.value?.start ?? 0) + range * percent
})

watch(selectedTime, async () => {
  if (!stageListFetch.value) {
    stageListFetch.value = true
    try {
      const data = await $apiFetch<IStageListApi>(`/api/recent/${props.dataId}/stagelist`)
      stageList.value = data.stage_list as IStageList[]
      for (const user of data.users || []) {
        users.set(user.id, user)
      }
    }
    catch {
      stageListFetch.value = false
    }
  }
})

const stageNum = computed(() => {
  const time = selectedTime.value
  for (const [i, stage] of stageList.value?.entries() ?? []) {
    if (new Date(stage.date).getTime() >= time) {
      return i
    }
  }
  return (stageList.value?.length - 1) || 0
})

function getFansRankList(): IUIStageFans[] {
  if (!stageList.value?.length) return []
  return stageList.value[stageNum.value].list.map<IUIStageFans>((i) => {
    const fans = users.get(i)
    return {
      id: i,
      name: fans?.name ?? 'Not Found!',
      avatar: $avatarURL(fans?.avatar_id ?? 1),
      isCurrentUser: String(user.value?.id || -1) === String(fans?.id || -2),
    }
  })
}

watch(selectedTime, (time) => {
  background.setDate(time)
})

const timeout = ref<NodeJS.Timeout>()
watch(stageNum, () => {
  if (timeout.value) clearTimeout(timeout.value)
  timeout.value = setTimeout(() => {
    setFansRankingList()
    // stage.setFans(getFansRankList())
  }, 50)
})

const podiumGifts = computed<IPodiumGift[]>(() => {
  const gifts: IPodiumGift[] = []
  for (const fansGift of props?.giftData?.log ?? []) {
    for (const gift of fansGift.gifts) {
      const g = props?.giftData?.list.find(i => gift.id === i.id)
      if (g && (g.point >= 10000)) {
        for (let i = 0; i < gift.num; i++) {
          gifts.push({
            ...g,
            img: $giftUrl(g.id),
            date: new Date(gift.date).getTime(),
          })
        }
      }
    }
  }
  return gifts
})

function setFansRankingList() {
  stage.setFans(getFansRankList())
  // let userRanks = user?.id ? ranks.findIndex(i => String(i.id) === user.id) + 1 : 101
  // if (userRanks <= 0) userRanks = 101
  // console.log('USER RANK', userRanks)
  // // background.setUserPosition(userRanks)
}

onMounted(() => {
  if (!stCanvas.value || !bgCanvas.value || !fgCanvas.value) throw new Error('Canvas not found!')
  stage.setAnimated(isAnimated.value)
  stage.inject(stCanvas.value)
  // stage.setFans(getFansRankList())
  setFansRankingList()
  background.inject(bgCanvas.value)
  background.loadBackground(props.background)
  background.setPodiumGifts(podiumGifts.value)
  background.screenshots.set(props.screenshot!)
  background.setDate(selectedTime.value)
  foreground.inject(fgCanvas.value)
})

onBeforeUnmount(() => {
  stage.destroy()
  background.destroy()
  foreground.destroy()
})

const { userClick, hide } = useSelectedUser()
useEventListener(container, 'click', (e: MouseEvent) => {
  if (isFullscreen.value) return
  if ((e.target as HTMLElement)?.id !== 'canvasControl') return hide()
  const rect = stCanvas.value!.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * stCanvas.value!.width
  const y = ((e.clientY - rect.top) / rect.height) * stCanvas.value!.height
  const userId = stage.getClickedUser(x, y)
  if (userId) {
    userClick(e, userId)
  }
  else {
    hide()
  }
})

const { width, height } = useWindowSize()
const isLandscape = computed(() => {
  const aspetRatio = 16 / 13
  if (width.value / height.value > aspetRatio) {
    return true
  }
  return false
})

async function toggleFullscreen() {
  if (!isFullscreen.value) {
    const o = orientation.value
    await toggle()
    if (['portrait-primary', 'portrait-secondary', 'portrait'].includes(o ?? '')) {
      if (isSupported.value) {
        await lockOrientation('landscape-primary').catch((_e) => {
          return null
        })
      }
    }
  }
  else {
    unlockOrientation()
    await toggle()
  }
}

const focused = useWindowFocus()

watch(focused, (isFocus) => {
  if (!stage.isAnimated) return
  if (isFocus) {
    stage.unpause()
  }
  else {
    stage.pause()
  }
})

const { locale } = useI18n()
</script>

<template>
  <div class="h-full w-full">
    <div
      id="sr-container"
      ref="container"
      class="relative h-full w-full select-none [&>canvas]:absolute [&>canvas]:left-0 [&>canvas]:top-0"
      :class="{
        '[&>canvas]:left-1/2 [&>canvas]:h-full [&>canvas]:-translate-x-1/2': !isFullscreen || isLandscape,
        '[&>canvas]:top-1/2  [&>canvas]:w-full [&>canvas]:-translate-y-1/2': isFullscreen && !isLandscape,
        '!bg-black': isFullscreen,
      }"
    >
      <canvas ref="bgCanvas" class="pointer-events-none" width="1920" height="1080">Your browser does not support the canvas element.</canvas>
      <canvas ref="stCanvas" class="pointer-events-none" width="1920" height="1080">Your browser does not support the canvas element.</canvas>
      <canvas ref="fgCanvas" class="pointer-events-none" width="1920" height="1080">Your browser does not support the canvas element.</canvas>
      <div
        id="canvasControl"
        class="absolute inset-0 flex flex-col justify-end px-3 py-2.5 text-xl md:px-4 md:py-3.5 md:text-2xl"
      >
        <div
          class="pointer-events-none relative flex items-center gap-2.5 text-white md:gap-3.5 [&>button]:pointer-events-auto [&>button]:select-none [&>button]:rounded-md [&>button]:p-1 hover:[&>button]:bg-gray-300/25 [&_button]:flex"
        >
          <button aria-label="Show Slider" type="button" @click="showSlider = !showSlider">
            <Icon
              :class="{
                '-rotate-180': showSlider,
              }"
              name="ph:caret-down-bold"
              class="transition-transform duration-[250ms]"
            />
          </button>
          <div
            :class="{
              'pointer-events-none invisible translate-y-[120%] opacity-0': !showSlider,
              'pointer-events-auto visible': showSlider,
            }"
            class="relative flex flex-1 items-center transition-[transform,visibility,opacity] duration-[300ms]"
          >
            <div
              class="absolute bottom-[calc(100%_+_5px)] text-xs font-bold md:text-sm"
              :class="{ 'lg:!text-2xl': isFullscreen }"
            >
              {{ $dayjs(selectedTime).locale(locale).format("LLLL") }}
            </div>
            <input
              id="timeslider"
              v-model="sliderVal"
              type="range"
              min="0"
              max="1000"
              class="w-full cursor-pointer"
            >
          </div>
          <Popover class="pointer-events-auto">
            <PopoverButton aria-label="Setting" class="rounded-md p-1 hover:bg-gray-300/25">
              <Icon name="ph:gear-six-fill" />
            </PopoverButton>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-2 translate-x-1 opacity-0"
              enter-to-class="translate-y-0 translate-x-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 translate-x-x opacity-100"
              leave-to-class="translate-y-2 translate-x-1 opacity-0"
            >
              <PopoverPanel class="absolute bottom-[calc(100%_+_8px)] right-2 rounded-md bg-[rgba(28,28,28,.9)]">
                <div class="flex flex-col py-1.5 text-base">
                  <SwitchGroup>
                    <div role="button" class="flex hover:bg-gray-300/25">
                      <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-4 py-2.5">
                        {{
                          $t("srview.btn.animation")
                        }}
                        <Switch
                          v-model="isAnimated"
                          :class="isAnimated ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 items-center rounded-full"
                        >
                          <span class="sr-only">{{ $t("srview.tips.animation") }}</span>
                          <span
                            :class="isAnimated ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 rounded-full bg-white transition"
                          />
                        </Switch>
                      </SwitchLabel>
                    </div>
                  </SwitchGroup>
                  <SwitchGroup>
                    <div role="button" class="flex hover:bg-gray-300/25">
                      <SwitchLabel class="flex flex-1 cursor-pointer select-none justify-between gap-3 px-4 py-2.5">
                        {{
                          $t("srview.btn.showscreenshot")
                        }}
                        <Switch
                          v-model="showScreenshot"
                          :class="showScreenshot ? 'bg-blue-600' : 'bg-gray-200'"
                          class="relative inline-flex h-6 w-11 items-center rounded-full"
                        >
                          <span class="sr-only">{{ $t("srview.tips.ss") }}</span>
                          <span
                            :class="showScreenshot ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 rounded-full bg-white transition"
                          />
                        </Switch>
                      </SwitchLabel>
                    </div>
                  </SwitchGroup>
                </div>
              </PopoverPanel>
            </Transition>
          </Popover>
          <button aria-label="Fullscreen" type="button" @click="toggleFullscreen">
            <Icon v-if="!isFullscreen" name="tabler:maximize" />
            <Icon v-else name="tabler:minimize" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
