<script lang="ts" setup>
import { FormImageDrop } from '#components'
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  event?: JKT48.EventDetail & { _id: string } | null
}>()

const emit = defineEmits<{
  (e: 'onDismiss'): void
}>()
const { addNotif } = useNotifications()
const editDialog = ref()

onClickOutside(editDialog, () => {
  emit('onDismiss')
})

const id = ref(props.event?.id ?? '')
const title = ref(props.event?.title ?? '')
const title_alt = ref(props.event?.title_alt ?? '')
const description = ref(props.event?.description ?? '')
const posterImageDrop = ref<typeof FormImageDrop>()
const bannerImageDrop = ref<typeof FormImageDrop>()
const pending = ref(false)

async function save() {
  try {
    pending.value = true
    const formData = new FormData()
    const poster = (posterImageDrop.value?.getFiles() ?? [])[0]
    const banner = (bannerImageDrop.value?.getFiles() ?? [])[0]
    if (poster) {
      formData.append('poster', poster)
    }

    if (banner) {
      formData.append('banner', banner)
    }

    if (props.event?.id) {
      formData.append('origin_id', id.value)
    }

    formData.append('_id', props.event?._id ?? '')
    formData.append('id', id.value)
    formData.append('title', title.value)
    formData.append('title_alt', title_alt.value)
    formData.append('description', description.value)
    // formData.append('commentsBy', commentsBy.value ?? '')

    await $apiFetch('/api/admin/event', { method: 'POST', body: formData })
    pending.value = false
    addNotif({
      type: 'success',
      message: 'Form success!',
    })
    emit('onDismiss')
  }
  catch (e) {
    pending.value = false
    addNotif({
      type: 'danger',
      message: 'Post form error!',
    })
    console.error(e)
  }
}
</script>

<template>
  <div class="fixed inset-0 z-aboveNav bg-black/50 overscroll-contain">
    <div ref="editDialog" class=" bg-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2">
      <div class="roundedscrollbar my-6 max-h-[90vh] w-[850px] max-w-[90vw] overflow-y-auto overscroll-none px-3 md:px-5 lg:px-8">
        <h3 class="text-2xl">
          Setlist Form
        </h3>
        <div class="flex gap-3 py-4">
          <FormImageDrop ref="posterImageDrop" :src="event?.poster" form-id="poster" title="Poster" class="bg-container-2 flex aspect-[4/5] h-40 items-center justify-center overflow-hidden rounded-md" />
          <FormImageDrop ref="bannerImageDrop" :src="event?.banner" form-id="poster" title="Banner" class="bg-container-2 flex aspect-[16/9] h-40 items-center justify-center overflow-hidden rounded-md" />
          <!-- <button class="bg-container-2 flex aspect-[4/5] h-40 items-center justify-center rounded-md">
            <div v-if="!poster">
              Poster
            </div>
            <img v-else :src="poster" alt="Poster" class="h-full w-full object-cover">
          </button>
          <button class="bg-container-2 flex aspect-[16/9] h-40 items-center justify-center rounded-md">
            <div v-if="!banner">
              Banner
            </div>
            <img v-else :src="banner" alt="Poster" class="h-full w-full object-cover">
          </button> -->
        </div>
        <div class="flex flex-col gap-4">
          <div class="item-start flex gap-4">
            <div class="w-[120px] text-xl leading-9">
              Id
            </div>
            <FormText v-model="id" form-id="id" placeholder="Title" class="flex-1" input-class="bg-container-2" />
          </div>
          <div class="item-start flex gap-4">
            <div class="w-[120px] text-xl leading-9">
              Title
            </div>
            <FormText v-model="title" form-id="title" placeholder="Title" class="flex-1" input-class="bg-container-2" />
          </div>
          <div class="item-start flex gap-4">
            <div class="w-[120px] text-xl leading-9">
              Alt Title
            </div>
            <FormText v-model="title_alt" form-id="title_alt" placeholder="Alternative title" class="flex-1" input-class="bg-container-2" />
          </div>
          <div class="item-start flex gap-4">
            <div class="w-[120px] text-xl leading-9">
              Description
            </div>
            <FormTextArea v-model="description" form-id="description" placeholder="Description" class="flex-1" input-class="bg-container-2 min-h-[120px]" />
          </div>
        </div>
        <div class="mt-10">
          <button type="button" class="float-right rounded-full bg-blue-500 px-5 py-2" :disabled="pending" @click="save">
            <span v-if="!pending">Save</span>
            <Icon v-else name="svg-spinners:ring-resize" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
