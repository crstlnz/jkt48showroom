class EventListener extends Map {
  el: any;
  constructor(element) {
    super();
    this.el = element;
  }

  add(event, fun, useCapture = false) {
    if (this.has(event)) this.remove(event);
    this.set(event, { fun, useCapture });
    this.el.addEventListener(event, fun, useCapture);
    return this;
  }

  remove(event) {
    const e = this.get(event);
    if (e) {
      this.el.removeEventListener(event, e.fun, e.useCapture);
      this.delete(event);
    }
    return this;
  }

  removeAll() {
    for (const event of this.keys()) {
      this.remove(event);
    }
  }
}

export default EventListener;
