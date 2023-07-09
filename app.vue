<script lang="ts" setup>
useHead({
  noscript: [
    { children: 'JavaScript is required' },
  ],
  link: [
    { rel: 'preload', href: '/fonts/signika/regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    { rel: 'preload', href: '/fonts/signika/700.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
  ],
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
