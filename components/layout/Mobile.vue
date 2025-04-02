<script lang="ts" setup>
import { DragGesture } from '@use-gesture/vanilla'
import { useScrollLock } from '@vueuse/core'
import { animate } from 'popmotion'
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

watch(isOpen, (open) => {
  isLocked.value = open
})

const { onState, push, back } = usePopState<{ isOpen: boolean }>('menu-nav')

onState((state) => {
  isOpen.value = state?.isOpen ?? false
})

function openMenu() {
  push({
    isOpen: true,
  })
}

function closeMenu() {
  back()
}

const hiddenUsername = useCookie('_h_usrnme', {
  default: () => true,
  maxAge: 3600 * 24 * 30,
  path: '/',
})

// const bgOpacity = ref(0)
const { width } = useWindowSize()

const xPos = ref(100)
const openAnimation = ref<any>(null)
const background = ref<HTMLElement>()
watch(isOpen, (open) => {
  if (openAnimation.value) openAnimation.value.stop()
  if (!background.value) return
  background.value.style.display = 'none'
  openAnimation.value = animate({
    from: xPos.value,
    to: open ? 0 : 100,
    type: 'spring',
    bounce: 0,
    onUpdate(v) {
      xPos.value = v
    },
    onPlay() {
      if (background.value) background.value.style.pointerEvents = !isOpen.value ? 'none' : 'auto'

      // if (!background.value) return
      // background.value.style.pointerEvents = 'auto'
      // background.value.style.display = 'block'
    },
    onStop() {
      // if (!background.value) return
      // if (isOpen.value) {
      //   background.value.style.pointerEvents = 'none'
      //   background.value.style.display = 'none'
      // }
    },
    onComplete() {
      // if (!background.value) return
      // if (isOpen.value) {
      //   background.value.style.pointerEvents = 'none'
      //   background.value.style.display = 'none'
      // }
    },
  })
})

const nav = ref<HTMLElement>()
const dragListener = ref()

function preventDefault(e: Event) {
  e.preventDefault()
}

onMounted(() => {
  document.addEventListener('gesturestart', preventDefault)
  document.addEventListener('gesturechange', preventDefault)
  el.value = document.body

  useEventListener(window, 'popstate', (event) => {
    isOpen.value = !!event.state?.isPopup
  })

  if (!nav.value) return
  dragListener.value = new DragGesture(nav.value, (state) => {
    if (state.down) {
      if (openAnimation.value) openAnimation.value.stop()
      xPos.value = Math.max(0, xPos.value + (state.delta[0] / (80 / 100 * width.value)) * 100)
    }
    else {
      if (xPos.value > 40) {
        closeMenu()
      }
      else {
        openAnimation.value = animate({
          from: xPos.value,
          to: 0,
          type: 'spring',
          bounce: 0,
          onUpdate(v) {
            xPos.value = v
          },
        })
      }
    }
  }, {
    preventDefault: true,
    bounds: {
      left: 0,
    },
    eventOptions: {
      passive: false,
    },
  })
})

onBeforeUnmount(() => {
  if (dragListener.value) {
    dragListener.value.destroy()
  }
  document.removeEventListener('gesturestart', preventDefault)
  document.removeEventListener('gesturechange', preventDefault)
})
</script>

<template>
  <div class="w-full min-h-[100vh]">
    <nav id="navbar" class="fixed inset-x-0 bottom-0 z-nav border-t-2 bg-white drop-shadow-md dark:border-dark-3 dark:bg-dark-2">
      <div class="relative flex h-[60px] gap-4 overflow-hidden px-4">
        <div v-for="menu in menus" :key="menu.title" class="relative flex min-w-0 flex-1 flex-col items-center">
          <NuxtLink v-ripple :to="menu.url" class="relative top-1/2 h-20 w-20 shrink-0 -translate-y-1/2 cursor-pointer rounded-full" :aria-label="menu.title">
            <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1" :class="{ 'bg-hover': route.path === menu.url }">
                <Icon :name="route.path !== menu.url ? menu.icon : menu.activeIcon" class="h-full w-full" />
              </div>
              <div class="shrink-0 text-xs">
                {{ $t(menu.locale_id) }}
              </div>
            </div>
          </NuxtLink>
        </div>
        <button class="relative flex min-w-0 flex-1 flex-col items-center" @click="openMenu">
          <div class="absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full p-5">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1">
              <Icon name="ph:list-fill" class="h-full w-full" />
            </div>
            <div class="shrink-0 text-xs">
              Menu
            </div>
          </div>
        </button>
      </div>
    </nav>
    <div
      ref="background"
      :style="{
        opacity: (100 - xPos) / 100,
        display: xPos === 100 ? 'none' : 'block',
      }"
      :class="{
      }" class="ease fixed inset-0 z-aboveNav bg-black/75" @click="closeMenu"
    />
    <div
      ref="nav"
      :style="{
        transform: `translateX(${xPos}%)`,
      }"
      :class="{
      }" class="bg-container fixed inset-y-0 right-0 z-aboveNav w-[80%] overflow-y-auto p-5 touch-none"
    >
      <div class="flex flex-col h-full">
        <div class="pb-5 border-b-2 border-black/10 dark:border-white/5">
          <NuxtLink :to="authenticated ? undefined : '/login'" class="flex items-center gap-3 rounded-full">
            <div class="h-11 w-11 bg-container-2 rounded-full overflow-hidden">
              <img
                v-if="authenticated && user?.image"
                class="h-full w-full bg-slate-400 text-white dark:bg-dark-1 dark:text-slate-500/50"
                :src="user?.image"
                alt="User profile picture"
              >
              <Icon v-else name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full p-2 text-white dark:text-slate-500/50" />
            </div>
            <div class="mr-3 flex flex-1 flex-col items-start">
              <div class="text-base font-semibold leading-5!">
                {{ authenticated ? user?.name : "Login" }}
              </div>
              <div v-if="authenticated" class="text-left text-sm font-light leading-5!" @click="hiddenUsername = !hiddenUsername">
                <div v-if="!hiddenUsername">
                  {{ authenticated ? user?.account_id : $t('loginwithshowroom') }}
                </div>
                <div v-else class="flex items-center gap-1 align-middle">
                  <span>********</span><Icon name="formkit:hidden" />
                </div>
              </div>
              <div v-else class="text-left text-sm font-light leading-5!">
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
                  {{ $t(menu.locale_id) }}
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
          <div class="flex gap-1.5">
            <button
              v-ripple
              type="button"
              aria-label="Toggle Dark Mode"
              class="bg-container flex items-center justify-start gap-3 rounded-full p-3"
              @click="$emit('toggleDark')"
            >
              <Icon name="ph:moon-bold" class="hidden! h-6 w-6 dark:block!" />
              <Icon name="ph:sun-bold" class="h-6 w-6 dark:hidden!" />
            </button>
            <SettingsDialog />
          </div>

          <Footer />
        </div>
      </div>
    </div>
    <div class="w-full pb-[60px]">
      <slot />
    </div>
  </div>
</template>
