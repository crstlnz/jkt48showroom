interface FocusOptions {
  time: number
  idleTime?: number
}

/**
 * @param {number} opts  Focus options.
 * @param {number} opts.time  Minimal time before required to trigger.
 * @param {number} opts.idleTime  Minimal time before required to trigger.
 */
export default function (opts?: FocusOptions) {
  const time = opts?.time ?? 0
  const lastTrigger = ref(Date.now())
  const focused = useWindowFocus()
  const trigger = createEventHook()
  const unfocus = createEventHook()
  const { idle } = useIdle(opts?.idleTime)

  function checkTime() {
    const valid = Date.now() - lastTrigger.value >= time
    if (valid) lastTrigger.value = Date.now()
    return valid
  }

  watch(focused, (isFocus) => {
    if (isFocus && checkTime()) {
      trigger.trigger()
    }
    else {
      unfocus.trigger()
    }
  })

  watch(idle, (isIdle) => {
    if (!isIdle && checkTime()) {
      trigger.trigger()
    }
    else {
      unfocus.trigger()
    }
  })

  return { onFocus: trigger.on, onUnfocus: unfocus.on }
}
