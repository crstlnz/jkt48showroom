<script lang="ts" setup>
const props = withDefaults(defineProps<{
  formId: string
  label?: string
  modelValue: any[]
  inputClass?: string
  data: { title: string, value: string }[]
}>(), {
  inputClass: '',
})

defineEmits(['update:modelValue'])
const selected = computed(() => {
  const data = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  return data.map((id) => {
    return props.data.find(i => i.value === id)
  }).filter(i => i != null)
})

function add(data: string) {
  return [...props.modelValue, data]
}

function remove(data: string) {
  return props.modelValue.filter(i => i !== data)
}
</script>

<template>
  <div class="flex flex-col gap-1 border-t-2 border-dashed border-b-2 py-2 border-white/10">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="i in selected" :key="i?.value" type="button" class="group py-1.5 px-2.5 bg-container-2 rounded-md relative overflow-hidden" @click="() => {
          $emit('update:modelValue', remove(i?.value!))
        }"
      >
        <div class="absolute bg-black/60 inset-0 group-hover:opacity-100 opacity-0 transition-opacity flex justify-center items-center text-base gap-2">
          <span>Id : {{ i?.value }}</span>
          <Icon name="heroicons:x-circle-20-solid" size="1.4rem" />
        </div>
        <div class="group-hover:opacity-0">
          {{ i?.title }}
        </div>
      </button>
      <select
        id="member_data"
        :class="inputClass" class="rounded-md p-1.5 "
        @input="($event) => {
          $emit('update:modelValue', add(($event.target as HTMLInputElement)?.value))
          if ($event.target){
            ($event.target as HTMLSelectElement).selectedIndex = 0
          }
        }"
      >
        <option>
          {{ selected?.length ? 'Pilih lagi' : 'Pilih' }}
        </option>
        <option v-for="m in data.filter(i => !modelValue.includes(i.value))" :key="m.value" :value="m.value">
          {{ m.title }}
        </option>
      </select>
    </div>
  </div>
</template>
