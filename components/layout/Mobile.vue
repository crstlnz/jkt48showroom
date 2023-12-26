<script lang="ts" setup>
import { useScrollLock } from '@vueuse/core'
import { useSettings } from '~/store/settings'

const props = defineProps<{
  menus: MenuItem[]
}>()

defineEmits(['toggleDark'])
const isOpen = ref(false)
const route = useRoute()
const router = useRouter()

watch(() => route.path, () => {
  isOpen.value = false
})

const { authenticated, user } = useAuth()
const settings = useSettings()
const menus = computed(() => {
  return props.menus.filter(i =>
    i.mobile && (!i.login || authenticated.value) && (!i.admin || user.value?.is_admin) && (!i.group || i.group === settings.group || i.group === 'all'))
})

const hiddenMenus = computed(() => {
  return props.menus.filter(i =>
    !i.mobile && (!i.login || authenticated.value) && (!i.admin || user.value?.is_admin) && (!i.group || i.group === settings.group || i.group === 'all'))
})

const el = ref<HTMLElement | null>()
const isLocked = useScrollLock(el)

onMounted(() => {
  el.value = document.body
})
watch(isOpen, (open) => {
  isLocked.value = open
})

const hashMenu = '#menu'
function openMenu() {
  router.push({
    path: route.path,
    hash: hashMenu,
  })
}

function closeMenu() {
  router.back()
}

watch(() => route.fullPath, (p, oP) => {
  if (process.server) return
  const hash = `#${p.split('#')?.[1] || ''}`
  const path = (p.split('#')?.[0])?.split('?')?.[0] || ''
  const oldPath = (oP?.split('#')?.[0])?.split('?')?.[0]
  if (oldPath != null && path !== oldPath) {
    if (hash === hashMenu && oldPath) {
      router.back()
    }
  }
  else {
    nextTick(() => {
      isOpen.value = hash === hashMenu
    })
  }
}, { immediate: true })

const hiddenUsername = useCookie('_h_usrnme', {
  default: () => true,
  maxAge: 3600 * 24 * 30,
  path: '/',
})
</script>

<template>
  <div class="w-full min-h-[100vh]">
    <nav class="fixed inset-x-0 bottom-0 z-nav border-t-2 bg-white drop-shadow-md dark:border-dark-3 dark:bg-dark-2">
      <div class="relative flex h-[60px] gap-4 overflow-hidden px-4">
        <div v-for="menu in menus" :key="menu.title" class="relative flex min-w-0 flex-1 flex-col items-center">
          <NuxtLink v-ripple :to="menu.url" class="relative top-1/2 h-20 w-20 shrink-0 -translate-y-1/2 cursor-pointer rounded-full" :aria-label="menu.title">
            <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1" :class="{ 'bg-hover': route.path === menu.url }">
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
      }" class="bg-container fixed inset-y-0 right-0 z-aboveNav w-[80%] overflow-y-auto p-5 transition-[transform,visibility] duration-300"
    >
      <div class="flex flex-col h-full">
        <div class="pb-5 border-b-2 border-black/10 dark:border-white/5">
          <NuxtLink :to="authenticated ? undefined : '/login'" class="flex items-center gap-3 rounded-full">
            <div class="h-11 w-11 bg-container-2 rounded-full overflow-hidden">
              <NuxtImg
                v-if="authenticated && user?.image"
                class="h-full w-full bg-slate-400 text-white dark:bg-dark-1 dark:text-slate-500/50"
                :src="user?.image"
                alt="User profile picture"
                fit="fill"
                :modifiers="{
                  aspectRatio: 1,
                  gravity: 'faceCenter',
                }"
                width="56px"
                :placeholder="[4, 4, 75, 5]"
                format="webp"
              />
              <Icon v-else name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full p-2 text-white dark:text-slate-500/50" />
            </div>
            <div class="mr-3 flex flex-1 flex-col items-start">
              <div class="text-base font-semibold !leading-5">
                {{ authenticated ? user?.name : "Login" }}
              </div>
              <div v-if="authenticated" class="text-left text-sm font-light !leading-5" @click="hiddenUsername = !hiddenUsername">
                <div v-if="!hiddenUsername">
                  {{ authenticated ? user?.account_id : $t('loginwithshowroom') }}
                </div>
                <div v-else class="flex items-center gap-1 align-middle">
                  <span>********</span><Icon name="formkit:hidden" />
                </div>
              </div>
              <div v-else class="text-left text-sm font-light !leading-5">
                {{ $t('loginwithshowroom') }}
              </div>
            </div>
          </NuxtLink>
        </div>
        <div class="flex-1">
          <div v-if="hiddenMenus.length" class="mt-5 flex flex-col gap-3 items-start border-b pb-5 border-black/10 dark:border-white/5">
            <NuxtLink v-for="menu in hiddenMenus" :key="menu.title" :to="menu.url" class="flex w-full items-start justify-start">
              <div class="flex items-center justify-start gap-3 rounded-full py-1.5 px-3" :class="{ 'bg-hover': route.path === menu.url }">
                <SwitchIcon :is-switch="route.path === menu.url" :icon="menu.icon" :switch-icon="menu.activeIcon" class="h-5 w-5" />
                <div class="text-lg font-bold">
                  {{ menu.title }}
                </div>
              </div>
            </NuxtLink>
          </div>
          <div class="flex flex-col gap-2 pt-5">
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
        <div class="flex justify-between items-center">
          <button
            v-ripple
            type="button"
            aria-label="Toggle Dark Mode"
            class="bg-container flex items-center justify-start gap-3 rounded-full p-3"
            @click="$emit('toggleDark')"
          >
            <Icon name="ph:moon-bold" class="!hidden h-6 w-6 dark:!block" />
            <Icon name="ph:sun-bold" class="h-6 w-6 dark:!hidden" />
          </button>
          <Footer />
        </div>
      </div>
    </div>
    <div class="w-full pb-[60px]">
      <slot />
    </div>
  </div>
</template>
