export default {
  avatarURL: (id: number | string) => `https://image.showroom-cdn.com/showroom-prod/image/avatar/${id}.png`,
  profileURL: (roomId: number | string) => `https://www.showroom-live.com/room/profile?room_id=${roomId}`,
  nextLiveURL: (roomId: number | string) => `https://www.showroom-live.com/api/room/next_live?room_id=${roomId}`,
  nowLiveURL: (roomId: number | string) => `https://www.showroom-live.com/api/room/now_live?room_id=${roomId}`,
  apiProfileURL: (roomId: number | string) => `https://www.showroom-live.com/api/room/profile?room_id=${roomId}`,
  liveURL: (key: string) => `https://www.showroom-live.com/r${key?.startsWith("/") ? "" : "/"}${key}`,
  isLiveURL: "https://www.showroom-live.com/room/is_live",
  followURL: "https://www.showroom-live.com/follow",
  tweetURL: (text: string) => `https://twitter.com/intent/tweet?text=${text}`,
  errorPicture: "https://image.showroom-cdn.com/showroom-prod/assets/img/v3/img-err-404.jpg?t=1602821561",
  fansProfileURL: (userId: string | number) => `https://www.showroom-live.com/user/profile?user_id=${userId}`,
  onLivesURL: "https://www.showroom-live.com/api/live/onlives",
};
