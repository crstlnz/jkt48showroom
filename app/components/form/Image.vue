<script lang="ts" setup>
import { DeferImage } from '#components'

const props = withDefaults(defineProps<{
  formId: string
  modelValue: any
  inputClass?: string
  imageClass?: string
  alt?: string
  isPotrait?: boolean
}>(), {
  imageClass: '',
})

const emit = defineEmits(['update:modelValue'])

const image = ref('')

const inputImage = ref<HTMLInputElement>()

function selectImage() {
  if (inputImage.value) {
    inputImage.value.click()
  }
}

function onImageInput($event: Event) {
  const files = ($event.target as HTMLInputElement)?.files
  if (files?.length) {
    emit('update:modelValue', URL.createObjectURL(files[0]))
  }
}

function setImageInput(file: File) {
  if (!inputImage.value?.files) return
  const files = new DataTransfer()
  files.items.add(file)
  inputImage.value.files = files.files
  emit('update:modelValue', URL.createObjectURL(file))
}

watch(() => props.modelValue, () => {
  if (typeof props.modelValue === 'string') {
    image.value = props.modelValue
  }
  else {
    readURL(props.modelValue)
  }
}, {
  immediate: true,
})

function readURL(files: FileList) {
  if (files && files[0]) {
    const reader = new FileReader()

    reader.onload = function (e) {
      if (e.target?.result) {
        image.value = e.target.result as string
      }
    }

    reader.readAsDataURL(files[0])
  }
}

defineExpose({
  selectImage,
  inputImage,
  setImageInput,
})
</script>

<template>
  <div class="relative max-w-full rounded-md outline-2 outline-black/10" :class="inputClass" @click="selectImage">
    <DeferImage v-if="modelValue" :src="image" :class="imageClass" :alt="alt ?? 'Image Form'" class="bg-container-2 h-full w-full object-cover" />
    <div v-else :class="imageClass" :alt="alt ?? 'Image Form'" />
    <div class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100">
      <Icon name="material-symbols:edit-rounded" size="1.6rem" class="text-white" />
    </div>
    <input
      id="img"
      ref="inputImage"
      type="file"
      name="img"
      accept="image/*"
      class="hidden"
      @input="onImageInput"
    >
  </div>
</template>
