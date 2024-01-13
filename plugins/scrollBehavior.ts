import type { RouteLocationNormalized, RouterScrollBehavior } from 'vue-router'

type ScrollPosition = Awaited<ReturnType<RouterScrollBehavior>>

export default defineNuxtPlugin((nuxtApp) => {
  useRouter().options.scrollBehavior = (
    to: any,
    from: any,
    savedPosition: any,
  ) => {
    let position: ScrollPosition = savedPosition || undefined
    if (
      !position
      && from
      && to
      && to.meta.scrollToTop !== false
      && _isDifferentRoute(from, to)
    ) {
      position = { left: 0, top: 0 }
    }

    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 }
      }

      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) }
      }

      // if (from.fullPath === to.fullPath || to.path === to.fullPath) return { left: 0, top: 0, behavior: 'smooth' }
      if (from.fullPath === to.fullPath) return { left: 0, top: 0, behavior: 'smooth' }
    }

    return new Promise((resolve) => {
      nuxtApp.hooks.hook('page:transition:finish', async () => {
        await nextTick()
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash) }
        }
        resolve(position)
      })
    })
  }
})

function _getHashElementScrollMarginTop(selector: string): number {
  const element = document.querySelector(selector)
  if (element) {
    return Number.parseFloat(getComputedStyle(element).scrollMarginTop)
  }
  return 0
}

function _isDifferentRoute(
  a: RouteLocationNormalized,
  b: RouteLocationNormalized,
): boolean {
  const samePageComponent = a.matched[0] === b.matched[0]
  if (!samePageComponent) {
    return true
  }
  return (
    samePageComponent && JSON.stringify(a.params) !== JSON.stringify(b.params)
  )
}
