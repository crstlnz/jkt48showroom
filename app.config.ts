type GiftSize = 'small' | 'medium'

const defaultRecentQuery: RecentsQuery = {
  sort: 'date',
  page: 1,
  filter: 'all',
  order: -1,
}

function isSort(s: any): s is sortType {
  const sort: sortType[] = ['date', 'gift', 'views', 'duration']
  return sort.includes(s)
}

const urls = {
  giftUrl: (id: string | number, type: GiftSize = 'small') =>
    `https://static.showroom-live.com/image/gift/${id}_${type === 'small' ? 's' : 'm'}.png`,
  avatarURL: (id: number | string) => `https://static.showroom-live.com/image/avatar/${id}.png`,
  profileURL: (roomId: number | string) => `https://www.showroom-live.com/room/profile?room_id=${roomId}`,
  liveURL: (key: string) => `https://www.showroom-live.com/r${key?.startsWith('/') ? '' : '/'}${key}`,
  followURL: 'https://www.showroom-live.com/follow',
  tweetURL: (text: string) => `https://twitter.com/intent/tweet?text=${text}`,
  errorPicture: 'https://res.cloudinary.com/haymzm4wp/image/upload/v1674294578/assets/img/image-notfound_wsaxhy.jpg',
  fansProfileURL: (userId: string | number) => `https://www.showroom-live.com/user/profile?user_id=${userId}`,
  cloudinaryURL: 'https://res.cloudinary.com/haymzm4wp/image/upload/',
  screenshotURL: (folder: string, id: string, format: string) =>
    `https://res.cloudinary.com/haymzm4wp/image/upload/${folder?.startsWith('/') ? '' : '/'}${folder}/${id}.${format}`,
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
export default {
  // group: 'hinatazaka46', // jkt48, hinatazaka or all
  ...urls,
  sortList: SortList,
  defaultRecentQuery,
  isSort,
  getBanner(group: string): Banner {
    switch (group) {
      case 'hinatazaka46' : {
        return {
          img: 'https://res.cloudinary.com/haymzm4wp/image/upload/h_400,f_auto/v1689063914/assets/img/hinabannerwide_hurqhb.png',
          url: 'https://www.youtube.com/watch?v=vYKRIwJGRKk&ab_channel=%E6%97%A5%E5%90%91%E5%9D%8246OFFICIALYouTubeCHANNEL',
        }
      }
      default : {
        return {
          img: 'https://res.cloudinary.com/haymzm4wp/image/upload/h_400,f_auto/v1689086407/assets/img/jkt48banner_nvyix5.png',
          url: 'https://www.youtube.com/watch?v=2wvqBMjPmqk&ab_channel=JKT48',
        }
      }
    }
  },
  getIcon(group: string) {
    switch (group) {
      case 'hinatazaka46' : {
        return 'https://res.cloudinary.com/haymzm4wp/image/upload/h_200,w_200/v1689065442/assets/img/hinalogo_x90izm.png'
      }
      default : {
        return 'https://res.cloudinary.com/haymzm4wp/image/upload/v1681138674/assets/img/showroomjkt48circle_ddxdk7.ico'
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
  isAdmin(id: string) {
    const ids = (process.env.DISCORD_ADMINS ?? '').split(',').map(i => i.trim())
    return ids.includes(id)
  },
  getGroup(group: string | null) {
    return (group == null) ? 'jkt48' : ['jkt48', 'hinatazaka46'].includes(String(group)) ? String(group) : null
  },
}
