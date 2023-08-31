<script lang="ts" setup>
const { isMobile, isSmall } = useResponsive()
const MobileLayout = resolveComponent('LayoutMobile')
const DesktopLayout = resolveComponent('LayoutDesktop')
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
</script>

<template>
  <SplashScreen>
    <component :is="!isMobile ? (isSmall ? MobileLayout : DesktopLayout) : MobileLayout" :menus="menus" @toggle-dark="toggleDark()">
      <slot />
    </component>
  </SplashScreen>
</template>
