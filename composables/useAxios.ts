import axios from "axios";

type Config = {
  minTime?: number;
  fetchOnStart?: boolean;
};
export default function (url: string, params?: () => unknown, config?: Config) {
  const cfg = useRuntimeConfig();
  // const fetched = useState("fetched", () => false);
  // const pending = useState("pending", () => true);
  // const data = useState("data", () => null);
  // const error = useState("error", () => false);
  const minTime = config?.minTime ?? 0;
  const fetched = ref(!(config?.fetchOnStart ?? true));
  const pending = ref(config?.fetchOnStart ?? true);
  const data = ref(null);
  const error = ref(false);
  const fetch = async () => {
    if (!fetched.value) fetched.value = true;
    const date = new Date();
    if (error.value) error.value = false;
    pending.value = true;
    try {
      const { data: res } = await axios.get(cfg.public.baseURL + url, params ? params() : {});
      finish(() => {
        data.value = res;
        pending.value = false;
      }, date);
    } catch (e) {
      finish(() => {
        if (!error.value) error.value = true;
        pending.value = false;
      }, date);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const finish = async (fn: () => unknown, date: Date) => {
    const time = new Date().getTime() - date.getTime();
    if (minTime && time < minTime) {
      await sleep(minTime - time);
    }
    fn();
  };

  onMounted(() => {
    if (!fetched.value) fetch();
  });

  return { data, error, pending, refresh: fetch };
}
