import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export default function () {
  const { greaterOrEqual, smallerOrEqual } = useBreakpoints({ ...breakpointsTailwind, extra: 1700 })
  const isLarge = greaterOrEqual('2xl')
  const isSmall = smallerOrEqual('sm')
  const { $device } = useNuxtApp()
  const isMobile = $device.isMobile
  return { isLarge, isSmall, isMobile, greaterOrEqual, smallerOrEqual }
}
