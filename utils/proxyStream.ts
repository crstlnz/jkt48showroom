export function getProxiedStream(src: string): string {
  const proxyServers = getProxyServer()
  return proxyServers[Math.floor(Math.random() * proxyServers.length)] + src
}
