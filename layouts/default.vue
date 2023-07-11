<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const settings = useSettings()
const { getIcon } = useAppConfig()

const { getTitle, getFavicon } = useAppConfig()
const title = getTitle(settings.group)
const menuOpen = ref(false)

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
    class: () => menuOpen.value ? 'max-md:overflow-hidden' : '',
  },
  titleTemplate: t => t ? `${t} - ${title}` : title,
  meta: [
    ...(i18nHead.value.meta || []),
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      hid: 'description',
      name: 'description',
      content: 'JKT48 Showroom Logs',
    },
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'icon', type: 'image/x-icon', href: getFavicon(settings.group) },
  ],
})

const menus: MenuItem[] = [
  {
    title: 'Home',
    url: '/',
    mobile: true,
    icon: 'mingcute:home-5-line',
    activeIcon: 'mingcute:home-5-fill',
  },
  {
    title: 'Recent',
    url: '/recent',
    mobile: true,
    icon: 'majesticons:list-box-line',
    activeIcon: 'majesticons:list-box',
  },
  {
    title: 'Member',
    url: '/member',
    mobile: true,
    icon: 'heroicons:user-group',
    activeIcon: 'heroicons:user-group-solid',
  },
  {
    title: 'Favorites',
    url: '/user/favorites',
    login: true,
    mobile: true,
    icon: 'ic:round-favorite-border',
    activeIcon: 'ic:round-favorite',
  },
  {
    title: 'Admin',
    url: '/admin',
    login: true,
    mobile: false,
    admin: true,
    icon: 'material-symbols:shield-person-outline-rounded',
    activeIcon: 'material-symbols:shield-person-rounded',
  },
  // {
  //   title: 'Watch',
  //   url: '/watch/Kareai_hinata',
  //   mobile: true
  // }
]
const colorMode = useColorMode()
function toggleDark() {
  if (colorMode.value === 'dark') {
    colorMode.preference = 'light'
  }
  else {
    colorMode.preference = 'dark'
  }
}

const route = useRoute()
watch(route, () => {
  nextTick(() => {
    menuOpen.value = false
  })
})

const { isMobile, isSmall } = useResponsive()
const MobileLayout = resolveComponent('LayoutMobile')
const DesktopLayout = resolveComponent('LayoutDesktop')
</script>

<template>
  <main class="relative mx-auto flex max-w-[1630px]">
    <ClientOnly>
      <template #fallback>
        <div class="flex h-[100vh] w-[100vw] items-center justify-center">
          <img class="h-20 w-20" :src="getIcon(settings.group)" alt="Logo">
        </div>
      </template>
      <!-- <DesktopLayout :menus="menus" @toggle-dark="toggleDark()">
        <slot />
      </DesktopLayout> -->
      <component :is="!isMobile ? (isSmall ? MobileLayout : DesktopLayout) : MobileLayout" :menus="menus" @toggle-dark="toggleDark()">
        <slot />
      </component>
    </ClientOnly>
  </main>
</template>
