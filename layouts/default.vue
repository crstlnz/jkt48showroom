<script lang="ts" setup>
const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true
})

const title = 'JKT48 Showroom'
useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir
  },
  titleTemplate: t => t ? `${t} - ${title}` : title,
  meta: [
    ...(i18nHead.value.meta || []),
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      hid: 'description',
      name: 'description',
      content: 'JKT48 Showroom Logs'
    }
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
const menuOpen = ref(false)
const menus = [
  {
    title: 'Home',
    url: '/',
    mobile: false
  },
  {
    title: 'Recent',
    url: '/recent',
    mobile: true
  },
  {
    title: 'Member',
    url: '/member',
    mobile: true
  }
  // {
  //   title: 'Watch',
  //   url: '/watch/rina0129',
  //   mobile: true
  // }
]
const colorMode = useColorMode()
function toggleDark () {
  if (colorMode.value === 'dark') {
    colorMode.preference = 'light'
  } else {
    colorMode.preference = 'dark'
  }
}
function toggleMenu () {
  menuOpen.value = !menuOpen.value
}
const route = useRoute()
watch(route, () => {
  nextTick(() => {
    menuOpen.value = false
  })
})

const { IS_DEV } = useRuntimeConfig()

function handleError (error: any) {
  // eslint-disable-next-line no-console
  if (IS_DEV) { console.log(error) }
}
</script>

<template>
  <div class="w-full min-h-[100vh] flex flex-col">
    <transition name="fade">
      <div
        v-if="menuOpen"
        key="background-nav"
        class="md:hidden md:opacity-0 bg-black/30 dark:bg-black/40 fixed top-0 left-0 right-0 bottom-0 z-[100] !m-0"
        @click="toggleMenu"
      />
    </transition>

    <nav class="fixed z-[1000] top-0 left-0 right-0 bg-white dark:bg-dark-1 shadow-sm">
      <div class="container h-16 flex items-center mx-auto px-4 md:px-3 flex-row-reverse md:flex-row">
        <button
          key="burger"
          type="button"
          aria-label="Open Menu"
          :class="{ open: menuOpen }"
          class="burger nav-btn"
          @click="toggleMenu"
        >
          <span />
          <span />
          <span />
        </button>

        <div class="flex-1 md:flex-none w-0 md:w-auto items-center flex">
          <NuxtLink
            class="text-2xl py-2 hover:text-blue-400 inline-block font-bold truncate"
            to="/"
          >
            <h1 class="font-black hover:font-bold">
              {{ title }}
            </h1>
          </NuxtLink>
        </div>

        <ul
          :class="{ 'translate-y-full invisible': !menuOpen }"
          class="absolute z-[100] top-full transition-[visibility,transform] pt-4 md:pt-0 duration-500 md:flex md:flex-row md:justify-end md:items-center md:gap-6 md:transition-none md:translate-y-0 md:!visible md:flex-1 md:w-0 md:static md:top-0 h-[calc(100vh_-_4rem)] md:h-auto left-0 right-0 overflow-y-auto md:overflow-y-visible bg-white dark:bg-dark-1 md:!bg-transparent overscroll-contain"
        >
          <li v-for="menu in menus" :key="menu.title" :class="{ 'md:hidden': !menu.mobile }">
            <NuxtLink
              :to="menu.url"
              class="text-xl hover:text-blue-400 inline-block text-center w-full py-4 md:py-0"
              active-class="text-blue-500"
            >
              {{ menu.title }}
            </NuxtLink>
          </li>
          <li
            class="flex gap-4 md:pl-6 md:border-l-2 dark:border-slate-100/30 py-4 md:py-0.5 items-center justify-center"
          >
            <LangSwitch />
            <button
              type="button"
              aria-label="Toggle Dark Mode"
              class="border-slate-800 dark:border-slate-100 cursor-pointer relative text-2xl w-6 h-6"
              @click="toggleDark"
            >
              <Icon
                name="ph:moon-bold"
                class="!hidden dark:!inline-block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
              <Icon
                name="ph:sun-bold"
                class="dark:!hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container mt-16 px-3 mx-auto flex-1">
      <NuxtErrorBoundary @error="handleError">
        <template #error>
          <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" img-src="/svg/error.svg" :url="'/'" />
        </template>
        <slot />
      </NuxtErrorBoundary>
    </div>

    <footer class="pt-14 pb-10 font-bold flex items-center justify-center">
      Created by<a class="ml-1" target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
    </footer>
  </div>
</template>
