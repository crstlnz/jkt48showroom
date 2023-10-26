import CanvasUtil from '../canvasUtil'
import type ShowroomBackground from '.'
import config from '~~/app.config'

const { cloudinaryURL } = config

class ScreenshotManager {
  list: Map<number, HTMLImageElement>
  ids: number[]
  id: number // picked ss id
  screenshot: HTMLImageElement | undefined | null // picked ss
  parent: ShowroomBackground
  processId: number
  showScreenshot: boolean
  folder: string
  format: string
  defaultImage: HTMLImageElement | undefined
  ssNotFound: HTMLImageElement | undefined
  isLoaded: boolean

  constructor(
    parent: ShowroomBackground,
    defaultImage: string,
    showScreenshot: boolean,
  ) {
    this.list = new Map()
    this.ids = []
    this.parent = parent
    this.processId = 0
    this.showScreenshot = showScreenshot
    this.isLoaded = false
    this.loadDefaultImage(defaultImage)
    this.loadSSNotFound()
    this.id = 0
    this.folder = ''
    this.format = ''
  }

  destroy() {
    this.screenshot = undefined
    this.defaultImage = undefined
    this.ssNotFound = undefined
    this.list.clear()
  }

  setShowScreenshot(val: boolean) {
    if (val) {
      if (!this.isLoaded) this.loadScreenshots(true)
      this.showScreenshot = true
    }
    else {
      this.showScreenshot = false
    }
    this.parent.requestDraw()
  }

  set(screenshots: Database.IScreenshot) {
    this.folder = screenshots.folder
    this.format = screenshots.format
    this.list.clear()
    this.ids = [...screenshots.list]
    if (this.showScreenshot) this.loadScreenshots()
  }

  loadDefaultImage(src: string) {
    this.defaultImage = CanvasUtil.createImageCallback(src, () => {
      if (!this.showScreenshot && !this.screenshot) {
        this.parent.requestDraw()
      }
    })
  }

  loadSSNotFound() {
    this.ssNotFound = CanvasUtil.createImageCallback('/img/ssnotfound.png', () => {
      if (!this.showScreenshot) {
        this.parent.requestDraw()
      }
    })
  }

  loadScreenshots(setSS = false) {
    this.isLoaded = true
    for (const id of this.ids) {
      const url = `${cloudinaryURL}/${this.folder}/${id}.${this.format}`
      this.list.set(
        id,
        CanvasUtil.createImageCallback(url, () => {
          if (id === this.id) {
            if (setSS) this.screenshot = this.list.get(this.id)
            this.parent.requestDraw()
          }
        }),
      )
    }
  }

  setDate(date: number) {
    this.processId++
    const processId = this.processId
    const num = this.ids.length
    for (let i = 0; i < num; i++) {
      if (this.processId !== processId) return
      if (this.ids[i] <= date) {
        if (Math.abs(this.ids[i] - date) <= 180000) {
          this.id = this.ids[i]
          this.screenshot = this.list.get(this.id)
          if (this.screenshot?.complete) this.parent.requestDraw()
        }
        else {
          this.id = 0
          this.screenshot = null
        }
      }
    }
  }

  draw() {
    const size = {
      width: this.parent.width * 0.34,
      height: this.parent.height * 0.34,
    }
    const pos = {
      x: this.parent.width * 0.5 - size.width / 2,
      y: this.parent.height * 0.25695 - size.height / 2,
    }
    if (this.showScreenshot && this.screenshot) {
      if (this.parent.ctx) {
        this.parent.ctx.drawImage(
          this.screenshot,
          pos.x,
          pos.y,
          size.width,
          size.height,
        )
      }
    }
    else if (this.parent.ctx && this.defaultImage) {
      this.parent.ctx.drawImage(
        this.defaultImage,
        pos.x,
        pos.y,
        size.width,
        size.height,
      )

      if (this.showScreenshot && this.ssNotFound) {
        this.parent.ctx.drawImage(
          this.ssNotFound,
          pos.x + size.width / 2 - this.ssNotFound.width / 2,
          pos.y + size.height / 2 - this.ssNotFound.height / 2,

        )
      }
    }
  }
}

export default ScreenshotManager
