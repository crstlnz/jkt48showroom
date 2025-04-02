<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const colorMode = useColorMode()
const themeColor = computed(() => {
  return colorMode.preference === 'dark' ? '#1e2124' : '#f1f5f9'
})

const i18nHead = useLocaleHead({
  dir: true,
  lang: true,
  seo: true,
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
      innerHTML: 'JavaScript is required',
    },
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'icon', type: 'image/x-icon', href: getFavicon(settings.group) },
    { rel: 'canonical', href: url.href },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous',
    },
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
const description = `A Fanmade Website for ${getGroupTitle(
  group,
)} Showroom. Discover the latest ${getGroupTitle(
  group,
)} member showroom live streams, member profile, and fans ranking!`

useSeoMeta({
  title: `${getGroupTitle(group)} Showroom Log`,
  ogTitle: () => `${getGroupTitle(group)} Showroom Log`,
  description,
  ogSiteName: `${getGroupTitle(group)} Showroom Log`,
  ogDescription: description,
  ogImage: getMetaImage(group),
  twitterTitle: `${getGroupTitle(group)} Showroom Log`,
  twitterDescription: description,
  twitterImage: getMetaImage(group),
  twitterCard: 'summary',
  ogType: 'website',
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
    if (
      e.code === 'Escape'
      && e.type === 'keydown'
      && document.activeElement?.id === 'search_shortcut'
    ) {
      if ((document.activeElement as HTMLInputElement | null)?.value !== '') {
        ;(document.activeElement as HTMLInputElement).value = ''
        ;(document.activeElement as HTMLInputElement).blur()
      }
    }
    else if (e.code === 'KeyK' && e.ctrlKey) {
      e.preventDefault()
    }
  },
})
const shiftCtrlA = keys['Ctrl+K']

watch(shiftCtrlA, (v) => {
  if (v) {
    const input = document.querySelector(
      'input#search_shortcut',
    ) as HTMLElement | null
    input?.focus()
  }
})

const navRect = useState<DOMRect | null>('navRect', () => null)
const navElement = ref<HTMLElement>()

onMounted(() => {
  const el = document.querySelector('#navbar')
  if (el) {
    navElement.value = el as HTMLElement
    navRect.value = el.getBoundingClientRect()
  }
})

const { width } = useElementSize(navElement)
watch(width, () => {
  navRect.value = navElement.value!.getBoundingClientRect()
})

// useCSRF()
useAuth()
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
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
    <!-- <NuxtPwaManifest /> -->
  </div>
</template>
