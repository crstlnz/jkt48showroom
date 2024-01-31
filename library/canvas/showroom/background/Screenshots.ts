import CanvasUtil from '../canvasUtil'
import type ShowroomBackground from '.'
import config from '~~/app.config'

const { cloudinaryURL } = config

class ScreenshotManager {
  list: Map<number, ScreenshotContainer>
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
    this.folder = screenshots?.folder || ''
    this.format = screenshots?.format || 'jpg'
    this.list.clear()
    this.ids = [...(screenshots?.list || [])]
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
      const container = new ScreenshotContainer(url, () => {
        if (id === this.id) {
          if (setSS) this.screenshot = container.img
          this.parent.requestDraw()
        }
      })

      this.list.set(
        id,
        container,
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
        if (Math.abs(this.ids[i] - date) <= 60000 * 3) {
          this.id = this.ids[i]
          const screenshotContainer = this.list.get(this.id)
          if (screenshotContainer) {
            this.screenshot = screenshotContainer.load()
            if (this.screenshot?.complete) this.parent.requestDraw()
          }
          else {
            this.screenshot = undefined
          }
        }
        else {
          this.id = 0
          this.screenshot = null
        }
      }
    }
  }

  drawSSNotFound(x: number, y: number) {
    this.parent.ctx!.beginPath()
    this.parent.ctx!.fillStyle = 'rgba(0, 0, 0, 0.8)'
    const height = 50
    const width = 310
    this.parent.ctx!.roundRect(x - width / 2, y - height / 2, width, height, 20)
    this.parent.ctx!.fill()
    this.parent.ctx!.font = '26px DM Sans'
    this.parent.ctx!.fillStyle = 'white'
    this.parent.ctx!.textAlign = 'center'
    this.parent.ctx!.textBaseline = 'middle'
    this.parent.ctx!.fillText('Screenshot not found!', x, y + 2)
  }

  drawLoading(x: number, y: number) {
    this.parent.ctx!.beginPath()
    this.parent.ctx!.fillStyle = 'rgba(0, 0, 0, 0.8)'
    const height = 50
    const width = 170
    this.parent.ctx!.roundRect(x - width / 2, y - height / 2, width, height, 20)
    this.parent.ctx!.fill()
    this.parent.ctx!.font = '26px DM Sans'
    this.parent.ctx!.fillStyle = 'white'
    this.parent.ctx!.textAlign = 'center'
    this.parent.ctx!.textBaseline = 'middle'
    this.parent.ctx!.fillText('Loading...', x, y + 2)
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

    if (this.parent.ctx) {
      if (this.showScreenshot && this.screenshot) {
        if (!this.screenshot.complete) {
          this.drawLoading(pos.x + size.width / 2, pos.y + size.height / 2)
        }
        else {
          this.parent.ctx.drawImage(
            this.screenshot,
            pos.x,
            pos.y,
            size.width,
            size.height,
          )
        }
      }
      else if (this.defaultImage) {
        this.parent.ctx.drawImage(
          this.defaultImage,
          pos.x,
          pos.y,
          size.width,
          size.height,
        )

        if (this.showScreenshot) {
          this.drawSSNotFound(pos.x + size.width / 2, pos.y + size.height / 2)
        }
      }
    }
  }
}

class ScreenshotContainer {
  is_loaded: boolean
  url: string
  img?: HTMLImageElement
  loadCallback?: () => void
  constructor(url: string, onLoad: () => void) {
    this.url = url
    this.is_loaded = false
    this.onLoad(onLoad)
  }

  onLoad(loadCallback: () => void) {
    this.loadCallback = loadCallback
  }

  load(): HTMLImageElement {
    if (!this.img) {
      this.img = CanvasUtil.createImageCallback(this.url, () => {
        this.is_loaded = true
        if (this.loadCallback) this.loadCallback()
      })
    }
    return this.img
  }
}

export default ScreenshotManager
