<script lang="ts" setup>
const route = useRoute()
const { data, pending, error } = useLazyFetch(`/api/jkt48/news/${route.params.id}`)
const dayjs = useDayjs()
const { locale } = useI18n()
</script>

<template>
  <div>
    <div v-if="pending" class="relative min-h-[100vh] w-full">
      <Icon name="eos-icons:loading" size="3rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 " />
    </div>
    <Error v-else-if="error || !data" :message="error ? (error.statusCode === 404 ? $t('error.pagenotfound') : $t('error.unknown')) : $t('error.pagenotfound')" :img-src="!data || error?.statusCode === 404 ? '/svg/404.svg' : '/svg/error.svg'" />
    <LayoutRow v-else title="News" :mobile-side="false">
      <template #default>
        <div class="px-3 md:px-4">
          <h3 class="text-2xl font-bold">
            {{ data?.title }}
          </h3>
          <div class="mb-5 mt-2 flex items-center gap-2">
            <img v-if="data?.label" :src="`https://jkt48.com${data?.label}`" alt="Label" class="h-[18px] w-[58px] rounded-[3px]">
            <span class="text-sm"> {{ dayjs(data?.date).locale(locale).format("DD MMMM YYYY") }}</span>
          </div>
          <div id="content" class="overflow-x-auto pb-20" v-html="data?.content" />
        </div>
      </template>
    </LayoutRow>
  </div>
</template>

<style lang="scss">
#content {
  a {
    span {
      color :rgb(235, 54, 54) !important;
    }
  }
}

.dark {
  #content {
    div, span {
      color : rgb(205, 205, 205) !important;
    }
  }
}
</style>
