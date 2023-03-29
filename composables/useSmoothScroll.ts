import { MaybeRef, get } from '@vueuse/core'

export default function (scrollElement : MaybeRef<HTMLElement | null>) {
  let currentAnimationId = 0
  function isMotionReduced () {
    return matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
     * It scrolls to a target position on the page, with a smooth animation
     * @param {number} scrollTargetY - The target scrollY property of the window
     * @param [maxDuration=800] - The maximum duration of the animation in milliseconds.
     */

  // easeInOutSine
  function ease (x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2
  }

  function smoothScroll (scrollTargetY: number, maxDuration = 800) {
    const getEl = get(scrollElement)
    if (!getEl) return
    console.log('MASOK')
    const el = getEl
    currentAnimationId++
    const id = currentAnimationId

    let animationFrameId: number
    let currentTime = 0
    const speed = 1000
    const scrollPos = el?.scrollTop ?? 0
    const derivedSpeed = (isMotionReduced() ? speed * 3 : speed)
    const time = Math.max(
      0.1,
      Math.min(Math.abs(scrollPos - scrollTargetY) / derivedSpeed, maxDuration / 1000)
    )

    function runAnimation () {
      cancelAnimationFrame(animationFrameId)
      if (id !== currentAnimationId) return
      currentTime += 1 / 60
      const p = currentTime / time
      if (p < 1) {
        const t = ease(p)
        animationFrameId = requestAnimationFrame(runAnimation)
        el.scrollTo(0, scrollPos + (scrollTargetY - scrollPos) * t)
      } else {
        el.scrollTo(0, scrollTargetY)
      }
    }
    runAnimation()
  }

  function cancel () {
    currentAnimationId++
  }

  return { smoothScroll, cancel }
}
