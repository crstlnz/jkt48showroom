import CanvasUtil from "../canvasUtil";
import { StageShowroom } from ".";
import stagePositions from "./StagePosition";
import calculationTime from "~~/library/utils/calculationTime";

class FansRankings {
  ranks: FansAvatar[];
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  parent: StageShowroom;
  processId: number;
  constructor(context: StageShowroom) {
    this.processId = 0;
    this.canvas = context.canvas;
    this.ctx = context.ctx;
    this.parent = context;
    this.ranks = [];
    const onload = () => {
      if (!this.parent.isAnimated) this.parent.draw();
    };

    for (let i = 0; i < 100; i++) {
      const pos = stagePositions[i];
      const fansAva = new FansAvatar(pos[0] * this.canvas.width, pos[1] * this.canvas.height);
      fansAva.avatar.onload = onload;
      fansAva.avatar.onerror = onload;
      this.ranks.push(fansAva);
    }
  }

  draw(deltaTime: number) {
    if (!this.ranks.length) return;
    this.ctx.save();
    for (let i = 12; i >= 0; i--) {
      const fans = this.ranks[i];
      if (!fans) return;
      fans.draw(this.ctx, deltaTime, this.parent.isAnimated);
    }
    for (let i = 13; i < 100; i++) {
      const fans = this.ranks[i];
      if (!fans) return;
      fans.draw(this.ctx, deltaTime, this.parent.isAnimated);
    }
    this.ctx.restore();
  }

  async set(stageFans: IStageFans[]) {
    this.processId++;
    const processId = this.processId;
    for (let i = 0; i < 100; i++) {
      if (this.processId !== processId) return;
      const fans = stageFans[i];
      const fansAvatar = this.ranks[i];
      if (fans) {
        if (fansAvatar.id === fans.id) continue;
        fansAvatar.setId(fans.id, fans.name).setAvatarSrc(fans.avatar);
        const nameBox = await FansAvatar.generateUsername(fans.name, i, this.canvas.width);
        if (this.processId !== processId) return;
        fansAvatar.setNameBox(nameBox, this.parent);
      } else {
        const name = fansAvatar.name;
        fansAvatar.setId(null, null).clearAvatar();
        if (!this.parent.isAnimated) this.parent.requestDraw();
        console.log(name, fansAvatar.nameBox);
      }
    }
  }
}

class FansAvatar {
  id: number;
  name: string;
  x: number;
  y: number;
  rotation: number;
  maxRotation: number;
  avatar?: HTMLImageElement;
  nameBox?: HTMLImageElement;
  boxMargin: number;
  size: number;
  time: number;
  speed: number;
  // drawAvatar: (ctx: CanvasRenderingContext2D) => void;

  static defaultSize = 0.0625; // percent on canvas width
  static fontSize = 16;
  static nameBoxPos = 0.8; // 80% on top of avatar
  static boxOpacity = 0.35;
  static namePadding = 0.2;

  constructor(x: number, y: number) {
    this.rotation = 0;
    this.maxRotation = 6;
    this.x = x;
    this.y = y;
    this.size = 0;
    this.time = Math.random() * 10;
    this.speed = 0.1 * 16 + Math.random() * 0.1;
    this.avatar = new Image();
    this.nameBox = new Image();
    // this.drawAvatar = () => {};
  }

  setId(id, name = null) {
    this.id = id;
    this.name = name;
    return this;
  }

  setNameBox(nameBox: HTMLImageElement, parent: StageShowroom) {
    this.nameBox = nameBox;
    if (!parent.isAnimated) parent.requestDraw();
  }

  // setGeneratedAvatar(generatedAvatar: HTMLImageElement | HTMLCanvasElement) {
  //   this.nameBox = null;
  //   this.avatar?.remove();
  //   this.avatar = generatedAvatar;
  //   this.drawAvatar = this.drawGeneratedAvatar.bind(this);
  //   return this;
  // }
  setAvatarSrc(src: string) {
    this.avatar.src = src;
    return this;
  }

  setNameBoxSrc(src) {
    this.nameBox.src = src;
    return this;
  }

  // setAvatar(avatar: HTMLImageElement, nameBox: HTMLImageElement) {
  //   this.avatar?.remove();
  //   this.avatar = avatar;
  //   this.nameBox = nameBox;
  //   this.drawAvatar = this.drawAvatarImage.bind(this);
  //   this.boxMargin = nameBox.height * FansAvatar.nameBoxPos;
  //   return this;
  // }

  clearAvatar() {
    this.avatar.src = "";
    this.nameBox?.remove();
    this.nameBox = null;
  }

