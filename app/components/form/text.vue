<script lang="ts" setup>
withDefaults(defineProps<{
  formId: string
  label?: string
  placeholder?: string
  disabled?: boolean
  modelValue: any
  inputClass?: string
}>(), {
  inputClass: '',
  disabled: false,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <input
      :placeholder="placeholder"
      :name="formId"
      :disabled="disabled"
      type="text"
      class="bg-container max-w-full rounded-md px-2.5 py-1.5 outline-2 outline-black/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:brightness-90"
      :class="inputClass"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
    >
  </div>
</template>
