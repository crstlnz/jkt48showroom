<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { LazyImage } from '#components'
import { useSelectedUser } from '~/store/selectedUser'

const divId = ref(0)
const { userId, isHidden, position } = storeToRefs(useSelectedUser())

const padding = 20
const cursorPadding = 40
const userContainer = ref<HTMLElement>()

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { width: containerWidth, height: containerHeight } = useElementSize(userContainer)

const posX = ref(0)
const posY = ref(0)
function setPosition(x: number, y: number) {
  posX.value = clamp(0, windowWidth.value - containerWidth.value, x + cursorPadding, padding)
  posY.value = clamp(containerHeight.value, windowHeight.value, y + cursorPadding, padding)
  isHidden.value = false
}
defineExpose({ setPosition })

const { data: userData, pending, error, refresh } = await useApiFetch<ShowroomAPI.UserProfile>(() => `/api/showroom/user/profile?user_id=${userId.value}`, { lazy: true, server: false, immediate: false })

watch(position, (v) => {
  if (v) {
    setPosition(v.x, v.y)
  }
})

watch(userId, () => {
  if (process.client) {
    refresh()
  }
})

const isDrag = ref(false)
const isSlide = ref(false)
const dragPos = ref({ x: 0, y: 0 })

const lastPos = {
  x: 0,
  y: 0,
  t: 0,
}

const speed = {
  x: 0,
  y: 0,
}
const { pause, resume } = useRafFn(() => {
  const deltaT = performance.now() - lastPos.t
  speed.x = speed.x / 1.2
  speed.y = speed.y / 1.2
  posX.value = clamp(0, windowWidth.value - containerWidth.value, posX.value + speed.x * deltaT)
  posY.value = clamp(containerHeight.value, windowHeight.value, posY.value + speed.y * deltaT)
  if (Math.abs(speed.x) < 0.00001 && Math.abs(speed.y) < 0.00001) isSlide.value = false
  lastPos.t = performance.now()
}, { immediate: false })

onClickOutside(userContainer, () => {
  isHidden.value = true
}, { ignore: ['.user-btn', '#sr-container'] })
const route = useRoute()

watch(route, () => {
  isHidden.value = true
})
const breakpoints = useBreakpoints(breakpointsTailwind)
const el = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(el)

watch(containerHeight, (height) => {
  if (height) {
    posY.value = clamp(height, windowHeight.value, posY.value, padding)
  }
})

watch(containerWidth, (width) => {
  if (width) {
    posX.value = clamp(0, windowWidth.value - width, posX.value, padding)
  }
})

function startDrag(e: MouseEvent) {
  if (e.button !== 0) return
  if ((e.target as HTMLElement).classList.contains('disable-drag')) return
  e.preventDefault()
  lastPos.x = e.clientX
  lastPos.y = e.clientY
  lastPos.t = performance.now()
  isDrag.value = true
  dragPos.value = {
    x: e.clientX,
    y: e.clientY,
  }
  document.onpointermove = dragging
  document.onpointerup = stopDrag
}

function clamp(min: number, max: number, num: number, pad = 0) {
  return Math.max(min + pad, Math.min(num, max - pad))
}

watch(isDrag, (drag) => {
  if (drag) isSlide.value = false
})

watch(isSlide, (slide) => {
  if (!slide) pause()
  resume()
})

function stopDrag(e: MouseEvent) {
  e.preventDefault()
  isDrag.value = false
  isSlide.value = true
  document.onpointerup = null
  document.onpointermove = null
  window.onscroll = null

  const deltaX = e.clientX - lastPos.x
  const deltaY = e.clientY - lastPos.y
  const deltaT = performance.now() - lastPos.t
  lastPos.t = performance.now()
  speed.x = deltaX / deltaT
  speed.y = deltaY / deltaT
}

function dragging(e: MouseEvent) {
  requestAnimationFrame((t) => {
    e.preventDefault()
    lastPos.x = e.clientX
    lastPos.y = e.clientY
    lastPos.t = t
    posX.value = clamp(0, windowWidth.value - containerWidth.value, posX.value - (dragPos.value.x - e.clientX))
    posY.value = clamp(containerHeight.value, windowHeight.value, posY.value - (dragPos.value.y - e.clientY))
    dragPos.value = {
      x: e.clientX,
      y: e.clientY,
    }
  })
}

