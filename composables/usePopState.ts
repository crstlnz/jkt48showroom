export default function<T>(id: string) {
  const onState = createEventHook<T | undefined | null>()
  function onStateChange(event: PopStateEvent) {
    onState.trigger(event.state[id])
  }
  onMounted(() => {
    useEventListener(window, 'popstate', onStateChange)
  })

  function push(_state: T) {
    const state: Record<string, T> = {}
    state[id] = _state
    window.history.pushState(state, id)
    onState.trigger(state[id])
  }

  function back() {
    window.history.back()
  }

  function call(fun: (windowHistory: History) => any) {
    fun(window.history)
  }

  return {
    onState: onState.on,
    call,
    push,
    back,
  }
}
