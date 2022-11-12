import ShowroomBackground from "./index";

class PodiumGift {
  x: number;
  y: number;
  date: number;
  img: HTMLImageElement;

  static size = 0.08;

  constructor(
    img: HTMLImageElement,
    date: number,
    giftAreaSize: ShowroomBackground["giftAreaSize"],
    giftAreaPos: ShowroomBackground["giftAreaPos"]
  ) {
    this.x = giftAreaPos.x - giftAreaSize.width / 2 + Math.random() * giftAreaSize.width;
    this.y = giftAreaPos.y - giftAreaSize.height / 2 + Math.random() * giftAreaSize.height;
    this.img = img;
    this.date = date;
  }

  draw(ctx) {
    const size = ctx.canvas.width * PodiumGift.size;
    ctx.drawImage(this.img, this.x - size / 2, this.y - size, size, size);
  }
}

export default PodiumGift;
