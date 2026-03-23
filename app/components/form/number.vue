<script lang="ts" setup>
withDefaults(defineProps<{
  formId: string
  label?: string
  placeholder?: string
  disabled?: boolean
  modelValue: any
}>(), {
  disabled: false,
})

const emit = defineEmits(['update:modelValue'])
function onInput(event: Event) {
  let num: number | undefined = Number((event.target as HTMLInputElement)?.value)
  if (Number.isNaN(num)) num = undefined
  emit('update:modelValue', num)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <input :placeholder="placeholder" :disabled="disabled" type="number" :name="formId" :value="modelValue" class="bg-container-2 max-w-full rounded-md px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:brightness-90" @input="onInput">
  </div>
</template>
