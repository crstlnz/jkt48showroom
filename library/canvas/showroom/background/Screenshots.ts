import CanvasUtil from "../canvasUtil";
import config from "~/config";
import ShowroomBackground from ".";
const { cloudinaryURL } = config;

class ScreenshotManager {
  list: Map<number, HTMLImageElement>;
  ids: number[];
  id: number; // picked ss id
  screenshot: HTMLImageElement; // picked ss
  parent: ShowroomBackground;
  processId: number;
  showScreenshot: boolean;
  folder: string;
  format: string;
  defaultImage: HTMLImageElement;
  isLoaded: boolean;

  constructor(parent: ShowroomBackground, defaultImage: string, showScreenshot: boolean) {
    this.list = new Map();
    this.ids = [];
    this.parent = parent;
    this.processId = 0;
    this.showScreenshot = showScreenshot;
    this.isLoaded = false;
    this.loadDefaultImage(defaultImage);
  }

  setShowScreenshot(val: boolean) {
    if (val) {
      if (!this.isLoaded) this.loadScreenshots(true);
      this.showScreenshot = true;
    } else {
      this.showScreenshot = false;
    }
    this.parent.requestDraw();
  }

  set(screenshots: IScreenshotData) {
    this.folder = screenshots.folder;
    this.format = screenshots.format;
    this.list.clear();
    this.ids = [...screenshots.list];
    if (this.showScreenshot) this.loadScreenshots();
  }

  loadDefaultImage(src: string) {
    this.defaultImage = CanvasUtil.createImageCallback(
      src,
      () => {
        if (!this.showScreenshot) {
          this.parent.requestDraw();
        }
      },
      () => {}
    );
  }

  loadScreenshots(setSS = false) {
    this.isLoaded = true;
    for (const id of this.ids) {
      const url = `${cloudinaryURL}${this.folder}/${id}.${this.format}`;
      this.list.set(
        id,
        CanvasUtil.createImageCallback(url, () => {
          if (id === this.id) {
            if (setSS) this.screenshot = this.list.get(this.id);
            this.parent.requestDraw();
          }
        })
      );
    }
  }

  async setDate(date: number) {
    this.processId++;
    const processId = this.processId;
    const num = this.ids.length;
    for (let i = 0; i < num; i++) {
      if (this.processId !== processId) return;
      if (this.ids[i] <= date) {
        this.id = this.ids[i];
        this.screenshot = this.list.get(this.id);
        if (this.screenshot?.complete) this.parent.requestDraw();
      }
    }
  }

  draw() {
    const size = {
      width: this.parent.width * 0.34,
      height: this.parent.height * 0.34,
    };
    const pos = {
      x: this.parent.width * 0.5 - size.width / 2,
      y: this.parent.height * 0.25695 - size.height / 2,
    };
    if (this.showScreenshot && this.screenshot) {
      this.parent.ctx.drawImage(this.screenshot, pos.x, pos.y, size.width, size.height);
    } else {
      this.parent.ctx.drawImage(this.defaultImage, pos.x, pos.y, size.width, size.height);
    }
  }
}

export default ScreenshotManager;
