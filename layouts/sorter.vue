<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

const { group } = useSettings()
const { getIcon, getGroupTitle } = useAppConfig()
useHead({
  title: `${getGroupTitle(group)} Oshi Sorter`,
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: `Sort your favorite ${getGroupTitle(group)} members and discover your top picks. Find your real oshi!`,
    },
  ],
})

const description = `Sort your favorite ${getGroupTitle(group)} members and discover your top picks. Find your real oshi!`
useSeoMeta({
  ogImage: 'https://res.cloudinary.com/haymzm4wp/image/upload/v1695028178/assets/img/oshi_sorter_rfhpsz.png',
  twitterImage: 'https://res.cloudinary.com/haymzm4wp/image/upload/v1695028178/assets/img/oshi_sorter_rfhpsz.png',
  description,
  twitterDescription: description,
  ogDescription: description,
})
</script>

<template>
  <div>
    <ClientOnly>
      <template #fallback>
        <div class="flex h-[100vh] w-[100vw] items-center justify-center">
          <img class="h-20 w-20" :src="getIcon(group)" alt="Logo">
        </div>
      </template>
      <template #default>
        <div class="flex min-h-[100vh] flex-col">
          <div class="mt-8 flex items-center gap-2 self-center text-4xl font-bold md:mt-10">
            <Icon name="solar:square-sort-vertical-bold-duotone" class="text-red-400" size="3rem" />
            <span>Oshi Sorter!</span>
          </div>
          <NuxtLink to="/" class="mb-3 mt-2 text-center font-bold md:mb-5">
            Home
          </NuxtLink>
          <div class="flex flex-1 flex-col">
            <slot />
          </div>
          <footer class="p-6 text-center font-bold my-10 opacity-50">
            <Footer />
          </footer>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
