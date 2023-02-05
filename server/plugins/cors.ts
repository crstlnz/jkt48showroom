import redirectSSL from 'redirect-ssl'
import cors from 'cors'
export default defineNitroPlugin(({ h3App }) => {
  h3App.use(
    fromNodeMiddleware(
      redirectSSL.create({
        enabled: process.env.NODE_ENV !== 'development'
      })
    )
  )
  h3App.use(
    fromNodeMiddleware(
      cors({
        origin: process.env.BASE_URL,
        credentials: true
      })
    )
  )
})
