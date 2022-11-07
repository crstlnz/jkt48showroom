import { skipHydrate, acceptHMRUpdate, defineStore } from "pinia";
import JSONSerializer from "~~/library/serializer/json";

export const useLiveInfos = defineStore("liveInfos", () => {
  const controller = useLocalStoreController<APILiveInfo[]>("liveInfos", refreshLiveInfo, {
    allowExpiredData: true,
    expiredIn: 60000,
    serializer: new JSONSerializer([]),
  });

  const { state, data: liveInfo, refresh, tryRefresh } = controller;

  async function refreshLiveInfo(roomIds: number[]): Promise<APILiveInfo[]> {
    if (!roomIds?.length) return [];
    const result = [];
    const data: APILiveInfo | APILiveInfo[] = await $fetch(
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

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLiveInfos, import.meta.hot));
}
