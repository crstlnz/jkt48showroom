<script lang="ts" setup>
import { vOnClickOutside } from '@vueuse/components'
import { useFocus } from '@vueuse/core'

const props = withDefaults(defineProps<{
  formId: string
  label?: string
  modelValue?: any[]
  inputClass?: string
  keys: string[]
  titleKey?: string
  data: { title: string, value: string }[]
}>(), {
  inputClass: '',
})

const emit = defineEmits(['update:modelValue'])
const input = ref<HTMLInputElement>()
const { focused } = useFocus(input)

// function includes(object: object) {
//   for (const obj of props.modelValue) {
//     const object1 = obj as any
//     const object2 = object as any
//     if (Object.keys(obj).every((key: string) => object1[key] === object2[key])) return true
//   }
//   return false
// }

onMounted(() => {
  focused.value = true
})

// function add() {
//   if (!input.value) return
//   //   if (includes(input.value.value)) return
//   emit('update:modelValue', [...props.modelValue, input.value.value || ''])
//   input.value.value = ''
// }

function remove(i: number) {
  return emit('update:modelValue', props.modelValue?.filter((idx, _d) => i !== idx))
}

function previous(index: number) {
  if (!props.modelValue) return
  const data = [...props.modelValue]
  const pick = data[index]
  data.splice(index, 1)
  data.splice(index - 1, 0, pick)
  emit('update:modelValue', data)
}

function next(index: number) {
  if (!props.modelValue) return
  const data = [...props.modelValue]
  const pick = data[index]
  data.splice(index, 1)
  data.splice(index + 1, 0, pick)
  emit('update:modelValue', data)
}
const formOpen = ref(new Set())
const formAdd = ref(false)

function formChange(i: number, data: any) {
  if (!props.modelValue) return
  formOpen.value.clear()
  const d = [...props.modelValue]
  d[i] = data
  emit('update:modelValue', d)
}

function add(data: any) {
  if (!props.modelValue) return
  formAdd.value = false
  const d = [...props.modelValue]
  d.push(data)
  emit('update:modelValue', d)
}
</script>

<template>
  <div class="flex flex-col gap-1 border-t-2 border-dashed border-b-2 py-2 border-white/10">
    <!-- <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label> -->
    <div class="flex flex-wrap gap-3 !bg-transparent" :class="inputClass">
      <div
        v-for="[idx, i] in modelValue?.entries() ?? []" :key="String(i)" type="button" class=" group py-1.5 px-2.5 bg-container-2 rounded-md relative min-w-[115px]"
      >
        <Transition name="fade">
          <FormObject v-if="formOpen.has(idx)" v-on-click-outside="() => formOpen.clear()" :keys="keys" :data="i" class="absolute bottom-0 left-0 z-10" @change="(data) => formChange(idx, data)" />
        </Transition>
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
          <button v-if="(modelValue?.length ?? 0) > 1" type="button" class="disabled:opacity-40 disabled:cursor-not-allowed" :disabled="idx === 0" @click="() => previous(idx)">
            {{ '<' }}
          </button>
          <div class="flex-1" @click="() => formOpen.add(idx)">
            {{ i[titleKey ?? keys[0]] }}
          </div>
          <button v-if="(modelValue?.length ?? 0) > 1" type="button" class="disabled:opacity-40 disabled:cursor-not-allowed" :disabled="idx === (modelValue?.length ?? 0) - 1" @click="() => next(idx)">
            {{ '>' }}
          </button>
        </div>
      </div>
      <div class="relative">
        <FormObject v-if="formAdd" v-on-click-outside="() => formAdd = false" :keys="keys" :data="{}" class="absolute right-1/2 translate-x-1/2 bottom-0 z-10" @change="(data) => add(data)" />
        <button type="button" class="bg-blue-500 rounded-md flex items-center px-4 md:px-5 py-1 md:py-1.5" @click="formAdd = true">
          Add
        </button>
      </div>
    </div>
  </div>
</template>
