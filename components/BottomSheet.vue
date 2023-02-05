<script lang="ts" setup>
import { DynamicScroller } from 'vue-virtual-scroller'
import { onClickOutside, useEventListener } from '@vueuse/core'
import type DragListener from '~~/library/plugins/dragListener'
import type SwipeDetector from '~~/library/plugins/swipeDetector'
const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    items?: any[]
    sizeDependencies?: string
  }>(),
  {
    id: 'bottomSheet',
    title: '',
    items: () => [],
    sizeDependencies: ''
  }
)

const { $device, $createDragListener, $createSwipeDetector } = useNuxtApp()
const isOpen = ref(false)
const isDrag = ref(false)
const background = ref(null)
const dragBody = ref<DragListener | null>(null)
const dragNavbar = ref<DragListener | null>(null)
const navbar = ref<HTMLElement | null>(null)
const sheet = ref<HTMLElement | null>(null)
const scroller = ref<typeof DynamicScroller | null>(null)
let setState: (_state: boolean) => void
if ($device.isMobile) {
  const { state: openState, setState: setFun } = useQueryState(props.id)
  setState = setFun
  watch(openState, (state) => {
    if (state) { openSheet() } else { closeSheet() }
  })
}

useEventListener(background, 'touchmove', evt => evt.preventDefault())
const cleanup = ref<any>(undefined)
watch(isOpen, (open) => {
  nextTick(() => {
    if (open) {
      cleanup.value = onClickOutside(sheet, () => close(), { ignore: [ignore] })
      return startListener()
    } else if (cleanup.value) { cleanup.value() }
    return stopListener()
  })
})

function listenDrag () {
  if (navbar.value && sheet.value) {
    let swipeDetector: SwipeDetector
    let percent = 0
    dragNavbar.value = $createDragListener(navbar.value)
    dragNavbar.value?.on('start', ({ x, y, e }) => {
      e.stopPropagation()
      if (e.cancelable) { e.preventDefault() }
      isDrag.value = true
      swipeDetector = $createSwipeDetector(x, y)
    })
    dragNavbar.value?.on('move', ({ x, y }) => {
      if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
        finishDrag(x, y, percent, swipeDetector)
      } else {
        const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0
        percent = (deltaY / (sheet.value?.clientHeight ?? 0)) * 100
        percent = percent < 0 ? 0 : percent
        if (sheet.value) { sheet.value.style.transform = `translateY(${percent}%)` }
      }
    })
    dragNavbar.value?.on('end', ({ x, y }) => {
      finishDrag(x, y, percent, swipeDetector)
    })
  }
}

function finishDrag (x: number, y: number, percent: number, swipeDetector: SwipeDetector) {
  isDrag.value = false
  const isSwipe = swipeDetector ? swipeDetector.finish(x, y) : false
  if (percent > 40 || isSwipe) { return close() }

  if (sheet.value) { sheet.value.style.transform = 'none' }
}

function startListener () {
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
          if (e.cancelable) { e.preventDefault() }
          isDrag.value = true
          swipeDetector = $createSwipeDetector(x, y)
        } else if (y <= 0 || x <= 0 || x >= window.innerWidth || y >= window.innerHeight) {
          finishDrag(x, y, percent, swipeDetector)
        } else {
          const deltaY = swipeDetector ? swipeDetector.getDistanceY(y) : 0
          percent = (deltaY / (sheet.value?.clientHeight ?? 0)) * 100
          if (percent >= 0) {
            isDragging = true
            if (e.cancelable) { e.preventDefault() }
            if (sheet.value) { sheet.value.style.transform = `translateY(${percent}%)` }
          } else if (isDragging) {
            if (e.cancelable) { e.preventDefault() }
          } else {
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

function stopListener () {
  if (dragBody.value) { dragBody.value.destroy() }
  if (dragNavbar.value) { dragNavbar.value.destroy() }
}

const ignore = ref<HTMLElement | null>(null)

function openSheet (el: HTMLElement | null = null) {
  ignore.value = el
  isOpen.value = true
}
function closeSheet () {
  isOpen.value = false
}

function open (el: HTMLElement | null = null) {
  if ($device.isMobile) { setState(true) } else { openSheet(el) }
}

function close () {
  if ($device.isMobile) { setState(false) } else { closeSheet() }
}

defineExpose({ open, close, isOpen })
</script>

<template>
  <div class="absolute">
    <transition name="sheet">
      <div v-if="isOpen">
        <div
          ref="background"
          class="visible md:invisible transform-[visibility] md:opacity-0 bg-black/30 dark:bg-black/60 fixed top-0 left-0 right-0 bottom-0 z-[500] !m-0 background"
        />

        <div
          ref="sheet"
          :class="{ 'transition-transform duration-[600]': !isDrag }"
          class="sheet-content !fixed w-full left-0 md:left-auto md:w-[450px] md:right-10 lg:right-20 bottom-0 max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-t-2xl ease-in-out z-[500] md:shadow-rounded touch-none"
        >
          <DynamicScroller
            ref="scroller"
            class="overflow-y-auto roundedscrollbar h-[80vh] bg-white dark:bg-dark-1 overscroll-contain"
            :class="{ 'no-scrollbar': $device.isMobile }"
            :items="items"
            :min-item-size="120"
            key-field="id"
          >
            <template #before>
              <div
                class="h-16 flex justify-between shadow-sm bg-white/80 dark:bg-dark-1/80 w-full backdrop-blur-md relative"
              >
                <div
                  v-if="$device.isMobile"
                  class="absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-14 bg-slate-400/40 dark:bg-dark-3/90 rounded-sm"
                />
                <h2 ref="navbar" class="px-5 text-xl font-bold leading-[4rem] select-none flex-1">
                  {{ title }}
                </h2>
                <button
                  v-if="!$device.isMobile"
                  ref="closeBtn"
                  type="button"
                  class="group px-5 disable-highlight scale-100 active:bg-slate-100 dark:active:bg-dark-2 transition-transform"
                  @click="close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-6 h-6 group-active:scale-90"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </template>

            <template #default="{ item, index, active }">
              <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[item[sizeDependencies ?? '']]"
                :data-index="index"
              >
                <slot :item="item" :index="index" />
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </div>
    </transition>
  </div>
</template>
