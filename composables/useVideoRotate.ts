import { get, useLocalStorage } from '@vueuse/core'

export default function (videoDimens: MaybeRef<{ width: number, height: number }>, containerDimens?: MaybeRef<{ width: number, height: number }>) {
  const enableRotate = useLocalStorage<boolean>('rotate_feature_v1', () => false)
  const rotation = ref(0)
  const videoScale = ref(1)

  function rotate() {
    if (!enableRotate.value) return
    rotation.value += 90
    calculateVideoSize()
  }

  function reset() {
    rotation.value = 0
    calculateVideoSize()
  }

  function calculateVideoSize() {
    const dimens = get(videoDimens)
    const cDimens = containerDimens ? get(containerDimens) : null
    if (!dimens.height || !dimens.width) return videoScale.value = 1
    if ((rotation.value / 90) % 2 !== 0) {
      // miring
      if (cDimens) {
        const mode1 = cDimens.height > cDimens.width ? cDimens.height / cDimens.width : cDimens.width / cDimens.height
        const mode2 = dimens.height < dimens.width ? dimens.height / dimens.width : dimens.width / dimens.height
        videoScale.value = cDimens.width > cDimens.height ? mode1 : mode2
        // videoScale.value = dimens.height < dimens.width ? dimens.height / dimens.width : dimens.width / dimens.height
      }
      else {
        videoScale.value = dimens.height < dimens.width ? dimens.height / dimens.width : dimens.width / dimens.height
      }
    }
    else {
      // normal
      videoScale.value = 1
    }
  }

  return { rotate, rotation, reset, videoScale, isRotateFeatureEnabled: enableRotate }
}
