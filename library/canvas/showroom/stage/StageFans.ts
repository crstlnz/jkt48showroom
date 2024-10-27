import type { StageShowroom } from '.'
import stagePositions from './StagePosition'

export class FansAvatar {
  id: number | undefined
  name: string | undefined
  x: number
  y: number
  rotation: number
  maxRotation: number
  avatar?: HTMLImageElement
  nameBox?: HTMLImageElement
  bg?: HTMLImageElement
  boxMargin: number
  size: number
  time: number
  speed: number
  isCurrentUser: boolean
  // drawAvatar: (ctx: CanvasRenderingContext2D) => void;

  static defaultSize = 0.0625 // percent on canvas width
  static fontSize = 16
  static nameBoxPos = 0.8 // 80% on top of avatar
  static boxOpacity = 0.35
  static namePadding = 0.2

  constructor(x: number, y: number) {
    this.rotation = 0
    this.maxRotation = 6
    this.x = x
    this.y = y
    this.size = 0
    this.time = Math.random() * 10
    this.speed = 0.1 * 16 + Math.random() * 0.1
    this.avatar = new Image()
    this.nameBox = new Image()
    this.boxMargin = 0
    this.isCurrentUser = false
  }

  setCurrentUser(val: boolean) {
    this.isCurrentUser = val
  }

  setBG(bg: HTMLImageElement) {
    this.bg = bg
  }

  setId(id: number, name: string | undefined = undefined) {
    this.id = id
    this.name = name
    return this
  }

  setNameBox(nameBox: HTMLImageElement, parent: StageShowroom) {
    this.nameBox = nameBox
    if (!parent.isAnimated) parent.requestDraw()
  }

  setAvatarSrc(src: string) {
    if (this.avatar) this.avatar.src = src
    return this
  }

  setNameBoxSrc(src: string) {
    if (this.nameBox) this.nameBox.src = src
    return this
  }

  clearAvatar() {
    if (this.avatar) this.avatar.src = ''

    this.nameBox?.remove()
    if (this.nameBox) this.nameBox = undefined
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime = 0, isAnimated: boolean) {
    if (!this.avatar) return
    this.time += deltaTime * this.speed
    this.rotation = this.maxRotation * Math.sin(this.time)
    ctx.setTransform(1, 0, 0, 1, this.x, this.y)
    if (isAnimated) ctx.rotate(((this.rotation ?? 0) * Math.PI) / 180)
    if (this.isCurrentUser && this.bg) {
      ctx.drawImage(this.bg, -(this.bg?.width / 1.5) / 2, -(this.bg.height / 1.5), this.bg.width / 1.5, this.bg.height / 1.5)
    }
    this.drawAvatar(ctx)
  }

  drawAvatar(ctx: CanvasRenderingContext2D) {
    if (!this.avatar) return
    ctx.drawImage(
      this.avatar,
      -(this.avatar?.width ?? 0) / 2,
      -(this.avatar.height ?? 0),
    )
    if (this.nameBox) {
      ctx.drawImage(
        this.nameBox,
        -this.nameBox.width / 2,
        -this.avatar.height - this.nameBox.height * FansAvatar.nameBoxPos,
      )
    }
  }

  static generateBoxSize(
    name: string,
    ctx: CanvasRenderingContext2D,
    size: number,
  ): { width: number, height: number, name: string } {
    const padding = size * FansAvatar.namePadding
    const maxBoxW = size + padding // maximal username box width
    let boxW = maxBoxW // dynamic based on name
    const boxH = size * 0.33 // username box
    // calculate box width and cut name if overflow
    ctx.font = `bold ${FansAvatar.fontSize}px Arial`
    const measure = (u: string) => ctx.measureText(u).width
    if (measure(name) + padding > maxBoxW) {
      while (measure(name) + padding > maxBoxW) name = name.slice(0, name.length - 1)
    }
    else {
      boxW = measure(name) + padding
      if (boxW < 80) boxW = 80
    }
    return {
      width: boxW,
      height: boxH,
      name,
    }
  }

