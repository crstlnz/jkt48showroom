import type { Ref } from "vue";
import { useLocalStorage, Serializer } from "@vueuse/core";
interface LocalStoreControllerOptions<T> {
  expiredIn?: number;
  expire?: boolean;
  serializer?: Serializer<T>;
  allowExpiredData?: boolean;
}

export default function <T>(
  id: string,
  fetchData: (...args: any[]) => Promise<T>,
  opts: LocalStoreControllerOptions<T> = null
) {
  const defaultOptions: LocalStoreControllerOptions<T> = {
    expiredIn: 3600000,
    expire: true,
    serializer: null,
    allowExpiredData: true,
  };

  const willExpire = opts?.expire ?? defaultOptions.expire;
  const expiredIn = opts?.expiredIn ?? defaultOptions.expiredIn;
  const serializer = opts?.serializer ?? defaultOptions.serializer;
  const allowExpiredData = opts?.allowExpiredData ?? defaultOptions.allowExpiredData;
  const pending = ref(false);
  const error = ref(false);

  const data: Ref<T | null> = useLocalStorage(`data-${id}`, null as T, {
    serializer: serializer,
  });
  const lastFetch = useLocalStorage(`lf-${id}`, 0 as number);

  if (data.value && isExpired()) {
    data.value = null;
    lastFetch.value = 0;
  }

  function isExpired() {
    return new Date().getTime() - lastFetch.value > expiredIn;
  }

  async function tryRefresh(...args: any[]) {
    if (willExpire && !pending.value && !isExpired()) return;
    refresh(...args);
  }

  async function refresh(...args: any[]) {
    try {
      pending.value = true;
      const res: T = await fetchData(args);
      lastFetch.value = new Date().getTime();
      data.value = res;
      pending.value = false;
    } catch (e) {
      // console.log(e);
      pending.value = false;
      error.value = true;
    }
  }

  function set(value: T) {
    data.value = value;
  }

  function clear() {
    data.value = null;
    lastFetch.value = 0;
  }

  return {
    state: computed(() => ({
      data: data.value,
      pending: pending.value,
      error: error.value,
    })),
    data,
    refresh,
    tryRefresh,
    clear,
  };
}
