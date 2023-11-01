<script lang="ts" setup>
import { FormImage } from '#components'
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  formId: string
  alt?: string
  src?: string
  title?: string
  imageClass?: string
  saveClass?: string
  isPotrait?: boolean
}>()

const emit = defineEmits<{
  (e: 'uploaded', url: string): void
}>()

const { addNotif } = useNotifications()

const imageUrl = ref(props.src)

const formImage = ref<typeof FormImage | null>(null)
function selectImage() {
  if (formImage.value) {
    formImage.value.selectImage()
  }
}
const isChanged = computed(() => {
  return imageUrl.value !== props.src
})

const isUploading = ref(false)
// async function save(e: Event) {
//   e.stopPropagation()
//   const formData = new FormData()
//   formData.append('banner', formImage.value?.inputImage.files[0])
//   try {
//     isUploading.value = true
//     const result = (await $fetch(props.postUrl, {
//       body: formData,
//       method: 'post',
//     })) as any

//     imageUrl.value = result.url
//     emit('uploaded', result.url)
//     addNotif({
//       type: 'success',
//       title: 'Success',
//       duration: 1500,
//       message: `Data berhasil ditambah : ${result.url}`,
//     })
//     isUploading.value = false
//   }
//   catch (e: any) {
//     isUploading.value = false
//     addNotif({
//       type: 'danger',
//       title: 'Error',
//       duration: 1500,
//       message: e.message,
//     })
//   }
// }

const isDragEnter = ref(false)

function dropHandler(ev: DragEvent) {
  isDragEnter.value = false
  ev.preventDefault()
  if (ev.dataTransfer?.items && formImage.value) {
    const imageTypes = ['image/png', 'image/gif', 'image/bmp', 'image/jpeg']
    const file = ev.dataTransfer.files[0]
    const fileType = ev.dataTransfer.files[0].type
    if (imageTypes.includes(fileType)) {
      formImage.value.setImageInput(file)
    }
    // Use DataTransferItemList interface to access the file(s)
  }
}

const counter = ref(0)
function onDragEnter(ev: DragEvent) {
  ev.preventDefault()
  ev.stopPropagation()
  counter.value++
  isDragEnter.value = true
}

function onDragLeave(ev: DragEvent) {
  ev.preventDefault()
  ev.stopPropagation()
  counter.value--
  if (counter.value === 0) {
    isDragEnter.value = false
  }
}

function getFiles(): File[] {
  return formImage.value?.inputImage.files ?? []
}

defineExpose({ getFiles })
</script>

<template>
  <div class="group relative cursor-pointer select-none" @drop.prevent="dropHandler" @dragenter.prevent="onDragEnter" @dragover.prevent @dragleave="onDragLeave">
    <FormImage ref="formImage" v-model="imageUrl" class="h-full w-full" :is-potrait="isPotrait" :image-class="imageClass" :form-id="formId" input-class="w-full h-full" />
    <div v-if="isDragEnter" class="z-1 absolute inset-0 flex items-center justify-center bg-black/75 text-lg text-white">
      Drop a image
    </div>
    <div v-if="!imageUrl" class="pointer-events-none absolute transition-opacity duration-300 group-hover:opacity-10">
      {{ title }}
    </div>
    <!-- <div v-if="isChanged" class="z-1 absolute inset-0 flex items-center justify-center" @click="selectImage">
      <button v-if="!isUploading" type="button" :disabled="isUploading" :class="saveClass" class="rounded-full bg-black/50 px-3 py-1 text-white opacity-75" @click="save">
        Save
      </button>
      <div v-else class="rounded-full bg-black/50">
        <Icon name="svg-spinners:ring-resize" size="2.5rem" class="p-1.5 text-white" />
      </div>
    </div> -->
  </div>
</template>
