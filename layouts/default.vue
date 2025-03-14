<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const settings = useSettings()

const { getTitle } = useAppConfig()
const title = computed(() => getTitle(settings.group))
const menuOpen = ref(false)

useHead({
  htmlAttrs: {
    class: () => menuOpen.value ? 'max-md:overflow-hidden' : '',
  },
  titleTemplate: t => t ? `${t} | ${title.value}` : title.value,
})

const { group } = useSettings()

const menus: MenuItem[] = [
  {
    title: 'Home',
    locale_id: 'menu.home',
    url: '/',
    mobile: true,
    icon: 'mingcute:home-5-line',
    activeIcon: 'mingcute:home-5-fill',
  },
  {
    title: 'Multi Viewer',
    locale_id: 'menu.multi_viewer',
    url: '/multi',
    mobile: false,
    icon: 'iconamoon:player-play-bold',
    activeIcon: 'iconamoon:player-play-fill',
  },
  {
    title: 'Recent',
    url: '/recent',
    locale_id: 'menu.recent',
    mobile: true,
    icon: 'fluent:history-16-regular',
    activeIcon: 'fluent:history-16-filled',
  },
  // {
  //   title: 'Sousenkyo 2024',
  //   url: '/sousenkyo2024',
  //   locale_id: 'menu.sousenkyo',
  //   mobile: false,
  //   icon: 'mdi:crown-outline',
  //   activeIcon: 'mdi:crown',
  // },
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
    locale_id: 'menu.member',
    mobile: true,
    icon: 'heroicons:user-group',
    activeIcon: 'heroicons:user-group-solid',
  },
  {
    title: 'Event',
    url: '/event',
    locale_id: 'menu.event',
    mobile: true,
    group: 'jkt48',
    icon: 'material-symbols:event-note-outline-sharp',
    activeIcon: 'material-symbols:event-note-sharp',
  },
  {
    title: 'News',
    url: '/news',
    locale_id: 'menu.news',
    group: 'jkt48',
    mobile: false,
    icon: 'fluent:news-20-regular',
    activeIcon: 'fluent:news-20-filled',
  },
  // {
  //   title: 'Follow',
  //   url: '/user/follow',
  //   login: true,
  //   mobile: false,
  //   icon: 'ic:round-favorite-border',
  //   activeIcon: 'ic:round-favorite',
  // },
  // {
  //   title: 'Stats',
  //   locale_id: 'menu.stats',
  //   url: '/stats',
  //   login: false,
  //   mobile: true,
  //   icon: 'solar:ranking-linear',
  //   activeIcon: 'solar:ranking-bold',
  // },
  {
    title: 'Bookmark',
    locale_id: 'menu.bookmark',
    url: '/user/bookmark',
    login: true,
    mobile: group !== 'jkt48',
    icon: 'heroicons:bookmark',
    activeIcon: 'heroicons:bookmark-20-solid',
  },
  {
    title: 'Oshi Sorter',
    locale_id: 'menu.oshi_sorter',
    url: '/sorter',
    mobile: false,
    icon: 'solar:square-sort-vertical-linear',
    activeIcon: 'solar:square-sort-vertical-bold',
  },
  {
    title: 'Admin',
    url: '/admin',
    locale_id: 'menu.admin',
    login: true,
    mobile: false,
    admin: true,
    icon: 'material-symbols:shield-person-outline-rounded',
    activeIcon: 'material-symbols:shield-person-rounded',
  },
  // {
  //   title: 'Lapor Bug',
  //   url: '/feedback',
  //   locale_id: 'menu.report_bugs',
  //   mobile: false,
  //   icon: 'fluent:person-feedback-16-regular',
  //   activeIcon: 'fluent:person-feedback-16-filled',
  // },
  {
    title: 'About',
    url: '/about',
    locale_id: 'menu.about',
    mobile: false,
    icon: 'material-symbols:info-outline-rounded',
    activeIcon: 'material-symbols:info-rounded',
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

const { isMobile } = useResponsive()
const MobileLayout = resolveComponent('LayoutMobile')
const DesktopLayout = resolveComponent('LayoutDesktop')
</script>

<template>
  <main class="flex mx-auto max-w-[1650px]">
    <MobileLayout v-if="isMobile" :menus="menus" @toggle-dark="toggleDark()">
      <slot />
    </MobileLayout>
    <DesktopLayout v-else :menus="menus" @toggle-dark="toggleDark()">
      <slot />
    </DesktopLayout>
  </main>
</template>
