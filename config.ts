type GiftSize = "small" | "medium";
export default {
  giftUrl: (id: string | number, type: GiftSize = "small") =>
    `https://static.showroom-live.com/image/gift/${id}_${type === "small" ? "s" : "m"}.png`,
  avatarURL: (id: number | string) => `https://static.showroom-live.com/image/avatar/${id}.png`,
  profileURL: (roomId: number | string) => `https://www.showroom-live.com/room/profile?room_id=${roomId}`,
  liveURL: (key: string) => `https://www.showroom-live.com/r${key?.startsWith("/") ? "" : "/"}${key}`,
  followURL: "https://www.showroom-live.com/follow",
  tweetURL: (text: string) => `https://twitter.com/intent/tweet?text=${text}`,
  errorPicture: "https://image.showroom-cdn.com/showroom-prod/assets/img/v3/img-err-404.jpg?t=1602821561",
  fansProfileURL: (userId: string | number) => `https://www.showroom-live.com/user/profile?user_id=${userId}`,
  cloudinaryURL: "https://res.cloudinary.com/haymzm4wp/image/upload/",
  screenshotURL: (folder: string, id: string, format: string) =>
    `https://res.cloudinary.com/haymzm4wp/image/upload/${folder?.startsWith("/") ? "" : "/"}${folder}/${id}.${format}`,
};
