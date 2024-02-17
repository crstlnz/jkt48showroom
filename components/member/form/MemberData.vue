<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  memberData: Admin.IdolMemberWithID
  jkt48members: JKT48.Member[]
}>()

const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdate', data: Admin.IdolMemberWithID): void
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
      data: props.memberData?.info?.img,
      check: (data: any): boolean => {
        return props.memberData.info.img === data
      },
    },
    {
      title: 'Tanggal Lahir',
      id: 'birthdate',
      component: 'date',
      data: props.memberData?.info?.birthdate,
      check: (data: any): boolean => {
        return props.memberData.info.birthdate === data
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
      data: props.memberData?.info?.banner,
      check: (data: any): boolean => {
        return props.memberData.info.banner === data
      },
    },
    {
      title: 'Jikosokai',
      id: 'jikosokai',
      component: 'textarea',
      data: props.memberData?.info?.jikosokai,
      check: (data: any): boolean => {
        return props.memberData.info.jikosokai === data
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
    {
      title: 'Social Media',
      id: 'socials',
      component: 'arrayobject',
      data: props.memberData?.info?.socials,
      keys: ['title', 'url'],
      titleKey: 'title',
      options: group,
      check: (data: any): boolean => {
        return props.memberData.info.socials === data
      },
    },
    {
      title: 'Nicknames',
      id: 'nicknames',
      component: 'arraystring',
      data: props.memberData?.info?.nicknames || [],
      check: (data: any): boolean => {
        const pData = props.memberData?.info?.nicknames || []
        if (data.length !== pData.length) {
          return false
        }

        for (const [i, d] of data.entries()) {
          if (pData[i] !== d) {
            return false
          }
        }
        return true
      },
    },
    {
      title: 'JKT48 ID',
      id: 'jkt48id',
      component: 'selectmultiple',
      data: props.memberData?.jkt48id,
      options: (props.jkt48members ?? []).map((i) => {
        return {
          title: i.name,
          value: i.id,
        }
      }),
      check: (data: any): boolean => {
        const pData = props.memberData?.jkt48id || []
        if (data.length !== pData.length) {
          return false
        }

        for (const [i, d] of data.entries()) {
          if (pData[i] !== d) {
            return false
          }
        }
        return true
      },
    },
    {
      title: 'Generation',
      id: 'generation',
      component: 'select',
      data: props.memberData?.info?.generation,
      options: (generation as any)[props.memberData.group ?? '']?.map((i: any) => {
        return {
          title: i.title,
          value: i.key,
        }
      }),
      check: (data: any): boolean => {
        return props.memberData?.info?.generation === data
      },
    },
    {
      title: 'IDN Username',
      placeholder: 'IDN Username',
      id: 'idn_username',
      data: props.memberData?.idn?.username,
      component: 'text',
      check: (data: any): boolean => {
        return props.memberData.idn?.username === data
      },
    },
    {
      title: 'Missing Showroom',
      placeholder: 'Missing Showroom',
      id: 'live_data.missing.showroom',
      data: props.memberData?.live_data?.missing?.showroom,
      component: 'number',
      check: (data: any): boolean => {
        return props.memberData?.live_data?.missing?.showroom === data
      },
    },
    {
      title: 'Missing IDN',
      placeholder: 'Missing IDN',
      id: 'live_data.missing.idn',
      data: props.memberData?.live_data?.missing?.idn,
      component: 'number',
      check: (data: any): boolean => {
        return props.memberData?.live_data?.missing?.idn === data
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
  const formData = new FormData()
  q._id = props.memberData._id
  formData.append('_id', String(props.memberData._id))
  for (const form of formMemberData.value) {
    if (Array.isArray(form.data)) {
      const data = []
      if (form.component === 'arrayobject') {
        for (const item of form.data) {
          const obj = {} as any
          for (const key of form.keys || []) {
            obj[key] = (item as any)[key]
          }
          data.push(JSON.stringify(obj))
        }
      }
      else {
        data.push(...form.data)
      }

      q[form.id] = data
      for (const item of data) {
        formData.append(`${form.id}[]`, String(item))
      }
    }
    else {
      q[form.id] = form.data
      if (form.data) {
        formData.append(form.id, String(form.data))
      }
    }
  }

  try {
    isLoading.value = true
    await $apiFetch('/api/admin/edit_memberdata', { method: 'POST', body: formData })
    addNotif({
      type: 'success',
      title: 'Success',
      duration: 1500,
      message: 'Data berhasil diubah',
    })
    console.log(q)
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
      <div class="w-[65px] shrink-0 truncate pt-1.5 md:w-[90px] lg:w-[120px] text-sm md:text-base" :class="{ '!leading-[45px]': isMultiple(form.component) }">
        {{ form.title }}
      </div>
      <Component :is="getForm(form.component ?? 'text')" v-model="form.data" :label="form.component === 'arrayobject' ? form.title : undefined" :title-key="form.titleKey" :keys="form.keys" :data="form.options || []" form-id="start" :placeholder="form.placeholder ?? form.title" input-class="bg-container-2 flex-1 text-sm md:text-base" class="w-0 flex-1" />
    </div>
    <div class="mt-1 flex justify-end gap-3">
      <button
        type="button"
        class="text-sm md:text-base rounded-full bg-red-500 px-4 md:px-5 py-1.5 md:py-2 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75"
        @click="$emit('onDismiss')"
      >
        Close
      </button>
      <button :disabled="!hasChanges || isLoading" type="button" class="text-sm md:text-base rounded-full bg-blue-500 px-4 md:px-5 py-1.5 md:py-2 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75" @click="apply">
        <Icon v-if="isLoading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" name="svg-spinners:ring-resize" size="1.5rem" />
        <span :class="{ 'opacity-0': isLoading }">Apply</span>
      </button>
    </div>
  </div>
</template>
