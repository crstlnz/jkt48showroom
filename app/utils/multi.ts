export function convertIDNLive(room: INowLive): Omit<Multi.Video, 'order'> {
  const { idnLiveUrl, idnLiveIcon } = useAppConfig()
  return {
    id: `idn-${room.room_id}`,
    name: room.name,
    poster: room.img,
    image: room.img_alt || room.img,
    landscape: false,
    original_url: idnLiveUrl(room.url_key ?? '0', room.slug ?? '0'),
    icon: idnLiveIcon,
    stream_url: room.streaming_url_list?.[0]?.url,
    space: 1,
    is_mockup: false,
    type: 'idn',
  }
}

export function convertShowroom(room: INowLive): Omit<Multi.Video, 'order'> {
  const { liveURL, showroomIcon } = useAppConfig()
  return {
    id: `showroom-${room.room_id}`,
    name: room.name,
    image: room.img_alt || room.img,
    poster: room.img,
    landscape: true,
    stream_url: room.streaming_url_list?.sort((a, b) => b.quality - a.quality)?.[0]?.url ?? room.streaming_url_list?.[0]?.url ?? '',
    original_url: liveURL(room.url_key ?? '0'),
    icon: showroomIcon,
    space: 1,
    is_mockup: false,
    type: 'showroom',
  }
}
