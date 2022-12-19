import ShowroomAPI from "~/library/api/showroom";
import cache from "~~/library/utils/cache";
export default defineEventHandler(
  async (event): Promise<APILiveInfo | APILiveInfo[]> => {
    const { room_id: ids } = getQuery(event);
    const roomIds = String(ids)
      .split(",")
      .map((i) => Number(i))
      .filter((i) => i);
    if (!roomIds?.length)
      throw createError({ statusCode: 404, statusMessage: "Room not found!" });
    return await getLiveInfo(roomIds.length > 1 ? roomIds : roomIds[0]);
  }
);
export { getLiveInfo };

const time = 30000;
async function getLiveInfo(
  roomId: number | number[]
): Promise<APILiveInfo | APILiveInfo[]> {
  return await fetchAllData(roomId);
}

async function fetchAllData(
  roomId: number | number[]
): Promise<APILiveInfo | APILiveInfo[]> {
  if (Array.isArray(roomId)) {
    const promises: Promise<APILiveInfo>[] = [];
    for (const room of roomId) {
      promises.push(
        cache.fetch<APILiveInfo>(
          "live_info" + room,
          () => fetchData(room, true),
          time
        )
      );
    }
    return Promise.all(promises);
  }
  return await cache.fetch<APILiveInfo | APILiveInfo[]>(
    "live_info" + roomId,
    () => fetchData(roomId),
    time
  );
}

async function fetchData(roomId: number, bulk = false): Promise<APILiveInfo> {
  // bulk is for prevent error when fetching more than 1 room but there are rooms that are not found
  // const response = await fetch(`https://www.showroom-live.com/api/room/profile?room_id=${roomId}`);
  const data = await ShowroomAPI.profile(roomId).catch((e) => {
    if (!bulk) {
      if (e.code === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: "Room not found!",
        });
      } else {
        throw createError({ statusCode: e.code, statusMessage: e.message });
      }
    }
    return null;
  });
  return {
    name: data?.main_name ?? "Not Found!",
    room_id: data?.room_id ?? roomId,
    live_id: data?.live_id ?? 0,
    started_at: new Date(
      (data?.current_live_started_at ?? 0) * 1000
    ).toISOString(),
    is_birthday: data?.is_birthday ?? false,
    viewers: data?.view_num ?? 0,
    is_live: data?.is_onlive ?? false,
    url: `/${data?.room_url_key ?? ""}`,
    is_error: data === null,
  };
}
