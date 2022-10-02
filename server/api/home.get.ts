import { getRecents } from "./showroom/recents.get";
import cache from "~~/library/utils/cache";
import { getStats } from "./showroom/stats.get";

const time = 60000;

export default defineEventHandler(async (): Promise<IHomeData> => {
  return await getHomeData();
});

export { getHomeData };
async function getHomeData(): Promise<IHomeData | null> {
  return await cache.fetch<IHomeData>("homedata", fetchData, time).catch(() => null);
}

async function fetchData(): Promise<IHomeData> {
  const data = await Promise.all([getRecents().catch(() => ({ recents: [] })), getStats()]);
  return {
    recents: data[0].recents,
    data: data[1],
  };
}
