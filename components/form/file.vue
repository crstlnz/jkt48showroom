<script lang="ts" setup>
defineProps<{
  formId: string
  label?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <input :name="formId" type="file" class="bg-container max-w-full rounded-md px-2.5 py-1.5">
  </div>
</template>
