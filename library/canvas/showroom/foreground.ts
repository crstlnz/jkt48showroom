import CanvasUtil from './canvasUtil'

class ShowroomForeground extends CanvasUtil {
  foreground?: HTMLImageElement | ImageBitmap | null

  override inject(canvas: HTMLCanvasElement) {
    super.inject(canvas)
    if (this.ctx) this.ctx.globalAlpha = 0.9
    this.loadForeground(
      'https://image.showroom-cdn.com/showroom-prod/assets/img/room/background/stand.png',
    )
  }

  destroy() {
    this.foreground = null
  }

  async loadForeground(src: string) {
    this.foreground = await CanvasUtil.createImage(src).catch(_e => null)
    this.requestDraw()
  }

  drawForeground() {
    if (this.foreground) {
      if (this.ctx) this.ctx.drawImage(this.foreground, 0, 0, this.width, this.height)
    }
  }

  override draw(_time?: number): void {
    this.drawForeground()
  }
}

export default ShowroomForeground
