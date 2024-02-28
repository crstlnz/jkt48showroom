<script lang="ts" setup>
import { NuxtPwaManifest } from '#components'
import { useSettings } from '~~/store/settings'

const colorMode = useColorMode()
const themeColor = computed(() => {
  return (colorMode.preference === 'dark') ? '#1e2124' : '#f1f5f9'
})

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const url = useRequestURL()
const settings = useSettings()
const { getFavicon } = useAppConfig()

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
  },
  noscript: [
    {
      children: 'JavaScript is required',
    },
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'icon', type: 'image/x-icon', href: getFavicon(settings.group) },
    { rel: 'canonical', href: url.href },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
  ],
  meta: [
    ...(i18nHead.value.meta || []),
    { content: () => themeColor.value, name: 'theme-color' },
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const { group } = useSettings()
const { getGroupTitle, getMetaImage } = useAppConfig()
const description = `A Fanmade Website for ${getGroupTitle(group)} Showroom. Discover the latest ${getGroupTitle(group)} member showroom live streams, member profile, and fans ranking!`
useSeoMeta({
  ogTitle: () => `${getGroupTitle(group)} Showroom Log`,
  description,
  ogSiteName: `${getGroupTitle(group)} Showroom Log`,
  ogDescription: description,
  ogImage: getMetaImage(group),
  twitterTitle: `${getGroupTitle(group)} Showroom Log`,
  twitterDescription: description,
  twitterImage: getMetaImage(group),
  twitterCard: 'summary',
})

// TODO: Remove when https://github.com/vuejs/core/issues/5513 fixed
const key = ref(0)
const messages = [
  'Uncaught NotFoundError: Failed to execute \'insertBefore\' on \'Node\': The node before which the new node is to be inserted is not a child of this node.', // chromium based
  'NotFoundError: The object can not be found here.', // safari
]
if (typeof window !== 'undefined') {
  // @ts-expect-error using arbitrary window key
  if (!window.__vue5513) {
    window.addEventListener('error', (event) => {
      if (messages.includes(event.message)) {
        event.preventDefault()
        console.warn(
          'Rerendering layout because of https://github.com/vuejs/core/issues/5513',
        )
        key.value++
      }
    })
  }
  // @ts-expect-error using arbitrary window key
  window.__vue5513 = true
}

// const { $pwa } = useNuxtApp()
const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.code === 'Escape' && e.type === 'keydown' && document.activeElement?.id === 'search_shortcut') {
      if ((document.activeElement as HTMLInputElement | null)?.value !== '') {
        (document.activeElement as HTMLInputElement).value = '';
        (document.activeElement as HTMLInputElement).blur()
      }
    }
    else
      if (e.code === 'KeyK' && e.ctrlKey) {
        e.preventDefault()
      }
  },
})
const shiftCtrlA = keys['Ctrl+K']

watch(shiftCtrlA, (v) => {
  if (v) {
    const input = document.querySelector('input#search_shortcut') as HTMLElement | null
    input?.focus()
  }
})

// useCSRF()
useAuth()
</script>

<template>
  <div>
    <!-- <NuxtLoadingIndicator
      :height="4"
    /> -->
    <Dialog />
    <LiveUserDraggable />
    <NotificationView />
    <NuxtLayout>
      <NuxtPage
        :key="key"
        :transition="{
          name: 'page',
          mode: 'out-in',
        }"
      />
    </NuxtLayout>
    <NuxtPwaManifest />
    <!-- <ClientOnly>
      <div v-if="$pwa" v-show="$pwa.needRefresh" class="fixed bottom-[72px] left-1/2 z-notification flex max-w-[90%] -translate-x-1/2 items-center rounded-xl bg-blue-400/75 p-3 backdrop-blur-md sm:bottom-4 md:p-4">
        <Icon name="ic:round-browser-updated" class="mr-1.5 h-4 w-4 md:h-5 md:w-5" />
        <span class="truncate whitespace-nowrap text-sm md:text-base">
          New update available!
        </span>
        <button class="ml-2.5 rounded-md bg-blue-500 px-2.5 py-0.5 text-sm transition-transform active:scale-95 md:ml-3.5 md:px-3 md:py-1 md:text-base" @click="$pwa.updateServiceWorker()">
          Reload
        </button>
      </div>
    </ClientOnly> -->
  </div>
</template>
