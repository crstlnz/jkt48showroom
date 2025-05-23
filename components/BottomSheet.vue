<script lang="ts" setup>
import type { MaybeElementRef } from '@vueuse/core'
import type { DynamicScroller } from 'vue-virtual-scroller'
import type DragListener from '~~/library/plugins/dragListener'
import type SwipeDetector from '~~/library/plugins/swipeDetector'
import { breakpointsTailwind, onClickOutside, useBreakpoints, useEventListener } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    items?: any[]
    itemSize?: number
    ignore?: (MaybeElementRef | string)[]
  }>(),
  {
    id: 'bottomSheet',
    title: '',
    items: () => [],
    ignore: () => [],
  },
)
const { isSmallerOrEqual } = useBreakpoints(breakpointsTailwind)
const { $createDragListener, $createSwipeDetector } = useNuxtApp()
const $device = useDevice()
const isOpen = ref(false)
const isDrag = ref(false)
const background = ref(null)
const dragBody = ref<DragListener | null>(null)
const dragNavbar = ref<DragListener | null>(null)
const navbar = ref<HTMLElement | null>(null)
const sheet = ref<HTMLElement | null>(null)
const scroller = ref<InstanceType<typeof DynamicScroller> | null>(null)
const windowEl = ref()
const isLocked = useScrollLock(windowEl)
const ignore = ref<HTMLElement | null>(null)

// let setState: (_state: boolean) => void
// if ($device.isMobile) {
//   const { state: openState, setState: setFun } = useQueryState(props.id)
//   setState = setFun
//   watch(openState, (state) => {
//     if (state) openSheet()
//     else { closeSheet() }
//   })
// }
const { onState, push, back } = usePopState<{ isOpen: boolean }>(props.id)
onState((state) => {
  isOpen.value = state?.isOpen ?? false
})

function open(el: HTMLElement | null = null) {
  ignore.value = el
  push({
    isOpen: true,
  })
  // isOpen.value = true
}
function close() {
  // isOpen.value = false
  back()
}

onMounted(() => {
  windowEl.value = document.body
})

useEventListener('resize', () => {
  if (isSmallerOrEqual('md') && isOpen.value === true) {
    isLocked.value = true
  }
  else {
    isLocked.value = false
  }
})

useEventListener(background, 'touchmove', evt => evt.preventDefault())
const cleanup = ref<any>(undefined)
watch(isOpen, (open) => {
  nextTick(() => {
    if (open) {
      if (isSmallerOrEqual('md')) {
        isLocked.value = true
      }
      cleanup.value = onClickOutside(sheet, () => close(), { ignore: [ignore, ...props.ignore] })
      return startListener()
    }
    else if (cleanup.value) {
      if (isSmallerOrEqual('md')) {
        isLocked.value = false
      }
      cleanup.value()
    }
    return stopListener()
  })
})

function listenDrag() {
  if (navbar.value && sheet.value) {
    let swipeDetector: SwipeDetector
    let percent = 0
    dragNavbar.value = $createDragListener(navbar.value)
    dragNavbar.value?.on('start', ({ x, y, e }) => {
      e.stopPropagation()
      if (e.cancelable) e.preventDefault()
      isDrag.value = true
      swipeDetector = $createSwipeDetector(x, y)
    })
    dragNavbar.value?.on('move', ({ x, y }) => {
      if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
        finishDrag(x, y, percent, swipeDetector)
      }
      else {
        const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0
        percent = (deltaY / (sheet.value?.clientHeight ?? 0)) * 100
        percent = percent < 0 ? 0 : percent
        if (sheet.value) sheet.value.style.transform = `translateY(${percent}%)`
      }
    })
    dragNavbar.value?.on('end', ({ x, y }) => {
      finishDrag(x, y, percent, swipeDetector)
    })
  }
}

