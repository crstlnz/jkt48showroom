import fetch, { RequestInit } from "node-fetch";

class APIError extends Error {
  status: number;
  code: number;

  constructor(message?: string | undefined, status: number | null = null) {
    super(message);
    this.status = status ?? 0;
    this.code = status ?? 0;
  }
}
class API {
  async get<T>(
    url: string,
    opts: RequestInit | undefined = undefined
  ): Promise<T> {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new APIError(res.statusText, res.status);
      return (await res.json()) as T;
    } catch (e) {
      throw new APIError("Unknown Error!", 500);
    }
  }
}

export default API;
