import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export default function () {
  const { greaterOrEqual, smallerOrEqual } = useBreakpoints({ ...breakpointsTailwind, extra: 1700 })
  let isLarge = ref(true)
  let isSmall = ref(false)
  const { isMobile } = useDevice()

  onMounted(() => {
    isLarge = greaterOrEqual('2xl')
    isSmall = smallerOrEqual('sm')
  })
  return { isLarge, isSmall, isMobile, greaterOrEqual, smallerOrEqual }
}
