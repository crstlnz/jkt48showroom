import { get, useLocalStorage } from '@vueuse/core'

export default function (videoDimens: MaybeRef<{ width: number, height: number }>) {
  const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)
  const rotation = ref(0)
  const videoScale = ref(1)

  function rotate() {
    if (!enableRotate.value) return
    rotation.value += 90
    calculateVideoSize()
  }

  function calculateVideoSize() {
    const dimens = get(videoDimens)
    if ((rotation.value / 90) % 2 !== 0) {
      // miring
      videoScale.value = dimens.height / dimens.width
    }
    else {
      // normal
      videoScale.value = 1
    }
  }

  return { rotate, rotation, videoScale, isRotateFeatureEnabled: enableRotate }
}
