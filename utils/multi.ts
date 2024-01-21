export function convertIDNLive(room: IDNLives): Omit< Multi.Video, 'order'> {
  const { idnLiveUrl, idnLiveIcon } = useAppConfig()
  return {
    id: room.user?.id,
    name: room.user?.name,
    poster: room.image,
    image: room.user?.avatar || room.image,
    landscape: false,
    original_url: idnLiveUrl(room.user?.username, room.slug),
    icon: idnLiveIcon,
    stream_url: room.stream_url,
    space: 1,
    is_mockup: false,
    type: 'idn',
  }
}

export function convertShowroom(room: IRoomLive): Omit< Multi.Video, 'order'> {
  const { liveURL, showroomIcon } = useAppConfig()
  return {
    id: String(room.room_id),
    name: room.name,
    image: room.img_alt || room.img,
    poster: room.img,
    landscape: true,
    stream_url: room.streaming_url_list?.filter(a => a.type === 'hls')?.sort((a, b) => b.quality - a.quality)?.[0]?.url ?? room.streaming_url_list?.[0]?.url ?? '',
    original_url: liveURL(room.url),
    icon: showroomIcon,
    space: 1,
    is_mockup: false,
    type: 'showroom',
  }
}
