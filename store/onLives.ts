import { defineStore, storeToRefs, acceptHMRUpdate } from "~/node_modules/@pinia/nuxt/dist/runtime/composables";
import { useLiveInfos } from "./liveInfos";
import JSONSerializer from "~~/library/serializer/json";

export const useOnLives = defineStore("onLives", () => {
  const controller = useLocalStoreController<INowLive[]>("onlives", refreshLives, {
    expiredIn: 10000,
    serializer: new JSONSerializer<INowLive[]>([]),
  });
  const { state, data: lives, refresh, tryRefresh } = controller;

  const liveInfoStore = useLiveInfos();
  const { data: liveInfo, state: liveInfoState } = storeToRefs(liveInfoStore);

  const livesMap = computed(() => {
    const map = new Map();
    if (!lives.value) return map;
    for (const live of lives?.value ?? []) {
      map.set(live.room_id, live);
    }
    return map;
  });

  async function refreshLives(): Promise<IMember[]> {
    const data: IMember[] = await $fetch("/api/showroom/now_live");
    if (data?.length && isDifferent(data, lives.value ?? [])) {
      liveInfoStore.refresh(data?.map((i) => i.room_id));
    } else if (!data?.length) {
      liveInfoStore.clear();
    }
    return data;
  }

  function refreshLiveInfo() {
    liveInfoStore.refresh(lives.value?.map((i) => i.room_id));
  }

  function isLive(roomId: number) {
    return livesMap.value?.has(roomId);
  }

  function removeLive(roomId: number) {
    lives.value = lives.value?.filter((i) => i.room_id !== roomId) as INowLive[];
    liveInfo.value = liveInfo.value?.filter((i: any) => i.room_id !== roomId) as APILiveInfo[];
  }

  function isDifferent(newData: INowLive[], oldData: INowLive[]) {
    if (!oldData) return true;
    if (newData.length !== oldData.length) return true;
    for (const live of newData) {
      if (!oldData.some((i) => i.room_id === live.room_id)) return true;
    }
    return false;
  }

  function getStartDate(roomId: number) {
    const room = liveInfo?.value?.find((i: any) => i.room_id === roomId);
    if (!room || room.is_error === true) return null;
    if (!room.is_live) {
      removeLive(roomId);
      return null;
    }
    return room?.started_at ?? null;
  }

  return {
    lives: state,
    liveInfo: liveInfoState,
    tryRefresh,
    refresh,
    getStartDate,
    refreshLiveInfo,
    isLive,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOnLives, import.meta.hot));
}
