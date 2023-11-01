<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const settings = useSettings()
const { getIcon } = useAppConfig()

const { getTitle, getFavicon } = useAppConfig()
const title = getTitle(settings.group)
const menuOpen = ref(false)

useHead({
  htmlAttrs: {
    class: () => menuOpen.value ? 'max-md:overflow-hidden' : '',
  },
  titleTemplate: t => t ? `${t} - ${title}` : title,
  // meta: [
  //   {
  //     hid: 'description',
  //     name: 'description',
  //     content: `A fanmade ${title} log web`,
  //   },
  // ],
  link: [
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
    icon: 'fluent:history-16-regular',
    activeIcon: 'fluent:history-16-filled',
  },
  {
    title: 'News',
    url: '/news',
    group: 'jkt48',
    mobile: false,
    icon: 'fluent:news-20-regular',
    activeIcon: 'fluent:news-20-filled',
  },
  // {
  //   title: 'Schedule',
  //   url: '/schedule',
  //   group: 'jkt48',
  //   mobile: false,
  //   icon: 'bx:calendar',
  //   activeIcon: 'bxs:calendar',
  // },
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
    title: 'Oshi Sorter',
    url: '/sorter',
    mobile: false,
    icon: 'solar:square-sort-vertical-linear',
    activeIcon: 'solar:square-sort-vertical-bold',
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
    <SplashScreen>
      <Component :is="!isMobile ? (isSmall ? MobileLayout : DesktopLayout) : MobileLayout" :menus="menus" @toggle-dark="toggleDark()">
        <slot />
      </Component>
    </SplashScreen>
  </main>
</template>
