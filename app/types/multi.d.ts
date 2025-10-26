declare namespace Multi {
  interface Video {
    id: string
    name: string
    poster: string
    image: string
    stream_url: string
    landscape: boolean
    order: number
    original_url: string
    icon: string
    space: number
    type: 'idn' | 'showroom'
    is_mockup: boolean
  }
}
