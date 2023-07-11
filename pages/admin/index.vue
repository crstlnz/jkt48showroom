<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutSingleRow title="Admin">
    <div class="space-y-5 px-4">
      <div class="flex gap-4">
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/input/url_data">
          Input Data
        </NuxtLink>
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/member">
          Member
        </NuxtLink>
      </div>
    </div>
  </LayoutSingleRow>
</template>
