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
  opts: LocalStoreControllerOptions<T> = {}
) {
  const willExpire = opts?.expire ?? true;
  const expiredIn = opts?.expiredIn ?? 3600000;
  const serializer = opts?.serializer;
  const allowExpiredData = opts?.allowExpiredData ?? false;
  const pending = ref(false);
  const error = ref(false);

  const data: Ref<T | null> = useLocalStorage(`data-${id}`, null as T, {
    serializer,
  });
  const lastFetch = useLocalStorage(`lf-${id}`, 0 as number);

  if (data.value && isExpired() && !allowExpiredData) {
    data.value = null;
    lastFetch.value = 0;
  }

  function isExpired() {
    return new Date().getTime() - lastFetch.value > expiredIn;
  }

  function tryRefresh(...args: unknown[]) {
    if (willExpire && !pending.value && !isExpired()) return;
    refresh(...args);
  }

  async function refresh(...args: unknown[]) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
