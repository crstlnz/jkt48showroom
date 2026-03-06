<script lang="ts" setup>
import { useSettings } from '~/store/settings'

const { group } = useSettings()
const { t } = useI18n()
const { getIcon, getGroupTitle } = useAppConfig()
const groupTitle = getGroupTitle(group)
const description = t('sorter.layout_description', { group: groupTitle })

useHead({
  title: `${groupTitle} ${t('menu.oshi_sorter')}`,
  meta: [
    {
      id: 'description',
      name: 'description',
      content: description,
    },
  ],
})

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
        <div class="flex h-screen w-screen items-center justify-center">
          <img class="h-20 w-20" :src="getIcon(group)" alt="Logo">
        </div>
      </template>
      <template #default>
        <div class="flex min-h-screen flex-col">
          <div class="mt-8 flex items-center gap-2 self-center text-4xl font-bold md:mt-10">
            <Icon name="solar:square-sort-vertical-bold-duotone" class="text-red-400" size="3rem" />
            <span>{{ $t('menu.oshi_sorter') }}!</span>
          </div>
          <NuxtLink to="/" class="mb-3 mt-2 text-center font-bold md:mb-5">
            {{ $t('menu.home') }}
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
