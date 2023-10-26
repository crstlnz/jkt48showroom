import config from '~~/app.config'
import SwipeDetector from '~~/library/plugins/swipeDetector'
import DragListener from '~~/library/plugins/dragListener'

export default defineNuxtPlugin(() => {
  type CurrencyType = 'jpy' | 'idr' | 'sr'
  return {
    provide: {
      fixCloudinary: (url: string, w: number | string = 300, h = 300) => {
        if (url?.includes('res.cloudinary.com/haymzm4wp/image/upload/v')) {
          const d = url.split('upload/')
          if (typeof w === 'string') {
            return d.join(`upload/${w}/`)
          }
          else {
            return d.join(`upload/c_fit,c_fill,g_face,h_${h},w_${w},f_auto/`)
          }
        }
        return url
      },
      createSwipeDetector: (x: number, y: number, mode?: string): SwipeDetector => new SwipeDetector(x, y, mode),
      createDragListener: (el: unknown): DragListener => new DragListener(el),
      ...config,
      currency(num: number, type: CurrencyType = 'sr') {
        const { n: $n } = useI18n()
        if (type === 'sr') {
          return `${$n(num)} G`
        }
        else {
          if (type === 'jpy') return $n(num / 1.1, 'currency', 'ja-JP')
          return $n(num * 105.5, 'currency', 'id-ID')
        }
      },
    },
  }
})
