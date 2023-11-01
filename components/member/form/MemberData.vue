<script lang="ts" setup>
import { generation, group } from '@/library/utils/stage48'
import { getForm } from '~~/library/utils/form'
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  memberData: Admin.I48Member
  jkt48members: JKT48.Member[]
}>()

const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdate', data: Admin.I48Member): void
}>()

const { addNotif } = useNotifications()

function generateForm() {
  return [
    {
      title: 'Name',
      placeholder: 'Name',
      id: 'name',
      data: props.memberData?.name,
      component: 'text',
      check: (data: any): boolean => {
        return props.memberData.name === data
      },
    },
    {
      title: 'Image',
      id: 'img',
      data: props.memberData?.img,
      check: (data: any): boolean => {
        return props.memberData.img === data
      },
    },
    {
      title: 'Stage48',
      id: 'stage48',
      data: props.memberData?.stage48,
      check: (data: any): boolean => {
        return props.memberData.stage48 === data
      },
    },

    {
      title: 'Banner',
      id: 'banner',
      data: props.memberData?.banner,
      check: (data: any): boolean => {
        return props.memberData.banner === data
      },
    },
    {
      title: 'Jikosokai',
      id: 'jikosokai',
      component: 'textarea',
      data: props.memberData?.jikosokai,
      check: (data: any): boolean => {
        return props.memberData.jikosokai === data
      },
    },
    {
      title: 'Group',
      id: 'group',
      component: 'select',
      data: props.memberData?.group,
      options: group,
      check: (data: any): boolean => {
        return props.memberData?.group === data
      },
    },
    // {
    //   title: 'Social Media',
    //   id: 'socials',
    //   component: 'select',
    //   data: props.memberData?.socials,
    //   options: group,
    //   check: (data: any): boolean => {
    //     return props.memberData.socials === data
    //   },
    // },
    {
      title: 'JKT48 ID',
      id: 'jkt48id',
      component: 'select',
      data: props.memberData?.jkt48id,
      options: (props.jkt48members ?? []).map((i) => {
        return {
          title: i.name,
          value: i.id,
        }
      }),
      check: (data: any): boolean => {
        return props.memberData.jkt48id === data
      },
    },
    {
      title: 'Generation',
      id: 'generation',
      component: 'select',
      data: props.memberData?.generation,
      options: (generation as any)[props.memberData.group ?? '']?.map((i: any) => {
        return {
          title: i.title,
          value: i.key,
        }
      }),
      check: (data: any): boolean => {
        return props.memberData.generation === data
      },
    },
  ]
}
const formMemberData = ref(generateForm())

watch(() => props.memberData, () => {
  formMemberData.value = generateForm()
})

const hasChanges = computed(() => {
  return formMemberData.value.some(i => !i.check(i.data))
})
const isLoading = ref(false)
async function apply() {
  const q = {} as any
  q._id = props.memberData._id
  for (const form of formMemberData.value) {
    q[form.id] = form.data
  }

  try {
    isLoading.value = true
    await $fetch('/api/admin/showroom/modify_member_data', { method: 'POST', query: q })
    addNotif({
      type: 'success',
      title: 'Success',
      duration: 1500,
      message: 'Data berhasil diubah',
    })
    emit('onUpdate', { ...props.memberData, ...q })
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
    <div v-for="form in formMemberData" :key="form.id" class="flex gap-3">
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
