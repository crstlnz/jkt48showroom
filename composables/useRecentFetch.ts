import EventEmitter from "events";
interface RecentFetchOpts {
  changeRoute?: boolean;
  mode?: "infinite" | "page";
}

const defaultOpts = {
  changeRoute: true,
  mode: "page",
};
export default async function (opts: RecentFetchOpts | null = null) {
  enum sortType {
    LATEST,
    OLDEST,
    MOST_GIFT,
    MOST_VIEWS,
  }
  const urlroute = useRoute();
  const router = useRouter();
  const defaultQuery: RecentsQuery = {
    sort: sortType[sortType.LATEST].toLowerCase(),
    page: 1,
    filter: "all",
  };
  const query = ref<RecentsQuery>(buildQuery());
  const cooldown = ref(false);
  const timeout = ref<NodeJS.Timeout | undefined>(undefined);

  const { data: res, error, pending, refresh } = await useFetch<IApiRecents>("/api/showroom/recent", { query });
  const pageData = computed(() => {
    return {
      totalCount: res.value?.total_count ?? 1,
      perpage: res.value?.perpage ?? 10,
    };
  });
  const totalPage = computed(() => {
    return res.value?.recents ? Math.ceil(pageData.value.totalCount / pageData.value.perpage) : 1;
  });

  /// FUNCTIONS
  watch(
    () => urlroute.query,
    () => onRouteChange()
  );

  function onRouteChange() {
    changeQuery();
  }

  function queryCheck(object1: RecentsQuery, object2: RecentsQuery) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
    return true;
  }

  function changeQuery(q: RecentsQuery | null = null) {
    if ((opts?.mode ?? defaultOpts.changeRoute) === "infinite") {
      if (q) {
        const newQuery = Object.assign({}, q);
        const oldQuery = Object.assign({}, query.value);
        delete newQuery.page;
        delete oldQuery.page;

        if (Object.keys(newQuery).length === Object.keys(oldQuery).length)
          if (queryCheck(newQuery, oldQuery)) {
            query.value = buildQuery(q);
            return;
          }
      }
    }
    query.value = buildQuery(q);
    event.value.emit("queryChange");
  }

  function settingQuery(query: { [key: string]: unknown }) {
    if (pending.value || cooldown.value) return;
    if (!(opts?.changeRoute ?? defaultOpts.changeRoute)) {
      changeQuery(query);
    } else {
      setCooldown(500);
      buildURL(query);
    }
  }

  function changePage(page: number) {
    if (pending.value || cooldown.value) return;
    if (isNaN(page)) page = 1;
    settingQuery({ ...query.value, page });
  }

  function buildQuery(query: RecentsQuery | null = null): RecentsQuery {
    const reqQuery = query ?? urlroute.query;
    const q: RecentsQuery = { ...defaultQuery };
    for (const key of Object.keys(reqQuery)) q[key as keyof RecentsQuery] = reqQuery[key] as any;
    if (!sortType[q.sort?.toUpperCase() as any]) q.sort = sortType[sortType.LATEST].toLowerCase();
    q.page = Number(q.page) ?? 1;
    if (q.page < 1) q.page = 1;

    if (q.filter !== "graduated" && q.filter !== "active") q.filter = "all";
    return q;
  }

  function buildURL(_query: RecentsQuery) {
    const q = { ..._query };
    const def = defaultQuery;
    for (const key of Object.keys(q)) {
      if (q[key] === undefined || q[key] === "" || def[key as keyof RecentsQuery] === q[key]) delete q[key];
    }

    router.push({
      path: urlroute.path,
      query: { ...q },
    });
  }

  function setFilter(q: { [key: string]: unknown }) {
    if (pending.value || cooldown.value) return;
    settingQuery({ ...q, page: 1 });
  }

  function setCooldown(ms: number) {
    if (timeout.value) clearTimeout(timeout.value);
    cooldown.value = true;
    timeout.value = setTimeout(() => {
      cooldown.value = false;
    }, ms);
  }

  const event = ref(new EventEmitter());
  function onQueryChange(fun: () => void) {
    event.value.on("queryChange", fun);
  }

  return { data: { data: res, query, totalPage, pending, error }, changePage, refresh, setFilter, onQueryChange };
}
