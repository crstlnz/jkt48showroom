import CanvasUtil from "../canvasUtil";
import PodiumGift from "./PodiumGifts";
import ScreenshotManager from "./Screenshots";

class ShowroomBackground extends CanvasUtil {
  background?: HTMLImageElement | null;
  ssId: number;
  screenshots: ScreenshotManager;
  podiumGifts: PodiumGift[];
  selectedPodiumGifts: PodiumGift[];
  giftAreaPos: {
    x: number;
    y: number;
  };

  giftAreaSize: {
    width: number;
    height: number;
  };

  processId: number;

  constructor(defaultImage: string, showScreenshot: boolean) {
    super();
    this.processId = 0;
    this.screenshots = new ScreenshotManager(
      this,
      defaultImage,
      showScreenshot
    );
    this.ssId = 0;
    this.processId = 0;
    this.podiumGifts = [];
    this.selectedPodiumGifts = [];
    this.giftAreaPos = { x: 0, y: 0 };
    this.giftAreaSize = {
      width: 0,
      height: 0,
    };
  }

  inject(canvas: HTMLCanvasElement) {
    super.inject(canvas);
    this.giftAreaSize = {
      width: this.canvas?.width ?? 0 * 0.34,
      height: this.canvas?.height ?? 0 * 0.048,
    };
    this.giftAreaPos = {
      x: this.canvas?.width ?? 0 * 0.5,
      y: this.canvas?.height ?? 0 * 0.49,
    };
  }

  setPodiumGifts(giftData: IPodiumGift[]) {
    this.podiumGifts = [];
    const map = new Map();
    for (const gift of giftData) {
      if (map.has(gift.id)) {
        this.podiumGifts.push(
          new PodiumGift(
            map.get(gift.id),
            gift.date,
            this.giftAreaSize,
            this.giftAreaPos
          )
        );
      } else {
        const img = new Image();
        img.onload = () => this.draw();
        img.src = gift.img;
        map.set(gift.id, img);
        this.podiumGifts.push(
          new PodiumGift(img, gift.date, this.giftAreaSize, this.giftAreaPos)
        );
      }
    }
  }

  setDate(date: number) {
    const ssId = this.screenshots.id;
    this.screenshots.setDate(date);
    const oldPodNum = this.selectedPodiumGifts?.length ?? 0;
    const podNum = this.filterPodiumGifts(date);
    if (oldPodNum === podNum && ssId === this.screenshots.id) return;
    this.requestDraw();
  }

  filterPodiumGifts(date: number) {
    const gift = this.podiumGifts.filter((i) => i.date <= date);
    this.selectedPodiumGifts = gift;
    return gift?.length ?? 0;
  }

  drawPodiumGifts() {
    if (this.selectedPodiumGifts)
      for (const gift of this.selectedPodiumGifts) {
        if (this.ctx) gift.draw(this.ctx);
      }
  }

  async loadBackground(src: string) {
    if (this.background) this.background.remove();
    this.background = await CanvasUtil.createImage(src).catch((_e) => null);
    this.requestDraw();
  }

  // setNotFound(val: boolean) {}

  drawBackground() {
    if (this.background && this.ctx)
      this.ctx.drawImage(this.background, 0, 0, this.width, this.height);
  }

  draw(_time?: number): void {
    this.clear();
    this.screenshots.draw();
    this.drawBackground();
    this.drawPodiumGifts();
  }
}

export default ShowroomBackground;
