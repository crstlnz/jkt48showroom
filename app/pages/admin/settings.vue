<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutRow title="Settings">
    <div class="p-3">
      <ButtonPost url="/api/admin/clear_cache" class="w-full rounded-xl bg-blue-500 p-3">
        Clear Cache
      </ButtonPost>
    </div>
  </LayoutRow>
</template>
