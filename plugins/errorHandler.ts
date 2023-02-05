export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error: any) => {
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') { console.log(error) }
    showError({ statusCode: 500, statusMessage: error.message })
  }
})
