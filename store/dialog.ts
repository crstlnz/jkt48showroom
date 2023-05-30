export const useDialogs = defineStore('dialogs', () => {
  const dialogList = ref<DialogVariants[]>([])
  const currentDialog = computed<DialogVariants | null>(() => {
    const data = dialogList.value ?? []
    return data[data.length - 1]
  })

  const id = ref(0)
  function showDialog(dialog: Omit<AlertDialog, 'id'> | Omit<ConfirmDialog, 'id'> | Omit<LoadingDialog, 'id'>) {
    const dialogId = id.value
    dialogList.value.push({
      id: dialogId,
      ...dialog,
    })
    id.value += 1
    return dialogId
  }

  function deleteDialog(id: number) {
    dialogList.value = dialogList.value.filter(i => i.id !== id)
  }

  return { currentDialog, showDialog, deleteDialog }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDialogs as any, import.meta.hot))
}
