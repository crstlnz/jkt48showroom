type GiftSize = 'small' | 'medium'

const defaultRecentQuery: RecentsQuery = {
  sort: 'date',
  page: 1,
  filter: 'all',
  order: -1,
}

function isSort(s: string): s is SortType {
  const sort: string[] = ['date', 'gift', 'views', 'duration']
  return sort.includes(s)
}

export const imgCDN = 'https://img.crstlnz.my.id'

const urls = {
  jkt48url: 'https://jkt48.com',
  hlsUrl: 'https://cdn.jsdelivr.net/npm/hls.js@1.5.6',
  defaultIDNProfilePicture: 'https://cdn.idn.media/idnaccount/avatar/default.png',
  idnLiveIcon: `${imgCDN}/assets/IDN_Live.svg`,
  showroomIcon: `${imgCDN}/assets/SHOWROOM_logo.svg.png`,
  oldIdnLiveUrl: (username: string, slug: string) => {
    return `https://click.idn.media/VKUf?af_dp=idnapp://live/${username}/${slug}&af_web_dp=https://www.idn.app/${username}/live/${slug}&c=web-android&deep_link_value=live/${username}/${slug}&pid=idnapp`
  },
  idnLiveUrl: (username: string, slug: string) => {
    const af_dp = encodeURIComponent(`idnapp://live/${username}/?room=${slug}`)
    const webUrl = encodeURIComponent(`https://www.idn.app/${username}/live/${slug}`)
    const deepLinkValue = encodeURIComponent(`idnapp://live/?room=${slug}`)
    return `https://click.idn.media/VKUf?af_dp=${af_dp}&af_web_dp=${webUrl}&c=detail-liveroom&deep_link_value=${deepLinkValue}&pid=idnapp`
  },
  defaultCardBackground: `${imgCDN}/assets/img/jkt48pt_vbvdpw.png`,
  giftUrl: (id: string | number, type: GiftSize = 'small') => `https://static.showroom-live.com/image/gift/${id}_${type === 'small' ? 's' : 'm'}.png`,
  avatarURL: (id: number | string) => `https://static.showroom-live.com/image/avatar/${id}.png`,
  profileURL: (roomId: number | string) => `https://www.showroom-live.com/room/profile?room_id=${roomId}`,
  liveURL: (key: string) => `https://www.showroom-live.com/r${key?.startsWith('/') ? '' : '/'}${key}`,
  followURL: 'https://www.showroom-live.com/follow',
  tweetURL: (text: string) => `https://twitter.com/intent/tweet?text=${text}`,
  errorPicture: `${imgCDN}/assets/img/image-notfound_wsaxhy.jpg`,
  fansProfileURL: (userId: string | number) => `https://www.showroom-live.com/user/profile?user_id=${userId}`,
  imgCDN,
  screenshotURL: (folder: string, id: string, format: string) => `${imgCDN}/${folder?.startsWith('/') ? '' : '/'}${folder}/${id}.${format}`,
}

const SortList: SortData[] = [
  {
    title: {
      btn: 'sort.date',
      asc: 'sort.latest',
      desc: 'sort.oldest',
    },
    id: 'date',
  },
  {
    title: {
      btn: 'sort.gift',
      asc: 'sort.mostgift',
      desc: 'sort.leastgift',
    },
    id: 'gift',
  },
  {
    title: {
      btn: 'sort.views',
      asc: 'sort.mostviewers',
      desc: 'sort.leastviewers',
    },
    id: 'views',
  },
  {
    title: {
      btn: 'sort.duration',
      asc: 'sort.longestduration',
      desc: 'sort.shortestduration',
    },
    id: 'duration',
  },
]

