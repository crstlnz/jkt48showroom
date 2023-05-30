import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export default function () {
  const { greaterOrEqual, smallerOrEqual } = useBreakpoints({ ...breakpointsTailwind, extra: 1700 })
  const isLarge = greaterOrEqual('2xl')
  const isMobile = smallerOrEqual('sm')
  return { isLarge, isMobile, greaterOrEqual, smallerOrEqual }
}
