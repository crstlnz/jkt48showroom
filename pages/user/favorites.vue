<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, pending, error } = useFetch('/api/user/like_list')
</script>

<template>
  <LayoutRow :title="$t('favorites')" :mobile-side="false">
    <template #default>
      <div v-if="pending" class="space-y-3 px-3 md:space-y-4 md:px-4">
        <PulseRecentDetailCard />
        <PulseRecentDetailCard />
        <PulseRecentDetailCard />
      </div>
      <div v-else-if="error">
        <Error :message="$t('data.error')" :img-src="`${$cloudinaryURL}/assets/svg/web/error.svg`" :redirect-msg="$t('backtohome')" />
      </div>
      <div v-else-if="!data?.live.length">
        <Error :message="$t('data.nodata')" img-src="/svg/ufo.svg" :redirect-msg="$t('backtohome')" />
      </div>
      <div v-else>
        <DynamicScroller
          key="loaded"
          :prerender="10"
          :min-item-size="152"
          :items="data.live"
          key-field="data_id"
          class="px-3 md:px-4"
          page-mode
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem :item="item" :active="active" :data-index="index">
              <div class="pb-3 md:pb-4">
                <MemberRecentCard :key="item.data_id" :recent="item" />
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </template>
    <template #sidebar>
      <HomeContainer :title="$t('page.title.recent')" class="xl:mt-4" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
        <HomeRecents />
      </HomeContainer>
    </template>
  </LayoutRow>
</template>
