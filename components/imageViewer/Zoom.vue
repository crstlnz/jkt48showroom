<script lang="ts" setup>
import { DragGesture, Gesture, rubberbandIfOutOfBounds } from '@use-gesture/vanilla'
import { animate, spring } from 'popmotion'

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
let releaseAnimation: any
let releaseZoomAnimation: any
const gestureListener = ref<Gesture>()
const bgOpacity = ref(1)
const minZoom = 1
const maxZoom = 5
const isExit = ref(false)
function getScaleFactor() {
  return Math.min(windowWidth.value / imageSize.value.width, windowHeight.value / imageSize.value.height)
}

onMounted(() => {
  if (!container.value) return
  // to prevent macbook trackpad pinch gesture
  document.addEventListener('gesturestart', e => e.preventDefault())
  document.addEventListener('gesturechange', e => e.preventDefault())
  gestureListener.value = new Gesture(
    container.value,
    {
      // onWheel(state) {
      //   let velocity
      //   if (zoomAnimation) {
      //     velocity = zoomAnimation.velocity
      //     console.log('NAH VELOCITY', velocity)
      //     zoomAnimation.stop()
      //   }
      //   const scaleFactor = Math.min(windowWidth.value / imageSize.value.width, windowHeight.value / imageSize.value.height)
      //   zoomState.value = Math.min(maxZoom, Math.max(minZoom, zoomState.value + state.delta[1] / 500))
      //   const width = imageSize.value.width * scaleFactor * zoomState.value
      //   const height = imageSize.value.height * scaleFactor * zoomState.value
      //   const maxX = Math.max(0, (width - windowWidth.value) / 2 / zoomState.value)
      //   const maxY = Math.max(0, (height - windowHeight.value) / 2 / zoomState.value)
      //   console.log('zom', zoomState.value + state.delta[1] / 500)
      //   console.log('zom2', zoomState.value)

      //   pos.value.x = Math.min(maxX, Math.max(pos.value.x, -maxX))
      //   pos.value.y = Math.min(maxY, Math.max(pos.value.y, -maxY))
      //   rubberPos.value = {
      //     ...pos.value,
      //   }
      //   // const target = Math.min(maxZoom, Math.max(minZoom, zoomState.value + state.delta[1]))
      //   // console.log('Target', target, 'Scroll', zoomState.value + state.delta[1], state.delta[1])
      //   // zoomAnimation = animate({
      //   //   from: zoomState.value,
      //   //   to: target,
      //   //   restDelta: 0,
      //   //   onUpdate(v) {
      //   //     zoomState.value = v
      //   //     console.log(zoomState.value)
      //   //   },
      //   // })
      // },
      onPinch(state) {
        const scaleFactor = getScaleFactor()
        if (releaseZoomAnimation) {
          releaseZoomAnimation.stop()
        }
        // zoomState.value = Math.min(maxZoom, Math.max(minZoom, state.offset[0]))
        if (state.pinching) {
          zoomState.value = state.offset[0]
          const width = imageSize.value.width * scaleFactor * zoomState.value
          const height = imageSize.value.height * scaleFactor * zoomState.value
          const maxX = Math.max(0, (width - windowWidth.value) / 2 / zoomState.value)
          const maxY = Math.max(0, (height - windowHeight.value) / 2 / zoomState.value)
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
          console.log('wew')
        }
      },
      onDrag(state) {
        if (isExit.value) return
        const scaleFactor = getScaleFactor()
        const width = imageSize.value.width * scaleFactor * zoomState.value
        const height = imageSize.value.height * scaleFactor * zoomState.value
        const maxX = Math.max(0, (width - windowWidth.value) / 2 / zoomState.value)
        const maxY = Math.max(0, (height - windowHeight.value) / 2 / zoomState.value)
        const x = pos.value.x + state.delta[0] / zoomState.value
        const y = pos.value.y + state.delta[1] / zoomState.value
        // state.event.preventDefault()
        // const x = state.delta[0] === 0 ? pos.value.x : rubberbandIfOutOfBounds(pos.value.x + state.delta[0], 0, 0, 0.19)
        // const y = state.delta[1] === 0 ? pos.value.y : rubberbandIfOutOfBounds(pos.value.y + state.delta[1], 0, 0, 0.19)
        if (state.down) {
          // pos.value.x = Math.min(maxX, Math.max(pos.value.x + x, -maxX))
          // pos.value.y = Math.min(maxY, Math.max(pos.value.y + y, -maxY))
          pos.value.x = x
          pos.value.y = y
          // pos.value.x = pos.value.x + state.delta[0]
          // pos.value.y = pos.value.y + state.delta[1]
          if (releaseAnimation) {
            releaseAnimation.stop()
          }
          rubberPos.value = {
            x: zoomState.value === 1 ? 0 : rubberbandIfOutOfBounds(pos.value.x, -maxX, maxX, 0.18),
            y: zoomState.value === 1 ? pos.value.y : rubberbandIfOutOfBounds(pos.value.y, -maxY, maxY, 0.18),
          }
          // rubberPos.value = {
          //   x: rubberbandIfOutOfBounds(pos.value.x, 0, 0, 0.16),
          //   y: rubberbandIfOutOfBounds(pos.value.y, 0, 0, 0.19),
          // }
        }
        else {
          const percentY = Math.abs(rubberPos.value.y / windowHeight.value * 100)
          if (zoomState.value === 1 && percentY > 35) {
            isExit.value = true
            animate({
              from: 1,
              to: 0,
              onUpdate(v) {
                bgOpacity.value = v
              },
            })
            releaseAnimation = animate({
              from: rubberPos.value,
              to: {
                x: 0,
                y: rubberPos.value.y > 0 ? windowHeight.value : -windowHeight.value,
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
        pinchOnWheel: true,
        rubberband: true,
        // preventDefault: true,
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
  if (gestureListener.value) {
    gestureListener.value.destroy()
  }
})
</script>

<template>
  <div
    ref="container"
    class="fixed inset-0 w-screen z-aboveNav bg-black/90 imageViewer !pointer-events-auto"
    :style="{
      opacity: bgOpacity,
      pointerEvents: isExit ? 'none' : 'auto',
    }"
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
  // transition-property: scale;
  // transition-duration: 0.3s;
  // transition-timing-function: ease-out;
}
</style>
