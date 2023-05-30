<script lang="ts" setup>
defineProps<{
  formId: string
  label?: string
  placeholder?: string
  modelValue: any
}>()
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <input :placeholder="placeholder" :name="formId" type="text" class="bg-container max-w-full rounded-md px-2.5 py-1.5" @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)">
  </div>
</template>
