import { useSettings } from '~~/store/settings'

// import showroomSession from '~~/library/serializer/showroomSession'

export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const settings = useSettings()
    const { session } = storeToRefs(settings)
    if (!session.value) {
      $fetch(`/api/showroom/session?_=${new Date().getTime()}`).then((res) => {
        session.value = res
      })
    }
  }
})
