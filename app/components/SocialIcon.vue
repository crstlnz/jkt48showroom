<script setup lang="ts">
defineProps<{
  social: SocialNetwork
}>()
</script>

<template>
  <NuxtLink :to="social.url" target="_blank">
    <Icon v-if="!['showroom-live', 'tiktok', 'idn'].some(i => social.url.includes(i))" :name="$getSocialColorIcon(social.url) ?? ''" class="size-full p-1 lg:p-2" />
    <div v-else-if="social.url.includes('showroom-live')" class="size-full p-0.5 lg:p-1.5">
      <img src="https://static.showroom-live.com/assets/img/v3/app-icon.png?t=1667879557" alt="" class="size-full">
    </div>
    <div v-else-if="social.url.includes('tiktok')" class="size-full p-0.5 lg:p-1.5">
      <img src="https://www.tiktok.com/favicon.ico" alt="" class="size-full rounded-md">
    </div>
    <div v-else-if="social.url.includes('idn')" class="size-full p-0.5 lg:p-1.5">
      <img src="https://www.idn.app/_next/static/media/logo_idn_app.b557eeeb.svg" alt="" class="size-full rounded-md">
    </div>
    <div v-else class="size-full p-0.5 lg:p-1.5">
      <div class="size-full rounded-md bg-container" />
    </div>
  </NuxtLink>
</template>
