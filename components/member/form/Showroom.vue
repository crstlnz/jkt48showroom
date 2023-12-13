<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  member: Admin.IShowroomMember
}>()

const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdate', data: Admin.IShowroomMember): void
}>()

const { addNotif } = useNotifications()
const member = ref<Admin.IShowroomMember>(props.member)
function generateForm() {
  return [
    {
      title: 'Name',
      id: 'name',
      placeholder: 'Name',
      data: member.value.name,
      check: (data: any): boolean => {
        return member.value.name === data
      },
    },
    {
      title: 'Room Id',
      id: 'room_id',
      data: member.value.room_id,
      check: (data: any): boolean => {
        return member.value.room_id === data
      },
    },
    {
      title: 'Image',
      id: 'img',
      data: member.value.img,
      check: (data: any): boolean => {
        return member.value.img === data
      },
    },
    {
      title: 'Description',
      id: 'description',
      component: 'textarea',
      data: member.value.description,
      check: (data: any): boolean => {
        return member.value.description === data
      },
    },
    {
      title: 'Generation',
      id: 'generation',
      component: 'select',
      data: member.value.generation,
      options: (generation as any)[member.value.group ?? '']?.map((i: any) => {
        return {
          title: i.title,
          value: i.key,
        }
      }),
      check: (data: any): boolean => {
        return member.value.generation === data
      },
    },
    {
      title: 'Group',
      id: 'group',
      component: 'select',
      data: member.value.group,
      options: group,
      check: (data: any): boolean => {
        return member.value.group === data
      },
    },
    {
      title: 'Url',
      id: 'url',
      data: member.value.url,
      check: (data: any): boolean => {
        return member.value.url === data
      },
    },
  ]
}

const formShowroom = ref(generateForm())
const hasChanges = computed(() => {
  return formShowroom.value.some(i => !i.check(i.data))
})

const isLoading = ref(false)

async function apply() {
  const q = {} as any
  q._id = props.member._id
  for (const form of formShowroom.value) {
    q[form.id] = form.data
  }

  try {
    isLoading.value = true
    await $apiFetch('/api/admin/edit_showroom', { method: 'POST', query: q })
    addNotif({
      type: 'success',
      title: 'Success',
      duration: 1500,
      message: 'Data berhasil diubah',
    })
    emit('onUpdate', { ...props.member, ...q })
    isLoading.value = false
  }
  catch (e: any) {
    isLoading.value = false
    addNotif({
      type: 'danger',
      title: 'Error',
      duration: 1500,
      message: e.message,
    })
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <div v-for="form in formShowroom" :key="form.id" class="flex gap-3">
      <div class="w-[70px] shrink-0 truncate pt-1.5 md:w-[90px] lg:w-[120px]">
        {{ form.title }}
      </div>
      <Component :is="getForm(form.component ?? 'text')" v-model="form.data" :data="form.options" form-id="start" :placeholder="form.placeholder ?? form.title" input-class="bg-container-2 flex-1" class="min-w-0 flex-1" />
    </div>

    <div class="mt-1 flex justify-end gap-3">
      <button
        type="button"
        class="rounded-full bg-red-500 px-6 py-2.5 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75"
        @click="$emit('onDismiss')"
      >
        Close
      </button>
      <button :disabled="!hasChanges || isLoading" type="button" class="rounded-full bg-blue-500 px-6 py-2.5 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75" @click="apply">
        <Icon v-if="isLoading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" name="svg-spinners:ring-resize" size="1.5rem" />
        <span :class="{ 'opacity-0': isLoading }">Apply</span>
      </button>
    </div>
  </div>
</template>