export default defineAppConfig({
  // group: 'hinatazaka46', // jkt48, hinatazaka or all
  ...urls,
  enableSousenkyou: false,
  getTheaterId(url: string) {
    const match = url.match(/\/(\d+)\?/)
    return match ? match[1] : null
  },
  gift_perpage: 20,
  sortList: SortList,
  defaultRecentQuery,
  isSort,
  uploadFolder: 'uploads',
  getCardBackground(group: string | null = null): string {
    switch (group) {
      case 'hinatazaka46' : {
        return `${imgCDN}/assets/img/hinazaka47pt_gmqluz.jpg`
      }
      default : {
        return urls.defaultCardBackground
      }
    }
  },
  getMetaImage(group: string): string {
    switch (group) {
      case 'hinatazaka46' : {
        return `${imgCDN}/assets/img/showroomloglogo2_mmjara.jpg`
      }
      default : {
        return `${imgCDN}/assets/img/jkt48showroomlog2_qdqnbw.jpg`
      }
    }
  },
  getBanner(group: string): Banner[] {
    switch (group) {
      case 'hinatazaka46' : {
        return [{
          title: 'Hinatazaka46 new single',
          img: `${imgCDN}/assets/img/hinabannerwide_hurqhb.png`,
          url: 'https://www.youtube.com/watch?v=vYKRIwJGRKk&ab_channel=%E6%97%A5%E5%90%91%E5%9D%8246OFFICIALYouTubeCHANNEL',
        }]
      }
      default : {
        return [
          {
            title: '#KuSangatSuka',
            img: `${imgCDN}/assets/img/joejskicp7xgarywsgkj.jpg`,
            url: 'https://www.youtube.com/watch?v=kvhNCk257WY',
          },
        ]
      }
    }
  },
  getIcon(group: string) {
    switch (group) {
      case 'hinatazaka46' : {
        return `${imgCDN}/assets/img/hinalogo_x90izm.png`
      }
      default : {
        return `${imgCDN}/assets/img/showroomjkt48circle_ddxdk7.ico`
      }
    }
  },
  getGroupTitle(group: string) {
    switch (group) {
      case 'hinatazaka46' : {
        return 'Hinatazaka46'
      }
      default : {
        return 'JKT48'
      }
    }
  },
  getTitle(group: string) {
    switch (group) {
      case 'hinatazaka46' : {
        return 'Hinatazaka46 Showroom'
      }
      default : {
        return 'JKT48 Showroom'
      }
    }
  },
  getFavicon(group: string) {
    switch (group) {
      case 'hinatazaka46' : {
        return '/hinalogo.ico'
      }
      default : {
        return '/favicon.ico'
      }
    }
  },
  getGroup(group: string | null) {
    return (group == null) ? 'jkt48' : ['jkt48', 'hinatazaka46'].includes(String(group)) ? String(group) : null
  },
  getDefaultBanner(group: string | null): string {
    switch (group) {
      case 'hinatazaka46' : {
        return `${imgCDN}/assets/img/hinabannerwide_hurqhb.png`
      }
      default : {
        return `${imgCDN}/assets/img/joejskicp7xgarywsgkj.jpg`
      }
    }
  },
  getSocialColorIcon(link: string): string | null {
    if (link.includes('twitter.com')) return 'logos:twitter'
    if (link.includes('x.com')) return 'logos:twitter'
    if (link.includes('facebook.com')) return 'logos:facebook'
    if (link.includes('instagram.com')) return 'skill-icons:instagram'
    if (link.includes('tiktok.com')) return 'logos:tiktok-icon'
    if (link.includes('youtube.com')) return 'logos:youtube-icon'
    return null
  },
  getSocialIcon(link: string): string | null {
    if (link.includes('twitter.com')) return 'fa6-brands:twitter'
    if (link.includes('x.com')) return 'fa6-brands:twitter'
    if (link.includes('facebook.com')) return 'fa6-brands:facebook'
    if (link.includes('instagram.com')) return 'fa6-brands:instagram'
    if (link.includes('tiktok.com')) return 'fa6-brands:tiktok'
    if (link.includes('youtube.com')) return 'fa6-brands:youtube'
    return null
  },
},
)
