export default async <T>(fn: () => Promise<T>, name: string = null): Promise<T> => {
  const now = performance.now();
  const res = await fn();
  const late = performance.now();
  // eslint-disable-next-line no-console
  console.log(`${name || "Calculation time"} :`, late - now, "ms");
  return res;
};
