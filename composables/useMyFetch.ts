export default function (_url: string, params: Object = {}, options) {
  const config = useRuntimeConfig();
  //   const url = ref(buildQueryURL({ ...params }));
  const query = ref({ ...params });

  const {
    pending,
    error,
    data,
    refresh: _refresh,
  } = useFetch(() => buildQueryURL({ ...query.value }), {
    baseURL: config.public.baseURL,
    ...options,
  });

  function buildQueryURL(query) {
    const queryString = new URLSearchParams(query as unknown as Record<string, string>).toString();
    return _url + (queryString ? `?${queryString}` : "");
  }

  function refresh(_query: Object) {
    query.value = _query;
    _refresh();
  }

  return { pending, error, data, refresh };
}
