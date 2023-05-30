<script lang="ts" setup>
import { useDialogs } from '~/store/dialog'

const dialogData = useDialogs()
const { deleteDialog } = dialogData
const { currentDialog } = storeToRefs(dialogData)

function confirm(dialog: DialogVariants | null) {
  if (!dialog) return
  if (dialog.type === 'confirm') {
    if (dialog.onConfirm) dialog.onConfirm()
  }
  else {
    deleteDialog(dialog?.id ?? 0)
  }
}

function cancel(dialog: DialogVariants | null) {
  deleteDialog(dialog?.id ?? 0)
}

const dialog = ref()

watch(currentDialog, (dialog) => {
  if (dialog?.type === 'alert') {
    if (dialog.autoClose == null || dialog.autoClose) {
      setTimeout(() => {
        deleteDialog(dialog.id)
      }, dialog.duration ?? 1500)
    }
  }
})

onClickOutside(dialog, () => {
  if (currentDialog.value?.type !== 'loading') deleteDialog(currentDialog.value?.id ?? -1)
})
</script>

<template>
  <teleport to="body">
    <Transition
      enter-from-class="opacity-0 scale-90"
      leave-to-class="opacity-0 scale-90"
      enter-active-class="transition-[opacity,transform] duration-300"
      leave-active-class="transition-[opacity,transform] duration-300"
    >
      <div v-if="currentDialog" :key="currentDialog.id" class="z-aboveNav fixed inset-0 flex items-center justify-center">
        <div ref="dialog" class="bg-container z-10 flex min-w-[300px] flex-col rounded-2xl p-8" :class="{ 'items-start': currentDialog.type !== 'loading', 'items-center': currentDialog.type === 'loading' }">
          <div v-if="currentDialog.title" class="mb-2 text-2xl">
            {{ currentDialog.title }}
          </div>
          <div v-if="currentDialog.image" class="h-20 w-20">
            <img :src="currentDialog.image" class="h-full w-full object-cover">
          </div>
          <div v-if="currentDialog.message" class="text-base">
            {{ currentDialog.message }}
          </div>
          <div v-if="currentDialog.type !== 'loading'" class="mt-5 flex flex-row-reverse gap-3 self-end">
            <button v-ripple type="button" :aria-label="currentDialog.type === 'alert' ? 'Close' : 'Accept'" class="min-w-[65px] rounded-lg bg-red-500 px-3 py-1" @click="() => confirm(currentDialog)">
              {{ currentDialog.positiveText ?? 'Yes' }}
            </button>
            <button v-if="currentDialog.type === 'confirm'" v-ripple type="button" aria-label="Cancel" class="min-w-[65px] rounded-lg border px-3 py-1" @click="() => cancel(currentDialog)">
              {{ currentDialog.negativeText ?? 'No' }}
            </button>
          </div>
          <div v-else class="mt-5 flex w-full items-center justify-center">
            <Icon name="svg-spinners:ring-resize" size="2.2rem" />
          </div>
        </div>
        <div class="absolute -inset-40  z-0 bg-black/30 dark:bg-black/50" />
      </div>
    </Transition>
  </teleport>
</template>
