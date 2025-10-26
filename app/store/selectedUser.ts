export const useSelectedUser = defineStore('selectedUser', () => {
  const userId = ref<string | number>(0)
  const position = ref({ x: 0, y: 0 })
  const isHidden = ref(true)
  const type = ref<LogType>('showroom')

  function setUserId(_userId: string | number) {
    userId.value = _userId
    isHidden.value = false
  }

  function set(_userId: string | number, _type: LogType, pos: { x: number, y: number }) {
    userId.value = _userId
    type.value = _type
    position.value = pos
    isHidden.value = false
  }

  function setPosition(x: number, y: number) {
    position.value = {
      x,
      y,
    }
    isHidden.value = false
  }

  function userClick(e: MouseEvent, userId: number | string, type: LogType = 'showroom') {
    set(userId, type, { x: e.clientX, y: e.clientY })
  }

  function hide() {
    isHidden.value = true
  }

  return { userId, type, position, isHidden, setUserId, set, setPosition, userClick, hide }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSelectedUser, import.meta.hot))
}
