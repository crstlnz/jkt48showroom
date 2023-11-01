export const useNotifications = defineStore('notifications', () => {
  const notifData = ref<NotifData[]>([])
  const currentNotif = ref<NotifData[]>([])
  const defaultDuration = 10000
  const maxShowingNotif = 3
  const id = ref(0)
  function addNotif(notif: Omit<NotifData, 'id' | 'remainingTime'>) {
    const dur = notif.duration ?? defaultDuration
    notifData.value.push({ ...notif, id: id.value, duration: dur, remainingTime: dur })
    id.value++
    showNotif()
  }

  function showNotif() {
    if (currentNotif.value.length < maxShowingNotif) {
      const notif = notifData.value.shift()
      if (notif) {
        currentNotif.value.push(notif)
      }
    }
  }

  function deleteNotif(id: number) {
    currentNotif.value = currentNotif.value.filter(i => i.id !== id)
  }

  return { addNotif, currentNotif, deleteNotif, showNotif }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotifications as any, import.meta.hot))
}
