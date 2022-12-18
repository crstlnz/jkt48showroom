import API from ".";
type GiftSize = "small" | "medium";

class ShowroomAPI extends API {
  liveURL(key: string): string {
    return `https://www.showroom-live.com/r${key?.startsWith("/") ? "" : "/"}${key}`;
  }

  avatarURL(id: number | string): string {
    return `https://image.showroom-cdn.com/showroom-prod/image/avatar/${id}.png`;
  }

  giftUrl(id: string | number, type: GiftSize = "small"): string {
    return `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${id}_${type === "small" ? "s" : "m"}.png`;
  }

  profileURL(roomId: number | string): string {
    return `https://www.showroom-live.com/room/profile?room_id=${roomId}`;
  }

  profile(roomId: number | string): Promise<ProfileSR> {
    return this.get(`https://www.showroom-live.com/api/room/profile?room_id=${roomId}`);
  }

  nextLive(roomId: number | string): Promise<NextLiveSR> {
    return this.get(`https://www.showroom-live.com/api/room/next_live?room_id=${roomId}`);
  }

  isLive(roomId: number | string): Promise<IsLiveSR> {
    return this.get(`https://www.showroom-live.com/room/is_live?room_id=${roomId}&_=${new Date().getTime()}`);
  }

  onlives(): Promise<OnlivesSR> {
    return this.get(`https://www.showroom-live.com/api/live/onlives&_=${new Date().getTime()}`);
  }
}

export default new ShowroomAPI();
export { ShowroomAPI };
