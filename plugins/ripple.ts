import { convertDurationToMs } from '~/library/utils'

function click(ev: PointerEvent) {
  const button = ev.currentTarget as HTMLElement
  const circle = document.createElement('span')
  circle.classList.add('ripple')
  const buttonRect = button.getBoundingClientRect()
  const diameter = Math.max(buttonRect.width, buttonRect.height)
  const radius = diameter / 2
  const clickX = ev.clientX - buttonRect.left
  const clickY = ev.clientY - buttonRect.top
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${clickX - radius}px`
  circle.style.top = `${clickY - radius}px`
  circle.style.pointerEvents = 'none'
  button.appendChild(circle)
  const styles = window.getComputedStyle(circle)
  const animationDuration = styles.getPropertyValue('animation-duration')
  setTimeout(() => {
    circle.remove()
  }, convertDurationToMs(animationDuration))
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('ripple', {
    mounted(el) {
      el.style.position = 'relative'
      el.style.overflow = 'hidden'
      el.addEventListener('pointerdown', click)
    },
    beforeUnmount(el) {
      el.removeEventListener('pointerdown', click)
    },
  })
})
