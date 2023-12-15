<script lang="ts" setup>
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot,
} from '@headlessui/vue'
import { useFocus } from '@vueuse/core'

import Fuse from 'fuse.js'

const props = withDefaults(defineProps<{
  formId: string
  label?: string
  modelValue: any[]
  inputClass?: string
  data: { title: string, value: string }[]
}>(), {
  inputClass: '',
})
const emit = defineEmits(['update:modelValue'])
const input = ref()
const { focused } = useFocus(input)
const selectedData = computed(() => {
  const data = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  return data.map((id) => {
    return props.data.find(i => i.value === id)
  }).filter(i => i != null)
})

function add(data: string) {
  return emit('update:modelValue', [...props.modelValue, data])
}

function remove(data: string) {
  return emit('update:modelValue', props.modelValue.filter(i => i !== data))
}

const query = ref('')
const selectedId = ref()
const options = {
  includeScore: true,
  threshold: 0.25,
  keys: ['value', 'title'],
}

const listData = computed(() => {
  return props.data.filter(i => !props.modelValue.includes(i.value))
})

const filteredData = computed(() => {
  const fuse = new Fuse(listData.value, options)
  return fuse.search(query.value).map(i => i.item)
},
)

watch(selectedId, (id) => {
  add(id)
  query.value = ''
})
onMounted(() => {
  focused.value = true
})
</script>

<template>
  <div class="flex flex-col gap-1 border-t-2 border-dashed border-b-2 py-2 border-white/10">
    <label v-if="label" class="pl-2.5" :for="formId">{{ label }}</label>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="i in selectedData" :key="i?.value" type="button" class="group py-1.5 px-2.5 bg-container-2 rounded-md overflow-hidden relative min-w-[120px]" @click="() => {
          remove(i?.value!)
        }"
      >
        <div class="absolute bg-black/60 inset-0 group-hover:opacity-100 opacity-0 transition-opacity flex justify-center items-center text-sm gap-2">
          <span>Id : {{ i?.value }}</span>
          <Icon name="heroicons:x-circle-20-solid" size="1.4rem" />
        </div>
        <div class="group-hover:opacity-0">
          {{ i?.title }}
        </div>
      </button>
      <Combobox v-model="selectedId">
        <div class="relative">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg text-left sm:text-sm"
          >
            <ComboboxInput
              ref="input"
              :class="inputClass"
              :placeholder="selectedData?.length ? 'Search lagi' : 'Search'"
              class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 focus:ring-0 outline-none min-w-[350px]"
              :display-value="() => ''"
              @change="query = $event.target.value"
            />
            <ComboboxButton
              class="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>

          <TransitionRoot
            leave="transition ease-in duration-100"
            leave-from="opacity-100"
            leave-to="opacity-0"
            @after-leave="query = ''"
          >
            <ComboboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-container-2 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
              <div
                v-if="filteredData.length === 0 && query !== ''"
                class="relative cursor-default select-none px-4 py-2"
              >
                Nothing found.
              </div>
              <div
                v-if="query === ''"
                class="relative cursor-default select-none px-4 py-2"
              >
                Type something.
              </div>

              <ComboboxOption
                v-for="member in filteredData"
                :key="member.value"
                v-slot="{ selected, active }"
                :value="member.value"
                as="template"
              >
                <li
                  class="relative cursor-default select-none py-2 px-4"
                  :class="{
                    'bg-blue-500': active,
                  }"
                >
                  <span
                    class="block truncate"
                    :class="{ 'font-medium': selected, 'font-normal': !selected }"
                  >
                    {{ member.title }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3"
                    :class="{ 'text-white': active, 'text-teal-600': !active }"
                  >
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
    </div>
  </div>
</template>