watch(windowWidth, (v, old) => {
  const percent = posX.value / old
  posX.value = v * percent
  isLocked.value = breakpoints.isSmallerOrEqual('md') && !isHidden.value
})

watch(isHidden, (hidden) => {
  if (!hidden) {
    if (breakpoints.isSmallerOrEqual('md')) {
      isLocked.value = true
    }
    divId.value++
  }
  else {
    isLocked.value = false
  }
})

onMounted(() => {
  if (userId.value) {
    refresh()
    setPosition(position.value?.x ?? 0, position.value?.y ?? 0)
  }
  el.value = document.body
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0 scale-90"
      leave-to-class="opacity-0 scale-90"
      enter-active-class="transition-[opacity] duration-300"
      leave-active-class="transition-[opacity] duration-300"
    >
      <div
        v-if="userId && !isHidden"
        id="user-draggable"
        :key="divId"
        ref="userContainer"
        :class="{
          'invisible opacity-0': userId == null || isHidden,
        }"
        :style="{
          left: `${posX}px`,
          bottom: `${windowHeight - posY}px`,
        }"
        class="fixed z-notification transition-all duration-[350ms] ease-out max-md:inset-0 max-md:!bottom-0 max-md:!left-0"
        @pointerdown="startDrag"
      >
        <div class="absolute -inset-40 bg-black/40 md:hidden" @click="isHidden = true" />
        <div class="md:max-w-[3 00px] min-w-[280px] max-w-[95vw] rounded-3xl bg-white p-5 shadow-2xl drop-shadow-2xl dark:bg-dark-3 max-md:fixed max-md:!bottom-1/2 max-md:!left-1/2 max-md:-translate-x-1/2 max-md:translate-y-1/2 lg:max-w-[400px]">
          <div class="mb-2 flex justify-end">
            <button type="button" aria-label="Close" class="disable-drag" @click="isHidden = true">
              <Icon name="ph:x-bold" class="pointer-events-none" />
            </button>
          </div>
          <div v-if="pending" class="mb-6 flex animate-pulse flex-col items-center gap-4">
            <div class="aspect-square w-32 rounded-full bg-gray-300 dark:bg-dark-2/80 lg:w-36" />
            <div class="h-8 w-32 rounded-md bg-gray-300 dark:bg-dark-2/80" />
            <div class="flex flex-wrap gap-2 text-lg font-semibold">
              <div :href="$fansProfileURL(userId)" class="inline-block h-8 w-[104px] rounded-sm bg-blue-500 text-sm leading-8 text-white" />
            </div>
          </div>
          <div v-else-if="error" class="w-[210px] space-y-10 px-5">
            <img :src="`${$cloudinaryURL}/assets/svg/web/error.svg`" class="h-full px-2 pt-3" alt="Not found">
            <div class="pb-5 text-center">
              {{ $t('data.notfound') }}
            </div>
          </div>
          <div v-else-if="userData" class="mb-6 flex flex-col items-center gap-4">
            <div class="relative aspect-square w-32 lg:w-36">
              <LazyImage :alt="`${userData.name} profile picture`" class="h-full w-full overflow-hidden rounded-full" :src="userData.image" />
              <img :src="userData.avatar_url" class="absolute -bottom-2 -right-4 aspect-square w-16">
            </div>
            <div class="disable-drag flex flex-col gap-2 text-center">
              <div class="disable-drag text-2xl font-semibold">
                {{ userData.name }}
              </div>
              <div v-if="userData.description" class="disable-drag text-sm font-light">
                {{ userData.description }}
              </div>
            </div>
            <div class="disable-drag flex flex-wrap gap-2 text-lg font-semibold">
              <a v-for="sns in (userData.sns_list ?? [])" :key="sns.url" :href="sns.url" target="_blank">
                <img :src="sns.icon" alt="SNS Icon" class="aspect-square h-8">
              </a>
              <a target="_blank" :href="$fansProfileURL(userId)" class="inline-block h-8 select-none rounded-sm bg-blue-500 px-4 text-sm leading-8 text-white">{{ $t('viewprofile') }}</a>
            </div>
          </div>
          <div v-else class="w-[210px] space-y-10 px-5">
            <img :src="`${$cloudinaryURL}/assets/svg/web/ufo.svg`" class="h-full px-2 pt-2" alt="Not found">
            <div class="pb-5 text-center">
              {{ $t('data.notfound') }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
