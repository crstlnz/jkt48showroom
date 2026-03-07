<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const { group } = useSettings()
const { t } = useI18n()
const { getIcon, getGroupTitle } = useAppConfig()
const showSettingsDialog = ref(false)
const revealAllOnFinish = useLocalStorage('sorter-reveal-all-finish', true)
const groupTitle = getGroupTitle(group)
const description = t('sorter.layout_description', { group: groupTitle })

onKeyStroke('Escape', () => {
  showSettingsDialog.value = false
})

useHead({
  title: `${groupTitle} ${t('menu.oshi_sorter')}`,
  meta: [
    {
      id: 'description',
      name: 'description',
      content: description,
    },
  ],
})

useSeoMeta({
  ogImage: 'https://res.cloudinary.com/haymzm4wp/image/upload/v1695028178/assets/img/oshi_sorter_rfhpsz.png',
  twitterImage: 'https://res.cloudinary.com/haymzm4wp/image/upload/v1695028178/assets/img/oshi_sorter_rfhpsz.png',
  description,
  twitterDescription: description,
  ogDescription: description,
})
</script>

<template>
  <div>
    <ClientOnly>
      <template #fallback>
        <div class="flex h-screen w-screen items-center justify-center">
          <img class="h-20 w-20" :src="getIcon(group)" alt="Logo">
        </div>
      </template>
      <template #default>
        <div class="flex min-h-screen flex-col">
          <div class="mt-8 flex items-center gap-2 self-center text-4xl font-bold md:mt-10">
            <Icon name="solar:square-sort-vertical-bold-duotone" class="text-red-400" size="3rem" />
            <span>{{ $t('menu.oshi_sorter') }}!</span>
          </div>
          <div class="mb-3 mt-2 flex items-center justify-center gap-4 md:mb-5">
            <NuxtLink to="/" class="text-center font-bold">
              {{ $t('menu.home') }}
            </NuxtLink>
            <button type="button" class="text-center font-bold" @click="showSettingsDialog = true">
              {{ t('settings_global') }}
            </button>
          </div>
          <div class="flex flex-1 flex-col">
            <slot />
          </div>
          <footer class="p-6 text-center font-bold my-10 opacity-50">
            <Footer />
          </footer>
        </div>
        <Transition name="sorter-settings">
          <div
            v-if="showSettingsDialog"
            class="fixed inset-0 z-99999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
            @click.self="showSettingsDialog = false"
          >
            <div class="sorter-settings-dialog bg-container w-full max-w-sm rounded-2xl border border-color-2 p-4 shadow-xl">
              <div class="text-lg font-bold">
                {{ t('settings_global') }}
              </div>
              <div class="mt-1 text-sm opacity-70">
                {{ $t('menu.oshi_sorter') }}
              </div>
              <label class="mt-4 flex items-center gap-2 rounded-xl border border-color-2 px-3 py-2 text-sm">
                <input v-model="revealAllOnFinish" type="checkbox" class="h-4 w-4">
                <span>{{ t('sorter.reveal_all_on_finish') }}</span>
              </label>
              <div class="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  class="rounded-xl bg-hover px-3 py-2 text-center text-sm font-semibold"
                  @click="showSettingsDialog = false"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.sorter-settings-enter-active,
.sorter-settings-leave-active {
  transition: opacity 380ms ease;
}

.sorter-settings-enter-from,
.sorter-settings-leave-to {
  opacity: 0;
}

.sorter-settings-enter-active .sorter-settings-dialog,
.sorter-settings-leave-active .sorter-settings-dialog {
  transition: transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 380ms ease;
}

.sorter-settings-enter-from .sorter-settings-dialog,
.sorter-settings-leave-to .sorter-settings-dialog {
  transform: scale(0.9);
  opacity: 0;
}
</style>
