interface Value {
  value: unknown;
  expireIn: number;
  date: number;
}
const setValue = (value, ms): Value => ({
  value,
  expireIn: ms,
  date: new Date().getTime(),
});

class LocalCacheManager {
  map: Map<unknown, Value>;
  constructor() {
    this.map = new Map();
  }

  set(key, value, ms = 3600000) {
    if (!key) throw new Error("No Key");
    this.map.set(key, setValue(value, ms));
  }

  get(key) {
    return this.map.get(key)?.value;
  }

  clear() {
    this.map.clear();
  }

  has(key) {
    return this.map.has(key);
  }

  valid(key) {
    if (!this.map.has(key)) return false;
    const d = this.map.get(key);
    if (new Date().getTime() - new Date(d.date).getTime() < d.expireIn) return true;
    return false;
  }
}

export default LocalCacheManager;
