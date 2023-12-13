<script lang="ts" setup>
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

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
  },
  noscript: [
    { children: 'JavaScript is required' },
  ],
  link: [
    { rel: 'canonical', href: url.href },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=Noto+Serif+JP:wght@300;400;600;700;900&display=swap' },

    // ...(i18nHead.value.link || []),
    // { rel: 'preload', href: '/fonts/signika/regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    // { rel: 'preload', href: '/fonts/signika/700.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
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
    if (e.code === 'Escape' && e.type === 'keydown' && document.activeElement?.id === 'search') {
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
    const input = document.querySelector('input#search') as HTMLElement | null
    input?.focus()
  }
})

useCSRF()
</script>

<template>
  <div>
    <NuxtLoadingIndicator
      :height="4"
    />
    <Dialog />
    <ShowroomUserDraggable />
    <NotificationView />
    <NuxtLayout>
      <NuxtPage
        :key="key"
      />
    </NuxtLayout>
  </div>
</template>
