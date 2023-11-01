<script lang="ts" setup>
useHead({
  title: `JKT48 Showroom API - Crstlnz`,
  // meta: [
  //   {
  //     hid: 'description',
  //     name: 'description',
  //     content: `A fanmade ${title} log web`,
  //   },
  // ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
})
</script>

<template>
  <main class="relative mx-auto flex max-w-[1630px]">
    <slot />
  </main>
</template>
