import config from "~~/config";
import cache from "~~/library/utils/cache";
export default defineEventHandler(async (event): Promise<ILiveInfo | ILiveInfo[]> => {
  const { room_id: ids } = useQuery(event);
  const roomIds = String(ids)
    .split(",")
    .map((i) => Number(i))
    .filter((i) => i);
  if (!roomIds?.length) throw createError({ statusCode: 404, statusMessage: "Room not found!" });
  return await getLiveInfo(roomIds.length > 1 ? roomIds : roomIds[0]);
});
export { getLiveInfo };

const time = 30000;
async function getLiveInfo(roomId): Promise<ILiveInfo | ILiveInfo[]> {
  return await fetchAllData(roomId);
}

async function fetchAllData(roomId: number | number[]): Promise<ILiveInfo | ILiveInfo[]> {
  if (Array.isArray(roomId)) {
    const promises = [];
    for (const room of roomId) {
      promises.push(cache.fetch<ILiveInfo | ILiveInfo[]>("live_info" + room, () => fetchData(room, true), time));
    }
    return await Promise.all(promises);
  }
  return await cache.fetch<ILiveInfo | ILiveInfo[]>("live_info" + roomId, () => fetchData(roomId), time);
}

async function fetchData(roomId, bulk = false): Promise<ILiveInfo> {
  const response = await fetch(config.apiProfileURL(roomId));
  if (!response.ok && !bulk) throw createError({ statusCode: 404, statusMessage: "Room not found!" });
  const data = await response.json();
  return {
    name: data.main_name ?? "Not Found!",
    room_id: data.room_id ?? roomId,
    live_id: data.live_id ?? 0,
    started_at: new Date((data.current_live_started_at ?? 0) * 1000).toISOString(),
    is_birthday: data.is_birthday ?? false,
    viewers: data.view_num ?? 0,
    is_live: data.is_onlive ?? false,
    url: `/${data.room_url_key ?? ""}`,
    is_error: !response.ok,
  };
}
