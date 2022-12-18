import { UseFetchOptions } from "nuxt/dist/app/composables";
import { KeyOfRes } from "nuxt/dist/app/composables/asyncData";

export default function <T>(
  _url: string,
  params: { [key: string]: unknown } = {},
  options:
    | UseFetchOptions<
        unknown,
        (res: unknown) => unknown,
        KeyOfRes<(res: unknown) => unknown>
      >
    | undefined
) {
  const config = useRuntimeConfig();
  const query = ref({ ...params });

  if (!options) {
    options = { baseURL: config.public.baseURL };
  } else {
    options.baseURL = config.public.baseURL;
  }

  const {
    pending,
    error,
    data,
    refresh: _refresh,
  } = useFetch<T>(() => buildQueryURL({ ...query.value }), options as any);

  function buildQueryURL(query: unknown) {
    const queryString = new URLSearchParams(
      query as unknown as Record<string, string>
    ).toString();
    return _url + (queryString ? `?${queryString}` : "");
  }

  function refresh(_query: { [key: string]: unknown }) {
    query.value = _query;
    _refresh();
  }

  return { pending, error, data, refresh };
}
