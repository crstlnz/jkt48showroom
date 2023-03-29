export const useNotifications = defineStore('notifications', () => {
  const notifData = ref<NotifData[]>([])
  const currentNotif = ref<NotifData>()
  const id = ref(0)
  function addNotif (notif : Omit<NotifData, 'id'>) {
    notifData.value.push({ ...notif, id: id.value })
    id.value++
    if (isShowingNotif.value) return
    showNotif()
  }

  const isShowingNotif = ref(false)

  function showNotif () {
    isShowingNotif.value = true
    currentNotif.value = notifData.value.shift()
    setTimeout(() => {
      if (notifData.value.length) {
        showNotif()
      } else {
        isShowingNotif.value = false
        currentNotif.value = undefined
      }
    }, currentNotif.value?.duration ?? 5000)
  }

  // watch(notifData, () => {
  //   if (isShowingNotif.value) return
  //   showNotif()
  // })

  return { addNotif, currentNotif }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotifications, import.meta.hot))
}