  // static async generate(
  //   avaUrl: string,
  //   name = '',
  //   rank: number,
  //   canvasWidth: number,
  //   generateImage = true,
  // ): Promise<HTMLImageElement | HTMLCanvasElement> {
  //   const canvas: HTMLCanvasElement = document.createElement('canvas')
  //   const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  //   if (!ctx) throw new Error('Canvas not initialized!')
  //   const size = FansAvatar.defaultSize * canvasWidth
  //   const {
  //     width: boxW,
  //     height: h,
  //     name: cuttedName,
  //   } = FansAvatar.generateBoxSize(name, ctx, size)
  //   const boxH = rank <= 13 ? h * 1.5 : h
  //   const width = Math.max(size, boxW)
  //   const marginTop = boxH * FansAvatar.nameBoxPos // margin for username box;
  //   const height = size + marginTop
  //   canvas.width = width
  //   canvas.height = height
  //   const avaImg = await calculationTime(() => CanvasUtil.createImage(avaUrl))
  //   if (avaImg) ctx.drawImage(avaImg, width / 2 - size / 2, height - size, size, size)
  //   ctx.fillStyle = 'black'
  //   ctx.globalAlpha = FansAvatar.boxOpacity
  //   ctx.fillRect(width / 2 - boxW / 2, 0, boxW, boxH)
  //   ctx.globalAlpha = 1
  //   ctx.textBaseline = 'middle'
  //   ctx.textAlign = 'center'
  //   ctx.fillStyle = 'white'
  //   ctx.font = `bold ${FansAvatar.fontSize}px Arial`
  //   ctx.fillText(cuttedName, width / 2, rank <= 13 ? h + (h / 2) * 0.1 : h / 2)
  //   if (rank <= 13) {
  //     ctx.textBaseline = 'middle'
  //     ctx.textAlign = 'center'
  //     ctx.font = `bold ${FansAvatar.fontSize + 1}px Arial`
  //     ctx.fillStyle = '#F2F20D'
  //     ctx.fillText(`${rank}位`, width / 2, h / 2)
  //   }
  //   if (generateImage) {
  //     return await CanvasUtil.createImage(canvas.toDataURL('image/jpg'))
  //   }
  //   return canvas
  // }

  // only generate Username Box
  static generateUsername(
    name = '',
    rank: number,
    canvasWidth: number,
  ): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not initialized!')
      const size = FansAvatar.defaultSize * canvasWidth
      const {
        width,
        height: h,
        name: cuttedName,
      } = FansAvatar.generateBoxSize(name, ctx, size)
      const height = rank <= 13 ? h * 1.5 : h
      canvas.width = width
      canvas.height = height

      ctx.fillStyle = 'black'
      ctx.globalAlpha = FansAvatar.boxOpacity
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      ctx.textBaseline = 'middle'
      if (rank <= 13) {
        ctx.textAlign = 'center'
        ctx.font = `bold ${FansAvatar.fontSize + 1}px Arial`
        ctx.fillStyle = '#F2F20D'
        ctx.fillText(`${rank + 1}位`, width / 2, h / 2)
      }
      ctx.textAlign = 'center'
      ctx.fillStyle = 'white'
      ctx.font = `bold ${FansAvatar.fontSize}px Arial`
      ctx.fillText(
        cuttedName,
        width / 2,
        rank <= 13 ? h + (h / 2) * 0.1 : h / 2,
      )
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = canvas.toDataURL('image/jpg')
    })
  }
}

export class FansRankings {
  ranks: FansAvatar[]
  userBG?: HTMLImageElement
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  parent: StageShowroom
  processId: number
  constructor(context: StageShowroom) {
    this.processId = 0
    if (!context.ctx || !context.canvas) throw new Error('Canvas not initialized!')
    this.canvas = context.canvas
    this.userBG = new Image()
    this.userBG.onload = () => {
      if (!this.parent.isAnimated) this.parent.requestDraw()
    }

    this.userBG.src = 'https://res.cloudinary.com/haymzm4wp/image/upload/v1700467900/assets/img/aura_zbndth.png'

    this.ctx = context.ctx
    this.parent = context
    this.ranks = []
    const onload = () => {
      if (!this.parent.isAnimated) this.parent.draw()
    }

    for (let i = 0; i < 100; i++) {
      const pos = stagePositions[i]
      const fansAva = new FansAvatar(
        pos[0] * this.canvas.width,
        pos[1] * this.canvas.height,
      )
      if (fansAva.avatar) {
        fansAva.avatar.onload = onload
        fansAva.avatar.onerror = onload
      }

      fansAva.setBG(this.userBG)
      this.ranks.push(fansAva)
    }
  }

  draw(deltaTime: number) {
    if (!this.ranks.length) return
    this.ctx.save()
    for (let i = 12; i >= 0; i--) {
      const fans = this.ranks[i]
      if (!fans) return
      fans.draw(this.ctx, deltaTime, this.parent.isAnimated)
    }
    for (let i = 13; i < 100; i++) {
      const fans = this.ranks[i]
      if (!fans) return
      fans.draw(this.ctx, deltaTime, this.parent.isAnimated)
    }
    this.ctx.restore()
  }

  async set(stageFans: IUIStageFans[]) {
    this.processId++
    const processId = this.processId
    for (let i = 0; i < 100; i++) {
      if (this.processId !== processId) return
      const fans = stageFans[i]
      const fansAvatar = this.ranks[i]
      if (fans) {
        if (fansAvatar.id === fans.id) continue
        fansAvatar.setId(fans.id, fans.name).setAvatarSrc(fans.avatar).setCurrentUser(fans.isCurrentUser)
        const nameBox = await FansAvatar.generateUsername(
          fans.name,
          i,
          this.canvas.width,
        )
        if (this.processId !== processId) return
        if (nameBox)fansAvatar.setNameBox(nameBox, this.parent)
      }
      else {
        fansAvatar.setId(0, undefined).clearAvatar()
        if (!this.parent.isAnimated) this.parent.requestDraw()
      }
    }
  }
}
