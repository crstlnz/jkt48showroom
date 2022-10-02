import { skipHydrate } from "pinia";
import JSONSerializer from "~~/library/serializer/json";

export const useLiveInfos = defineStore("liveInfos", () => {
  const controller = useLocalStoreController<ILiveInfo[]>("liveInfos", refreshLiveInfo, {
    expiredIn: 30000,
    serializer: new JSONSerializer([]),
  });

  const { state, data: liveInfo, refresh, tryRefresh } = controller;

  async function refreshLiveInfo(roomIds: number[]): Promise<ILiveInfo[]> {
    if (!roomIds?.length) return [];
    const result = [];
    const data: ILiveInfo | ILiveInfo[] = await $fetch(
      `/api/showroom/live_info?room_id=${roomIds?.join(",")}&_=${new Date().getTime()}`
    );
    if (Array.isArray(data)) {
      result.push(...data);
    } else if (data.is_error === false) {
      result.push(data);
    }
    return result;
  }

  function clear() {
    controller.clear();
  }

  return {
    state,
    data: skipHydrate(liveInfo),
    tryRefresh,
    refresh,
    clear,
  };
});
