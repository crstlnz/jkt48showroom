import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export default function () {
  const { greaterOrEqual, smallerOrEqual } = useBreakpoints({ ...breakpointsTailwind, extra: 1700 })
  const isLarge = greaterOrEqual('2xl')
  const isMD = greaterOrEqual('md')
  const isSmall = smallerOrEqual('sm')
  const { isMobile } = useDevice()
  return { isLarge, isMD, isSmall, isMobile, greaterOrEqual, smallerOrEqual }
}
