<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

const isOpen = ref(false)

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}

const rotateFeature = useLocalStorage('rotate_feature', () => true)
const autoRemove = useLocalStorage('auto_remove_player', () => true)
const centerVideos = useLocalStorage('center_videos', () => false)
const showVideoControl = useLocalStorage('show_video_control', () => true)
</script>

<template>
  <div>
    <button
      v-ripple
      type="button"
      aria-label="Toggle Dark Mode"
      class="bg-container flex items-center justify-start gap-3 rounded-full p-3"
      @click="openModal"
    >
      <Icon name="heroicons:cog-6-tooth-solid" class="h-6 w-6" />
    </button>
    <Teleport to="body">
      <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" class="relative z-notification" @close="closeModal">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/40" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto w-screen">
            <div
              class="flex min-h-full items-center justify-center p-4 text-center"
            >
              <TransitionChild
                as="template"
                enter="duration-100 ease-out"
                enter-from="opacity-0 scale-75"
                enter-to="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-75"
              >
                <DialogPanel
                  class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-container p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] flex flex-col"
                >
                  <DialogTitle
                    as="h3"
                    class="text-lg md:text-xl font-medium leading-6"
                  >
                    {{ $t('settings_global') }}
                  </DialogTitle>
                  <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-3" @click="rotateFeature = !rotateFeature">
                    <input v-model="rotateFeature" type="checkbox" class="cursor-pointer">
                    <div>{{ $t("enable_rotate") }}</div>
                  </button>
                  <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-3" @click="centerVideos = !centerVideos">
                    <input v-model="centerVideos" type="checkbox" class="cursor-pointer">
                    <div>{{ $t("multi.center") }}</div>
                  </button>
                  <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-2" @click="showVideoControl = !showVideoControl">
                    <input v-model="showVideoControl" type="checkbox" class="cursor-pointer">
                    <div>{{ $t("multi.showvideocontrol") }}</div>
                  </button>
                  <button type="button" class="flex items-center gap-2.5 text-xs text-left md:text-sm opacity-80 font-light mt-1" @click="autoRemove = !autoRemove">
                    <input v-model="autoRemove" type="checkbox" class="cursor-pointer">
                    <div>{{ $t("multi.auto_remove") }}</div>
                  </button>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </Teleport>
  </div>
</template>
