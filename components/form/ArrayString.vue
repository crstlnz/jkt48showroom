<script lang="ts" setup>
import { useFocus } from '@vueuse/core'

const props = withDefaults(defineProps<{
  formId: string
  label?: string
  modelValue: string[]
  inputClass?: string
  data: { title: string, value: string }[]
}>(), {
  inputClass: '',
})

const emit = defineEmits(['update:modelValue'])
const input = ref<HTMLInputElement>()
const { focused } = useFocus(input)
//
function add() {
  if (!input.value) return
  if (props.modelValue?.includes(input.value.value)) return
  emit('update:modelValue', [...props.modelValue, input.value.value || ''])
  input.value.value = ''
}

function remove(data: string) {
  return emit('update:modelValue', props.modelValue.filter(i => i !== data))
}

onMounted(() => {
  focused.value = true
})

function previous(index: number) {
  const data = [...props.modelValue]
  const pick = data[index]
  data.splice(index, 1)
  data.splice(index - 1, 0, pick)
  emit('update:modelValue', data)
}

function next(index: number) {
  const data = [...props.modelValue]
  const pick = data[index]
  data.splice(index, 1)
  data.splice(index + 1, 0, pick)
  emit('update:modelValue', data)
}
</script>

<template>
  <div class="flex flex-col gap-1 border-t-2 border-dashed border-b-2 py-2 border-white/10">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="[idx, i] in modelValue.entries()" :key="i" type="button" class="group py-1.5 px-2.5 bg-container-2 rounded-md relative min-w-[120px]"
      >
        <div class="absolute right-1 -translate-y-1/2 translate-x-1/2 top-1 group-hover:opacity-100 opacity-0 transition-opacity flex justify-center items-center text-sm gap-2">
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center" @click="() => {
              remove(i)
            }"
          >
            <Icon name="heroicons:x-mark-20-solid" size="1.4rem" class="w-full h-full p-0.5" />
          </button>
        </div>
        <div class="flex gap-3 text-center">
          <button v-if="modelValue.length > 1" type="button" class="disabled:opacity-40 disabled:cursor-not-allowed" :disabled="idx === 0" @click="() => previous(idx)">
            {{ '<' }}
          </button>
          <div class="flex-1">
            {{ i }}
          </div>
          <button v-if="modelValue.length > 1" type="button" class="disabled:opacity-40 disabled:cursor-not-allowed" :disabled="idx === modelValue.length - 1" @click="() => next(idx)">
            {{ '>' }}
          </button>
        </div>
      </div>
      <div class="bg-container-2 rounded-md flex items-center gap-2.5 pr-2">
        <input ref="input" type="text" :placeholder="modelValue?.length ? 'Tambah' : 'Input'" class="truncate text-sm w-[150px] bg-transparent px-2.5 py-1.5 outline-none" @keyup.enter="add">
        <button type="button" class="bg-blue-500 px-2 py-0.5 rounded-md text-sm" @click="add">
          Add
        </button>
      </div>
    </div>
  </div>
</template>
