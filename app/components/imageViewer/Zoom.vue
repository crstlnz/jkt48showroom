<script lang="ts" setup>
import { Gesture, rubberbandIfOutOfBounds } from '@use-gesture/vanilla'
import { animate } from 'popmotion'

const props = defineProps<{
  image: ImageViewerOptions
}>()
const emit = defineEmits<{ (e: 'exit'): void }>()
const container = ref()

const pending = ref(true)
const { width: windowWidth, height: windowHeight } = useWindowSize()
const error = ref<string | Error | Event | null>(null)
const imageSize = ref({
  width: 0,
  height: 0,
})
onMounted(() => {
  const img = new Image()
  pending.value = true
  error.value = null
  img.onload = () => {
    pending.value = false
    imageSize.value = {
      width: img.width,
      height: img.height,
    }
  }
  img.onerror = (e) => {
    pending.value = false
    error.value = e
  }

  img.src = props.image.src
})

const imageElement = ref<HTMLElement>()

const pos = ref({ x: 0, y: 0 })
const rubberPos = ref({ x: 0, y: 0 })
const zoomState = ref(1)
const gestureListener = ref<Gesture>()
const bgOpacity = ref(1)
const minZoom = 1
const maxZoom = 5
const isExit = ref(false)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getScaleFactor() {
  return Math.min(windowWidth.value / imageSize.value.width, windowHeight.value / imageSize.value.height)
}

function getBound(zoom = zoomState.value) {
  const scaleFactor = getScaleFactor()
  const width = imageSize.value.width * scaleFactor * zoom
  const height = imageSize.value.height * scaleFactor * zoom
  return {
    x: Math.max(0, (width - windowWidth.value) / 2 / zoom),
    y: Math.max(0, (height - windowHeight.value) / 2 / zoom),
  }
}

let releaseAnimation: any
let releaseZoomAnimation: any
let wheelZoomAnimation: any
let wheelPositionAnimation: any

function onWheel(event: WheelEvent) {
  if (isExit.value || pending.value || error.value) return
  event.preventDefault()

  if (releaseZoomAnimation) releaseZoomAnimation.stop()
  if (wheelZoomAnimation) wheelZoomAnimation.stop()
  if (wheelPositionAnimation) wheelPositionAnimation.stop()

  const factor = Math.exp(-event.deltaY * 0.003)
  const nextZoom = clamp(zoomState.value * factor, minZoom, maxZoom)
  const bound = getBound(nextZoom)
  const nextPosition = nextZoom === minZoom
    ? { x: 0, y: 0 }
    : {
        x: clamp(rubberPos.value.x, -bound.x, bound.x),
        y: clamp(rubberPos.value.y, -bound.y, bound.y),
      }

  wheelZoomAnimation = animate({
    from: zoomState.value,
    to: nextZoom,
    duration: 120,
    onUpdate(value) {
      zoomState.value = value
    },
  })

  wheelPositionAnimation = animate({
    from: rubberPos.value,
    to: nextPosition,
    duration: 120,
    onUpdate(value) {
      pos.value = { ...value }
      rubberPos.value = { ...value }
    },
  })
}

