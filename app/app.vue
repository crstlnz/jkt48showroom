<script lang="ts" setup>
import { useSettings } from '~/store/settings'
import useEmbeddedClientDetector from './composables/useEmbeddedClientDetector'

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

const { $pwa } = useNuxtApp()
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
const ctrlK = keys['Ctrl+K']

watch(ctrlK!, (v) => {
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
const { user } = useAuth()

const { isEmbeddedClient } = await useEmbeddedClientDetector()
const showWebviewBlock = ref(false)
const openingExternalBrowser = ref(false)
const browserUrl = ref(url.href)
// const pwaNeedRefresh = computed(() => $pwa?.needRefresh ?? false)
// const pwaCanInstall = computed(() =>
//   ($pwa?.showInstallPrompt ?? false)
//   && !($pwa?.isPWAInstalled ?? false),
// )
// const activePwaPrompt = computed<'update' | 'install' | null>(() => {
//   if (pwaNeedRefresh.value) return 'update'
//   if (pwaCanInstall.value) return 'install'
//   return null
// })
// const showPwaPrompt = computed(() =>
//   !showWebviewBlock.value && activePwaPrompt.value !== null,
// )
// const pwaPromptPrefix = computed(() =>
//   activePwaPrompt.value === 'update' ? 'pwa.update' : 'pwa.install',
// )
// const pwaPromptIcon = computed(() =>
//   activePwaPrompt.value === 'update'
//     ? 'material-symbols:system-update-alt-rounded'
//     : 'material-symbols:download-rounded',
// )
// const pwaPromptIconClass = computed(() =>
//   activePwaPrompt.value === 'update'
//     ? 'bg-green-500/15 text-green-500'
//     : 'bg-blue-500/15 text-blue-500',
// )

// async function installPwa() {
//   await $pwa?.install()
// }

// function dismissPwaInstall() {
//   $pwa?.cancelInstall()
// }

// function applyPwaUpdate() {
//   $pwa?.updateServiceWorker(true)
// }

// function dismissPwaUpdate() {
//   $pwa?.cancelPrompt()
// }

// function dismissPwaPrompt() {
//   if (activePwaPrompt.value === 'update') {
//     dismissPwaUpdate()
//     return
//   }
//   dismissPwaInstall()
// }

// function applyPwaPromptAction() {
//   if (activePwaPrompt.value === 'update') {
//     applyPwaUpdate()
//     return
//   }
//   installPwa()
// }

function wait(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

function createAndroidIntentURL(targetUrl: string) {
  try {
    const parsed = new URL(targetUrl)
    const scheme = parsed.protocol.replace(':', '')
    return `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=${scheme};package=com.android.chrome;end`
  }
  catch {
    return ''
  }
}

function createIOSChromeURL(targetUrl: string) {
  if (targetUrl.startsWith('https://')) {
    return `googlechromes://${targetUrl.slice('https://'.length)}`
  }
  if (targetUrl.startsWith('http://')) {
    return `googlechrome://${targetUrl.slice('http://'.length)}`
  }
  return ''
}

function getDeepLinks(targetUrl: string) {
  const userAgent = navigator.userAgent
  const deepLinks: string[] = []

  if (/Android/i.test(userAgent)) {
    const intentURL = createAndroidIntentURL(targetUrl)
    if (intentURL) deepLinks.push(intentURL)
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const iosChromeURL = createIOSChromeURL(targetUrl)
    if (iosChromeURL) deepLinks.push(iosChromeURL)
  }

  return deepLinks
}

function openDeepLink(urlToOpen: string) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = urlToOpen
  document.body.appendChild(iframe)
  window.setTimeout(() => {
    iframe.remove()
  }, 1000)
}

async function openInExternalBrowser() {
  if (import.meta.server || openingExternalBrowser.value) return false

  openingExternalBrowser.value = true
  browserUrl.value = window.location.href
  let movedToExternalBrowser = false

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      movedToExternalBrowser = true
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  try {
    for (const deepLink of getDeepLinks(browserUrl.value)) {
      openDeepLink(deepLink)
      await wait(450)
      if (movedToExternalBrowser) return true
    }

    window.open(browserUrl.value, '_blank', 'noopener,noreferrer')
    await wait(1400)
    return movedToExternalBrowser || document.visibilityState === 'hidden'
  }
  finally {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    openingExternalBrowser.value = false
  }
}

// async function retryOpenInBrowser() {
//   showWebviewBlock.value = false
//   const success = await openInExternalBrowser()
//   showWebviewBlock.value = !success
// }

// onMounted(async () => {
//   if (!isEmbeddedClient.value) return
//   const success = await openInExternalBrowser()
//   showWebviewBlock.value = !success
// })
</script>

<template>
  <div>
    <div
      v-if="isEmbeddedClient"
      class="fixed bottom-0 bg-red-500 w-full z-9999 px-3 py-1.5 text-center"
    >
      Buka aplikasi asli di <a class="text-blue-200 font-bold" href="https://48live.my.id">https://48live.my.id</a>
    </div>
    <!-- <div
      v-if="showPwaPrompt"
      class="fixed bottom-4 left-1/2 z-99998 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl bg-white dark:bg-dark-1 p-4 shadow-xl border border-color-2"
    >
      <div class="flex items-start gap-3">
        <div
          :class="pwaPromptIconClass"
          class="flex size-9 shrink-0 items-center justify-center rounded-lg"
        >
          <Icon :name="pwaPromptIcon" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold leading-5">
            {{ $t(`${pwaPromptPrefix}.title`) }}
          </div>
          <div class="mt-0.5 text-xs leading-4 opacity-80">
            {{ $t(`${pwaPromptPrefix}.description`) }}
          </div>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          class="rounded-lg bg-hover px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
          @click="dismissPwaPrompt"
        >
          {{ $t(`${pwaPromptPrefix}.later`) }}
        </button>
        <button
          type="button"
          class="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
          @click="applyPwaPromptAction"
        >
          {{ $t(`${pwaPromptPrefix}.action`) }}
        </button>
      </div>
    </div> -->
    <UserCount v-if="user?.is_admin" />
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
    <NuxtPwaManifest />
  </div>
</template>
