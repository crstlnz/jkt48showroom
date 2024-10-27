<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const props = defineProps<{
  menus: MenuItem[]
}>()
defineEmits(['toggleDark'])
const route = useRoute()
const { greaterOrEqual } = useResponsive()
const navbar = ref<HTMLElement | null>()
const { authenticated, user } = useAuth()
const settings = useSettings()
const menus = computed(() => {
  return props.menus.filter(i =>
    (!i.login || authenticated.value) && (!i.admin || user.value?.is_admin) && (!i.group || i.group === settings.group || i.group === 'all'))
})

const { getIcon } = useAppConfig()

const isXL = greaterOrEqual('2xl')
</script>

<template>
  <nav id="navbar" ref="navbar" class="sticky top-0 z-[151] h-[100vh] shrink-0 overflow-y-auto border-r dark:border-zinc-700 2xl:w-[290px]">
    <div class="flex h-full flex-col justify-between gap-3 [&>div]:mx-3 max-2xl:items-center">
      <div class="flex-1 flex flex-col max-2xl:items-center gap-2">
        <NuxtLink to="/" class="mb-2.5 mt-4 inline-block aspect-square w-10 xl:w-14 rounded-full text-3xl font-bold hover:bg-hover" aria-label="Home">
          <NuxtImg class="aspect-square w-full object-contain xl:p-2" :src="getIcon(settings.group)" alt="Logo" />
        </NuxtLink>
        <LayoutMenu
          v-for="m in menus"
          :key="m.url"
          v-tooltip="!isXL ? m.title : undefined"
          class="block"
          :title="m.title"
          :locale-id="m.locale_id"
          :icon="m.icon"
          :active-icon="m.activeIcon"
          :active="route.path === m.url"
          :url="m.url"
        />
      </div>
      <div class="flex justify-center gap-2 max-2xl:flex-col">
        <LangSwitch class="2xl:bg-container max-2xl:hover:bg-hover flex 2xl:flex-1 items-center justify-center gap-2 rounded-full size-12" />
        <button
          v-ripple
          type="button"
          aria-label="Settings menu"
          class="2xl:bg-container max-2xl:hover:bg-hover flex items-center justify-center gap-2 rounded-full size-12 aspect-square"
          @click="$emit('toggleDark')"
        >
          <Icon name="ph:moon-bold" class="!hidden h-5 w-5 dark:!inline-block" />
          <Icon name="ph:sun-bold" class="h-5 w-5 dark:!hidden" />
        </button>
        <SettingsDialog />
      </div>
      <div class="border-t-2 dark:border-zinc-700 max-2xl:self-center">
        <LayoutUser />
      </div>
    </div>
  </nav>
  <div class="min-w-0 flex-1">
    <slot />
  </div>
</template>
