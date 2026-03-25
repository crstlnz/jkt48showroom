<script lang="ts" setup>
const route = useRoute()
const { data, pending, error } = await useApiFetch<JKT48.News>(`/api/news/${route.params.id}`)
const { locale } = useI18n()

const description = computed(() => {
  const regex = /&[^;]+;/g
  let str = (data.value?.content?.replace(/(<([^>]+)>)/g, '') || '').replace(regex, '')
  if (str.split(' ').length > 25) {
    str = `${str.split(' ').slice(0, 25).join(' ')}...`
  }
  return str
})

const title = computed(() => data.value?.title || 'News')
const content = computed(() => {
  return data.value?.content?.replaceAll('https://jkt48.com/upload/news', `https://jkt48.com/api/v1/storages/media/news/migrated`)?.replaceAll('https://jkt48.com/api/v1/storages/media', `${useRuntimeConfig().public.showroomApi ?? ''}https://jkt48.com/api/v1/storages/media`)?.replaceAll('color: #333333', '')?.replaceAll('color: #1f1f1f;', '')?.replaceAll('color: blue', '')?.replaceAll('color: #000000', '')
})

useSeoMeta({
  title,
  ogTitle: title,
  twitterTitle: title,
  description,
  twitterDescription: description,
  ogDescription: description,
})

useHead({
  title,
})
</script>

<template>
  <div>
    <div v-if="pending" class="relative min-h-screen w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? `${$imgCDN}/assets/svg/web/404.svg` : `${$imgCDN}/assets/svg/web/error.svg`" />
    <LayoutRow v-else title="News" :mobile-side="false">
      <template #default>
        <div class="px-3 md:px-4">
          <div class="flex gap-3 items-start">
            <h3 class="text-2xl font-bold flex-1">
              {{ data?.title }}
            </h3>
            <NuxtLink
              :to="data.url ?? `https://jkt48.com/news/detail/id/${data.id}`"
              :external="true"
              class="group inline-flex mt-1 items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-container px-3 py-1.5 text-sm font-semibold transition-all hover:border-black/20 hover:bg-hover dark:hover:border-white/20"
            >
              <Icon name="lucide:external-link" class="text-sm opacity-75 transition-opacity group-hover:opacity-100" />
              <span class="leading-none">{{ $t('open_original') }}</span>
            </NuxtLink>
          </div>
          <div class="mt-1 flex items-center gap-2">
            <Image
              v-if="data.label"
              class="h-4.75 w-14 rounded-[3px]"
              :src="`${$imgCDN}/assets/jkt48${data.label}`"
              alt="Label"
              loading="lazy"
              fit="fill"
              width="56px"
              format="webp"
            />
            <NewsCategoryBadge v-else-if="data.category" :category="data.category" variant="soft" />
            <span class="size-1 bg-black/15 dark:bg-white/10 rounded-full" />
            <span class="text-sm opacity-80"> {{ $dayjs(data?.date).locale(locale).format("DD MMMM YYYY") }}</span>
          </div>
          <div class="w-full border-b border-dashed border-color-1 my-3" />
          <div class="relative pb-10 px-5 bg-gray-400/10 dark:bg-gray-500/10 rounded-xl pt-5">
            <div id="content" class="overflow-x-auto font-serif!" v-html="content" />
          </div>
        </div>
      </template>
      <template #sidebar>
        <HomeRecents class="mt-3 md:mt-4" />
      </template>
    </LayoutRow>
  </div>
</template>

<style lang="scss">
#content {
  a {
    span {
      color :rgb(235, 54, 54)
    }
  }
}

.dark {
  #content {
    div, span {
      color : rgb(205, 205, 205);
    }

    a {
      span {
        color : rgb(231, 65, 65) !important;
      }
      color : rgb(231, 65, 65) !important;
    }
  }
}
</style>
