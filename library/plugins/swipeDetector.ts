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
  constructor(x: number, y: number, mode = "down") {
    this.startX = x;
    this.startY = y;
    this.startTime = new Date();
    this.otherMaxDist = 100; // maximum distance other axis
    this.minSpeed = 80; // minimal speed for valid swipe in pixel per 100ms
    this.mode = this.getMode(mode);
  }

  setSpeed(num: number) {
    this.minSpeed = num;
  }

  getMode(mod: string) {
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

  getDistanceY(y: number) {
    return y - this.startY;
  }

  getDistanceX(x: number) {
    return x - this.startX;
  }

  getSpeed(x: number, y: number) {
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

  getOtherDiff(x: number, y: number) {
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

  finish(x: number, y: number) {
    const speed = this.getSpeed(x, y); // speed in pixer per 100ms
    return this.getOtherDiff(x, y) <= this.otherMaxDist && speed >= this.minSpeed;
  }
}

export default SwipeDetector;
