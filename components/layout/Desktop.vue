<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { useUser } from '~/store/user'

const props = defineProps<{
  menus: MenuItem[]
}>()
defineEmits(['toggleDark'])
const route = useRoute()
const { isLarge } = useResponsive()
const navbar = ref<HTMLElement | null>()
const { authenticated, user } = useUser()
const menus = computed(() => {
  return props.menus.filter(i =>
    (!i.login || authenticated) && (!i.admin || user?.isAdmin))
})

const settings = useSettings()
const { getIcon } = useAppConfig()
const navRect = useState<DOMRect | null>('navRect', () => null)
onMounted(() => {
  navRect.value = navbar.value?.getBoundingClientRect() ?? null
})

const { width } = useWindowSize()
watch(width, () => {
  navRect.value = navbar.value?.getBoundingClientRect() ?? null
})
onBeforeUnmount(() => {
  navRect.value = null
})
</script>

<template>
  <nav id="navbar" ref="navbar" class="sticky top-0 z-aboveNav h-[100vh] shrink-0 overflow-y-auto border-r dark:border-zinc-700" :class="{ 'w-[275px]': isLarge }">
    <div class="flex h-full flex-col justify-between gap-3 [&>div]:mx-3" :class="{ 'items-center': !isLarge }">
      <div class="flex-1 space-y-2">
        <NuxtLink to="/" class="mb-1 mt-4 inline-block aspect-square w-14 rounded-full text-3xl font-bold hover:bg-hover">
          <img class="aspect-square w-full object-contain p-2" :src="getIcon(settings.group)" alt="Logo">
        </NuxtLink>
        <LayoutMenu
          v-for="m in menus"
          :key="m.url"
          class="block"
          :compact="!isLarge"
          :title="m.title"
          :icon="m.icon"
          :active-icon="m.activeIcon"
          :active="route.path === m.url"
          :url="m.url"
        />
      </div>
      <div class="flex justify-center gap-4" :class="{ 'flex-col': !isLarge }">
        <LangSwitch class="bg-container flex flex-1 items-center justify-center gap-2 rounded-full p-3" :compact="!isLarge" />
        <button
          v-ripple
          type="button"
          aria-label="Toggle Dark Mode"
          class="bg-container flex items-center justify-center gap-2 rounded-full p-3"
          @click="$emit('toggleDark')"
        >
          <Icon name="ph:moon-bold" class="!hidden h-5 w-5 dark:!inline-block" />
          <Icon name="ph:sun-bold" class="h-5 w-5 dark:!hidden" />
        </button>
        <!-- <SettingGift /> -->
      </div>
      <div class="border-t-2 dark:border-zinc-700" :class="{ 'self-center': !isLarge }">
        <LayoutUser :compact="!isLarge" />
      </div>
    </div>
  </nav>
  <div class="min-w-0 flex-1">
    <slot />
  </div>
</template>