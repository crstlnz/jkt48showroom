import { useSettings } from '~~/store/settings'
import { deepCompare } from '~/utils'

interface RecentFetchOpts {
  initPage?: number
  changeRoute?: boolean
  mode?: 'infinite' | 'page'
  userHistory?: boolean
}

const defaultOpts = {
  changeRoute: true,
  mode: 'page',
}
export default function (opts: RecentFetchOpts | null = null, q: RecentsQuery | null = null) {
  const cooldownDuration = 300
  const urlroute = useRoute()
  const config = useAppConfig()
  const defaultQuery: RecentsQuery = config.defaultRecentQuery
  const settings = useSettings()
  let query: Ref<RecentsQuery>
  if (q) {
    query = ref({ ...q })
  }
  else {
    query = useSessionStorage<RecentsQuery>(opts?.userHistory ? 'history-fetch-query' : `recent-fetch-query`, buildQuery())
    // query = useSessionStorage<RecentsQuery>('recent-fetch-query', { page: opts?.initPage ?? 1 }, { mergeDefaults: opts?.initPage != null })
    if (opts?.initPage != null) {
      query.value.page = opts.initPage
    }
  }
  const key = opts?.userHistory ? '/api/user/history' : `/api/recent-${query.value?.room_id}`
  const cooldown = ref(false)
  const timeout = ref<NodeJS.Timeout | undefined>(undefined)

  function isResurrected() {
    if (!window) return false
    if (!!window.performance && window.performance.navigation.type === 2) {
      return true
    }
  }

  const {
    data: res,
    error,
    pending: apiPending,
    refresh,
  } = useApiFetch<IApiRecents>(
    opts?.userHistory ? '/api/user/history' : '/api/recent',
    { key, query, watch: false, deep: false, server: false, lazy: true, immediate: isResurrected() },
  )

  const mustPending = ref(false)
  const pending = computed(() => {
    return mustPending.value || apiPending.value
  })
  const pageData = computed(() => {
    return {
      totalCount: res.value?.total_count ?? 1,
      perpage: res.value?.perpage ?? 10,
    }
  })
  const totalPage = computed(() => {
    return res.value?.recents ? Math.ceil(pageData.value.totalCount / pageData.value.perpage) : 1
  })

  /// FUNCTIONS
  watch(
    () => urlroute.query,
    (p, p2) => {
      if (!deepCompare(p, p2)) {
        onRouteChange()
      }
    },
  )

  function onRouteChange() {
    changeQuery()
  }

  function queryCheck(object1: RecentsQuery, object2: RecentsQuery) {
    const keys1 = Object.keys(object1) as (keyof RecentsQuery)[]
    const keys2 = Object.keys(object2) as (keyof RecentsQuery)[]
    if (keys1.length !== keys2.length) {
      return false
    }
    for (const key of keys1) {
      if (object1[key] !== object2[key]) {
        return false
      }
    }
    return true
  }

  const queryChange = createEventHook<RecentsQuery | null>()

  function changeQuery(q: RecentsQuery | null = null) {
    if ((opts?.mode ?? defaultOpts.changeRoute) === 'infinite') {
      if (q) {
        const newQuery = Object.assign({}, q)
        const oldQuery = Object.assign({}, query.value)
        delete newQuery.page
        delete oldQuery.page

        if (Object.keys(newQuery).length === Object.keys(oldQuery).length) {
          if (queryCheck(newQuery, oldQuery)) {
            query.value = buildQuery(q)
            slowRefresh()
            return
          }
        }
      }
    }
    query.value = buildQuery(q)
    queryChange.trigger(q)

    slowRefresh()
  }

  async function slowRefresh() {
    mustPending.value = true
    await sleep(1200)
    await refresh()
    mustPending.value = false
  }

  function settingQuery(query: { [key: string]: unknown }) {
    if (pending.value || cooldown.value) return
    if (!(opts?.changeRoute ?? defaultOpts.changeRoute)) {
      changeQuery(query)
    }
    else {
      setCooldown(cooldownDuration)
      // buildURL(query)
    }
  }

  function changePage(page: number) {
    if (pending.value || cooldown.value) return
    if (Number.isNaN(page)) page = 1
    settingQuery({ ...query.value, page })
  }

  function buildQuery(query: RecentsQuery | null = null): RecentsQuery {
    const reqQuery = query ?? urlroute.query
    const q: RecentsQuery = { ...defaultQuery }
    for (const key of Object.keys(reqQuery) as (keyof RecentsQuery)[]) q[key] = reqQuery[key] as undefined // for type error
    if (!config.isSort(q.sort || '')) q.sort = 'date'
    q.page = Number(q.page) ?? 1
    if (q.page < 1) q.page = 1

    if (q.filter !== 'graduated' && q.filter !== 'active') q.filter = 'all'
    q.group = settings.group as Group
    return q
  }

  function setFilter(q: { [key: string]: unknown }) {
    if (pending.value || cooldown.value) return
    settingQuery({ ...q, page: 1 })
  }

  function setCooldown(ms: number) {
    if (timeout.value) clearTimeout(timeout.value)
    cooldown.value = true
    timeout.value = setTimeout(() => {
      cooldown.value = false
    }, ms)
  }

  return { data: { data: res, query, totalPage, pending, error }, changePage, refresh, setFilter, onQueryChange: queryChange.on }
}
