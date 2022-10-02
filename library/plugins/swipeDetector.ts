enum Modes {
  DOWN,
  UP,
  RIGHT,
  LEFT,
}
class SwipeDetector {
  startX: number;
  startY: number;
  startTime: Date;
  otherMaxDist: number;
  minSpeed: number;
  mode: Modes;
  constructor(x, y, mode = "down") {
    this.startX = x;
    this.startY = y;
    this.startTime = new Date();
    this.otherMaxDist = 100; // maximum distance other axis
    this.minSpeed = 80; // minimal speed for valid swipe in pixel per 100ms
    this.mode = this.getMode(mode);
  }

  setSpeed(num) {
    this.minSpeed = num;
  }

  getMode(mod) {
    let m = 1;
    switch (mod) {
      case "right":
        m = Modes.RIGHT;
        break;
      case "up":
        m = Modes.UP;
        break;
      case "left":
        m = Modes.LEFT;
        break;
      default:
        m = Modes.DOWN;
        break;
    }
    return m;
  }

  getDistanceY(y) {
    return y - this.startY;
  }

  getDistanceX(x) {
    return x - this.startX;
  }

  getSpeed(x, y) {
    let distance = 0;
    switch (this.mode) {
      case Modes.LEFT:
        distance = this.getDistanceX(x) * -1;
        break;
      case Modes.RIGHT:
        distance = this.getDistanceX(x);
        break;
      case Modes.UP:
        distance = this.getDistanceY(y) * -1;
        break;
      case Modes.DOWN:
        distance = this.getDistanceY(y);
        break;
    }
    return (distance / (new Date().getTime() - this.startTime.getTime())) * 100;
  }

  getOtherDiff(x, y) {
    let diff = 0;
    switch (this.mode) {
      case Modes.LEFT:
        diff = Math.abs(this.startY - y);
        break;
      case Modes.RIGHT:
        diff = Math.abs(this.startY - y);
        break;
      case Modes.UP:
        diff = Math.abs(this.startX - x);
        break;
      case Modes.DOWN:
        diff = Math.abs(this.startX - x);
        break;
    }

    return diff;
  }

  finish(x, y) {
    const speed = this.getSpeed(x, y); // speed in pixer per 100ms
    return this.getOtherDiff(x, y) <= this.otherMaxDist && speed >= this.minSpeed;
  }
}

export default SwipeDetector;
