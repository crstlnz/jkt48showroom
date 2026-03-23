<script lang="ts" setup>
withDefaults(defineProps<{
  formId: string
  label?: string
  modelValue: any
  disabled?: boolean
  inputClass?: string
  data: { title: string, value: string }[]
}>(), {
  inputClass: '',
  disabled: false,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <select
      id="member_data"
      :class="inputClass"
      :disabled="disabled"
      :value="modelValue" class="rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:brightness-90"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
    >
      <option :value="undefined">
        No data
      </option>
      <option v-for="m in data" :key="m.value" :value="m.value">
        {{ m.title }}
      </option>
    </select>
  </div>
</template>
