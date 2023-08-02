<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { clamp } from '../library/utils/index'

interface Size {
  width: number
  height: number
}
interface ElementSpace {
  left: number
  right: number
  top: number
  bottom: number
  rect: DOMRect
}

interface Position {
  x: number
  y: number
  rect?: DOMRect
}

const props = withDefaults(
  defineProps<{
    offset?: number
  }>(),
  {
    offset: 10,
  },
)
const pos = ref<Position>({ x: 0, y: 0 })
type ToolTipType = 'left' | 'right' | 'top' | 'bottom'
const type = ref<ToolTipType>('top')
const container = ref<HTMLElement | null>(null)
const { width, height } = useWindowSize()
const isOpen = ref(false)
const tooltip = ref<HTMLElement | null>(null)
function onClick() {
  if (!isOpen.value) return open()
  close()
}
function open() {
  isOpen.value = true
  if (container.value && window) {
    const remainingSpace = getRemainingSpace(container.value)
    nextTick(() => {
      if (tooltip.value) {
        const { width, height } = tooltip.value.getBoundingClientRect()
        const result = calculatePosition(remainingSpace, { width, height })
        pos.value = result
      }
    })
  }
}

function calculatePosition(space: ElementSpace, size: Size): Position {
  return {
    x: clamp(0, width.value - size.width, space.rect.left + space.rect.width / 2 - size.width / 2),
    y: clamp(0, height.value - size.height, space.rect.top - size.height - props.offset - 10), // 10 is chat arrow size
    rect: space.rect,
  }
}

function close() {
  isOpen.value = false
}
onMounted(() => {
  function onScroll() {
    close()
  }

  let unlisten: any
  watchEffect(() => {
    if (isOpen.value) {
      window.addEventListener('resize', onScroll)
      document.addEventListener('scroll', onScroll)
      unlisten = onClickOutside(tooltip, close, { ignore: [container] })
    }
    else {
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('scroll', onScroll)
      if (unlisten) unlisten()
    }
  })
})

function getRemainingSpace(el: HTMLElement): ElementSpace {
  const pos = el.getBoundingClientRect()
  if (window) {
    const { innerWidth: width, innerHeight: height } = window
    return {
      left: pos.left,
      top: pos.top,
      bottom: height - pos.bottom,
      right: width - pos.right,
      rect: pos,
    }
  }
  return { left: 0, right: 0, top: 0, bottom: 0, rect: pos }
}
</script>

<template>
  <button ref="container" class="inline-block" @click="onClick">
    <slot />
    <Transition name="fade">
      <div v-if="isOpen" ref="tooltip" class="fixed" :style="{ left: `${pos.x}px`, top: `${pos.y}px` }">
        <div class="bg-container relative rounded-xl shadow-rounded after:left-2" :style="{}">
          <slot name="tooltip" />
          <div
            :style="{
              left: `${(pos.rect?.left ?? 0) - pos.x + ((pos.rect?.width ?? 0) / 2)}px`,
            }" class="speech-pointer-bottom"
          />
        </div>
      </div>
    </Transition>
    <!-- <button ref="container" :class="class" class="inline-block" @click="onClick">
      <slot />
    </button> -->
  </button>
</template>
