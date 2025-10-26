<script lang="ts" setup>
defineProps<{
  title?: string
  keys: string[]
  data?: any
}>()

const emit = defineEmits<(e: 'change', data: Record<string, string | number>) => void>()
const inputData = ref<HTMLInputElement[]>()
function save() {
  const data: Record<string, string> = {}
  if (inputData.value) {
    for (const form of inputData.value) {
      data[form.getAttribute('data-id') || ''] = form.value
    }
  }
  emit('change', data)
}
</script>

<template>
  <div class="bg-container border-color-2 drop-shadow-md t bordertext-left p-3 md:p-4 rounded-md flex flex-col gap-3">
    <div v-if="title" class="text-sm md:text-base">
      {{ title }}
    </div>
    <div v-for="key in keys" :key="key" class="flex gap-3 items-center text-xs md:text-sm font-light">
      <div class="w-10 md:w-[45px] truncate">
        {{ key[0]?.toUpperCase() + key.slice(1, key.length) }}
      </div>
      <input :id="key" ref="inputData" :data-id="key" type="text" :name="key" :value="data?.[key]" class="bg-container-2 px-2.5 py-0.5 md:py-1 rounded-md outline-hidden">
    </div>
    <button type="button" class="px-2 md:px-3 py-0.5 md:py-1 bg-blue-500 self-end rounded-md text-xs md:text-sm" @click="save">
      {{ data ? 'Save' : 'Add' }}
    </button>
  </div>
</template>
