<script lang="ts" setup>
const route = useRoute()
const { data, pending, error } = await useApiFetch<JKT48.News>(`/api/news/${route.params.id}`)
const { locale } = useI18n()

const description = computed(() => {
  const regex = /&[^;]+;/g
  let str = (data.value?.content?.replace(/(<([^>]+)>)/ig, '') || '').replace(regex, '')
  if (str.split(' ').length > 25) {
    str = `${str.split(' ').slice(0, 25).join(' ')}...`
  }
  return str
})

const title = computed(() => data.value?.title || 'News')
const content = computed(() => {
  return data.value?.content?.replaceAll('color: #333333', '')?.replaceAll('color: #1f1f1f;', '')?.replaceAll('color: blue', '')?.replaceAll('color: #000000', '')
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
    <div v-if="pending" class="relative min-h-[100vh] w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? `${$cloudinaryURL}/assets/svg/web/404.svg` : `${$cloudinaryURL}/assets/svg/web/error.svg`" />
    <LayoutRow v-else title="News" :mobile-side="false">
      <template #default>
        <div class="px-3 md:px-4">
          <h3 class="text-2xl font-bold">
            {{ data?.title }}
          </h3>
          <div class="mb-5 mt-2 flex items-center gap-2">
            <NuxtImg
              class="h-[19px] w-[56px] rounded-[3px]"
              :src="`${$cloudinaryURL}/assets/jkt48${data.label}`"
              alt="Label"
              loading="lazy"
              fit="fill"
              width="56px"
              format="webp"
            />
            <span class="text-sm"> {{ $dayjs(data?.date).locale(locale).format("DD MMMM YYYY") }}</span>
          </div>
          <div class="flex mb-3">
            <NuxtLink :to="`https://jkt48.com/news/detail/id/${data.id}`" :external="true" class="flex items-center gap-1.5 bg-red-500 px-2 rounded-md py-1 self-start">
              <Icon name="pepicons-pencil:internet" class="text-white" />
              <span class="text-white"> {{ $t('open_original') }}</span>
            </NuxtLink>
          </div>
          <div id="content" class="overflow-x-auto pb-20 !font-serif" v-html="content" />
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
