import { useWindowScroll } from '@vueuse/core'

interface InfiniteScrollOpts {
  distance?: number
}

export default function (onload: () => any | Promise<any>, opts: InfiniteScrollOpts = {}) {
  const { y } = useWindowScroll()
  const distance = opts.distance ?? 10
  watch(y, (val) => {
    checkTrigger(val)
  })

  async function checkTrigger(val: number | null = null) {
    if (import.meta.client) {
      if ((val ?? y.value) >= document.documentElement.scrollHeight - window.innerHeight - distance) {
        await onload()
      }
    }
  }
  onMounted(() => setTimeout(() => checkTrigger(), 500))
  return { checkTrigger }
}