  draw(ctx, deltaTime: number = 0, isAnimated: boolean) {
    if (!this.avatar) return;
    this.time += deltaTime * this.speed;
    this.rotation = this.maxRotation * Math.sin(this.time);
    ctx.setTransform(1, 0, 0, 1, this.x, this.y);
    if (isAnimated) ctx.rotate(((this.rotation ?? 0) * Math.PI) / 180);
    this.drawAvatar(ctx);
  }

  drawAvatar(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.avatar, -this.avatar.width / 2, -this.avatar.height);
    if (!this.nameBox) return;
    ctx.drawImage(
      this.nameBox,
      -this.nameBox.width / 2,
      -this.avatar.height - this.nameBox.height * FansAvatar.nameBoxPos
    );
  }
  // drawGeneratedAvatar(ctx: CanvasRenderingContext2D) {
  //   ctx.drawImage(this.avatar, -this.avatar.width / 2, -this.avatar.height);
  // }

  // drawAvatarImage(ctx: CanvasRenderingContext2D) {
  //   ctx.drawImage(this.avatar, -this.avatar.width / 2, -this.avatar.height);
  //   ctx.drawImage(this.nameBox, -this.nameBox.width / 2, -this.avatar.height - this.boxMargin);
  // }

  static generateBoxSize(
    name: string,
    ctx: CanvasRenderingContext2D,
    size: number
  ): { width: number; height: number; name: string } {
    const padding = size * FansAvatar.namePadding;
    const maxBoxW = size + padding; // maximal username box width
    let boxW = maxBoxW; // dynamic based on name
    const boxH = size * 0.33; // username box
    // calculate box width and cut name if overflow
    ctx.font = "bold " + FansAvatar.fontSize + "px Arial";
    const measure = (u) => ctx.measureText(u).width;
    if (measure(name) + padding > maxBoxW) {
      while (measure(name) + padding > maxBoxW) name = name.slice(0, name.length - 1);
    } else {
      boxW = measure(name) + padding;
      if (boxW < 80) boxW = 80;
    }
    return {
      width: boxW,
      height: boxH,
      name,
    };
  }

  static async generate(
    avaUrl: string,
    name: string = "",
    rank: number,
    canvasWidth: number,
    generateImage = true
  ): Promise<HTMLImageElement | HTMLCanvasElement> {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    const size = FansAvatar.defaultSize * canvasWidth;
    const { width: boxW, height: h, name: cuttedName } = FansAvatar.generateBoxSize(name, ctx, size);
    let boxH = rank <= 13 ? h * 1.5 : h;
    const width = Math.max(size, boxW);
    const marginTop = boxH * FansAvatar.nameBoxPos; // margin for username box;
    const height = size + marginTop;
    canvas.width = width;
    canvas.height = height;
    const avaImg = await calculationTime(() => CanvasUtil.createImage(avaUrl));
    if (avaImg) ctx.drawImage(avaImg, width / 2 - size / 2, height - size, size, size);
    ctx.fillStyle = "black";
    ctx.globalAlpha = FansAvatar.boxOpacity;
    ctx.fillRect(width / 2 - boxW / 2, 0, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold " + FansAvatar.fontSize + "px Arial";
    ctx.fillText(cuttedName, width / 2, rank <= 13 ? h + (h / 2) * 0.1 : h / 2);
    if (rank <= 13) {
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = "bold " + (FansAvatar.fontSize + 1) + "px Arial";
      ctx.fillStyle = "#F2F20D";
      ctx.fillText(rank + "位", width / 2, h / 2);
    }
    if (generateImage) {
      return await CanvasUtil.createImage(canvas.toDataURL("image/jpg"));
    }
    return canvas;
  }

  // only generate Username Box
  static generateUsername(name: string = "", rank: number, canvasWidth: number): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
      const size = FansAvatar.defaultSize * canvasWidth;
      const { width, height: h, name: cuttedName } = FansAvatar.generateBoxSize(name, ctx, size);
      let height = rank <= 13 ? h * 1.5 : h;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "black";
      ctx.globalAlpha = FansAvatar.boxOpacity;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      ctx.textBaseline = "middle";
      if (rank <= 13) {
        ctx.textAlign = "center";
        ctx.font = "bold " + (FansAvatar.fontSize + 1) + "px Arial";
        ctx.fillStyle = "#F2F20D";
        ctx.fillText(rank + 1 + "位", width / 2, h / 2);
      }
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = "bold " + FansAvatar.fontSize + "px Arial";
      ctx.fillText(cuttedName, width / 2, rank <= 13 ? h + (h / 2) * 0.1 : h / 2);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = canvas.toDataURL("image/jpg");
    });
  }
}

export { FansAvatar, FansRankings };
