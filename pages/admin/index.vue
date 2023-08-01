<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutRow title="Admin">
    <div class="space-y-3 px-4">
      <div class="flex flex-wrap gap-4">
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/input/url_data">
          Input Data
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/member">
          Showroom Member
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/stage48">
          Stage48
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/fans">
          Fans List
        </NuxtLink>
      </div>
      <AdminMissingJiko />
    </div>
    <template #sidebar>
      <HomeLiveNowSide class="mt-4" />
      <HomeContainer :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
        <HomeRecents />
      </HomeContainer>
    </template>
  </LayoutRow>
</template>
