import CanvasUtil from "../canvasUtil";
import { FansAvatar, FansRankings } from "./StageFans";
import stagePositions from "./StagePosition";
import calculationTime from "~~/library/utils/calculationTime";
class StageShowroom extends CanvasUtil {
  fansRanks: FansRankings;
  lastDraw: number;
  deltaTime: number;
  time: number;
  speed: number;
  isAnimated: boolean;
  isPaused: boolean;

  constructor(isAnimated = true) {
    super();
    this.time = 0;
    this.lastDraw = 0;
    this.speed = 0.0015;
    this.isAnimated = isAnimated;
  }

  pause() {
    this.isPaused = true;
  }

  setAnimated(val) {
    this.isAnimated = val;
  }

  getClickedUser(x, y): number | null {
    if (!this.fansRanks) return null;
    const padding = 5;
    const size = this.width * FansAvatar.defaultSize + padding;
    for (const fans of this.fansRanks.ranks) {
      if (x > fans.x - size / 2 && x < fans.x + size / 2 && y > fans.y - size && y < fans.y) {
        return fans.id;
      }
    }
    return null;
  }

  unpause() {
    this.isPaused = false;
    this.lastDraw = performance.now() / 1000;
    this.requestDraw();
  }

  stop() {
    this.setAnimated(false);
  }

  start() {
    this.setAnimated(true);
    this.requestDraw();
  }

  async setFans(fans: IStageFans[]) {
    calculationTime(() => this.fansRanks?.set(fans), "Fans Rank");
  }

  inject(canvas: HTMLCanvasElement): void {
    super.inject(canvas);
    this.fansRanks = new FansRankings(this);
    this.requestDraw();
  }

  draw(time: number = 0) {
    this.clear();
    this.setDeltaTime(time);
    this.fansRanks.draw(this.deltaTime);
    if (this.isAnimated && !this.isPaused) requestAnimationFrame((time) => this.draw(time));
  }

  setDeltaTime(time: number) {
    time = time / 1000;
    this.deltaTime = time - this.lastDraw;
    this.lastDraw = time;
  }
}

export { stagePositions, StageShowroom, FansAvatar };
