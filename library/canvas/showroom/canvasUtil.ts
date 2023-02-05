class CanvasUtil {
  canvas?: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D | null
  animationId!: number | 0

  get height (): number {
    return this.canvas?.height ?? 0
  }

  get width (): number {
    return this.canvas?.width ?? 0
  }

  inject (canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
  }

  static createImage (src: string, cross = false): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      if (cross) { image.crossOrigin = '*' }
      image.onload = () => resolve(image)
      image.onerror = e => reject(e)
      image.src = src
    })
  }

  static createImageCallback (
    src: string,
    onload: (() => unknown) | null = null,
    onerror: (() => unknown) | null = null
  ): HTMLImageElement {
    const image = new Image()
    image.onload = onload
    image.onerror = onerror
    image.src = src
    return image
  }

  draw (_time = 0) {
    throw new Error('No draw function!')
  }

  requestDraw () {
    if (this.animationId) { cancelAnimationFrame(this.animationId) }
    this.animationId = requestAnimationFrame(time => this.draw(time))
  }

  clear () {
    this.ctx?.clearRect(0, 0, this.width, this.height)
  }
}

export default CanvasUtil