function finishDrag(x: number, y: number, percent: number, swipeDetector: SwipeDetector) {
  isDrag.value = false
  const isSwipe = swipeDetector ? swipeDetector.finish(x, y) : false
  if (percent > 40 || isSwipe) return close()

  if (sheet.value) sheet.value.style.transform = 'none'
}

function startListener() {
  listenDrag()
  let percent = 0
  let swipeDetector: SwipeDetector
  if (scroller.value && sheet.value) {
    dragBody.value = $createDragListener(scroller.value.$el)
    let isScrolling = false
    let isDragging = false
    dragBody.value?.on('move', ({ x, y, e }) => {
      const isTop = scroller.value.$el.scrollTop === 0
      if (isTop && !isScrolling) {
        if (!isDrag.value) {
          if (e.cancelable) e.preventDefault()
          isDrag.value = true
          swipeDetector = $createSwipeDetector(x, y)
        }
        else if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
          finishDrag(x, y, percent, swipeDetector)
        }
        else {
          const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0
          percent = (deltaY / (sheet.value?.clientHeight ?? 0)) * 100
          if (percent >= 0) {
            isDragging = true
            if (e.cancelable) e.preventDefault()
            if (sheet.value) sheet.value.style.transform = `translateY(${percent}%)`
          }
          else if (isDragging) {
            if (e.cancelable) e.preventDefault()
          }
          else {
            isScrolling = true
            isDrag.value = false
          }
        }
      }
    })

    dragBody.value?.on('end', ({ x, y }) => {
      isScrolling = false
      isDragging = false
      finishDrag(x, y, percent, swipeDetector)
    })
  }
}

function stopListener() {
  if (dragBody.value) dragBody.value.destroy()
  if (dragNavbar.value) dragNavbar.value.destroy()
}

// function open(el: HTMLElement | null = null) {
//   if ($device.isMobile) setState(true)
//   else { openSheet(el) }
// }

// function close() {
//   if ($device.isMobile) setState(false)
//   else { closeSheet() }
// }

defineExpose({ open, close, isOpen })
</script>

<template>
  <div class="absolute">
    <Transition name="sheet">
      <div v-if="isOpen">
        <div
          ref="background"
          class="background visible fixed inset-0 z-aboveNav m-0! bg-black/30 dark:bg-black/60 md:invisible md:opacity-0"
        />

        <div
          ref="sheet"
          :class="{ 'transition-transform': !isDrag }"
          class="sheet-content fixed! bottom-0 left-0 z-aboveNav max-h-[90vh] w-full touch-none overflow-hidden rounded-t-3xl ease-in-out md:left-auto md:right-10 md:w-[450px] md:rounded-t-2xl md:shadow-rounded lg:right-20"
        >
          <RecycleScroller
            ref="scroller"
            class="roundedscrollbar h-[80vh] overflow-y-auto overscroll-contain bg-white dark:bg-dark-1"
            :class="{ 'no-scrollbar': $device.isMobile }"
            :items="items"
            :item-size="itemSize"
            key-field="id"
          >
            <template #before>
              <div
                class="relative flex h-16 w-full justify-between bg-white/80 shadow-2xs backdrop-blur-md dark:bg-dark-1/80"
              >
                <div
                  v-if="$device.isMobile"
                  class="absolute left-1/2 top-1.5 h-[3px] w-14 -translate-x-1/2 rounded-xs bg-slate-400/40 dark:bg-dark-3/90"
                />
                <h2 ref="navbar" class="flex-1 select-none px-5 text-xl font-bold leading-[4.5rem]">
                  {{ title }}
                </h2>
                <button
                  v-if="!$device.isMobile"
                  type="button"
                  class="group disable-highlight scale-100 px-5 transition-transform active:bg-slate-100 dark:active:bg-dark-2"
                  @click="close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="h-6 w-6 group-active:scale-90"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </template>

            <template #default="{ item, index }">
              <slot :item="item" :index="index" />
            </template>
          </RecycleScroller>
        </div>
      </div>
    </Transition>
  </div>
</template>
