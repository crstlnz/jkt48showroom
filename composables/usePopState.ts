export default function<T>(id: string) {
  const onState = createEventHook<T | undefined | null>()
  function onStateChange(event: PopStateEvent) {
    onState.trigger(event.state)
  }
  onMounted(() => {
    useEventListener(window, 'popstate', onStateChange)
  })

  function push(state: T) {
    window.history.pushState(state, id)
    onState.trigger(state)
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
