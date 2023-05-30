export const useSelectedUser = defineStore('selectedUser', () => {
  const userId = ref(0)
  const position = ref({ x: 0, y: 0 })
  const isHidden = ref(true)

  function setUserId(_userId: number) {
    userId.value = _userId
    isHidden.value = false
  }

  function set(_userId: number, pos: { x: number; y: number }) {
    userId.value = _userId
    position.value = pos
    isHidden.value = false
  }

  function setPosition(x: number, y: number) {
    position.value = {
      x, y,
    }
    isHidden.value = false
  }

  function userClick(e: MouseEvent, userId: number) {
    set(userId, { x: e.clientX, y: e.clientY })
  }

  function hide() {
    isHidden.value = true
  }

  return { userId, position, isHidden, setUserId, set, setPosition, userClick, hide }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSelectedUser as any, import.meta.hot))
}
