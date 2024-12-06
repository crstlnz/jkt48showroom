<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutRow title="Admin">
    <div class="space-y-3 px-4">
      <div class="flex flex-wrap gap-3">
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/input/showroom">
          Input Data
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/missing_jkt48id">
          Missing JKT48 Id
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/setlist">
          Setlist
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/member">
          Showroom
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/stage48">
          Stage48
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/fans">
          Fans List
        </NuxtLink>
        <NuxtLink class="bg-container flex items-center gap-1 rounded-3xl px-3.5 py-2 text-sm hover:bg-hover" to="/admin/settings">
          <Icon name="ic:round-settings" />
          Settings
        </NuxtLink>
      </div>
      <AdminMissingJiko />
    </div>
    <template #sidebar>
      <ClientOnly>
        <template #fallback>
          <div class="bg-container w-full aspect-[4/5] rounded-xl animate-pulse xl:mt-4" />
          <div class="bg-container w-full aspect-[4/12] rounded-xl animate-pulse" />
        </template>
        <HomeLiveNowSide class="mt-4" />
        <HomeRecents />
      </ClientOnly>
    </template>
  </LayoutRow>
</template>
