export default defineEventHandler((event) => {
  event.node.res.writeHead(301, {
    Location: `/recent/${event.context.params?.id || ''}`,
  })
  event.node.res.end()
})