function preventDefault(e: Event) {
  e.preventDefault()
}
onMounted(() => {
  if (!container.value) return
  // to prevent macbook trackpad pinch gesture
  document.addEventListener('gesturestart', preventDefault)
  document.addEventListener('gesturechange', preventDefault)
  gestureListener.value = new Gesture(
    container.value,
    {
      onPinch(state) {
        if (releaseZoomAnimation) {
          releaseZoomAnimation.stop()
        }
        if (state.pinching) {
          zoomState.value = state.offset[0]
          const bound = getBound()
          const { x: maxX, y: maxY } = bound
          pos.value.x = Math.min(maxX, Math.max(pos.value.x, -maxX))
          pos.value.y = Math.min(maxY, Math.max(pos.value.y, -maxY))
          rubberPos.value = {
            ...pos.value,
          }
        }
        else {
          releaseZoomAnimation = animate({
            from: zoomState.value,
            to: state.offset[0],
            onUpdate(v) {
              zoomState.value = v
            },
          })
        }
      },
      onDrag(state) {
        if (isExit.value) return
        const bound = getBound()
        const { x: maxX, y: maxY } = bound
        const x = pos.value.x + state.delta[0] / zoomState.value
        const y = pos.value.y + state.delta[1] / zoomState.value
        if (state.down) {
          pos.value.x = x
          pos.value.y = y
          if (releaseAnimation) {
            releaseAnimation.stop()
          }
          rubberPos.value = {
            x: zoomState.value === 1 ? 0 : rubberbandIfOutOfBounds(pos.value.x, -maxX, maxX, 0.18),
            y: rubberbandIfOutOfBounds(pos.value.y, -maxY, maxY, zoomState.value === 1 ? 0.165 : 0.18),
          }
        }
        else {
          const percentY = Math.abs(pos.value.y / windowHeight.value * 100)
          if (zoomState.value === 1 && percentY > 25) {
            isExit.value = true
            animate({
              from: 1,
              to: 0,
              onUpdate(v) {
                bgOpacity.value = v
              },
            })
            animate({
              from: zoomState.value,
              to: 0.65,
              onUpdate(val) {
                zoomState.value = val
              },
            })
            releaseAnimation = animate({
              from: rubberPos.value,
              to: {
                x: 0,
                y: 0,
              },
              velocity: state.velocity[1],
              onUpdate(val) {
                pos.value = { ...val }
                rubberPos.value = { ...val }
              },
              onComplete() {
                emit('exit')
              },
              onStop() {
                emit('exit')
              },
            })
          }
          else {
            releaseAnimation = animate({
              from: {
                x: rubberPos.value.x,
                y: rubberPos.value.y,
              },
              to: {
                x: Math.min(maxX, Math.max(rubberPos.value.x, -maxX)),
                y: Math.min(maxY, Math.max(rubberPos.value.y, -maxY)),
              },
              onUpdate(val) {
                pos.value = { ...val }
                rubberPos.value = { ...val }
              },
            })
          }
        }
      },
    },
    {
      pinch: {
        eventOptions: {
          passive: false,
        },
        preventDefault: true,
        scaleBounds: {
          min: minZoom,
          max: maxZoom,
        },
        pinchOnWheel: false,
        rubberband: true,
      },
      drag: {
        eventOptions: {
          passive: false,
        },
        preventDefault: true,
      },
    },
  )
})

onBeforeUnmount(() => {
  document.removeEventListener('gesturestart', preventDefault)
  document.removeEventListener('gesturechange', preventDefault)
  if (gestureListener.value) {
    gestureListener.value.destroy()
  }
})
</script>

<template>
  <div
    ref="container"
    class="fixed inset-0 w-screen z-aboveNav imageViewer pointer-events-auto!"
    :style="{
      opacity: bgOpacity,
      pointerEvents: isExit ? 'none' : 'auto',
    }"
    @wheel="onWheel"
  >
    <div
      ref="imageElement"
      class="size-full object-contain pointer-events-none imageElement"
      :style="{
        scale: zoomState,
        transform: `translate(${rubberPos.x}px,${rubberPos.y}px)`,
        backgroundImage: `url(${image?.src})`,
      }"
      :src="image?.src"
      :alt="image?.alt"
    />
    <button
      type="button"
      class="absolute right-0 top-0 m-4"
      @click="$emit('exit')"
    >
      <Icon
        name="heroicons:x-mark-16-solid"
        class="hover:bg-white/10 rounded-full size-10 p-1 z-10 bg-black/25"
      />
    </button>
  </div>
</template>

<style lang="scss">
.imageViewer {
  touch-action: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  user-select: none;
}

.imageElement{
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}
</style>
