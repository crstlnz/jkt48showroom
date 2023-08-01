import { useSettings } from '~~/store/settings'

// import showroomSession from '~~/library/serializer/showroomSession'

export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const settings = useSettings()
    const { session } = storeToRefs(settings)

    if (process.client) {
      if (!session.value) {
        $fetch('/api/showroom/session').then((res) => {
          session.value = res
        })
      }
    }
  }
})
