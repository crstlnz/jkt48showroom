<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const props = defineProps<{
  event: JKT48.Event
  jkt48members: JKT48.MemberWithNickname[]
}>()

defineEmits<{
  (e: 'dismiss'): void
  (e: 'onUpdate', data: Admin.IShowroomMember): void
}>()

const { addNotif } = useNotifications()

const event = ref(props.event)

function generateForm(): Admin.Form[] {
  return [
    {
      title: 'Theater Id',
      id: 'id',
      data: event.value.id,
      check: (data: any): boolean => {
        return event.value.id === data
      },
    },
    {
      title: 'Event Id',
      id: 'eventId',
      placeholder: 'Event Id',
      data: event.value.eventId,
      check: (data: any): boolean => {
        return event.value.eventId === data
      },
    },
    {
      title: 'Url',
      id: 'url',
      data: event.value.url,
      check: (data: any): boolean => {
        return event.value.url === data
      },
    },
    {
      title: 'Member List',
      id: 'memberIds',
      component: 'selectmultiple',
      data: (event.value.memberIds ?? []).map(i => String(i)),
      check: (data: any): boolean => {
        const pData = (props.event?.memberIds || []).map(i => String(i))
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
      options: (props.jkt48members ?? []).map((i) => {
        return {
          title: i.name,
          value: i.id,
          alt: i.nicknames?.join(','),
        }
      }),
    },
  ]
}

const formTheater = ref(generateForm())
const hasChanges = computed(() => {
  return formTheater.value.some(i => !i.check(i.data))
})

const isLoading = ref(false)

async function apply() {
  const q = {} as any
  q._id = props.event.id
  for (const form of formTheater.value) {
    q[form.id] = form.data
  }

  try {
    isLoading.value = true
    await $apiFetch('/api/admin/edit_jkt48event', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: JSON.stringify(q) })
    addNotif({
      type: 'success',
      title: 'Success',
      duration: 1500,
      message: 'Data berhasil diubah',
    })
    // emit('onUpdate', { ...props.member, ...q })
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
  <div class="flex flex-col gap-3">
    <div class="text-xl font-semibold mb-3">
      Edit {{ event.title }} {{ $dayjs(event.date).format("DD MMMM YYYY - HH:mm") }}
    </div>
    <div v-for="form in formTheater" :key="form.id" class="flex gap-3">
      <div class="w-[65px] shrink-0 truncate pt-1.5 md:w-[90px] lg:w-[120px] text-sm md:text-base" :class="{ '!leading-[45px]': isMultiple(form.component) }">
        {{ form.title }}
      </div>
      <Component :is="getForm(form.component ?? 'text')" v-model="form.data" :keys="(form as any).keys" :data="(form as Admin.FormMultipleSelect)?.options || []" form-id="start" :placeholder="(form as Admin.FormText)?.placeholder ?? form.title" input-class="bg-container-2 flex-1 text-sm md:text-base" class="w-0 flex-1" />
    </div>

    <div class="mt-1 flex justify-end gap-3">
      <button
        type="button"
        class="text-sm md:text-base rounded-full bg-red-500 px-4 md:px-5 py-1.5 md:py-2 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75"
        @click="$emit('dismiss')"
      >
        Close
      </button>
      <button :disabled="!hasChanges || isLoading" type="button" class="rounded-full bg-blue-500 px-4 md:px-5 py-1.5 md:py-2 text-white transition-transform hover:brightness-90 active:brightness-75 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:brightness-75" @click="apply">
        <Icon v-if="isLoading" class="text-sm md:text-base absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" name="svg-spinners:ring-resize" size="1.5rem" />
        <span :class="{ 'opacity-0': isLoading }">Apply</span>
      </button>
    </div>
  </div>
</template>
