import EventEmitter from 'events'
import Listener from './eventListener'

class DragListener extends EventEmitter {
  touchMode: boolean
  el: HTMLElement
  listener: Listener
  constructor(el: HTMLElement, touchMode = true) {
    super()
    this.el = el
    this.touchMode = touchMode
    this.listener = new Listener(this.el)
    this.init()
  }

  onStart(e: any) {
    let x, y
    if (this.touchMode) {
      this.listener.add('touchmove', this.onMove.bind(this), false)
      this.listener.add('touchend', this.onEnd.bind(this), false)
      const touch = e.touches[0] || e.changedTouches[0]
      x = touch.clientX
      y = touch.clientY
    }
    else {
      this.listener.add('mousemove', this.onMove.bind(this), false)
      this.listener.add('mouseup', this.onEnd.bind(this), false)
      x = e.clientX
      y = e.clientY
    }
    this.emit('start', { x, y, e })
  }

  onMove(e: any) {
    let x, y
    if (this.touchMode) {
      const touch = e.touches[0] || e.changedTouches[0]
      x = touch.clientX
      y = touch.clientY
    }
    else {
      x = e.clientX
      y = e.clientY
    }
    this.emit('move', { x, y, e })
  }

  onEnd(e: any) {
    let x, y
    if (this.touchMode) {
      this.listener.remove('touchmove')
      this.listener.remove('touchend')
      const touch = e.touches[0] || e.changedTouches[0]
      x = touch.clientX
      y = touch.clientY
    }
    else {
      this.listener.remove('mousemove')
      this.listener.remove('mouseup')
      x = e.clientX
      y = e.clientY
    }
    this.emit('end', { x, y, e })
  }

  init() {
    if (this.touchMode) {
      this.listener.add('touchstart', this.onStart.bind(this), false)
    }
    else {
      this.listener.add('mousedown', this.onStart.bind(this), false)
    }
  }

  destroy() {
    try {
      this.listener.remove('touchstart')
      this.listener.remove('touchmove')
      this.listener.remove('touchend')
    }
    catch (e) {}
  }
}
export default DragListener
