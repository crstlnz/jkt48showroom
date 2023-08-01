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

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
  },
  noscript: [
    { children: 'JavaScript is required' },
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'preload', href: '/fonts/signika/regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    { rel: 'preload', href: '/fonts/signika/700.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
  ],
  meta: [
    ...(i18nHead.value.meta || []),
    { content: () => themeColor.value, name: 'theme-color' },
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const { group } = useSettings()
const { getGroupTitle, getIcon } = useAppConfig()
useSeoMeta({
  ogTitle: () => `${getGroupTitle(group)} Showroom Log`,
  ogDescription: `A fanmade web for ${getGroupTitle(group)} Showroom live`,
  ogImage: getIcon(group),
  twitterTitle: `${getGroupTitle(group)} Showroom Log`,
  twitterDescription: `A fanmade web for ${getGroupTitle(group)} Showroom live`,
  twitterImage: getIcon(group),
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
</script>

<template>
  <div>
    <VitePwaManifest />
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
      <!-- <NuxtPage
        :key="key"
        :transition="{
          name: 'page',
          mode: 'out-in',
        }"
      /> -->
    </NuxtLayout>
  </div>
</template>
