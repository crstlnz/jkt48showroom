<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, pending, error, refresh } = await useApiFetch<ShowroomAPI.Follow>('/api/showroom/follow', { lazy: true, key: 'folloow', server: false })
</script>

<template>
  <LayoutSingleRow :title="$t('follow.title')" :mobile-side="false">
    <template #default>
      <div v-if="error">
        <Error :message="$t('data.error')" :img-src="`${$imgCDN}/assets/svg/web/error.svg`" :redirect-msg="$t('backtohome')" />
      </div>
      <div v-else-if="!pending && !data?.rooms?.length">
        <Error :message="$t('data.nodata')" img-src="/svg/ufo.svg" :redirect-msg="$t('backtohome')" />
      </div>
      <div v-else>
        <FollowGrid :error="error" :pending="pending" :members="data?.rooms || []" :key-id="0" :perpage="150" @update="refresh" />
      </div>
    </template>
    <template #sidebar>
      <HomeRecents class="xl:mt-4" />
    </template>
  </LayoutSingleRow>
</template>
