import EventEmitter from "events";
import Listener from "./eventListener";
enum state {
  IDLE,
  LOADING,
}

class InfiniteScroll extends EventEmitter {
  window: unknown;
  state: state;
  listener: Listener;
  trigger: number;
  lastScroll: number;
  checkAfterFinish: boolean;
  // emit load
  constructor(window) {
    super();
    this.window = window;
    this.state = state.IDLE;
    this.listener = new Listener(window);
    this.trigger = 85;
    this.lastScroll = window.scrollY;
    this.checkAfterFinish = true;
    this.start();
  }

  setTrigger(num) {
    this.trigger = num;
  }

  start() {
    this.listener.add("scroll", this.onScroll.bind(this));
    return this;
  }

  destroy() {
    this.listener.removeAll();
  }

  onScroll(e) {
    this.emit("scroll", { x: window.scrollX, y: window.scrollY, e });
    const last = this.lastScroll;
    this.lastScroll = window.scrollY;
    if (this.state === state.IDLE && last < this.lastScroll) {
      this.checkTrigger();
    }
  }

  setCheckAfterFinish(bool) {
    this.checkAfterFinish = bool;
  }

  checkTrigger() {
    const percent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (percent > this.trigger) {
      this.state = state.LOADING;
      this.emit("load");
    }
  }

  finishLoading() {
    this.state = state.IDLE;
    if (this.checkAfterFinish) {
      this.setCheckAfterFinish(false);
      this.checkTrigger();
    }
  }
}

export default InfiniteScroll;
