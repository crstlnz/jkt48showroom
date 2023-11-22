<script lang="ts" setup>
import { useScrollLock } from '@vueuse/core'
import { useUser } from '~/store/user'
import { useSettings } from '~/store/settings'

const props = defineProps<{
  menus: MenuItem[]
}>()

defineEmits(['toggleDark'])
const isOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  isOpen.value = false
})

const { authenticated, user, status } = useUser()
const settings = useSettings()
const menus = computed(() => {
  return props.menus.filter(i =>
    i.mobile && (!i.login || authenticated) && (!i.admin || user?.isAdmin) && (!i.group || i.group === settings.group || i.group === 'all'))
})

const hiddenMenus = computed(() => {
  return props.menus.filter(i =>
    !i.mobile && (!i.login || authenticated) && (!i.admin || user?.isAdmin) && (!i.group || i.group === settings.group || i.group === 'all'))
})

const el = ref<HTMLElement | null>()
const isLocked = useScrollLock(el)

onMounted(() => {
  el.value = document.body
})
watch(isOpen, (open) => {
  isLocked.value = open
})
function openMenu() {
  isOpen.value = true
}

function closeMenu() {
  isOpen.value = false
}
</script>

<template>
  <div class="w-full">
    <nav class="fixed inset-x-0 bottom-0 z-nav border-t-2 bg-white drop-shadow-md dark:border-dark-3 dark:bg-dark-2">
      <div class="relative flex h-[60px] gap-4 overflow-hidden px-4">
        <div v-for="menu in menus" :key="menu.title" class="relative flex min-w-0 flex-1 flex-col items-center">
          <NuxtLink v-ripple :to="menu.url" class="relative top-1/2 h-20 w-20 shrink-0 -translate-y-1/2 cursor-pointer rounded-full" :aria-label="menu.title">
            <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-1.5" :class="{ 'bg-hover': route.path === menu.url }">
                <Icon :name="route.path !== menu.url ? menu.icon : menu.activeIcon" class="h-full w-full" />
              </div>
              <div class="shrink-0 text-xs">
                {{ menu.title }}
              </div>
            </div>
          </NuxtLink>
        </div>
        <button class="relative flex min-w-0 flex-1 flex-col items-center" @click="openMenu">
          <div class="absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full p-5">
            <Icon name="ic:round-settings" class="h-9 w-9 shrink-0 rounded-full p-1.5" />
            <div class="shrink-0 text-xs">
              Settings
            </div>
          </div>
        </button>
      </div>
    </nav>
    <div
      :class="{
        'visible opacity-100': isOpen,
        'invisible opacity-0': !isOpen,
      }" class="ease fixed inset-0 z-aboveNav bg-black/75 transition-[opacity,visibility] duration-300" @click="closeMenu"
    />
    <div
      :class="{
        'visible translate-x-0': isOpen,
        'invisible translate-x-full': !isOpen,
      }" class="ease bg-container fixed inset-y-0 right-0 z-aboveNav w-[85%] overflow-y-auto p-5 transition-[transform,visibility] duration-300"
    >
      <button class="absolute right-5" @click="closeMenu">
        <Icon name="ic:round-close" size="2.2rem" />
      </button>
      <div class="flex flex-col">
        <div class="mt-5 border-b">
          <NuxtLink v-if="!authenticated" to="/login" aria-label="Login" class="my-3 flex items-center gap-3 rounded-full">
            <div class="h-10 w-10">
              <Icon name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
            </div>
            <div class="mr-3 flex flex-col">
              <div class="text-base font-semibold">
                Login
              </div>
              <div class="font-light">
                Login with Showroom
              </div>
            </div>
          </NuxtLink>
          <div v-else class="my-5 flex items-center gap-3 rounded-full">
            <NuxtImg
              v-if="user?.img"
              class="h-12 w-12 overflow-hidden rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50"
              :src="user?.img"
              alt="User profile picture"
              fit="fill"
              :modifiers="{
                aspectRatio: 1,
                gravity: 'faceCenter',
              }"
              width="48px"
              :placeholder="[4, 4, 75, 5]"
              format="webp"
            />
            <Icon v-else name="ic:baseline-person" size="1.5em" class="h-10 w-10 rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
            <div class="mr-3 flex flex-1 flex-col items-start">
              <div class="text-base font-semibold">
                {{ user?.name }}
              </div>
              <div v-if="user?.account_id" class="text-left font-light">
                {{ user?.account_id }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="hiddenMenus.length" class="mt-5 flex flex-col items-start border-b pb-5">
          <NuxtLink v-for="menu in hiddenMenus" :key="menu.title" :to="menu.url" class="flex w-full items-start justify-start">
            <div class="flex items-center justify-start gap-3 rounded-full p-3" :class="{ 'bg-hover': route.path === menu.url }">
              <Icon :name="menu.icon" class="h-7 w-7" />
              <div class="text-xl">
                {{ menu.title }}
              </div>
            </div>
          </NuxtLink>
        </div>
        <div class="flex flex-col gap-2 pt-5">
          <button
            v-ripple
            type="button"
            aria-label="Toggle Dark Mode"
            class="bg-container flex items-center justify-start gap-3 rounded-full p-3"
            @click="$emit('toggleDark')"
          >
            <Icon name="ph:moon-bold" class="!hidden h-5 w-5 dark:!block" />
            <Icon name="ph:sun-bold" class="h-5 w-5 dark:!hidden" />
            <div class="text-lg font-semibold leading-5 dark:!hidden">
              Light
            </div>
            <div class="!hidden text-lg font-semibold leading-5 dark:!inline-block">
              Dark
            </div>
          </button>
          <LangSwitch class="bg-container flex flex-1 items-center justify-start gap-3 rounded-full p-3" :compact="false" :full-title="true" />
          <NuxtLink v-ripple to="/history" class="flex gap-3 rounded-full p-3 text-left">
            <Icon name="ic:round-history" class="h-5 w-5" />
            <span class="text-lg font-semibold leading-5">
              History
            </span>
          </NuxtLink>
          <NuxtLink v-ripple :to="authenticated ? '/logout' : '/login'" class="flex gap-3 rounded-full p-3 text-left">
            <Icon name="ic:baseline-logout" class="h-5 w-5" />
            <span class="text-lg font-semibold leading-5">
              {{ authenticated ? 'Logout' : 'Login' }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="w-full pb-[60px]">
      <slot />
    </div>
  </div>
</template>
