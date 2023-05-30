<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutSingleRow title="Admin">
    <div class="space-y-5 px-4">
      <div class="flex">
        <NuxtLink class="bg-container rounded-3xl px-4 py-3 hover:bg-hover" to="/admin/input/url_data">
          Input Data
        </NuxtLink>
      </div>
    </div>
  </LayoutSingleRow>
</template>
