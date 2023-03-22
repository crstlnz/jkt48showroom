<script lang="ts" setup>
const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true
})

const title = 'JKT48 Showroom'
const menuOpen = ref(false)

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
    class: () => menuOpen.value ? 'max-md:overflow-hidden' : ''
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
  <div class="flex min-h-[100vh] w-full flex-col">
    <transition name="fade">
      <div
        v-if="menuOpen"
        key="background-nav"
        class="fixed inset-0 z-[100] !m-0 bg-black/30 dark:bg-black/40 md:hidden md:opacity-0"
        @click="toggleMenu"
      />
    </transition>

    <nav class="fixed inset-x-0 top-0 z-[1000] bg-white shadow-sm dark:bg-dark-1">
      <div class="container mx-auto flex h-16 flex-row-reverse items-center px-4 md:flex-row md:px-3">
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

        <div class="flex w-0 flex-1 items-center md:w-auto md:flex-none">
          <NuxtLink
            class="inline-block truncate py-2 text-2xl font-bold hover:text-blue-400"
            to="/"
          >
            <h1 class="font-black hover:font-bold">
              {{ title }}
            </h1>
          </NuxtLink>
        </div>

        <ul
          :class="{ 'invisible translate-y-full': !menuOpen }"
          class="absolute inset-x-0 top-full z-[100] h-[calc(100vh_-_4rem)] overflow-y-auto overscroll-contain bg-white pt-4 transition-[visibility,transform] duration-500 dark:bg-dark-1 md:!visible md:static md:top-0 md:flex md:h-auto md:w-0 md:flex-1 md:translate-y-0 md:flex-row md:items-center md:justify-end md:gap-6 md:overflow-y-visible md:!bg-transparent md:pt-0 md:transition-none"
        >
          <li v-for="menu in menus" :key="menu.title" :class="{ 'md:hidden': !menu.mobile }">
            <NuxtLink
              :to="menu.url"
              class="inline-block w-full py-4 text-center text-xl hover:text-blue-400 md:py-0"
              active-class="text-blue-500"
            >
              {{ menu.title }}
            </NuxtLink>
          </li>
          <li
            class="flex items-center justify-center gap-4 py-4 dark:border-slate-100/30 md:border-l-2 md:py-0.5 md:pl-6"
          >
            <LangSwitch />
            <button
              type="button"
              aria-label="Toggle Dark Mode"
              class="relative h-6 w-6 cursor-pointer border-slate-800 text-2xl dark:border-slate-100"
              @click="toggleDark"
            >
              <Icon
                name="ph:moon-bold"
                class="absolute left-1/2 top-1/2 !hidden -translate-x-1/2 -translate-y-1/2 dark:!inline-block"
              />
              <Icon
                name="ph:sun-bold"
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:!hidden"
              />
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container mx-auto mt-16 flex-1 px-3">
      <NuxtErrorBoundary @error="handleError">
        <template #error>
          <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" img-src="/svg/error.svg" :url="'/'" />
        </template>
        <slot />
      </NuxtErrorBoundary>
    </div>

    <footer class="flex items-center justify-center pt-14 pb-10 font-bold">
      Created by<a class="ml-1" target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
    </footer>
  </div>
</template>
