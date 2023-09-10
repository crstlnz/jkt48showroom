export default function (data: Ref<Watch.WatchData | null>) {
  const comments = ref(data.value?.comments ?? [])
  const delayedComments = ref<Watch.Comment[]>([])
  const autoAppend = ref(true)

  watch(data, () => {
    comments.value = data.value?.comments ?? []
  })

  function createComment(comment: string) { // create current user comment (logged in user is commenting to live)
    const user = data.value?.user
    if (user) {
      const created_at = Math.floor(new Date().getTime() / 1000)
      appendComment({
        id: `${user.id}${created_at}`,
        avatar_id: user.avatar_id,
        name: user.name || '',
        user_id: user.id,
        comment,
        created_at,
      })
    }
  }

  function appendComment(comment: Watch.Comment) {
    if (autoAppend.value) {
      comments.value.unshift(comment)
    }
    else {
      delayedComments.value.push(comment)
    }
  }

  function appendDelayedComments() {
    comments.value.unshift(...delayedComments.value)
    if (comments.value.length > 150) {
      comments.value = comments.value.slice(0, 50)
    }
    delayedComments.value = []
    autoAppend.value = true
  }

  function stopAutoAppend() {
    autoAppend.value = false
  }

  function setAutoAppend(value: boolean) {
    autoAppend.value = value
  }

  return { comments, delayedComments, appendComment, createComment, stopAutoAppend, appendDelayedComments, setAutoAppend }
}
