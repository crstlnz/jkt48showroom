<script lang="ts" setup>
const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const title = 'JKT48 Showroom'
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
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
})
const menus = [
  {
    title: 'Home',
    url: '/',
    mobile: false,
  },
  {
    title: 'Recent',
    url: '/recent',
    mobile: true,
  },
  {
    title: 'Member',
    url: '/member',
    mobile: true,
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
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
const route = useRoute()
watch(route, () => {
  nextTick(() => {
    menuOpen.value = false
  })
})

const { IS_DEV } = useRuntimeConfig()

function handleError(error: any) {
  // eslint-disable-next-line no-console
  if (IS_DEV) console.log(error)
}
</script>

<template>
  <div class="relative flex min-h-[100vh] w-full flex-col">
    <nav class="fixed inset-x-0 top-0 z-nav bg-white shadow-sm dark:bg-dark-1">
      <div class="container mx-auto flex h-16 flex-row-reverse items-center px-4 md:flex-row md:px-3">
        <button
          key="burger"
          type="button"
          aria-label="Open Menu"
          :class="{ open: menuOpen }"
          class="nav-btn burger"
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
        <transition name="fade">
          <div
            v-if="menuOpen"
            key="background-nav"
            class="fixed inset-0 z-belowNav !m-0 bg-black/50 dark:bg-black/60 md:hidden md:opacity-0"
            @click="toggleMenu"
          />
        </transition>
        <ul
          :class="{ 'invisible -translate-x-full': !menuOpen }"
          class="fixed inset-y-0 left-0 z-belowNav flex h-[100%] w-[75%] flex-col overflow-y-auto bg-white p-6 px-10 transition-[visibility,transform] duration-500 dark:bg-dark-1 md:!visible md:static md:top-0 md:h-auto md:w-0 md:flex-1 md:translate-y-0 md:flex-row md:items-center md:justify-end md:gap-6 md:overflow-y-visible md:!bg-transparent md:pt-0 md:transition-none"
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
            class="flex flex-1 items-end justify-center gap-4 py-4 dark:border-slate-100/30 md:border-l-2 md:py-0.5 md:pl-6"
          >
            <div id="nav-actions" class="flex w-full items-center gap-4">
              <button
                type="button"
                aria-label="Toggle Dark Mode"
                class="relative h-8 w-8 cursor-pointer border-slate-800 text-2xl dark:border-slate-100"
                @click="toggleDark"
              >
                <Icon
                  name="ph:moon-bold"
                  size="1.1em"
                  class="absolute left-1/2 top-1/2 !hidden -translate-x-1/2 -translate-y-1/2 dark:!inline-block"
                />
                <Icon
                  name="ph:sun-bold"
                  size="1.1em"
                  class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:!hidden"
                />
              </button>
              <LangSwitch />
              <div class="flex-1">
                <NuxtLink to="/login" aria-label="Login" class="float-right flex h-10 w-10 items-center justify-center rounded-full border-2 bg-slate-100 dark:border-dark-3 dark:bg-dark-2">
                  <Icon name="ic:baseline-person" class="text-slate-400 dark:text-slate-500/50" size="1.5em" />
                </NuxtLink>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container mx-auto mt-16 flex-1">
      <NuxtErrorBoundary @error="handleError">
        <template #error>
          <Error :message="$t('error.unknown')" :alt="$t('error.unknown')" img-src="/svg/error.svg" url="/" />
        </template>
        <slot />
      </NuxtErrorBoundary>
    </div>

    <footer class="flex items-center justify-center pb-10 pt-14 font-bold">
      <a class="ml-1 font-bold" target="_blank" href="https://twitter.com/crstlnz">@crstlnz</a>
    </footer>
  </div>
</template>
