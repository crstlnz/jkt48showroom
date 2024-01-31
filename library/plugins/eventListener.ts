class EventListener extends Map {
  el: HTMLElement
  constructor(element: HTMLElement) {
    super()
    this.el = element
  }

  add(event: keyof HTMLElementEventMap, fun: (...args: unknown[]) => unknown, useCapture = false) {
    if (this.has(event)) this.remove(event)
    this.set(event, { fun, useCapture })
    this.el.addEventListener(event, fun, useCapture)
    return this
  }

  remove(event: keyof HTMLElementEventMap) {
    const e = this.get(event)
    if (e) {
      this.el.removeEventListener(event, e.fun, e.useCapture)
      this.delete(event)
    }
    return this
  }

  removeAll() {
    for (const event of this.keys()) {
      this.remove(event)
    }
  }
}

export default EventListener
